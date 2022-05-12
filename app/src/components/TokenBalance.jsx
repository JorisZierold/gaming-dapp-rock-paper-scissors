import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { IconButton, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TokenFaucet from "./TokenFaucet/TokenFaucet";

const TOKEN_ADDRESS = import.meta.env.VITE_CONTRACT_TOKEN;

const styles = {
  balanceOverview: {
    background: "#ffd238",
    borderRadius: "20px",
    border: "1px solid rgb(234, 164, 83)",
    padding: "47px 5px 10px",
    color: "#000000",
    width: "190px",
    display: "flex",
    position: "relative",
    flexDirection: "column",
    alignItems: "center",
    top: "-48px",
  },
  balancesTitleWrapper: {
    display: "inline-flex",
  },
  balancesTitle: { margin: "15px 0px" },
  balances: {
    display: "inline-flex",
  },
  balance: {
    margin: "0px",
    paddingRight: "15px",
    borderRight: "1px solid black",
  },
  tokenBalance: {
    margin: "0px",
    paddingLeft: "15px",
  },
  tooltip: { fontSize: "13px", padding: "5px 10px" },
};

export const TokenBalance = () => {
  const { t } = useTranslation();
  
  const [{ data: account }] = useAccount();
  const [{ data: network }] = useNetwork();
  const [{ data: balance }, refetchBalance] = useBalance({
    addressOrName: account?.address,
    enabled: false,
  });

  const [{ data: tokenBalance }, refetchTokenBalance] = useBalance({
    addressOrName: account?.address,
    token: TOKEN_ADDRESS,
    enabled: false,
  });

  const refetchTimeoutInSeconds = 10;
  const [now, setNow] = useState(new Date());
  const [lastRefetch, setLastRefetch] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(refreshDate, 1000);
    return function cleanup() {
      clearInterval(timerId);
    };
  }, []);

  const refreshDate = () => {
    setNow(new Date());
  };

  const refetchBalances = () => {
    refetchBalance();
    refetchTokenBalance();
    setLastRefetch(new Date());
  };

  const isRefetchTimeout =
    Math.floor(now - lastRefetch) / 1000 > refetchTimeoutInSeconds
      ? true
      : false;

  const roundBalance = (balance) => {
    return Math.round(balance * 1000) / 1000;
  };

  const emptyBalance = "0.0";
  useEffect(() => {
    if (tokenBalance?.formatted === emptyBalance && isRefetchTimeout) {
      refetchBalances();
    }
  }, [isRefetchTimeout]);

  if (!balance || !tokenBalance || network?.chain?.unsupported) return null;

  return (
    <div style={styles.balanceOverview}>
      <div style={styles.balancesTitleWrapper}>
        <h4 style={styles.balancesTitle}>{t("tokenbalance.title")}</h4>
        {tokenBalance?.formatted === emptyBalance ? (
          <TokenFaucet />
        ) : (
          <Tooltip
            title={
              <p style={styles.tooltip}>
                {t("tokenbalance.refreshTooltip", {
                  timeout: refetchTimeoutInSeconds,
                  time: lastRefetch,
                })}
              </p>
            }
            arrow
          >
            {isRefetchTimeout ? (
              <IconButton
                color="primary"
                style={styles.refetchButton}
                onClick={() => refetchBalances()}
              >
                <RefreshIcon />
              </IconButton>
            ) : (
              <IconButton color="primary" style={styles.refetchButton}>
                <CheckCircleIcon />
              </IconButton>
            )}
          </Tooltip>
        )}
      </div>

      <div style={styles.balances}>
        {balance && (
          <Tooltip
            title={
              <p style={styles.tooltip}>{t("tokenbalance.currencyTooltip1")}</p>
            }
            arrow
          >
            <p style={styles.balance}>
              {`${roundBalance(balance.formatted)} ${balance?.symbol}`}
            </p>
          </Tooltip>
        )}
        {tokenBalance && (
          <Tooltip
            title={
              <p style={styles.tooltip}>
                {t("tokenbalance.currencyTooltip2", { address: TOKEN_ADDRESS })}
              </p>
            }
            arrow
          >
            <p style={styles.tokenBalance}>
              {roundBalance(tokenBalance.formatted) +
                " " +
                tokenBalance?.symbol}
            </p>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
