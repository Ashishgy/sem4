# Base image
FROM gradle:8.1.1-jdk11 AS builder

# Set the working directory
WORKDIR /app

# Copy the source code to the container
COPY . .

RUN gradle shadowJar --no-daemon

# Base image
FROM openjdk:11-jre-slim

# Set the working directory
WORKDIR /app

# Copy the shadow JAR from the builder stage to the final image
COPY --from=builder /app/app/build/libs/app-all.jar ./app.jar
COPY sleep_data.csv /app/sleep_data.csv

# Start the application
CMD ["java", "-jar", "app.jar"]
