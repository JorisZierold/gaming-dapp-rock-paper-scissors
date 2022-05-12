import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";
import { Box, Grid, Container, Paper } from "@mui/material";
import { SelectBet } from "../../components/SelectBet";
import { SelectHand } from "../../components/SelectHand";
import PlayerOneMove from "./PlayerOneMove";
import { generatePassword } from "../../utils/generatePassword";

const styles = {
  container: {
    marginBottom: "100px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  h2: { margin: "50px" },
  box: {
    width: 600,
    bgcolor: "background.paper",
    height: 200,
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  button: { width: "100%", borderRadius: "0px 0px 4px 4px" },
};

const StartGame = () => {
  const { t } = useTranslation();
  const [{ data: account }] = useAccount();

  const initGameData = {
    hand: "",
    amount: "",
    token: "",
    password: "",
  };
  const [gameData, setGameData] = useState(initGameData);

  useEffect(() => {
    if (!account) {
      setGameData(initGameData);
    }
  }, [account]);

  const setBet = (changedGameData) => {
    let pasword = generatePassword();
    setGameData({
      ...changedGameData,
      password: pasword,
    });
  };

  return (
    <Container maxWidth="sm" sx={styles.container}>
      <h2 style={styles.h2}>{t("startgame.title")}</h2>
      <Box sx={styles.box}>
        <Paper elevation={3}>
          <Grid container>
            <Grid item xs={6} sx={styles.grid}>
              <SelectHand gameData={gameData} setBet={setBet} />
            </Grid>
            <Grid item xs={6} sx={styles.grid}>
              <SelectBet betData={gameData} setBet={setBet} />
            </Grid>
          </Grid>
          {gameData.amount && (
            <PlayerOneMove
              game={gameData}
              setBet={setBet}
              accountAddress={account?.address}
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default StartGame;
