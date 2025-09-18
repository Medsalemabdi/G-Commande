package mr.bmci.gestioncommandesbackend.web.security;



import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtProvider {

    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Value("${app.jwtExpirationMs}")
    private long jwtExpirationMs;

    private Algorithm algorithm() {
        return Algorithm.HMAC256(jwtSecret);
    }

    /** Génère un JWT avec comme subject le username et date d’expiration. */
    public String generateToken(String username, String role) {
        Date now = new Date();
        Date expires = new Date(now.getTime() + jwtExpirationMs);

        return JWT.create()
                .withSubject(username)
                .withClaim("role", role)
                .withIssuedAt(now)
                .withExpiresAt(expires)
                .sign(algorithm());
    }



}

