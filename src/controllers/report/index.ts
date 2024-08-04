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
                const data = await reportService.newReport(req);

                return sendResponse(res, 201, "Successful!", data);
            } catch (err) {
                return sendErrorResponse(res, err);
            }
        },

        async getReport(req: Request, res: Response) {
            try {
                const report = await reportService.getReport({
                    secretKey: req.params.secretKey,
                });

                return sendResponse(
                    res,
                    200,
                    "Report retrieved!",
                    report,
                );
            } catch (err) {
                return sendErrorResponse(res, err);
            }
        },

        async getReports(req: Request, res: Response) {
            try {
                const reports = await reportService.getReports();

                return sendResponse(
                    res,
                    200,
                    "Reports retrieved!",
                    reports,
                );
            } catch (err) {
                return sendErrorResponse(res, err);
            }
        },

        async getReportCount(req: Request, res: Response) {
            try {
                const reportCount =
                    await reportService.getReportCount();

                return sendResponse(
                    res,
                    200,
                    "Report count retrieved!",
                    reportCount,
                );
            } catch (err) {
                return sendErrorResponse(res, err);
            }
        },

        async newReportUpdate(req: Request, res: Response) {
            try {
                const update = await reportService.newReportUpdate(
                    req.body,
                );

                return sendResponse(
                    res,
                    201,
                    "New updated added!",
                    update,
                );
            } catch (err) {
                return sendErrorResponse(res, err);
            }
        },

        async getReportUpdate(req: Request, res: Response) {
            try {
                const update = await reportService.getReportUpdate(
                    req.params.reportUpdateKey,
                );

                return sendResponse(
                    res,
                    200,
                    "Report update retrieved!",
                    update,
                );
            } catch (err) {
                return sendErrorResponse(res, err);
            }
        },

        async getReportUpdates(req: Request, res: Response) {
            try {
                const updates = await reportService.getReportUpdates(
                    req.params.reportSecretKey,
                );

                return sendResponse(
                    res,
                    200,
                    "Report updates retrieved!",
                    updates,
                );
            } catch (err) {
                return sendErrorResponse(res, err);
            }
        },

        async getReportUpdateCount(req: Request, res: Response) {
            try {
                const updateCount =
                    await reportService.getReportUpdateCount(
                        req.params.reportSecretKey,
                    );

                return sendResponse(
                    res,
                    200,
                    "Report update count retrieved!",
                    updateCount,
                );
            } catch (err) {
                return sendErrorResponse(res, err);
            }
        },
    };

export { reportController };
