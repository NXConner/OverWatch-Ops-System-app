export const environment = {
  production: true,
  apiUrl: process.env.API_URL || 'https://api.blacktop-blackout.com',
  frontendUrl: process.env.FRONTEND_URL || 'https://blacktop-blackout.com',
  
  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'blacktop_blackout',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD!, // Required in production
    ssl: process.env.DB_SSL !== 'false', // Default to true in production
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '50'),
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET!, // Required in production
    expiresIn: process.env.JWT_EXPIRES_IN || '8h', // Shorter expiry in production
  },
  
  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || '',
  },
  
  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB in production
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    uploadPath: process.env.UPLOAD_PATH || '/app/uploads',
  },
  
  // External API keys
  external: {
    weatherApiKey: process.env.WEATHER_API_KEY!,
    mapsApiKey: process.env.MAPS_API_KEY!,
  },
  
  // Plugin configuration
  plugins: {
    directory: process.env.PLUGINS_DIR || '/app/plugins',
    trustedSigners: process.env.TRUSTED_PLUGIN_SIGNERS?.split(',') || [],
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info', // Less verbose in production
    file: process.env.LOG_FILE || '/app/logs/app.log',
  },
  
  // Security configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '14'), // More rounds in production
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '200'), // Higher limit in production
  }
};