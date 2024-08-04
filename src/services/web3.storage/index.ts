import axios from "axios";

import {
    encryptFile,
    decryptFile,
} from "../../helpers/encryptDecrypt";
import { getClient } from "../../helpers/initClient";
import { formatFileSize } from "../../helpers/file";

const getBaseURL = (cid: string) => {
    return `https://${cid}.ipfs.w3s.link`;
};

const web3StorageService = {
    async uploadDescription(
        description: string,
        filename = "description.txt",
    ) {
        const descBuffer = Buffer.from(description, "utf-8");
        const encryptedBuffer = encryptFile(descBuffer, {
            filename: filename,
            mimetype: "text/plain",
        });

        const descFile = new File([encryptedBuffer], filename, {
            type: "text/plain",
        });

        const ipfsClient = await getClient();

        const descCid = await ipfsClient.uploadFile(descFile);

        return descCid.toString();
    },

    async uploadFiles(files: Express.Multer.File[]) {
        const ipfsClient = await getClient();

        const maxFileSize = 10 * 1024 * 1024; // 10 MB

        const encryptedFiles = files.map((file, index) => {
            if (file.size > maxFileSize) {
                throw Error(
                    `Max size is ${formatFileSize(file.size)}`,
                );
            }
            const encryptedBuffer = encryptFile(file.buffer, {
                mimetype: file.mimetype,
                filename: file.originalname,
            });
            return new File(
                [encryptedBuffer],
                `${index + 1}__document_${index}.txt`,
            );
        });

        const directoryCid =
            await ipfsClient.uploadDirectory(encryptedFiles);

        return directoryCid.toString();
    },

    async fetchFiles(cid: string, fileCount: number) {
        const baseURL = getBaseURL(cid);
        const fileUrls = Array.from({ length: fileCount }).map(
            (_, index) =>
                `${baseURL}/${index + 1}__document_${index}.txt`,
        );

        const encryptedFileRequests = fileUrls.map((url) =>
            axios.get(url),
        );

        const encryptedFileResponses = await Promise.all(
            encryptedFileRequests,
        );

        const decryptedFiles = encryptedFileResponses.map(
            ({ data }) => {
                const decryptedContent = decryptFile(data);
                return {
                    ...decryptedContent,
                    buffer: decryptedContent.buffer.toString(
                        "base64",
                    ),
                };
            },
        );

        return decryptedFiles;
    },

    async fetchDescription(descCid: string) {
        const url = getBaseURL(descCid);

        const { data } = await axios.get(url);

        const decryptedContent = decryptFile(data);

        const desc = decryptedContent.buffer.toString("utf-8");

        return desc;
    },
};

export { web3StorageService };
