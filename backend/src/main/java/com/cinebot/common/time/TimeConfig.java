package com.cinebot.common.time;

import com.cinebot.common.CinebotProperties;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import java.io.IOException;
import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

/** Injected UTC clock (ER-06) and contract JSON time format (ISO-8601 with a +07:00 offset). */
@Configuration
public class TimeConfig {

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    CinemaTime cinemaTime(Clock clock, CinebotProperties properties) {
        return new CinemaTime(clock, ZoneId.of(properties.cinemaTimezone()));
    }

    @Bean
    Jackson2ObjectMapperBuilderCustomizer cinemaTimeJson(CinemaTime cinemaTime) {
        ZoneId zone = cinemaTime.zone();
        return builder -> customize(builder, zone);
    }

    static void customize(Jackson2ObjectMapperBuilder builder, ZoneId zone) {
        builder.serializerByType(Instant.class, new InstantOffsetSerializer(zone));
        builder.deserializerByType(Instant.class, new InstantOffsetDeserializer());
        builder.featuresToDisable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    static final class InstantOffsetSerializer extends JsonSerializer<Instant> {
        private final ZoneId zone;

        InstantOffsetSerializer(ZoneId zone) {
            this.zone = zone;
        }

        @Override
        public void serialize(Instant value, JsonGenerator generator, SerializerProvider serializers) throws IOException {
            if (value == null) {
                generator.writeNull();
                return;
            }
            generator.writeString(DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(value.atZone(zone)));
        }
    }

    static final class InstantOffsetDeserializer extends JsonDeserializer<Instant> {
        @Override
        public Instant deserialize(JsonParser parser, DeserializationContext context) throws IOException {
            String text = parser.getValueAsString();
            if (text == null || text.isBlank()) {
                return null;
            }
            return OffsetDateTime.parse(text).toInstant();
        }
    }
}
