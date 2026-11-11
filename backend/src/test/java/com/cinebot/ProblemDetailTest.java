package com.cinebot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItems;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

class ProblemDetailTest extends IntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void apiExceptionCarriesCodeAndSeatIds() throws Exception {
        mockMvc.perform(get("/api/movies/__probe/problem"))
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.code").value("SEAT_UNAVAILABLE"))
                .andExpect(jsonPath("$.seatIds", hasItems(11, 12)));
    }

    @Test
    void validationErrorListsFieldConstraintNames() throws Exception {
        mockMvc.perform(post("/api/bookings/__probe/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"count\":0}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItems("name", "count")))
                .andExpect(jsonPath("$.fieldErrors[*].code", hasItems("NotBlank", "Min")));
    }

    @Test
    void unknownRouteIsNotFound() throws Exception {
        mockMvc.perform(get("/api/movies/does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    @Test
    void unexpectedErrorHidesTheExceptionDetail() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/movies/__probe/boom"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                .andReturn();
        String body = result.getResponse().getContentAsString();
        assertThat(body).doesNotContain("sql-password-should-not-leak");
        JsonNode problem = objectMapper.readTree(body);
        assertThat(problem.get("detail") == null || problem.get("detail").isNull()).isTrue();
    }

    @Test
    void seatInventoryOutageIs503AndRateLimitSetsRetryAfter() throws Exception {
        mockMvc.perform(get("/api/movies/__probe/seat-down"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("SEAT_SERVICE_UNAVAILABLE"));
        mockMvc.perform(get("/api/movies/__probe/limited"))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string(HttpHeaders.RETRY_AFTER, "7"))
                .andExpect(jsonPath("$.code").value("RATE_LIMITED"));
    }
}
