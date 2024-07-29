import { Request, Response, RequestHandler } from "express";

import {
    reportService,
    ReportServiceMethods,
} from "../../services/report";
import {
    sendErrorResponse,
    sendResponse,
} from "../../helpers/response";

const reportController: Record<ReportServiceMethods, RequestHandler> =
    {
        async newReport(req: Request, res: Response) {
            try {
                const data = await reportService.newReport();

                return sendResponse(res, 200, "Successful!");
            } catch (err) {
                return sendErrorResponse(res, err);
            }
        },
    };

export { reportController };
