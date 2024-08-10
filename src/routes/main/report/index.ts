import { Router } from "express";

import { schemaValidator } from "../../../middleware/schema-validator";
import { fileUpload } from "../../../middleware/file-upload";
import { reportController } from "../../../controllers/report";

const reportRoutes = Router();

reportRoutes.post(
    "/new",
    fileUpload.array("attachments"),
    schemaValidator("/report/new"),
    reportController.newReport,
);

reportRoutes.get("/all", reportController.getReports);

reportRoutes.get("/info", reportController.getReportsInfo);

reportRoutes.get("/total", reportController.getReportCount);

reportRoutes.get("/all-keys", reportController.getAllReportKeys);

reportRoutes.get("/:secretKey", reportController.getReport);

reportRoutes.post(
    "/update/new",
    schemaValidator("/report/update/new"),
    reportController.newReportUpdate,
);

reportRoutes.get(
    "/update/single/:reportUpdateKey",
    reportController.getReportUpdate,
);

reportRoutes.get(
    "/update/all/:reportSecretKey",
    reportController.getReportUpdates,
);

reportRoutes.get(
    "/update/total/:reportSecretKey",
    reportController.getReportUpdateCount,
);

export { reportRoutes };
