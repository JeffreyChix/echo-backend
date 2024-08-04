import Joi from "joi";

import { ReportUpdateStatus } from "../services/report";

const REPORT_UPDATE_STATUS: ReportUpdateStatus[] = [
    "submitted",
    "in-review",
    "investigating",
    "resolved",
];

const newReport = Joi.object().keys({
    subject: Joi.string().min(10).max(255).required(),
    dateOfIncident: Joi.string().required(),
    location: Joi.string().min(10),
    description: Joi.string().min(20).required(),
});

const newReportUpdate = Joi.object().keys({
    reportSecretKey: Joi.string().length(24).required(),
    content: Joi.string().required(),
    status: Joi.string()
        .valid(...REPORT_UPDATE_STATUS)
        .required(),
});

const schemas = {
    "/report/new": newReport,
    "/report/update/new": newReportUpdate,
};

export type SchemaPath = keyof typeof schemas;

export default schemas;
