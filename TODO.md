# CourTier Frontend — TODO

## 1. Install & Run

```bash
cd courtier-frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**  
Backend must be running at **http://localhost:8080**

---

## 2. Backend — Required Changes

### A. CORS (Most Important)
Add CORS config to `SecurityConfig.java` so the frontend can call the backend:

```java
// Inside securityFilterChain(), add:
http.cors(cors -> cors.configurationSource(corsConfigurationSource()))

// Add this bean:
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:4173"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
}
```

### B. AuthResponse field names
Make sure `AuthResponse.java` record fields are **camelCase**:
```java
public record AuthResponse(
    String accessToken,   // NOT AccessToken
    String refreshToken,  // NOT RefreshToken
    String email,
    String fullName
) {}
```

### C. CaptchaResponse must be null-safe
`GET /api/cases/captcha` should return `{ "success": true, "data": null }` for High Court CNRs (no captcha needed). Make sure `CaseService.getCaptcha()` handles that and doesn't throw.

### D. POST /api/cases/{cnrNumber}/poll
The manual refresh button calls `POST /api/cases/{cnrNumber}/poll`. Confirm `pollAndUpdate()` is wired to this endpoint in `CaseController.java`.

---

## 3. Pages & Routes

| Route | Page | Notes |
|-------|------|-------|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | Dashboard | Protected |
| `/cases` | All Cases | Protected |
| `/cases/:cnrNumber` | Case Detail | Protected |
| `/check` | Check Status | Protected |

---

## 4. Features Included

- **Auth**: Register, Login, JWT stored in localStorage, auto-redirect
- **Dashboard**: Stats (total, pending, disposed, upcoming), cases sorted by urgency
- **My Cases**: Full list with search + status filter
- **Case Detail**: Full info — parties, acts, hearing timeline, judge, next hearing
- **Check Status**: Look up any CNR (with captcha for district courts) — see status without tracking. Option to start tracking from results.
- **Add Case Flow**: Captcha modal for eCourts district courts, instant for Allahabad/Delhi HC
- **Manual Refresh**: Refresh button on each card and detail page
- **Hearing urgency**: Cards highlight red/blue when hearing is within 3/14 days
- **Toast notifications**: All actions have success/error feedback
- **Mobile-first**: Bottom nav on mobile, top nav on desktop

---

## 5. Optional Improvements (Later)

- [ ] Add Delhi HC scraper support in backend
- [ ] Push notifications (after Kafka/notification phase)
- [ ] PWA manifest for "Add to Home Screen"
- [ ] Pagination on cases list if > 20 cases
- [ ] Dark/light theme toggle (currently dark only)
- [ ] Production build: `npm run build` → serve `dist/` from Spring Boot static resources
