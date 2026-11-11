package com.cinebot;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cinebot.common.i18n.LocaleConfig;
import java.util.Locale;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.LocaleResolver;

class ContextLoadsTest extends IntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LocaleResolver localeResolver;

    @Test
    void contextLoadsAndHealthAndApiDocsRespond() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
        mockMvc.perform(get("/v3/api-docs")).andExpect(status().isOk());
    }

    @Test
    void localeResolverDefaultsToVietnameseAndAcceptsEnglish() {
        var request = new org.springframework.mock.web.MockHttpServletRequest();
        assertThat(localeResolver.resolveLocale(request)).isEqualTo(LocaleConfig.VIETNAMESE);
        request.addHeader("Accept-Language", "en");
        assertThat(localeResolver.resolveLocale(request).getLanguage()).isEqualTo(Locale.ENGLISH.getLanguage());
    }
}
