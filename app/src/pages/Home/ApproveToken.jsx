import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ethers } from "ethers";
import { useAccount, useContract, useSigner } from "wagmi";
import {
  Box,
  Grid,
  Paper,
  Chip,
  Avatar,
  Button,
  TextField,
} from "@mui/material";
import { toast } from "react-toastify";
import { contractABIList } from "../../utils/contracts/contracts";
import links from "../../constants/links.json";

const { Token: TOKEN_ABI } = contractABIList;
const TOKEN_ADDRESS = import.meta.env.VITE_CONTRACT_TOKEN;
const TOKEN_NAME = import.meta.env.VITE_TOKEN_NAME;
const TOKEN_SYMBOL = import.meta.env.VITE_TOKEN_SYMBOL;
const GAME_ADDRESS = import.meta.env.VITE_CONTRACT_RPC;

const styles = {
  h2: { paddingTop: "30px" },
  Box: { marginBottom: "100px" },
  intro: { padding: "0px 20px" },
  tokenSelector: { marginBottom: "20px" },
  gridContainer: { marginBottom: "30px", justifyContent: "center" },
  Button: { width: "100%", borderRadius: "0px 0px 4px 4px" },
  link: {
    color: "#1876d0",
    paddingTop: "30px",
  },
};

const ApproveToken = () => {
  const { t } = useTranslation();
  const [{ data: account }] = useAccount();
  const [{ data: signer }] = useSigner();
  const tokenContract = useContract({
    addressOrName: TOKEN_ADDRESS,
    contractInterface: TOKEN_ABI,
    signerOrProvider: signer,
  });

  const [amountToApprove, setAmountToApprove] = useState("");

  async function approveToken() {
    try {
      const amount = ethers.utils.parseUnits(amountToApprove.toString(), 18);
      await tokenContract.approve(GAME_ADDRESS, amount.toString());
    } catch (error) {
      toast.error(t("approvetoken.errorMessage", { msg: error?.message }));
    }
  }

  return (
    <Box sx={styles.Box}>
      <Paper elevation={3}>
        <h2 style={styles.h2}>{t("approvetoken.title")}</h2>
        <p style={styles.intro}>{t("approvetoken.description")}</p>
        <Grid container style={styles.gridContainer}>
          <Grid item xs={6}>
            <h3>{t("approvetoken.subtitleToken")}</h3>
            <Chip
              sx={styles.tokenSelector}
              variant="outlined"
              color="primary"
              avatar={<Avatar>{TOKEN_SYMBOL}</Avatar>}
              label={TOKEN_NAME}
              onClick={() =>
                window.open(
                  `${links.blockExplorer.address}${TOKEN_ADDRESS}`,
                  "_blank"
                )
              }
            />
          </Grid>
          <Grid item xs={6}>
            <h3>{t("approvetoken.subtitleAmount")}</h3>
            <TextField
              type="number"
              label={t("approvetoken.inputAmount")}
              InputProps={{
                inputProps: {
                  min: 1,
                },
              }}
              name="amountToApprove"
              value={amountToApprove}
              onChange={(e) => setAmountToApprove(e.target.value)}
            />
          </Grid>
          <a
            style={styles.link}
            href={`${links.blockExplorer.address}${GAME_ADDRESS}`}
            target="_blank"
          >
            {t("approvetoken.linktext")}
          </a>
        </Grid>
        <Button
          sx={styles.Button}
          size="large"
          variant="contained"
          disabled={amountToApprove <= 0 || !account}
          onClick={approveToken}
        >
          {t("approvetoken.approveCTA")}
        </Button>
      </Paper>
    </Box>
  );
};

export default ApproveToken;
