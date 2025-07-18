import express from "express";
import dotenv from "dotenv";
import identifyRoute from "./routes/identify.route";
import errorHandler from "./middlewares/error.middleware";

dotenv.config();

const app = express();

app.use(express.json());
app.use("/identify", identifyRoute);

// Error Handling Middleware
app.use(errorHandler);

export default app;

