package com.cinebot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class CinebotApplication {

    public static void main(String[] args) {
        SpringApplication.run(CinebotApplication.class, args);
    }
}
