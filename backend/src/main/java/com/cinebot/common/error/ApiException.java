package com.cinebot.common.error;

import java.util.Map;

/**
 * Business failure carried as an {@link ErrorCode}. {@code detail} is for operators, never a user-facing sentence
 * (ER-05). {@code seatIds} may be supplied in {@code properties}.
 */
public class ApiException extends RuntimeException {

    private final ErrorCode code;
    private final String detail;
    private final Map<String, Object> properties;

    public ApiException(ErrorCode code, String detail, Map<String, Object> properties) {
        super(code.name());
        this.code = code;
        this.detail = detail;
        this.properties = properties == null ? Map.of() : Map.copyOf(properties);
    }

    public ApiException(ErrorCode code, String detail) {
        this(code, detail, Map.of());
    }

    public ErrorCode code() {
        return code;
    }

    public String detail() {
        return detail;
    }

    public Map<String, Object> properties() {
        return properties;
    }
}
