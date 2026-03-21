import { config } from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import connectDb from './src/config/db.js';

config();

const port = process.env.PORT || 3000;
let server;

async function start() {
    await connectDb();

    server = app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}

async function shutdown(signal) {
    console.log(`${signal} received, shutting down gracefully`);

    if (server) {
        server.close(async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed');
                process.exit(0);
            } catch (error) {
                console.error('Shutdown error', error);
                process.exit(1);
            }
        });
    } else {
        try {
            await mongoose.connection.close();
        } catch (error) {
            console.error('Shutdown error', error);
        }
        process.exit(1);
    }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (err) => {
    console.error(
        `Server is shutting down due to unhandled rejection: ${err.message}`
    );

    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

start().catch((error) => {
    console.error('Failed to start server', error);
    process.exit(1);
});
