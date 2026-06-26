package dev.saad.quiz.config;

import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.ssl.DefaultClientTlsStrategy;
import org.apache.hc.client5.http.ssl.NoopHostnameVerifier;
import org.apache.hc.client5.http.ssl.TlsSocketStrategy;
import org.apache.hc.core5.ssl.SSLContexts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestClientCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.util.StreamUtils;

import javax.net.ssl.SSLContext;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * Configures the {@link org.springframework.web.client.RestClient} used by
 * Spring AI's OpenAI integration to use Apache HttpClient 5.
 *
 * <ul>
 *   <li>SSL is configured per-client (no global JVM mutation).</li>
 *   <li>Set {@code app.openai.trust-all-ssl=true} when behind a corporate
 *       SSL-inspection proxy (e.g. Capgemini) that re-signs HTTPS traffic.</li>
 *   <li>A diagnostic interceptor catches any {@code text/html} response that a
 *       proxy might return for blocked requests and logs the body so the root
 *       cause is immediately visible.</li>
 * </ul>
 */
@Configuration
public class OpenAiRestClientConfig {

    private static final Logger log = LoggerFactory.getLogger(OpenAiRestClientConfig.class);

    @Value("${app.openai.trust-all-ssl:false}")
    private boolean trustAllSsl;

    @Value("${app.openai.connect-timeout-seconds:30}")
    private int connectTimeoutSeconds;

    @Bean
    public RestClientCustomizer openAiHttpClientCustomizer() {
        return restClientBuilder -> {
            try {
                CloseableHttpClient httpClient = buildHttpClient();
                HttpComponentsClientHttpRequestFactory factory =
                        new HttpComponentsClientHttpRequestFactory(httpClient);
                factory.setConnectTimeout(Duration.ofSeconds(connectTimeoutSeconds));
                factory.setConnectionRequestTimeout(Duration.ofSeconds(connectTimeoutSeconds));
                restClientBuilder.requestFactory(factory);

                // ── Diagnostic interceptor ─────────────────────────────────────────
                // If a corporate proxy (or anything else) returns text/html instead of
                // application/json, capture and log the HTML body so the root cause is
                // immediately visible in the console, then throw a clear error.
                restClientBuilder.requestInterceptor(htmlProxyDiagnosticInterceptor());

                log.info("OpenAI HTTP client configured — trustAllSsl={}, connectTimeout={}s",
                        trustAllSsl, connectTimeoutSeconds);
            } catch (Exception e) {
                throw new IllegalStateException("Failed to configure OpenAI HTTP client", e);
            }
        };
    }

    // ── SSL ──────────────────────────────────────────────────────────────────

    private CloseableHttpClient buildHttpClient() throws Exception {
        if (trustAllSsl) {
            log.warn("⚠️  app.openai.trust-all-ssl=true — SSL certificate verification " +
                     "disabled for OpenAI calls (corporate proxy mode). " +
                     "Scoped to this HTTP client only — no global JVM mutation.");

            SSLContext sslContext = SSLContexts.custom()
                    .loadTrustMaterial((chain, authType) -> true)
                    .build();

            TlsSocketStrategy tlsStrategy =
                    new DefaultClientTlsStrategy(sslContext, NoopHostnameVerifier.INSTANCE);

            return HttpClients.custom()
                    .setConnectionManager(
                            PoolingHttpClientConnectionManagerBuilder.create()
                                    .setTlsSocketStrategy(tlsStrategy)
                                    .setMaxConnPerRoute(10)
                                    .setMaxConnTotal(20)
                                    .build())
                    .evictExpiredConnections()
                    .build();
        } else {
            return HttpClients.custom()
                    .setConnectionManager(
                            PoolingHttpClientConnectionManagerBuilder.create()
                                    .setMaxConnPerRoute(10)
                                    .setMaxConnTotal(20)
                                    .build())
                    .evictExpiredConnections()
                    .build();
        }
    }

    // ── Diagnostic interceptor ────────────────────────────────────────────────

    /**
     * Intercepts every HTTP response before Spring AI deserialises it.
     * When the response body is {@code text/html} (typical of a corporate proxy
     * "access blocked" page or a Cloudflare/CDN error page), the HTML is logged
     * in full and a clear exception is thrown — far more useful than Spring AI's
     * generic "no suitable HttpMessageConverter" error.
     */
    private static ClientHttpRequestInterceptor htmlProxyDiagnosticInterceptor() {
        return (request, body, execution) -> {
            var response = execution.execute(request, body);
            MediaType contentType = response.getHeaders().getContentType();

            if (contentType != null && contentType.isCompatibleWith(MediaType.TEXT_HTML)) {
                String htmlBody;
                try {
                    htmlBody = StreamUtils.copyToString(response.getBody(), StandardCharsets.UTF_8);
                } catch (IOException ex) {
                    htmlBody = "<could not read response body: " + ex.getMessage() + ">";
                }

                int statusCode = response.getStatusCode().value();
                String url = request.getURI().toString();

                log.error("""
                        ╔══════════════════════════════════════════════════════════════╗
                        ║  PROXY / NETWORK BLOCK DETECTED                             ║
                        ╠══════════════════════════════════════════════════════════════╣
                        ║  URL    : {}
                        ║  Status : {}
                        ║  The server returned text/html instead of application/json.
                        ║  This is almost always a corporate proxy blocking the request
                        ║  or a CDN (e.g. Cloudflare) returning an error page.
                        ╠══════════════════════════════════════════════════════════════╣
                        ║  HTML BODY (first 1 000 chars):
                        {}
                        ╚══════════════════════════════════════════════════════════════╝
                        """,
                        url, statusCode,
                        htmlBody.length() > 1000 ? htmlBody.substring(0, 1000) + "\n... [truncated]" : htmlBody);

                throw new IllegalStateException(
                        "OpenAI API call to [" + url + "] returned text/html (HTTP " + statusCode + "). " +
                        "This is typically a corporate proxy blocking the request. " +
                        "Ensure api.openai.com is reachable from this machine. " +
                        "Check logs above for the full HTML response.");
            }

            return response;
        };
    }
}
