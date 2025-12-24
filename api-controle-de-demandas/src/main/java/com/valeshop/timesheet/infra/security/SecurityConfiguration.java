package com.valeshop.timesheet.infra.security;

import com.valeshop.timesheet.entities.user.User;
import com.valeshop.timesheet.entities.user.UserType;
import com.valeshop.timesheet.repositories.UserRepository;
import com.valeshop.timesheet.services.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfiguration.class);

    @Autowired
    private SecurityFilter securityFilter;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 🔥 Agora usando AllowedOriginPatterns (funciona com localhost em qualquer porta)
        configuration.setAllowedOriginPatterns(Arrays.asList(
                frontendUrl,
                "http://localhost:*"
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Location"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        System.out.println("[API] securityFilterChain");

        http
            .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Rotas públicas
                .requestMatchers(HttpMethod.POST, "/api/users/register").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/users/verify-email").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users/forgot-password").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users/reset-password").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users/resend-verification").permitAll()
                .requestMatchers("/login/**", "/oauth2/**", "/api/oauth2/**").permitAll()
                // Rota de dev
                .requestMatchers("/h2-console/**").permitAll()

                // Rotas privadas
                .anyRequest().authenticated()

            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(oAuth2UserService())
                    .oidcUserService(oidcUserService())
                )
                .successHandler(oAuth2SuccessHandler())
                .failureUrl("/login?error=true")
            );

        http.addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public OAuth2UserService<OidcUserRequest, OidcUser> oidcUserService() {
        log.info("[OAuth2] Entered oidcUserService");
        OidcUserService delegate = new OidcUserService();

        return request -> {
            log.info("[OAuth2] Starting OIDC login processing");
            OidcUser oidcUser = delegate.loadUser(request);

            String email = null;
            try {
                email = oidcUser.getAttribute("preferred_username");
                if (email == null) email = oidcUser.getAttribute("email");
                if (email == null) email = oidcUser.getAttribute("upn");
            } catch (Exception ignored) {}

            String name = null;
            try { name = oidcUser.getAttribute("name"); } catch (Exception ignored) {}

            if (email != null) {
                log.info("[OAuth2] (OIDC) Email received: {}", email);
                User existingUser = userRepository.findByEmail(email).orElse(null);

                if (existingUser != null) {
                    log.info("[OAuth2] (OIDC) User exists: {} (enabled={})", email, existingUser.isEnabled());
                    if (!existingUser.isEnabled()) {
                        String verificationToken = existingUser.getVerificationToken();

                        if (verificationToken == null ||
                            existingUser.getVerificationTokenExpiry() == null ||
                            existingUser.getVerificationTokenExpiry().isBefore(java.time.LocalDateTime.now())) {

                            verificationToken = UUID.randomUUID().toString();
                            existingUser.setVerificationToken(verificationToken);
                            existingUser.setVerificationTokenExpiry(java.time.LocalDateTime.now().plusDays(1));
                            userRepository.save(existingUser);
                        }

                        try {
                            emailService.sendVerificationEmail(existingUser.getEmail(), verificationToken);
                        } catch (Exception ignored) {}
                    }
                    return oidcUser;
                }

                User newUser = new User();
                newUser.setEmail(email);
                try { newUser.getClass().getMethod("setName", String.class).invoke(newUser, name); } catch (Exception ignored) {}

                newUser.setEnabled(false);
                newUser.setUserType(UserType.Normal);
                newUser.setPassword(new BCryptPasswordEncoder().encode("microsoft-login"));

                String verificationToken = UUID.randomUUID().toString();
                newUser.setVerificationToken(verificationToken);
                newUser.setVerificationTokenExpiry(java.time.LocalDateTime.now().plusDays(1));

                try {
                    userRepository.save(newUser);
                    userRepository.flush();
                } catch (Exception ignored) {}

                try {
                    emailService.sendVerificationEmail(newUser.getEmail(), verificationToken);
                } catch (Exception ignored) {}

                return oidcUser;
            }

            log.warn("[OAuth2] (OIDC) Email not found");
            return oidcUser;
        };
    }

    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oAuth2UserService() {
        DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();

        return request -> {
            OAuth2User user = delegate.loadUser(request);
            return user; // Mantive sem mudanças, só pra reduzir tamanho
        };
    }

    @Bean
    public AuthenticationSuccessHandler oAuth2SuccessHandler() {
        return (request, response, authentication) -> {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String email = (String) oAuth2User.getAttributes().get("preferred_username");
            String name = (String) oAuth2User.getAttributes().get("name");

            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null || !user.isEnabled()) {
                response.setStatus(HttpServletResponse.SC_OK);
                response.setContentType("text/html;charset=UTF-8");
                String message = String.format("Conta criada! Verifique seu e-mail (%s).", email);

                String html = "<html><body><script>\n" +
                        "window.opener && window.opener.postMessage({ type: 'activation', message: '" + message + "' }, '*');\n" +
                        "window.close();\n" +
                        "</script><p>" + message + "</p></body></html>";

                response.getWriter().write(html);
                return;
            }

            String token = tokenService.generateToken(user);
            String userType = user.getUserType() != null ? user.getUserType().name() : "Normal";

            String baseCallback = frontendUrl.endsWith("/") ? frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;

            String redirectUrl = String.format(
                baseCallback + "/callback#token=%s&userType=%s&name=%s&email=%s",
                URLEncoder.encode(token, StandardCharsets.UTF_8),
                URLEncoder.encode(userType, StandardCharsets.UTF_8),
                URLEncoder.encode(name, StandardCharsets.UTF_8),
                URLEncoder.encode(email, StandardCharsets.UTF_8)
            );

            response.sendRedirect(redirectUrl);
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration auth) throws Exception {
        return auth.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
