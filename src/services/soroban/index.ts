/* eslint-disable @typescript-eslint/no-explicit-any */
// From::=> https://developers.stellar.org/docs/build/guides/conventions/install-deploy-contract-with-code

import * as StellarSDK from "@stellar/stellar-sdk";
import fs from "fs";
import path from "path";

import {
    ADMIN_SECRET_KEY,
    CONTRACT_ADDRESS,
    PUBLIC_KEY,
} from "../../lib/constants";
import { convertToScVal } from "../../helpers/convertToScVal";

type SmartContractFunctionNames =
    | "upload_report"
    | "fetch_report"
    | "fetch_all_reports"
    | "upload_report_update"
    | "fetch_report_update"
    | "fetch_all_report_updates"
    | "get_report_count"
    | "get_report_update_count"
    | "init"
    | "version"
    | "upgrade";

const server = new StellarSDK.SorobanRpc.Server(
    "https://soroban-testnet.stellar.org:443",
    { allowHttp: true },
);
const sourceKeypair = StellarSDK.Keypair.fromSecret(ADMIN_SECRET_KEY);

const sorobanServices = {
    async getAccount() {
        return server.getAccount(sourceKeypair.publicKey());
    },
    async uploadWasm() {
        // I'm using the optimized wasm file
        // use `stellar contract optimize --wasm <path-to-wasm-file>` to optimize build
        // though not necessary for contracts deployed to testnet

        const wasmFilePath = path.join(
            __dirname,
            "../../../soroban/target/wasm32-unknown-unknown/release/echo_report.optimized.wasm",
        );

        const bytecode = fs.readFileSync(wasmFilePath);
        const operation = StellarSDK.Operation.uploadContractWasm({
            wasm: bytecode,
        });
        return await this.buildAndSendTransaction(operation);
    },

    async deployContract(
        response: StellarSDK.rpc.Api.GetSuccessfulTransactionResponse,
    ) {
        const operation = StellarSDK.Operation.createCustomContract({
            wasmHash: response.returnValue?.bytes() as
                | Buffer
                | Uint8Array,
            address: StellarSDK.Address.fromString(
                sourceKeypair.publicKey(),
            ),
            salt: (response as any).hash,
        });
        const responseDeploy =
            await this.buildAndSendTransaction(operation);
        const contractAddress = StellarSDK.StrKey.encodeContract(
            StellarSDK.Address.fromScAddress(
                responseDeploy.returnValue?.address() as StellarSDK.xdr.ScAddress,
            ).toBuffer(),
        );
        console.log("Contract address =>", contractAddress);
    },

    async buildAndSendTransaction(
        operations: StellarSDK.xdr.Operation,
    ) {
        const account = await this.getAccount();
        const transaction = new StellarSDK.TransactionBuilder(
            account,
            {
                fee: StellarSDK.BASE_FEE,
                networkPassphrase: StellarSDK.Networks.TESTNET,
            },
        )
            .addOperation(operations)
            .setTimeout(30)
            .build();

        const tx = await server.prepareTransaction(transaction);
        tx.sign(sourceKeypair);

        console.log("Submitting transaction...");
        let response:
            | StellarSDK.rpc.Api.SendTransactionResponse
            | StellarSDK.rpc.Api.GetTransactionResponse =
            await server.sendTransaction(tx);
        const hash = response.hash;
        console.log(`Transaction hash: ${hash}`);
        console.log("Awaiting confirmation...");

        while (true) {
            response = await server.getTransaction(hash);
            if (response.status !== "NOT_FOUND") {
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000)); // sleep!
        }

        if (response.status === "SUCCESS") {
            console.log("Transaction successful ✔✔✔");
            return response;
        } else {
            console.log("Transaction failed!");
            throw new Error("Transaction failed!");
        }
    },

    async contractInterface(
        functionName: SmartContractFunctionNames,
        values: StellarSDK.xdr.ScVal[] = [],
    ) {
        const contract = new StellarSDK.Contract(CONTRACT_ADDRESS);
        const operation = contract.call(functionName, ...values);

        const result = await this.buildAndSendTransaction(operation);

        if (!result.returnValue) return null;

        return StellarSDK.scValToNative(result.returnValue);
    },

    // Contract upgrade methods
    // From::=> https://developers.stellar.org/docs/build/guides/conventions/upgrading-contracts

    async upgradeContract() {
        // first build the contract
        // Run `stellar contract build` to get a new wasm file

        await this.contractInterface("init", [
            new StellarSDK.Address(PUBLIC_KEY).toScVal(),
        ]);

        const oldVersion = await this.contractInterface("version");

        console.info("Old Version => ", oldVersion);

        const response = await this.uploadWasm(); // upload or install the wasm

        if (!response.returnValue) return null;

        const newWasmHash = response.returnValue.bytes();

        const upgradeResult = await this.contractInterface(
            "upgrade",
            [convertToScVal(newWasmHash)],
        );

        const newVersion = await this.contractInterface("version");

        console.info("New Version => ", newVersion);
        console.log("Upgraded ✔✔✔");

        return upgradeResult;
    },
};

export { sorobanServices };
