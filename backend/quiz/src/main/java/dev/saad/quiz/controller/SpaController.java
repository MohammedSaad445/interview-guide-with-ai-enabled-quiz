package dev.saad.quiz.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Forwards all client-side React Router paths to {@code index.html} so that
 * deep-linking (e.g. navigating directly to {@code /quiz/java}) works when the
 * application is served as a bundled Spring Boot app.
 *
 * <p>Each path-segment pattern {@code [^\\.]+} matches one or more characters that
 * contain <em>no dots</em>.  This means every segment in the matched URL must be
 * dot-free, so file-extension paths such as {@code /assets/main-AbCd.js} or
 * {@code /data/cloud.json} are never intercepted — Spring Boot's static resource
 * handler serves them directly.</p>
 *
 * <p>The app's deepest React Router route is three segments
 * ({@code /topic/:slug/:sectionSlug}), so four explicit patterns cover all
 * client-side navigation without any risk of accidentally catching static assets.</p>
 *
 * <p>Since all API endpoints use POST, there is no conflict with {@code @RestController}
 * mappings at {@code /api/**}.</p>
 */
@Controller
public class SpaController {

    @GetMapping(value = {
        "/",
        "/{a:[^\\.]+}",
        "/{a:[^\\.]+}/{b:[^\\.]+}",
        "/{a:[^\\.]+}/{b:[^\\.]+}/{c:[^\\.]+}"
    })
    public String forwardToIndex(
            @SuppressWarnings("unused") @PathVariable(required = false) String a,
            @SuppressWarnings("unused") @PathVariable(required = false) String b,
            @SuppressWarnings("unused") @PathVariable(required = false) String c,
            HttpServletRequest request) {
        // Safety guard: never intercept /api paths (in case future GET endpoints are added)
        if (request.getRequestURI().startsWith("/api/")) {
            return "forward:" + request.getRequestURI();
        }
        return "forward:/index.html";
    }
}

