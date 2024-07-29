import { Router } from "express";

import { schemaValidator } from "../../../middleware/schema-validator";
import { fileUpload } from "../../../middleware/file-upload";
import { reportController } from "../../../controllers/report";

const reportRoutes = Router();

reportRoutes.post(
    "/new",
    fileUpload.array("supportingDocuments"),
    schemaValidator("/report/new"),
    reportController.newReport,
);

export { reportRoutes };
