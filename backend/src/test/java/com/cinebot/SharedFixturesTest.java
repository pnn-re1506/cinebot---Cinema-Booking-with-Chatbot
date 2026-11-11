package com.cinebot;

import static org.assertj.core.api.Assertions.assertThat;

import com.cinebot.support.SharedFixtures;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;

class SharedFixturesTest {

    @Test
    void readsOrphanRuleCases() throws Exception {
        JsonNode root = SharedFixtures.readTree("orphan-rule-cases.json");
        assertThat(root.get("cases").size()).isGreaterThanOrEqualTo(11);
        assertThat(root.get("cases").get(0).get("id").asText()).isEqualTo("BR08-01");
        assertThat(root.get("cases").get(0).get("description").asText()).isNotBlank();
    }
}
