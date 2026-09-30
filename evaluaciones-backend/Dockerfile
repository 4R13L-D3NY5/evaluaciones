FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache typst
COPY target/evaluaciones-backend-*.jar app.jar
RUN mkdir -p /app/storage
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
