import { Request, Response } from "express";

const unknownRoute = (_: Request, res: Response) => {
  res.status(404).json({
    message: "Sorry, this is rogue route!",
    status: "failed!",
  });
};

const unknownError = (err: Error, _: Request, res: Response) => {
  if (err) {
    console.error(err.stack);
    return res
      .status(500)
      .json({ message: err.message, status: "failed!" });
  }
};

export { unknownRoute, unknownError };
