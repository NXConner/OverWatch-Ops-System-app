export declare const environment: {
    production: boolean;
    apiUrl: string;
    frontendUrl: string;
    database: {
        host: string;
        port: number;
        name: string;
        username: string;
        password: string;
        ssl: boolean;
        maxConnections: number;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    redis: {
        host: string;
        port: number;
        password: string;
    };
    upload: {
        maxFileSize: number;
        allowedTypes: string[];
        uploadPath: string;
    };
    external: {
        weatherApiKey: string;
        mapsApiKey: string;
    };
    plugins: {
        directory: string;
        trustedSigners: string[];
    };
    logging: {
        level: string;
        file: string;
    };
    security: {
        bcryptRounds: number;
        rateLimitWindow: number;
        rateLimitMax: number;
    };
};
//# sourceMappingURL=environment.d.ts.map