import crypto from "crypto";

const generateSecretKey = (length: number) => {
    const buffer = crypto.randomBytes(length);

    const secret = buffer.toString("hex").slice(0, length);

    return `sec_${secret}`.toUpperCase();
};

export { generateSecretKey };
