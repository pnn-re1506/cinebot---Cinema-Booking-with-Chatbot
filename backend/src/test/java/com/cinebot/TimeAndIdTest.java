package com.cinebot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cinebot.common.id.BookingCodeGenerator;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

class TimeAndIdTest extends IntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void instantSerializesWithHoChiMinhOffsetAndDatesAreIso() throws Exception {
        String body = mockMvc.perform(get("/api/movies/__probe/instant"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode json = objectMapper.readTree(body);
        assertThat(json.get("at").asText()).isEqualTo("2026-11-11T10:30:00+07:00");
        assertThat(json.get("day").asText()).isEqualTo("2026-11-11");
        assertThat(objectMapper.readValue("\"2026-11-11T10:30:00+07:00\"", Instant.class))
                .isEqualTo(Instant.parse("2026-11-11T03:30:00Z"));
        assertThat(objectMapper.writeValueAsString(LocalDate.parse("2026-11-11"))).isEqualTo("\"2026-11-11\"");
    }

    @Test
    void bookingCodesUseCrockfordAlphabet() {
        BookingCodeGenerator generator = new BookingCodeGenerator(new SecureRandom());
        for (int i = 0; i < 200; i++) {
            String code = generator.next();
            assertThat(code).hasSize(BookingCodeGenerator.LENGTH);
            assertThat(code.chars().allMatch(ch -> BookingCodeGenerator.ALPHABET.indexOf(ch) >= 0)).isTrue();
        }
    }
}
