import express from 'express';
import identifyRoutes from './routes/identify.routes';

const app = express();

app.use(express.json());
app.use('/identify', identifyRoutes);

export default app;
