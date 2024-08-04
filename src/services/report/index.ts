/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";

import { generateSecretKey } from "../../helpers/generateSecretKey";
import { web3StorageService } from "../web3.storage";
import { sorobanServices } from "../soroban";
import { convertToScVal } from "../../helpers/convertToScVal";
import { EMPTY_FIELD } from "../../lib/constants";
import { getCurrentDate } from "../../helpers/date";

interface NewReportPayload {
    subject: string;
    dateOfIncident: string;
    description: string;
    location?: string;
}

export type ReportUpdateStatus =
    | "submitted"
    | "in-review"
    | "investigating"
    | "resolved";

interface ReportUpdatePayload {
    reportSecretKey: string;
    content: string;
    status: ReportUpdateStatus;
}

interface SorobanReport {
    subject: string;
    date_of_incident: string;
    location: string;
    description_cid: string;
    attachments_cid: string;
    date_of_submission: string;
    attachment_count: number;
}

interface SorobanReportUpdate {
    report_secret_key: string;
    content_cid: string;
    status: ReportUpdateStatus;
    date_of_submission: string;
}

const {
    uploadDescription,
    uploadFiles,
    fetchDescription,
    fetchFiles,
} = web3StorageService;

const formatReportUpdateKey = (count: number, secretKey: string) =>
    `${count}_UPD_${secretKey}`;

const reportService = {
    async newReport(req: Request) {
        const { subject, dateOfIncident, description, location } =
            req.body as NewReportPayload;
        const attachments = req.files as
            | Express.Multer.File[]
            | undefined;

        const secretKey = generateSecretKey(20); // Ensure this is always unique

        const fileUploadPromises: Promise<string>[] = [
            uploadDescription(description),
        ];

        if (attachments && attachments.length !== 0) {
            fileUploadPromises.push(uploadFiles(attachments));
        }

        const [descriptionCid, attachmentsCid = EMPTY_FIELD] =
            await Promise.all(fileUploadPromises);

        const currentDate = getCurrentDate();
        const attachmentCount = attachments ? attachments.length : 0;
        const initialReportUpdateKey = formatReportUpdateKey(
            1,
            secretKey,
        );

        const values = [
            convertToScVal(secretKey, "symbol"),
            convertToScVal(subject),
            convertToScVal(dateOfIncident),
            convertToScVal(location ?? EMPTY_FIELD),
            convertToScVal(currentDate),
            convertToScVal(descriptionCid),
            convertToScVal(attachmentsCid),
            convertToScVal(attachmentCount, "u32"),
            convertToScVal(initialReportUpdateKey),
        ];

        await sorobanServices.contractInterface(
            "upload_report",
            values,
        );

        return secretKey;
    },

    async getReport(params: {
        secretKey: string;
        defaultReport?: SorobanReport;
    }) {
        let report = params.defaultReport;

        if (!report) {
            report = await sorobanServices.contractInterface(
                "fetch_report",
                [convertToScVal(params.secretKey, "symbol")],
            );
        }

        if (!report) {
            throw new Error("Report not found!");
        }

        const {
            description_cid,
            attachments_cid,
            attachment_count,
            ...cleanedReport
        } = report;

        const fileDecryptionPromises: Promise<
            | { buffer: string; filename: string; mimetype: string }[]
            | string
        >[] = [fetchDescription(description_cid)];

        if (attachments_cid !== EMPTY_FIELD) {
            fileDecryptionPromises.push(
                fetchFiles(attachments_cid, attachment_count),
            );
        }

        const [description, attachments = []] = await Promise.all(
            fileDecryptionPromises,
        );

        return {
            ...cleanedReport,
            secretKey: params.secretKey,
            description,
            attachments,
        };
    },

    async getReports() {
        const reports = (await sorobanServices.contractInterface(
            "fetch_all_reports",
        )) as Record<string, SorobanReport>;

        const decodedReportsPromise: Promise<any>[] = [];

        Object.entries(reports).forEach(([key, val]) => {
            decodedReportsPromise.push(
                this.getReport({
                    secretKey: key,
                    defaultReport: val,
                }),
            );
        });

        const decodedReports = await Promise.all(
            decodedReportsPromise,
        );

        return decodedReports;
    },

    async getReportCount() {
        const reportCount = (await sorobanServices.contractInterface(
            "get_report_count",
        )) as number;

        return reportCount;
    },

    async newReportUpdate(payload: ReportUpdatePayload) {
        const { reportSecretKey, content, status } = payload;

        if (status === "submitted") {
            throw new Error("Cannot set status to submitted!");
        }

        const [contentCid, currentUpdateCount] = await Promise.all([
            uploadDescription(content, "report_update_content.txt"),
            sorobanServices.contractInterface(
                "get_report_update_count",
                [convertToScVal(reportSecretKey, "symbol")],
            ),
        ]);

        const currentDate = getCurrentDate();
        const reportUpdateKey = formatReportUpdateKey(
            currentUpdateCount.count + 1,
            reportSecretKey,
        );

        await sorobanServices.contractInterface(
            "upload_report_update",
            [
                convertToScVal(reportSecretKey, "symbol"),
                convertToScVal(reportUpdateKey),
                convertToScVal(contentCid),
                convertToScVal(status),
                convertToScVal(currentDate),
            ],
        );

        return reportUpdateKey;
    },

    async getReportUpdate(reportUpdateKey: string) {
        const reportUpdate = (await sorobanServices.contractInterface(
            "fetch_report_update",
            [convertToScVal(reportUpdateKey)],
        )) as SorobanReportUpdate;

        if (!reportUpdate) {
            throw new Error(
                `Report update with key ${reportUpdateKey} does not exist!`,
            );
        }

        const { content_cid, ...cleanedReportUpdate } = reportUpdate;

        const content = await fetchDescription(content_cid);

        return {
            content,
            update_key: reportUpdateKey,
            ...cleanedReportUpdate,
        };
    },

    async getReportUpdates(reportSecretKey: string) {
        const reportUpdates =
            (await sorobanServices.contractInterface(
                "fetch_all_report_updates",
                [convertToScVal(reportSecretKey, "symbol")],
            )) as SorobanReportUpdate[];

        const contentPromises = reportUpdates.map(
            ({ content_cid }) => {
                return content_cid !== EMPTY_FIELD
                    ? fetchDescription(content_cid)
                    : Promise.resolve(EMPTY_FIELD);
            },
        );

        const contents = await Promise.all(contentPromises);

        const decodedReportUpdates = reportUpdates.map(
            (update, index) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { content_cid, ...others } = update;
                return { ...others, content: contents[index] };
            },
        );

        return decodedReportUpdates;
    },

    async getReportUpdateCount(reportSecretKey: string) {
        const reportUpdateCount =
            await sorobanServices.contractInterface(
                "get_report_update_count",
                [convertToScVal(reportSecretKey, "symbol")],
            );

        return reportUpdateCount.count;
    },
};

type ReportServiceMethods = keyof typeof reportService;

export { reportService, ReportServiceMethods };
