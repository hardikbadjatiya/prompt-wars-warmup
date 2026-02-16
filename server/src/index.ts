import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import geminiRoutes from './routes/gemini.js';
import zonesRoutes from './routes/zones.js';
import { authMiddleware } from './middleware/auth.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Security Middleware
app.set('trust proxy', 1); // Trust first proxy (Cloud Run load balancer)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://maps.googleapis.com", "https://apis.google.com", "https://accounts.google.com"],
            imgSrc: ["'self'", "data:", "https://maps.googleapis.com", "https://maps.gstatic.com", "https://lh3.googleusercontent.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", "https://maps.googleapis.com", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com", "https://accounts.google.com"],
            frameSrc: ["'self'", "https://accounts.google.com", "https://area-control-game.firebaseapp.com"],
        },
    },
}));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
}));

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
