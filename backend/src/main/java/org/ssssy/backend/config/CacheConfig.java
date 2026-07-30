package org.ssssy.backend.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Cache configuration.
 *
 * <p>When {@code REDIS_HOST} is set (non-empty) a Redis-backed {@link RedisCacheManager} is used
 * with per-cache TTLs.  When Redis is absent (empty host) the application falls back to an
 * in-process {@link ConcurrentMapCacheManager} so the app starts cleanly without Redis.
 *
 * <p>No Spring profile switch is required — the choice is made automatically at startup based on
 * the {@code spring.data.redis.host} property value.
 */
@Configuration
@EnableCaching
public class CacheConfig {

  // -----------------------------------------------------------------------
  // Cache name constants (use these in @Cacheable / @CacheEvict annotations)
  // -----------------------------------------------------------------------
  public static final String CACHE_PUBLIC_CONTENT   = "publicContent";
  public static final String CACHE_EVENTS           = "events";
  public static final String CACHE_JOB_VACANCIES    = "jobVacancies";
  public static final String CACHE_CATEGORIES       = "categories";
  public static final String CACHE_SYSTEM_CONFIG    = "systemConfig";
  public static final String CACHE_CONTENT_STRINGS  = "contentStrings";
  public static final String CACHE_SITE_SECTIONS    = "siteSections";
  public static final String CACHE_THEME_SETTINGS   = "themeSettings";

  // -----------------------------------------------------------------------
  // Redis-backed cache manager
  // Active when spring.data.redis.host is non-empty (any real hostname/IP).
  // -----------------------------------------------------------------------

  @Bean
  @Primary
  @ConditionalOnProperty(name = "spring.data.redis.host", matchIfMissing = false)
  public CacheManager redisCacheManager(RedisConnectionFactory factory) {

    // Value serializer: JSON (human-readable, avoids Java serialization issues)
    ObjectMapper mapper = new ObjectMapper();
    mapper.registerModule(new JavaTimeModule());
    mapper.activateDefaultTyping(
        LaissezFaireSubTypeValidator.instance,
        ObjectMapper.DefaultTyping.NON_FINAL,
        JsonTypeInfo.As.PROPERTY);
    GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(mapper);

    // Default config: key = String, value = JSON, null values not cached
    RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
        .serializeKeysWith(
            RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
        .serializeValuesWith(
            RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer))
        .disableCachingNullValues()
        .entryTtl(Duration.ofMinutes(15)); // conservative default

    // Per-cache TTL overrides
    Map<String, RedisCacheConfiguration> perCacheConfig = new HashMap<>();

    // Near-static config data — long TTL, evicted explicitly on update
    perCacheConfig.put(CACHE_SYSTEM_CONFIG,   defaultConfig.entryTtl(Duration.ofHours(4)));
    perCacheConfig.put(CACHE_THEME_SETTINGS,  defaultConfig.entryTtl(Duration.ofHours(4)));
    perCacheConfig.put(CACHE_SITE_SECTIONS,   defaultConfig.entryTtl(Duration.ofHours(4)));
    perCacheConfig.put(CACHE_CONTENT_STRINGS, defaultConfig.entryTtl(Duration.ofHours(4)));

    // Semi-dynamic — category tree changes rarely
    perCacheConfig.put(CACHE_CATEGORIES, defaultConfig.entryTtl(Duration.ofHours(2)));

    // Dynamic public content — short TTL keeps data fresh
    perCacheConfig.put(CACHE_PUBLIC_CONTENT, defaultConfig.entryTtl(Duration.ofMinutes(15)));
    perCacheConfig.put(CACHE_EVENTS,         defaultConfig.entryTtl(Duration.ofMinutes(15)));
    perCacheConfig.put(CACHE_JOB_VACANCIES,  defaultConfig.entryTtl(Duration.ofMinutes(15)));

    return RedisCacheManager.builder(factory)
        .cacheDefaults(defaultConfig)
        .withInitialCacheConfigurations(perCacheConfig)
        .transactionAware()
        .build();
  }

  // -----------------------------------------------------------------------
  // In-process fallback cache manager
  // Active when REDIS_HOST is empty or not set (e.g. local dev without Redis).
  // -----------------------------------------------------------------------

  @Bean
  @ConditionalOnMissingBean(CacheManager.class)
  public CacheManager localCacheManager() {
    return new ConcurrentMapCacheManager(
        CACHE_PUBLIC_CONTENT,
        CACHE_EVENTS,
        CACHE_JOB_VACANCIES,
        CACHE_CATEGORIES,
        CACHE_SYSTEM_CONFIG,
        CACHE_CONTENT_STRINGS,
        CACHE_SITE_SECTIONS,
        CACHE_THEME_SETTINGS);
  }
}
