package mr.bmci.gestioncommandesbackend.application;

import mr.bmci.gestioncommandesbackend.domaine.Utilisateur;
import mr.bmci.gestioncommandesbackend.web.dto.LoginRequest;
import mr.bmci.gestioncommandesbackend.web.dto.TokenResponse;
import mr.bmci.gestioncommandesbackend.web.security.JwtProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UtilisateurService    utilisateurService;
    private final AuthenticationManager authenticationManager;
    private final JwtProvider           jwtProvider;
    private final PasswordEncoder       passwordEncoder;

    public AuthService(UtilisateurService utilisateurService,
                       AuthenticationManager authenticationManager,
                       JwtProvider jwtProvider,
                       PasswordEncoder passwordEncoder) {
        this.utilisateurService    = utilisateurService;
        this.authenticationManager = authenticationManager;  // now injected lazily
        this.jwtProvider           = jwtProvider;
        this.passwordEncoder       = passwordEncoder;
    }

    /**
     * Inscrit un nouvel utilisateur en base (US01).
     * On encode le mot de passe AVANT la persistance.
     */
    public void register(Utilisateur u) {
        String raw    = u.getMdp_hash();
        String hashed = passwordEncoder.encode(raw);
        u.setMdp_hash(hashed);
        utilisateurService.save(u);
    }

    /**
     * Authentifie et génère un JWT.
     */
    public TokenResponse login(LoginRequest creds) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        creds.getUsername(),
                        creds.getPassword()
                )
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        String role = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("");

        // Générez le token avec le rôle
        String jwt = jwtProvider.generateToken(auth.getName(), role);

        return new TokenResponse(jwt, role);
    }
}
