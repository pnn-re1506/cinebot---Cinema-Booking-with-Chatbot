package com.cinebot;

import static org.assertj.core.api.Assertions.assertThat;

import com.cinebot.common.redis.LuaScriptRegistry;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class LuaScriptRegistryTest extends IntegrationTestBase {

    @Autowired
    private LuaScriptRegistry registry;

    @Test
    void loadsAndExecutesTheTestScript() {
        assertThat(registry.names()).contains("echo");
        assertThat(registry.execute("echo", List.of(), List.of("pong"))).isEqualTo("pong");
    }
}
