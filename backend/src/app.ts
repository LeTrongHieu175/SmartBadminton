import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRouter from "./routes/auth.routes";
import { responseMiddleware } from "./shared/response";
import config from "./config/env";

const app = express();
app.set("trust proxy", true);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(responseMiddleware);

app.use("/api/auth", authRouter);

const port = config.port;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port`, port);
});
