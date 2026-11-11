package com.cinebot.common.redis;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

/**
 * Loads {@code classpath*:redis/*.lua} once. {@link StringRedisTemplate} executes them with {@code EVALSHA} and
 * falls back to {@code EVAL} on {@code NOSCRIPT} (ARCHITECTURE §6.3). An empty directory is valid.
 */
@Component
public class LuaScriptRegistry {

    private final StringRedisTemplate redis;
    private final Map<String, RedisScript<String>> scripts;

    public LuaScriptRegistry(StringRedisTemplate redis, ResourcePatternResolver resources) throws IOException {
        this.redis = redis;
        Map<String, RedisScript<String>> loaded = new LinkedHashMap<>();
        Resource[] found;
        try {
            found = resources.getResources("classpath*:redis/*.lua");
        } catch (IOException ex) {
            found = new Resource[0];
        }
        for (Resource resource : found) {
            String filename = resource.getFilename();
            if (filename == null || !filename.endsWith(".lua")) {
                continue;
            }
            String name = filename.substring(0, filename.length() - 4);
            String body = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
            loaded.put(name, RedisScript.of(body, String.class));
        }
        this.scripts = Map.copyOf(loaded);
    }

    public Set<String> names() {
        return scripts.keySet();
    }

    public RedisScript<String> script(String name) {
        RedisScript<String> script = scripts.get(name);
        if (script == null) {
            throw new IllegalArgumentException("Unknown Lua script: " + name);
        }
        return script;
    }

    public String execute(String name, List<String> keys, List<String> args) {
        return redis.execute(script(name), keys, args.toArray());
    }
}
