import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import React from "react";
import ReactDOM from "react-dom/client";
import { Network } from "@aptos-labs/ts-sdk";
import App from "./App";
import './index.css'
// 1. Force the selector to recognize Petra
const optInWallets = ["Petra"] as const;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AptosWalletAdapterProvider 
      autoConnect={true} 
      optInWallets={optInWallets}
      dappConfig={{ 
        network: Network.TESTNET,
        // Adding a name helps the UI identify the dApp
        aptosConnect: { dappName: "RWA Invoice Minter" } 
      }}
      onError={(error) => console.log("Wallet Error:", error)}
    >
      <App />
    </AptosWalletAdapterProvider>
  </React.StrictMode>
);
