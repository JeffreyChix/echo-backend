import { nativeToScVal } from "@stellar/stellar-sdk";

type ScValType = "symbol" | "string" | "u32" | "u64";

const convertToScVal = (
    value: string | number | Buffer,
    type?: ScValType,
) =>
    nativeToScVal(value, {
        type,
    });


export { convertToScVal };
