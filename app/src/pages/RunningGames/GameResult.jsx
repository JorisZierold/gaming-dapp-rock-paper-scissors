import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useContractWrite, useWaitForTransaction } from "wagmi";
import { toast } from "react-toastify";
import { contractABIList } from "../../utils/contracts/contracts";
import { Button } from "@mui/material";

const gameAddress = import.meta.env.VITE_CONTRACT_RPC;
const { RockPaperScissors: gameABI } = contractABIList;

const styles = {
  Button: { width: "100%", borderRadius: "0px 0px 4px 4px" },
};

const GameResult = (props) => {
  const { game } = props;
  const { t } = useTranslation();
  const [selectedGame, setSelectedGame] = useState(null);

  const [{ data, loading: isWritePending, error: signError }, write] =
    useContractWrite(
      {
        addressOrName: gameAddress,
        contractInterface: gameABI,
      },
      "gameResult"
    );

  const [{ loading: isTxPending, error: txError }, wait] =
    useWaitForTransaction({
      hash: data?.hash,
    });

  const gameResult = () => {
    setSelectedGame(game?.key);
    write({
      args: [game?.gameId],
    });
  };

  useEffect(() => {
    if (data?.hash) {
      const txData = wait();
      toast.promise(txData, {
        pending: t("tx.toastPending"),
        success: t("tx.toastSuccess"),
        error: t("tx.toastError"),
      });
    }
  }, [data]);

  useEffect(() => {
    if (signError || txError) {
      setSelectedGame(null);
      toast.error(
        signError?.error?.message,
        signError?.message,
        txError?.message
      );
    }
  }, [signError, txError]);

  const buttonText = isTxPending
    ? t("tx.sending")
    : isWritePending
    ? t("tx.confirm")
    : t("runninggames.resultCTA");

  const gameIsSelected = game.key === selectedGame;

  return (
    <Button
      variant="contained"
      sx={styles.Button}
      onClick={() => gameResult()}
      disabled={gameIsSelected}
    >
      {gameIsSelected ? buttonText : t("runninggames.resultCTA")}
    </Button>
  );
};

export default GameResult;
