package org.ssssy.backend.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Cache configuration.
 *
 * <p>Tries to connect to Redis at startup. If the connection succeeds a Redis-backed
 * {@link RedisCacheManager} is used with per-cache TTLs. If Redis is unavailable (no host
 * configured, or connection refused) the application transparently falls back to an in-process
 * {@link ConcurrentMapCacheManager} so the app starts cleanly without Redis.
 *
 * <p>No Spring profile switch is required — the choice is made automatically at startup.
 */
@Configuration
@EnableCaching
public class CacheConfig {

  private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);

  @Value("${spring.data.redis.host:}")
  private String redisHost;

  @Value("${spring.data.redis.port:6379}")
  private int redisPort;

  @Value("${spring.data.redis.password:}")
  private String redisPassword;

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
  // Single primary cache manager — uses Redis when reachable, in-memory otherwise.
  // -----------------------------------------------------------------------

  @Bean
  @Primary
  public CacheManager cacheManager() {
    if (redisHost != null && !redisHost.isBlank()) {
      try {
        RedisStandaloneConfiguration rsc = new RedisStandaloneConfiguration(redisHost, redisPort);
        if (redisPassword != null && !redisPassword.isBlank()) {
          rsc.setPassword(redisPassword);
        }
        LettuceConnectionFactory factory = new LettuceConnectionFactory(rsc);
        factory.afterPropertiesSet();

        // Verify the connection is actually reachable before committing to Redis cache.
        factory.getConnection().ping();

        log.info("Redis reachable at {}:{} — using RedisCacheManager", redisHost, redisPort);
        return buildRedisCacheManager(factory);
      } catch (Exception ex) {
        log.warn("Redis not reachable ({}:{}) — falling back to in-memory cache: {}",
            redisHost, redisPort, ex.getMessage());
      }
    } else {
      log.info("REDIS_HOST not set — using in-memory ConcurrentMapCacheManager");
    }
    return buildLocalCacheManager();
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  private CacheManager buildRedisCacheManager(RedisConnectionFactory factory) {
    ObjectMapper mapper = new ObjectMapper();
    mapper.registerModule(new JavaTimeModule());
    mapper.activateDefaultTyping(
        LaissezFaireSubTypeValidator.instance,
        ObjectMapper.DefaultTyping.NON_FINAL,
        JsonTypeInfo.As.PROPERTY);
    GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(mapper);

    RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
        .serializeKeysWith(
            RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
        .serializeValuesWith(
            RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer))
        .disableCachingNullValues()
        .entryTtl(Duration.ofMinutes(15));

    Map<String, RedisCacheConfiguration> perCacheConfig = new HashMap<>();
    perCacheConfig.put(CACHE_SYSTEM_CONFIG,   defaultConfig.entryTtl(Duration.ofHours(4)));
    perCacheConfig.put(CACHE_THEME_SETTINGS,  defaultConfig.entryTtl(Duration.ofHours(4)));
    perCacheConfig.put(CACHE_SITE_SECTIONS,   defaultConfig.entryTtl(Duration.ofHours(4)));
    perCacheConfig.put(CACHE_CONTENT_STRINGS, defaultConfig.entryTtl(Duration.ofHours(4)));
    perCacheConfig.put(CACHE_CATEGORIES,      defaultConfig.entryTtl(Duration.ofHours(2)));
    perCacheConfig.put(CACHE_PUBLIC_CONTENT,  defaultConfig.entryTtl(Duration.ofMinutes(15)));
    perCacheConfig.put(CACHE_EVENTS,          defaultConfig.entryTtl(Duration.ofMinutes(15)));
    perCacheConfig.put(CACHE_JOB_VACANCIES,   defaultConfig.entryTtl(Duration.ofMinutes(15)));

    return RedisCacheManager.builder(factory)
        .cacheDefaults(defaultConfig)
        .withInitialCacheConfigurations(perCacheConfig)
        .transactionAware()
        .build();
  }

  @ConditionalOnMissingBean(CacheManager.class)
  private CacheManager buildLocalCacheManager() {
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
