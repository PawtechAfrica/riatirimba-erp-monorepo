// import dotenv from 'dotenv'
import {HelmetOptions} from 'helmet'

// dotenv.config();

export const helmetOptions: HelmetOptions = {
    // Prevents clickjacking (no iframes)
    frameguard: {action: "deny"},

    // Prevent browsers from guessing MIME types
    noSniff: true,

    // Helps mitigate XSS attacks
    xssFilter: true, // deprecated but Helmet still supports setting the header

    // Enforce HTTPS (HSTS) – adjust maxAge & preload for production
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },

    // Control referrer header for privacy
    referrerPolicy: {policy: "no-referrer"},

    // Disables DNS prefetching
    dnsPrefetchControl: {allow: false},

    // Hide Express fingerprinting
    hidePoweredBy: true,

    // Content Security Policy (CSP) – strict in prod, relaxed in dev
    contentSecurityPolicy:
        process.env.NODE_ENV === "production"
            ? {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'"],
                    styleSrc: ["'self'", "https:"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'"],
                    fontSrc: ["'self'", "https:", "data:"],
                    objectSrc: ["'none'"],
                    upgradeInsecureRequests: [],
                },
            }
            : false, // disable in dev for easier debugging

    // Cross-Origin Embedder Policy (good for preventing side-channel attacks)
    crossOriginEmbedderPolicy: true,

    // Cross-Origin Resource Policy (prevents resource leaks)
    crossOriginResourcePolicy: {policy: "same-origin"},
}
