const API_BASE_PATH = "/api/v1/secure";
const NODE_ENV = process.env.NODE_ENV;
const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY as string;
const DID = process.env.DID as string;
const PROOF = process.env.PROOF as string;
const ENCRYPTION_ALGORITHM = process.env
    .ENCRYPTION_ALGORITHM as string;
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET as string;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY as string;
const PUBLIC_KEY = process.env.PUBLIC_KEY as string;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as string;
const EMPTY_FIELD = "__NULL__";

export {
    API_BASE_PATH,
    NODE_ENV,
    AGENT_PRIVATE_KEY,
    DID,
    PROOF,
    ENCRYPTION_ALGORITHM,
    ENCRYPTION_SECRET,
    ADMIN_SECRET_KEY,
    PUBLIC_KEY,
    CONTRACT_ADDRESS,
    EMPTY_FIELD,
};
