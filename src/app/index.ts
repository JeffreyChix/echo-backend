import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { NODE_ENV } from "../lib/constants";
import { corsOptions } from "../lib/config";
import { appRoutes } from "../routes";
import { unknownError, unknownRoute } from "../routes/unknown";

const app: Application = express();

app.use(helmet());

if (NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(appRoutes);
app.use(unknownRoute);
app.use(unknownError);

export default app;
