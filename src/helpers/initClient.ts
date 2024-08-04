/* eslint-disable @typescript-eslint/no-explicit-any */
import { AGENT_PRIVATE_KEY, PROOF } from "../lib/constants";

let clientInstance: any;

async function initClient() {
    const [Signer, Client, { StoreMemory }, Proof] =
        await Promise.all([
            import("@ucanto/principal/ed25519"),
            import("@web3-storage/w3up-client"),
            import("@web3-storage/w3up-client/stores/memory"),
            import("@web3-storage/w3up-client/proof"),
        ]);

    const principal = Signer.parse(AGENT_PRIVATE_KEY);
    const store = new StoreMemory();
    const client = await Client.create({ principal, store });

    const proof = await Proof.parse(PROOF);
    const space = await client.addSpace(proof);
    await client.setCurrentSpace(space.did());

    return client;
}

const getClient = async () => {
    if (!clientInstance) {
        clientInstance = await initClient();
    }
    return clientInstance;
};

export { getClient };
