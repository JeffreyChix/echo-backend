import { Router } from "express";

import { API_BASE_PATH } from "../lib/constants";
import { mainRoutes } from "./main";

const appRoutes = Router();

appRoutes.use(API_BASE_PATH, mainRoutes);

export { appRoutes };
