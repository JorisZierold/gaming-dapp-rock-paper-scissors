import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ethers } from "ethers";
import { useSigner } from "wagmi";
import { toast } from "react-toastify";
import { IconButton, Tooltip } from "@mui/material";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import { contractABIList } from "../../utils/contracts/contracts";
import { requestTokens } from "./faucet";

const TOKENFAUCET_ADDRESS = import.meta.env.VITE_CONTRACT_TOKENFAUCET;

const styles = {
  tooltip: { fontSize: "13px", padding: "5px 10px" },
};

export default function TokenFaucet() {
  const { t } = useTranslation();

  const [{ data: signer }] = useSigner();
  const { GaslessTokenFaucet: GaslessTokenFaucetABI } = contractABIList;

  const [submitting, setSubmitting] = useState(false);

  const sendTx = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const faucetContract = new ethers.Contract(
      TOKENFAUCET_ADDRESS,
      GaslessTokenFaucetABI,
      signer?.provider
    );

    try {
      const response = await requestTokens(faucetContract, signer);
      // TODO get tx hash as response from OZ Autotask and use wagmi `useWaitForTransaction`
    } catch (err) {
      toast.error(err?.message + err?.data?.message || err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Tooltip
      title={
        <p style={styles.tooltip}>
          {
            t("tokenfaucet.tooltip")
          }
        </p>
      }
      arrow
    >
      <IconButton color="primary" onClick={sendTx} disabled={submitting}>
        <CurrencyExchangeIcon />
      </IconButton>
    </Tooltip>
  );
}
