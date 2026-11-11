package com.cinebot.common.error;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;

/** Builds RFC 7807 bodies that carry {@code code} and nothing a customer should read (ER-05). */
public final class ProblemResponses {

    private ProblemResponses() {
    }

    public static ProblemDetail of(ErrorCode code) {
        ProblemDetail problem = ProblemDetail.forStatus(code.status());
        problem.setTitle(code.status().getReasonPhrase());
        problem.setDetail(null);
        problem.setProperty("code", code.name());
        return problem;
    }

    public static ProblemDetail of(ErrorCode code, String detail, Map<String, Object> extra) {
        ProblemDetail problem = of(code);
        if (detail != null && !detail.isBlank()) {
            problem.setDetail(detail);
        }
        if (extra != null) {
            extra.forEach(problem::setProperty);
        }
        return problem;
    }

    public static void write(HttpServletResponse response, ObjectMapper objectMapper, ErrorCode code)
            throws IOException {
        response.setStatus(code.status().value());
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), of(code));
    }

    public static HttpStatus httpStatus(ErrorCode code) {
        return code.status();
    }
}
