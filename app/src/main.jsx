import React from "react";
import ReactDOM from "react-dom";
import { providers } from "ethers";
import { Provider, chain } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { WalletLinkConnector } from "wagmi/connectors/walletLink";
import "./i18n";
import "./main.css";
import App from "./App";

const alchemyId = import.meta.env.VITE_ALCHEMY_ID;
const etherscanApiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
const infuraId = import.meta.env.VITE_INFURA_ID;

const chains = [{ ...chain.goerli, name: "Görli" }];
const defaultChain = chain.goerli;

const connectors = ({ chainId }) => {
  const rpcUrl =
    chains.find((chain) => chain.id === chainId)?.rpcUrls?.[0] ??
    defaultChain.rpcUrls[0];
  return [
    new InjectedConnector({ chains, options: { shimDisconnect: true } }),
    new WalletConnectConnector({
      chains,
      options: {
        infuraId,
        qrcode: true,
      },
    }),
    new WalletLinkConnector({
      chains,
      options: {
        appName: "Rock Paper Scissors as a Gaming DApp",
        jsonRpcUrl: `${rpcUrl}/${infuraId}`,
      },
    }),
  ];
};

const isChainSupported = (chainId) =>
  chains.some((chain) => chain.id === chainId);

// Set up providers
const provider = ({ chainId }) =>
  providers.getDefaultProvider(
    isChainSupported(chainId) ? chainId : defaultChain.id,
    {
      alchemy: alchemyId,
      etherscan: etherscanApiKey,
      infura: infuraId,
    }
  );
const webSocketProvider = ({ chainId }) =>
  isChainSupported(chainId)
    ? new providers.InfuraWebSocketProvider(chainId, infuraId)
    : undefined;

ReactDOM.render(
  <React.StrictMode>
    <Provider
      autoConnect
      connectors={connectors}
      provider={provider}
      webSocketProvider={webSocketProvider}
    >
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
