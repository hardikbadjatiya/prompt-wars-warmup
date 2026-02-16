import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import geminiRoutes from './routes/gemini.js';
import zonesRoutes from './routes/zones.js';
import { authMiddleware } from './middleware/auth.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

// Protected API routes
app.use('/api/gemini', authMiddleware, geminiRoutes);
app.use('/api/zones', authMiddleware, zonesRoutes);

// Serve static client files in production
if (process.env.NODE_ENV === 'production') {
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const clientDist = path.join(__dirname, '../../client/dist');

    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
        res.sendFile(path.join(clientDist, 'index.html'));
    });
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Area Control Loop server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});

export default app;
