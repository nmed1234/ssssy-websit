package org.ssssy.backend.config;

import java.util.concurrent.Executor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * Configures the default {@code @Async} executor used by all async methods in the application
 * (email sending, event logging, notifications).
 *
 * <p>Sizing rationale:
 * <ul>
 *   <li>{@code corePoolSize} = 4 — keeps 4 threads alive for sustained bursts</li>
 *   <li>{@code maxPoolSize} = 16 — scales up for email/notification spikes</li>
 *   <li>{@code queueCapacity} = 200 — absorbs bursty workloads without rejection</li>
 *   <li>{@code CallerRunsPolicy} — if the queue is full the calling thread executes the task
 *       rather than dropping it (safe for low-priority async work)</li>
 * </ul>
 *
 * <p>Implementation note: the {@link ThreadPoolTaskExecutor} is declared as a {@code @Bean}
 * named {@value #EXECUTOR_BEAN_NAME} so it is addressable via {@code @Async(EXECUTOR_BEAN_NAME)}.
 * {@link AsyncConfigurer#getAsyncExecutor()} delegates to the same bean (looked up from the
 * context) so there is exactly one executor instance — no double-registration.
 */
@Configuration
public class AsyncConfig implements AsyncConfigurer {

  public static final String EXECUTOR_BEAN_NAME = "ssssyTaskExecutor";

  @Bean(name = EXECUTOR_BEAN_NAME)
  public ThreadPoolTaskExecutor ssssyTaskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(4);
    executor.setMaxPoolSize(16);
    executor.setQueueCapacity(200);
    executor.setThreadNamePrefix("ssssy-async-");
    executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
    executor.setWaitForTasksToCompleteOnShutdown(true);
    executor.setAwaitTerminationSeconds(30);
    executor.initialize();
    return executor;
  }

  /**
   * Wires the named executor as the default for {@code @Async} methods that do not specify
   * an executor name.  Delegates to the Spring-managed bean — no duplicate instantiation.
   */
  @Override
  public Executor getAsyncExecutor() {
    return ssssyTaskExecutor();
  }
}
