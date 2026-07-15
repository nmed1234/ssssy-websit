package org.ssssy.backend.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@EnableCaching
public class CacheConfig {

  @Bean
  @Profile("!redis")
  public CacheManager localCacheManager() {
    return new ConcurrentMapCacheManager("publicContent", "events", "jobVacancies", "categories", "systemConfig", "contentStrings", "siteSections", "themeSettings");
  }

  @Bean
  @Profile("redis")
  public CacheManager redisCacheManager(
      org.springframework.data.redis.cache.RedisCacheConfiguration config,
      org.springframework.data.redis.connection.RedisConnectionFactory factory) {
    return org.springframework.data.redis.cache.RedisCacheManager.builder(factory)
        .cacheDefaults(config)
        .build();
  }

  @Bean
  @Profile("redis")
  public org.springframework.data.redis.cache.RedisCacheConfiguration defaultCacheConfig() {
    return org.springframework.data.redis.cache.RedisCacheConfiguration
        .defaultCacheConfig()
        .entryTtl(java.time.Duration.ofHours(1))
        .disableCachingNullValues();
  }
}
