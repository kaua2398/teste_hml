package com.valeshop.timesheet.infra.security;

import com.valeshop.timesheet.exceptions.InvalidTokenException;
import com.valeshop.timesheet.exceptions.UserNotFoundException;
import com.valeshop.timesheet.services.AuthorizationService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(SecurityFilter.class);

    @Autowired
    private TokenService tokenService;

    @Autowired
    private AuthorizationService authorizationService;

    /** Rotas públicas da API (ajuste conforme sua app) */
    private boolean isPublicRoute(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/users/register")
                || path.startsWith("/api/users/login")
                || path.startsWith("/api/users/verify-email")
                || path.startsWith("/api/users/reset-password")
                || path.startsWith("/api/users/resend-verification")
                || path.startsWith("/api/users/forgot-password")
                // endpoints do fluxo MS login
                || path.startsWith("/login/")
                || path.startsWith("/oauth2/")
                || path.startsWith("/api/oauth2/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        try {
            // Preflight CORS não deve tentar autenticar
            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                chain.doFilter(request, response);
                return;
            }

            // Evita validação desnecessária em rotas públicas
            if (!isPublicRoute(request)) {
                // Evita reautenticar se já existir Authentication no contexto
                if (SecurityContextHolder.getContext().getAuthentication() == null) {
                    String token = recoverToken(request);

                    if (token != null) {
                        String login = tokenService.validateToken(token);
                        if (login != null && !login.isEmpty()) {
                            UserDetails user = authorizationService.loadUserByUsername(login);
                            var authentication = new UsernamePasswordAuthenticationToken(
                                    user, null, user.getAuthorities());
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                            log.info("[SecurityFilter] Token válido para '{}'", login);
                        } else {
                            log.debug("[SecurityFilter] Token presente, mas inválido/sem login decodificado");
                        }
                    } else {
                        log.debug("[SecurityFilter] Sem header Authorization");
                    }
                }
            } else {
                log.trace("[SecurityFilter] Rota pública: {} {}", request.getMethod(), request.getRequestURI());
            }
        } catch (UserNotFoundException | InvalidTokenException e) {
            SecurityContextHolder.clearContext();
            log.warn("[SecurityFilter] Token inválido ou usuário não encontrado: {}", e.getMessage());
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
            log.error("[SecurityFilter] Erro inesperado no filtro: {}", e.getMessage(), e);
        }

        chain.doFilter(request, response);
    }

    /** Recupera o token do header Authorization de forma robusta */
    private String recoverToken(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth == null) return null;
        // tolerante a caixa e espaços
        String trimmed = auth.trim();
        if (trimmed.length() < 7) return null;
        String prefix = trimmed.substring(0, 6).toLowerCase(); // "bearer"
        if (!"bearer".equals(prefix)) return null;
        char sep = trimmed.charAt(6);
        if (sep != ' ' && sep != '\t') return null; // exige espaço/tabs após Bearer
        return trimmed.substring(7).trim();
    }
}
