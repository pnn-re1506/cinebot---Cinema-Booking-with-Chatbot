package com.cinebot.common.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.distributed.ExpirationAfterWriteStrategy;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import io.github.bucket4j.redis.lettuce.Bucket4jLettuce;
import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.codec.ByteArrayCodec;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Bucket4j token buckets stored in Redis under {@code cb:rl:} (ER-14). Capacities come from
 * {@code cinebot.rate-limits}: LOGIN 10/min per IP, REGISTER 5/min per IP, BOOKING_LOOKUP 5/min per IP (BR-21),
 * HOLD_CREATE 20/min per owner.
 */
@Component
public class RedisRateLimiter implements RateLimiter, DisposableBean {

    static final String KEY_PREFIX = "cb:rl:";

    private final ProxyManager<byte[]> proxyManager;
    private final StatefulRedisConnection<byte[], byte[]> connection;
    private final RedisClient client;
    private final RateLimitProperties properties;

    public RedisRateLimiter(Environment environment, RateLimitProperties properties) {
        String url = environment.getProperty("spring.data.redis.url", "redis://localhost:6379");
        this.client = RedisClient.create(url);
        this.connection = client.connect(ByteArrayCodec.INSTANCE);
        this.proxyManager = Bucket4jLettuce.casBasedBuilder(connection)
                .expirationAfterWrite(ExpirationAfterWriteStrategy.basedOnTimeForRefillingBucketUpToMax(
                        Duration.ofMinutes(10)))
                .build();
        this.properties = properties;
    }

    @Override
    public void consume(RateLimitPolicy policy, String key) {
        if (key == null || key.isBlank()) {
            throw new IllegalArgumentException("rate limit key is required");
        }
        RateLimitProperties.Limit limit = properties.forPolicy(policy);
        if (limit == null || limit.capacity() < 1 || limit.period() == null || limit.period().isZero()
                || limit.period().isNegative()) {
            throw new IllegalStateException("Invalid rate limit configuration for " + policy);
        }
        BucketConfiguration configuration = BucketConfiguration.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(limit.capacity())
                        .refillGreedy(limit.capacity(), limit.period())
                        .build())
                .build();
        byte[] redisKey = (KEY_PREFIX + policy.name() + ":" + key).getBytes(StandardCharsets.UTF_8);
        ConsumptionProbe probe = proxyManager.builder()
                .build(redisKey, () -> configuration)
                .tryConsumeAndReturnRemaining(1);
        if (!probe.isConsumed()) {
            long nanos = probe.getNanosToWaitForRefill();
            long seconds = Math.max(1L, (nanos + 1_000_000_000L - 1L) / 1_000_000_000L);
            throw new RateLimitExceededException(seconds);
        }
    }

    @Override
    public void destroy() {
        connection.close();
        client.shutdown();
    }
}
