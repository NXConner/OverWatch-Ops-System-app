"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const helmet_1 = tslib_1.__importDefault(require("helmet"));
const compression_1 = tslib_1.__importDefault(require("compression"));
const express_rate_limit_1 = tslib_1.__importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const logger_1 = require("./utils/logger");
const error_handler_1 = require("./middleware/error-handler");
const auth_1 = require("./middleware/auth");
const plugin_manager_1 = require("./services/plugin-manager");
const database_1 = require("./services/database");
// Routes
const auth_2 = tslib_1.__importDefault(require("./routes/auth"));
const users_1 = tslib_1.__importDefault(require("./routes/users"));
const modules_1 = tslib_1.__importDefault(require("./routes/modules"));
const overwatch_1 = tslib_1.__importDefault(require("./routes/overwatch"));
const plugins_1 = tslib_1.__importDefault(require("./routes/plugins"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
exports.io = io;
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
// Body parsing middleware
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging middleware
app.use((req, res, next) => {
    logger_1.logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});
// API routes
app.use('/api/auth', auth_2.default);
app.use('/api/users', auth_1.authMiddleware, users_1.default);
app.use('/api/modules', auth_1.authMiddleware, modules_1.default);
app.use('/api/overwatch', auth_1.authMiddleware, overwatch_1.default);
app.use('/api/plugins', auth_1.authMiddleware, plugins_1.default);
// Socket.IO connection handling
io.on('connection', (socket) => {
    logger_1.logger.info(`Client connected: ${socket.id}`);
    socket.on('join-room', (room) => {
        socket.join(room);
        logger_1.logger.info(`Client ${socket.id} joined room: ${room}`);
    });
    socket.on('disconnect', () => {
        logger_1.logger.info(`Client disconnected: ${socket.id}`);
    });
});
// Error handling middleware
app.use(error_handler_1.errorHandler);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});
const PORT = process.env.PORT || 3333;
async function bootstrap() {
    try {
        // Initialize database
        await database_1.DatabaseService.initialize();
        logger_1.logger.info('Database initialized successfully');
        // Initialize plugin manager
        await plugin_manager_1.pluginManager.initialize();
        logger_1.logger.info('Plugin manager initialized successfully');
        // Start server
        server.listen(PORT, () => {
            logger_1.logger.info(`🚀 Blacktop Blackout API server running on port ${PORT}`);
            logger_1.logger.info(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    await database_1.DatabaseService.close();
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    await database_1.DatabaseService.close();
    process.exit(0);
});
// Start the server
if (require.main === module) {
    bootstrap();
}
//# sourceMappingURL=main.js.map