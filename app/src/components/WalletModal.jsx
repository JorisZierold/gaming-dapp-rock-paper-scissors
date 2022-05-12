import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useConnect, useAccount } from "wagmi";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { WALLET_ICONS } from "../constants/wallets";
import links from "../constants/links.json";

const styles = {
  dialogTitle: {
    background: "#ffd239",
    marginBottom: "40px",
    textAlign: "center",
  },
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  walletButton: {
    borderRadius: "35px",
    border: "1px solid #e7e7e7",
    width: "300px",
    fontSize: "14px",
    height: "50px",
    marginBottom: "15px",
    color: "black",
  },
  walletLogo: {
    width: "35px",
    marginRight: "10px",
  },
  loader: {
    position: "relative",
    left: "20px",
    width: "30px",
    height: "30px",
  },
  errorMessage: {
    border: "1px solid red",
    padding: "5px",
    color: "red",
    fontSize: "14px",
    width: "100%",
    textAlign: "center",
  },
};

export const WalletModal = (props) => {
  const { isLoginModalOpen, setIsLoginModalOpen } = props;
  const { t } = useTranslation();

  const [
    {
      data: { connector, connectors },
      error,
      loading,
    },
    connect,
  ] = useConnect();
  const [{ data: accountData }] = useAccount();

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  useEffect(() => {
    accountData?.address ? closeLoginModal() : null;
  }, [accountData]);

  return (
    <Dialog open={isLoginModalOpen} onClose={closeLoginModal}>
      <DialogTitle style={styles.dialogTitle}>
        {t("walletmodal.title")}
      </DialogTitle>
      <DialogContent style={styles.dialogContent}>
        {connectors.map((availableConnector) =>
          availableConnector.ready ? (
            <Button
              style={styles.walletButton}
              key={availableConnector.name}
              onClick={() => connect(availableConnector)}
            >
              <img
                src={WALLET_ICONS[availableConnector.name]}
                style={styles.walletLogo}
              />
              {availableConnector.name}
              {loading && availableConnector.name === connector?.name && (
                <CircularProgress style={styles.loader} />
              )}
            </Button>
          ) : (
            <Button
              style={styles.walletButton}
              key={availableConnector.name}
              onClick={() =>
                window.open(links.walletmodal.installMetamask, "_blank")
              }
            >
              <img src={WALLET_ICONS["MetaMask"]} style={styles.walletLogo} />
              {t("walletmodal.installMetamask")}
            </Button>
          )
        )}
        {error && (
          <p style={styles.errorMessage}>
            Error: {error?.message ?? t("walletmodal.error")}
          </p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeLoginModal}>{t("walletmodal.cancelCTA")}</Button>
      </DialogActions>
    </Dialog>
  );
};
