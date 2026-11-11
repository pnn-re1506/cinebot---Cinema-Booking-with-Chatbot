package com.cinebot.common.error;

import com.cinebot.booking.application.SeatInventoryUnavailableException;
import com.cinebot.common.ratelimit.RateLimitExceededException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Maps failures to {@code application/problem+json} (ER-05, ARCHITECTURE §9.2). Responses carry codes, not sentences.
 */
@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    ResponseEntity<ProblemDetail> handleApi(ApiException exception) {
        Map<String, Object> extra = new LinkedHashMap<>();
        Object seatIds = exception.properties().get("seatIds");
        if (seatIds != null) {
            extra.put("seatIds", seatIds);
        }
        return body(ProblemResponses.of(exception.code(), exception.detail(), extra));
    }

    @ExceptionHandler(BindException.class)
    ResponseEntity<ProblemDetail> handleBind(BindException exception) {
        return validation(fieldErrors(exception.getFieldErrors()));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ProblemDetail> handleConstraint(ConstraintViolationException exception) {
        List<Map<String, String>> errors = new ArrayList<>();
        for (ConstraintViolation<?> violation : exception.getConstraintViolations()) {
            errors.add(fieldError(
                    violation.getPropertyPath().toString(),
                    violation.getConstraintDescriptor().getAnnotation().annotationType().getSimpleName()));
        }
        return validation(errors);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ProblemDetail> handleUnreadable(HttpMessageNotReadableException exception) {
        log.debug("Unreadable request body: {}", exception.getClass().getSimpleName());
        return validation(List.of());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ResponseEntity<ProblemDetail> handleTypeMismatch(MethodArgumentTypeMismatchException exception) {
        return validation(List.of(fieldError(exception.getName(), "TypeMismatch")));
    }

    @ExceptionHandler({NoResourceFoundException.class, NoHandlerFoundException.class})
    ResponseEntity<ProblemDetail> handleNotFound(Exception exception) {
        return body(ProblemResponses.of(ErrorCode.NOT_FOUND));
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ProblemDetail> handleAccessDenied(AccessDeniedException exception) {
        return body(ProblemResponses.of(ErrorCode.FORBIDDEN));
    }

    @ExceptionHandler(SeatInventoryUnavailableException.class)
    ResponseEntity<ProblemDetail> handleSeatInventory(SeatInventoryUnavailableException exception) {
        log.warn("Seat inventory unavailable");
        return body(ProblemResponses.of(ErrorCode.SEAT_SERVICE_UNAVAILABLE));
    }

    @ExceptionHandler(RateLimitExceededException.class)
    ResponseEntity<ProblemDetail> handleRateLimit(RateLimitExceededException exception) {
        return ResponseEntity.status(ErrorCode.RATE_LIMITED.status())
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .header(HttpHeaders.RETRY_AFTER, Long.toString(exception.retryAfterSeconds()))
                .body(ProblemResponses.of(ErrorCode.RATE_LIMITED));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ProblemDetail> handleUnexpected(Exception exception) {
        log.error("Unhandled exception", exception);
        return body(ProblemResponses.of(ErrorCode.INTERNAL_ERROR));
    }

    private static ResponseEntity<ProblemDetail> validation(List<Map<String, String>> fieldErrors) {
        Map<String, Object> extra = fieldErrors.isEmpty() ? Map.of() : Map.of("fieldErrors", fieldErrors);
        return body(ProblemResponses.of(ErrorCode.VALIDATION_FAILED, null, extra));
    }

    private static List<Map<String, String>> fieldErrors(List<FieldError> errors) {
        List<Map<String, String>> result = new ArrayList<>();
        for (FieldError error : errors) {
            result.add(fieldError(error.getField(), error.getCode()));
        }
        return result;
    }

    private static Map<String, String> fieldError(String field, String code) {
        Map<String, String> error = new LinkedHashMap<>();
        error.put("field", field);
        error.put("code", code == null ? "Invalid" : code);
        return error;
    }

    private static ResponseEntity<ProblemDetail> body(ProblemDetail problem) {
        return ResponseEntity.status(problem.getStatus())
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problem);
    }
}
