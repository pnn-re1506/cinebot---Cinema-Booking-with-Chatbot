package com.cinebot.common.i18n;

import java.util.List;
import java.util.Locale;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

/** {@code Accept-Language} selects {@code vi} or {@code en}. The default is {@code vi} (ARCHITECTURE §9.3). */
@Configuration
public class LocaleConfig {

    public static final Locale VIETNAMESE = Locale.forLanguageTag("vi");
    public static final Locale ENGLISH = Locale.ENGLISH;

    @Bean
    LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
        resolver.setSupportedLocales(List.of(VIETNAMESE, ENGLISH));
        resolver.setDefaultLocale(VIETNAMESE);
        return resolver;
    }
}
