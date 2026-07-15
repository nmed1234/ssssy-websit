package org.ssssy.backend.aspect;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.ssssy.backend.model.entity.AuditLog;
import org.ssssy.backend.repository.AuditLogRepository;

import java.util.UUID;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

  private final AuditLogRepository auditLogRepository;

  @Pointcut("within(@org.springframework.web.bind.annotation.RestController *)")
  public void controllerMethods() {}

  @Around("controllerMethods()")
  public Object auditSlowRequests(ProceedingJoinPoint joinPoint) throws Throwable {
    long start = System.currentTimeMillis();
    Object result = joinPoint.proceed();
    long duration = System.currentTimeMillis() - start;

    if (duration > 1000) {
      ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
      if (attrs != null) {
        HttpServletRequest request = attrs.getRequest();
        AuditLog log = AuditLog.builder()
            .action(request.getMethod() + " " + request.getRequestURI())
            .entityType("SLOW_REQUEST")
            .ipAddress(request.getRemoteAddr())
            .userAgent(request.getHeader("User-Agent"))
            .build();
        auditLogRepository.save(log);
      }
    }
    return result;
  }
}
