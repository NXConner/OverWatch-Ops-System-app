"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environment = void 0;
exports.environment = {
    production: false,
    apiUrl: process.env.API_URL || 'http://localhost:3333',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    // Database configuration
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        name: process.env.DB_NAME || 'blacktop_blackout_dev',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        ssl: process.env.DB_SSL === 'true',
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
    },
    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
    // Redis configuration (for caching and sessions)
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || '',
    },
    // File upload configuration
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
        uploadPath: process.env.UPLOAD_PATH || './uploads',
    },
    // External API keys
    external: {
        weatherApiKey: process.env.WEATHER_API_KEY || '',
        mapsApiKey: process.env.MAPS_API_KEY || '',
    },
    // Plugin configuration
    plugins: {
        directory: process.env.PLUGINS_DIR || './plugins',
        trustedSigners: process.env.TRUSTED_PLUGIN_SIGNERS?.split(',') || [],
    },
    // Logging configuration
    logging: {
        level: process.env.LOG_LEVEL || 'debug',
        file: process.env.LOG_FILE || './logs/app.log',
    },
    // Security configuration
    security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
        rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
        rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    }
};
//# sourceMappingURL=environment.js.map