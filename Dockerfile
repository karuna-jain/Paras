# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy frontend configuration files and dependencies
COPY paras-frontend/package*.json ./
RUN npm ci

# Copy frontend source files
COPY paras-frontend/ ./

# Build the frontend (outputs to /app/frontend/dist)
RUN npm run build

# Stage 2: Build the Spring Boot backend
FROM eclipse-temurin:22-jdk-alpine AS backend-builder
WORKDIR /app/backend

# Copy gradle configuration wrapper files for caching
COPY paras-backend/gradlew ./
COPY paras-backend/gradle ./gradle
COPY paras-backend/build.gradle ./
COPY paras-backend/settings.gradle ./

# Ensure gradlew has execution permissions
RUN chmod +x gradlew

# Run gradle build to download dependencies (helps with layer caching)
RUN ./gradlew dependencies --no-daemon || true

# Copy backend source code
COPY paras-backend/src ./src

# Copy the built frontend static assets from Stage 1 into the backend resources/static directory
COPY --from=frontend-builder /app/frontend/dist /app/backend/src/main/resources/static/

# Build the final backend executable jar
RUN ./gradlew bootJar --no-daemon -x test

# Stage 3: Package the JRE runtime container
FROM eclipse-temurin:22-jre-alpine
WORKDIR /app

# Copy the built jar from the backend-builder stage
COPY --from=backend-builder /app/backend/build/libs/*-SNAPSHOT.jar app.jar

# Expose the production port (defined as 8080 in application-prod.properties)
EXPOSE 8080

# Run the jar with active prod profile
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
