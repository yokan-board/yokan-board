/**
 * @file Main entry point for the Express server application.
 * @module index
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs'); // To load YAML file
const swaggerDocument = YAML.load('./docs/api/openapi.yaml'); // Load your OpenAPI spec

const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/boards');
const aboutRoutes = require('./routes/about');
const userRoutes = require('./routes/user'); // Add this line
const { errorHandler } = require('./middleware/errorHandler');
const { AppError } = require('./utils/appError');

const app = express();
app.use(express.json());
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
            let allowedOrigins = [];

            if (allowedOriginsEnv) {
                allowedOrigins = allowedOriginsEnv
                    .split(',')
                    .map(
                        (o) =>
                            new RegExp(
                                `^${o.trim().replace(/\./g, '\\.').replace(/\*/g, '.*')}(:\\d+)?$`
                            )
                    );
            } else {
                // Default allowed patterns for local development and local network if not specified in .env
                allowedOrigins = [
                    /^http:\/\/localhost(:\d+)?$/,
                    /^http:\/\/127\.0\.0\.1(:\d+)?$/,
                ];
            }

            const isAllowed = allowedOrigins.some((pattern) => pattern.test(origin));

            if (isAllowed) {
                return callback(null, true);
            } else {
                return callback(new Error(`Origin ${origin} not allowed by CORS`));
            }
        },
        exposedHeaders: ['Content-Disposition'],
    })
);

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '127.0.0.1';

/**
 * Starts the Express server.
 * @param {number} [port=PORT] - The port number to listen on.
 * @param {string} [host=HOST] - The host address to bind to.
 * @returns {object} The HTTP server instance.
 */
function startServer(port = PORT, host = HOST) {
    const server = app.listen(port, host, () => {
        if (process.env.NODE_ENV !== 'test') {
            console.log(`Server running on http://${host}:${port}`);
        }
    });
    return server;
}

module.exports = { app, startServer };

// Serve OpenAPI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Auth routes
app.use('/api', authRoutes);
// Board routes
app.use('/api', boardRoutes);
app.use('/api', aboutRoutes);
app.use('/api/v1.1', userRoutes); // Add this line
app.use('/api/v1.1', authRoutes);
app.use('/api/v1.1', boardRoutes);
app.use('/api/v1.1', aboutRoutes);

// Handle 404 for API routes
app.use('/api', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(errorHandler);

if (require.main === module) {
    startServer();
}
