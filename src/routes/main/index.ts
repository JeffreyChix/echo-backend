import { Router, Request, Response } from "express";

import { reportRoutes } from "./report";

const mainRoutes = Router();

mainRoutes.get("/", (_: Request, res: Response) => {
  res.json({
    name: "Echo Backend",
    status: "Running...",
    author: "Jeffrey Nwankwo",
  });
});

mainRoutes.use("/report", reportRoutes)

export { mainRoutes };
