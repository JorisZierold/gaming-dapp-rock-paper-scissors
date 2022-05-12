import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";
import PropTypes from "prop-types";
import { Container, Grid, Paper, Box } from "@mui/material";
import { getRunningGames } from "../../utils/game/game-states";
import { userIsCurrentPlayer } from "../../utils/user/validate-user";
import PlaceholderGame from "../../components/PlaceholderGame";
import PlayedHand from "../../components/PlayedHand";
import GameState from "../../components/GameState";
import GameCounter from "../../components/GameCounter";
import GameResult from "./GameResult";
import Reveal from "./Reveal";

const styles = {
  Grid: {
    paddingBottom: "40px",
  },
  GridItem: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  Container: {
    marginBottom: "100px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  Button: { width: "100%", borderRadius: "0px 0px 4px 4px" },
  Box: {
    width: 600,
    bgcolor: "background.paper",
    height: 200,
    marginBottom: "150px",
  },
  h2: { margin: "50px" },
  h3: { marginBottom: "40px" },
  gameStatus: { paddingTop: "10px" },
};

const RunningGames = (props) => {
  const { contractEvents } = props;
  const { t } = useTranslation();
  const [{ data: account }] = useAccount();

  const setTimeoutIsOver = (key) => {
    let updatedGameData = [...allGameData];
    updatedGameData[key].timeoutIsOver = true;
    setAllGameData(updatedGameData);
  };

  useEffect(() => {
    if (contractEvents !== undefined) {
      lookupGames();
    }
  }, [contractEvents]);

  const [allGameData, setAllGameData] = useState([]);

  const lookupGames = () => {
    if (contractEvents.Registered.length > 0) {
      const openGameRounds = getRunningGames(
        contractEvents.NewGame,
        contractEvents.GameDecided,
        contractEvents.Revealed
      );
      setAllGameData(openGameRounds);
    }
  };

  const renderOpenGames = (game) => {
    const userIsPlayer1 = userIsCurrentPlayer(account?.address, game.player1);
    const userIsPlayer2 = userIsCurrentPlayer(account?.address, game.player2);
    const playerCanReveal =
      account?.address &&
      !game.player1Revealed &&
      userIsPlayer1 &&
      !game.timeoutIsOver;
    const playerCanRequestResult =
      account?.address &&
      (game.player1Revealed || game.timeoutIsOver) &&
      (userIsPlayer1 || userIsPlayer2);
    return (
      <>
        <div style={styles.gameStatus}>
          <GameState game={game} />
          <GameCounter game={game} setTimeoutIsOver={setTimeoutIsOver} />
        </div>

        <Grid container sx={styles.Grid}>
          <Grid item xs={6} sx={styles.GridItem}>
            <PlayedHand
              player={game.player1}
              hand={game.handPlayer1}
              name={t("runninggames.firstplayer")}
            />
          </Grid>
          <Grid item xs={6} sx={styles.GridItem}>
            <PlayedHand
              player={game.player2}
              hand={game.handPlayer2}
              name={t("runninggames.secondplayer")}
            />
          </Grid>
        </Grid>
        {playerCanReveal && <Reveal game={game} />}
        {playerCanRequestResult && <GameResult game={game} />}
      </>
    );
  };

  return (
    <Container maxWidth="sm" sx={styles.Container}>
      <h2 style={styles.h2}>{t("runninggames.title")}</h2>
      {allGameData.length > 0 ? (
        <h3 style={styles.h3}>
          {allGameData.length}
          {allGameData.length === 1
            ? t("runninggames.subtitle1")
            : t("runninggames.subtitle2")}
        </h3>
      ) : (
        <PlaceholderGame />
      )}
      {allGameData.map((game) => (
        <Box key={game.gameId} sx={styles.Box}>
          <Paper elevation={3}>{renderOpenGames(game)}</Paper>
        </Box>
      ))}
    </Container>
  );
};

export default RunningGames;

RunningGames.propTypes = {
  contractEvents: PropTypes.shape({
    NewGame: PropTypes.array,
    GameDecided: PropTypes.array,
    Revealed: PropTypes.array,
  }),
};
