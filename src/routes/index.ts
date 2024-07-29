import { Router, Request, Response } from "express";

import { API_BASE_PATH } from "../lib/constants";

const appRoutes = Router();

appRoutes.get(API_BASE_PATH, (_: Request, res: Response) => {
  res.json({
    name: "Echo Backend",
    status: "Running...",
    author: "Jeffrey Nwankwo",
  });
});

export { appRoutes };
