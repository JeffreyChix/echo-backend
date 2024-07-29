import { Response } from "express";

import { HttpError } from "../classes/http-error";

// Utility function to get error message
const getErrorMessage = (err: unknown, defaultMessage = "An unknown error occurred!") => {
    return err instanceof Error ? err.message : defaultMessage;
};

// General response function
const sendResponse = (res: Response, statusCode: number, message: string, data?: any) => {
    res.status(statusCode).json({
        status: statusCode.toString().startsWith("2"),
        message: message.replaceAll("Error: ", "") ?? "",
        data,
    });
};

// Error response function
const sendErrorResponse = (res: Response, err: unknown, customCode = 500) => {
    const statusCode = err instanceof HttpError ? err.statusCode : customCode;
    const message = getErrorMessage(err);
    sendResponse(res, statusCode, message);
};

export { sendResponse, sendErrorResponse };