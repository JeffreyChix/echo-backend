This is the backend project for [Echo](https://echo-frontend-two.vercel.app/), the anonymous reporting system, built with Node.js and Stellar's Soroban smart contracts.

## About Echo

Echo is a blockchain-based anonymous reporting platform that leverages blockchain technology and smart contracts to ensure complete confidentiality. By providing a secure space for individuals to share sensitive information, Echo empowers people to reveal secrets that might otherwise remain hidden. All reports and evidence are encrypted, stored using IPFS technology, and securely uploaded to the blockchain via Stellar's Soroban smart contracts.

I firmly believe that many unsolved crimes, injustices, and safety concerns persist because people are afraid to speak out. If they could share what they know with absolute assurance of anonymity and data integrity, they would be more willing to come forward. Echo was built to address this need, ensuring that reports are fully encrypted and securely stored on the blockchain.

Check out Echo live [here](https://echo-frontend-two.vercel.app/)

## Setting Up Environment Variables

**Follow this guide carefully to set up the project locally.**

To run the backend project, you'll need to configure about six environment variables. Note that this backend also includes Soroban smart contracts written in Rust, located in the `soroban` directory.

You'll need to set up the following:
- `AGENT_PRIVATE_KEY`
- `DID`
- `PROOF`
- `ENCRYPTION_ALGORITHM`: Use `aes-256-cbc`
- `ENCRYPTION_SECRET`: Generate using `crypto.randomUUID`, `openssl`, or any random string up to 32 characters
- `ADMIN_SECRET_KEY`
- `PUBLIC_KEY`
- `CONTRACT_ADDRESS`

These variables are essential for running the project.

#### Setting up web3.storage

The `AGENT_PRIVATE_KEY`, `DID`, and `PROOF` variables are required for file storage using IPFS and Filecoin technologies. When files are uploaded, they are encrypted and then stored on IPFS, generating a CID (Content Identifier), which is subsequently stored on the blockchain via smart contracts.

For more information on IPFS, check out these links:
- [IPFS Tech](https://ipfs.tech/)
- [IPFS and Filecoin](https://docs.filecoin.io/basics/how-storage-works/filecoin-and-ipfs)

-----------

**Node.js version `20` or higher and npm version `7` or higher are required to complete this setup guide.**

1. To set up the `AGENT_PRIVATE_KEY`, `DID`, and `PROOF`, we'll use [web3.storage](https://web3.storage/), a service that leverages IPFS and Filecoin technologies as mentioned earlier.

Here’s how to set up web3.storage:

1. **Install the w3cli:**  
   Run the following command:
   ```bash
   npm install -g @web3-storage/w3cli
   ```

2. **Create an Account:**  
   Sign up for a web3.storage account using your email address and set it up to start uploading to a Space.
   
   Run:
   ```bash
   w3 login <your email address>
   ```
   This will send a validation link to your email. Click on the link to be redirected to a webpage where you can select a plan. **Choose the free tier.**

3. **Create a Space:**  
   Run:
   ```bash
   w3 space create Echo_Anon_Space
   ```

4. **Select the Space to Use:**  
   Run:
   ```bash
   w3 space use
   ```
   This will display a list of your spaces. Ensure the space you just created is selected.

5. **Create Your `AGENT_PRIVATE_KEY` and `DID`:**  
   Run:
   ```bash
   w3 key create
   ```
   This will generate an agent private key and a DID. Store them in your `.env` file as `AGENT_PRIVATE_KEY` and `DID`, respectively.

6. **Generate `PROOF`:**  
   Run:
   ```bash
   w3 delegation create <your DID created in step 5> --base64
   ```
   Copy the generated proof and paste it as `PROOF` in your `.env` file. It's a lengthy piece of text, so make sure to copy everything.

   *Note:* If your machine doesn't recognize the `base64` command, especially on Windows, [click here](https://www.di-mgt.com.au/base64-for-windows.html) for a guide on how to install it.

Now your `AGENT_PRIVATE_KEY`, `DID`, and `PROOF` are set, and web3.storage is configured.


#### Setting Up Soroban

Soroban is the smart contracts platform on the Stellar network. Contracts are small programs written in the [Rust programming language](https://www.rust-lang.org/) and compiled into WebAssembly (Wasm) for deployment.

This is how we deploy our reports to the blockchain. You can learn more about Soroban [here](https://developers.stellar.org/docs/build).

1. **Install Rust**  
   On macOS, Linux, or another Unix-like OS, use the following command in your terminal:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

   On Windows, download and run [rustup-init.exe](https://static.rust-lang.org/rustup/dist/i686-pc-windows-gnu/rustup-init.exe). You can proceed with the default settings by pressing Enter.

2. **Install the Target**  
   Run the following command:
   ```bash
   rustup target add wasm32-unknown-unknown
   ```

3. **Install the Stellar CLI**  
   Run:
   ```bash
   cargo install --locked stellar-cli --features opt
   ```

4. **Configure the CLI for Testnet**  
   In this project, the smart contracts are deployed to Testnet.

   > Stellar has a test network called Testnet, which is used for deploying and testing smart contracts. It's a live network, but separate from the Stellar public network. It's intended for development and testing, making it ideal for trial runs before deploying to the public network.

   On macOS/Linux, run:
   ```bash
   stellar network add \
     --global testnet \
     --rpc-url https://soroban-testnet.stellar.org:443 \
     --network-passphrase "Test SDF Network ; September 2015"
   ```

   On Windows, run:
   ```bash
   stellar network add `
     --global testnet `
     --rpc-url https://soroban-testnet.stellar.org:443 `
     --network-passphrase "Test SDF Network ; September 2015"
   ```

5. **Configure an Identity**  
   When deploying a smart contract to a network, you need to specify an identity that will be used to sign the transactions. This is how we obtain the `ADMIN_SECRET_KEY` and `PUBLIC_KEY`.

   Run:
   ```bash
   stellar keys generate --global alice --network testnet
   ```
   You can replace `alice` with your name.

   To display your keys, run:

   ```bash
   stellar keys address alice && stellar keys show alice
   ```

   **This will reveal your public and secret keys. Although we're deploying to Testnet, always protect your secret key. Stay vigilant! 😃**

   The secret key starts with `S`, and the public key starts with `G`.  
   In your `.env` file, store your secret key as `ADMIN_SECRET_KEY` and your public key as `PUBLIC_KEY`.

#### Install the Dependencies

To install the necessary dependencies, run `npm install` in your command line.

#### Deploy the Contract

With the environment variables configured and dependencies installed, you're ready to deploy the contract.

1. Navigate to the `soroban` directory and run `stellar contract build`. This will generate the Wasm file located at `soroban/target/wasm32-unknown-unknown/release/echo_report.wasm`.

2. Optimize the build by running:

   ```bash
   stellar contract optimize soroban/target/wasm32-unknown-unknown/release/echo_report.wasm
   ```

3. Navigate to the `src/app` directory. Open the `index.ts` file and uncomment the line at the top:

   ```javascript
   import { sorobanServices } from "../services/soroban";
   ```

   Then, in the `initApp` function, uncomment the code for contract deployment:

   ```javascript
   const response = await sorobanServices.uploadWasm();
   await sorobanServices.deployContract(response);
   ```

4. Save the file and run `npm run dev` to start the Node server and deploy the optimized smart contract Wasm file to Testnet. Copy the contract address and save it as `CONTRACT_ADDRESS` in your `.env` file.

   Afterward, comment out the contract deployment code again to prevent it from running twice, and save the file.

**Feel free to explore alternative methods for contract deployment.**

Your Node server is now running, and you can start making API requests.

> If you've cloned the Next.js frontend of this project, add the localhost URL, e.g., `http://localhost:3000`, to the `allowedOrigins` array in `src/lib/config.ts`.

Check out the frontend repo [here](https://github.com/JeffreyChix/echo-frontend.git).

Happy coding!











