# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# Cache dependency downloads separately from source compile
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Non-root user for security
RUN addgroup -S ssssy && adduser -S ssssy -G ssssy

# Create directories the app writes to at runtime; ensure correct ownership
RUN mkdir -p /app/uploads /app/logs /app/plugins /tmp/ssssy-uploads \
    && chown -R ssssy:ssssy /app /tmp/ssssy-uploads

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
USER ssssy

# JVM tuning for containerised production deployment:
#   -XX:+UseContainerSupport   — honour cgroup CPU/memory limits
#   -XX:MaxRAMPercentage=75.0  — use 75% of container RAM for heap
#   -XX:+UseG1GC               — low-pause GC, suitable for web workloads
#   -Djava.io.tmpdir           — use a writable tmpdir for multipart uploads
#   -Dspring.profiles.active   — activate the prod Spring profile by default
#                                (override with -e SPRING_PROFILES_ACTIVE=dev)
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+UseG1GC", \
  "-XX:+ExitOnOutOfMemoryError", \
  "-Djava.io.tmpdir=/tmp/ssssy-uploads", \
  "-Duser.timezone=Asia/Damascus", \
  "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod}", \
  "-jar", "app.jar"]
