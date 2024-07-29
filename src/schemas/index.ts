import Joi from "joi";

const newReport = Joi.object().keys({
    subject: Joi.string().min(10).max(255).required(),
    dateOfIncident: Joi.string(),
    location: Joi.string().min(10),
    description: Joi.string().min(20).required(),
});

const schemas = {
    "/report/new": newReport,
};

export type SchemaPath = keyof typeof schemas;

export default schemas;
