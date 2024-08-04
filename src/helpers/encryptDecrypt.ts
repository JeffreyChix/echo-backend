import crypto from "crypto";

import {
    ENCRYPTION_SECRET,
    ENCRYPTION_ALGORITHM,
} from "../lib/constants";

const getKey = (secret: string) => {
    return crypto
        .createHash("sha256")
        .update(String(secret))
        .digest("base64")
        .substring(0, 32);
};

const encryptFile = (
    buffer: Buffer,
    metadata: { filename: string; mimetype: string },
): string => {
    const iv = crypto.randomBytes(16);
    const key = getKey(ENCRYPTION_SECRET);

    const cipher = crypto.createCipheriv(
        ENCRYPTION_ALGORITHM,
        key,
        iv,
    );

    const encrypted = Buffer.concat([
        cipher.update(buffer),
        cipher.final(),
    ]);

    const metadataBuffer = Buffer.from(
        JSON.stringify(metadata),
        "utf-8",
    );
    const metadataLengthBuffer = Buffer.alloc(4);
    metadataLengthBuffer.writeUInt32BE(metadataBuffer.length, 0);

    const encryptedData = Buffer.concat([
        iv,
        metadataLengthBuffer,
        metadataBuffer,
        encrypted,
    ]);

    return encryptedData.toString("base64");
};

const decryptFile = (
    encryptedString: string,
): { filename: string; mimetype: string; buffer: Buffer } => {
    const encryptedBuffer = Buffer.from(encryptedString, "base64");
    const iv = encryptedBuffer.slice(0, 16);
    const metadataLength = encryptedBuffer.readUInt32BE(16);
    const metadataString = encryptedBuffer
        .slice(20, 20 + metadataLength)
        .toString("utf-8");
    const metadata = JSON.parse(metadataString);

    const encryptedContentOffset = 20 + metadataLength;
    const encryptedContent = encryptedBuffer.slice(
        encryptedContentOffset,
    );

    const key = getKey(ENCRYPTION_SECRET);

    const decipher = crypto.createDecipheriv(
        ENCRYPTION_ALGORITHM,
        key,
        iv,
    );

    const decryptedContent = Buffer.concat([
        decipher.update(encryptedContent),
        decipher.final(),
    ]);

    return {
        ...metadata,
        buffer: decryptedContent,
    };
};

export { encryptFile, decryptFile };
