# Stage 1: Build the application
FROM maven:3.9.8-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# کپی فایل وابستگی‌ها جهت کش شدن لایه‌های داکر
COPY pom.xml .
RUN mvn dependency:go-offline -B

# کپی سورس کد و بیلد بدون اجرای تست‌های لوکال
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal Production Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# تنظیم متغیرهای سیستمی و زمان
ENV TZ=Asia/Tehran
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0 -Djava.security.egd=file:/dev/./urandom"

# ساخت کاربر غیر روت برای امنیت کانتینر
RUN addgroup -S vttgroup && adduser -S vttuser -G vttgroup && mkdir -p /app/uploads && chown -R vttuser:vttgroup /app

USER vttuser

COPY --from=builder /app/target/*.jar app.jar

# پورت به صورت داینامیک توسط Railway ست می‌شود
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]