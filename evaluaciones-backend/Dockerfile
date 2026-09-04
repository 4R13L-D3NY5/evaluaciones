# Etapa 1: Build con Maven
FROM maven:3.9.8-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Runtime ligero
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/evaluaciones-backend-*.jar app.jar
RUN mkdir -p /app/storage
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
