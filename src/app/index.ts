import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { NODE_ENV } from "../lib/constants";
import { corsOptions } from "../lib/config";
import { appRoutes } from "../routes";
import { unknownError, unknownRoute } from "../routes/unknown";
import { getClient } from "../helpers/initClient";
// import { sorobanServices } from "../services/soroban";

const app: Application = express();

app.use(helmet());

if (NODE_ENV === "development") {
    app.use(morgan("dev"));
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async function initApp() {
    getClient().then(() => console.log("Client initialized ✔✔✔"));

    // Only call for upgrades
    // const result = await sorobanServices.upgradeContract();
    // console.log("Upgrade result => ", result);
})();

app.use(appRoutes);
app.use(unknownRoute);
app.use(unknownError);

export default app;
