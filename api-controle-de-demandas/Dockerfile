# ==========================
# Stage 1: Build da aplicação
# ==========================
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copia dependências e prepara cache do Maven
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw
RUN ./mvnw dependency:go-offline

# Copia o código fonte
COPY src ./src

# Compila o projeto sem rodar testes
RUN ./mvnw clean package -DskipTests


# ==========================
# Stage 2: Runtime da aplicação
# ==========================
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copia o artefato gerado
COPY --from=build /app/target/*.jar app.jar

# Copia o arquivo .env (para referência apenas)
COPY .env .env

# ⚠️ Não tente exportar variáveis do .env aqui — elas serão injetadas pelo GitLab CI/CD
# Cada linha RUN cria uma camada isolada; o export não persiste.
# As variáveis serão passadas automaticamente em tempo de execução no Rancher.

# Define o perfil padrão como 'prod'
ENV SPRING_PROFILES_ACTIVE=prod

# Porta padrão da aplicação
EXPOSE 8080

# Inicializa a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]
