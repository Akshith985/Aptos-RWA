# Aptos Invoice RWA: Tokenizing Real-World Finance

An open-source Real-World Asset (RWA) protocol built on Aptos that transforms traditional invoices into unique, verifiable, and tradable on-chain objects.

## 🚀 Overview
Traditional invoices are "dead capital" locked in private databases. This project utilizes the **Aptos Object Model** to tokenize invoices, giving each a deterministic identity through `addr` and `creation_num`. 

By turning invoices into on-chain assets, we enable:
- **Instant Verification:** Immutable proof of debt and identity.
- **Liquidity:** Potential for invoice factoring and DeFi collateralization.
- **Transparency:** Clear audit trails for B2B transactions.

## 🛠 Tech Stack
- **Language:** Move (Aptos)
- **Framework:** Aptos Framework (0x1)
- **Deployment:** Aptos Testnet
- **Tools:** Zero Move Playground, Aptos CLI

## 📖 Key Features
- **Deterministic IDs:** Uses the GUID/Object standard for globally unique serial numbers.
- **Secure Storage:** Invoices are stored as independent Resources, ensuring decoupled security.
- **Creator Metadata:** Links every asset back to the original issuer for trust.

## 🚦 Quickstart (Zero Move)
1. Copy the code in `sources/invoice.move`.
2. Paste into the [Zero Move Playground](https://playground.pontem.network/).
3. Deploy to your virtual account.
4. Run `create_invoice` and inspect the **Resources** tab to see your fields.

## 🛡 License
This project is licensed under the **Apache License 2.0**.A tokenizing Aptos dapp.
