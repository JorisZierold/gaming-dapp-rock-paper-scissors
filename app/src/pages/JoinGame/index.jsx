import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";
import PropTypes from "prop-types";
import { Container, Grid, Paper, Box, Chip } from "@mui/material";
import { getOpenGames } from "../../utils/game/game-states";
import { userIsCurrentPlayer } from "../../utils/user/validate-user";
import GameCounter from "../../components/GameCounter";
import { SelectHand } from "../../components/SelectHand";
import PlayedHand from "../../components/PlayedHand";
import GameState from "../../components/GameState";
import PlaceholderGame from "../../components/PlaceholderGame";
import PlayerTwoMove from "./PlayerTwoMove";
import Cancel from "./Cancel";

const styles = {
  Grid: {
    paddingBottom: "20px",
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
    marginBottom: "200px",
  },
  h2: { margin: "50px" },
  h3: { marginBottom: "40px" },
  placeholderPlayer2: {},
  handPlaceholder: {
    fontSize: "50px",
    minHeight: "80px",
    minWidth: "80px",
    paddingTop: "15px",
  },
  gameState: { paddingTop: "10px" },
};

const JoinGame = (props) => {
  const { contractEvents } = props;
  const { t } = useTranslation();
  const [{ data: account }] = useAccount();

  useEffect(() => {
    if (contractEvents !== undefined) {
      lookupGames();
    }
  }, [contractEvents]);

  const [gameData, setGameData] = useState([]);

  const lookupGames = () => {
    if (contractEvents.Registered.length > 0) {
      const openGameRounds = getOpenGames(
        contractEvents.Registered,
        contractEvents.NewGame,
        contractEvents.GameDecided
      );
      setGameData(openGameRounds);
    }
  };

  const setBet = (changedGameData) => {
    let newGameData = [...gameData];
    newGameData[changedGameData.key] = changedGameData;
    setGameData(newGameData);
  };

  const setTimeoutIsOver = (key) => {
    let updatedGameData = [...gameData];
    updatedGameData[key].timeoutIsOver = true;
    setGameData(updatedGameData);
  };

  const renderOpenGames = (game) => {
    const userIsPlayer1 = userIsCurrentPlayer(account?.address, game?.player1);

    return (
      <>
        <div style={styles.gameState}>
          <GameState game={game} />
          <GameCounter game={game} setTimeoutIsOver={setTimeoutIsOver} />
        </div>
        <Grid container sx={styles.Grid}>
          <Grid item xs={6} sx={styles.GridItem}>
            <PlayedHand
              player={game?.player1}
              name={t("joingame.firstplayer")}
            />
          </Grid>
          <Grid item xs={6} sx={styles.GridItem}>
            {userIsPlayer1 ? (
              <div style={styles.placeholderPlayer2}>
                <div style={styles.handPlaceholder}>⏳</div>
                <Chip
                  color="info"
                  label={t("joingame.secondplayer")}
                  variant="outlined"
                ></Chip>
              </div>
            ) : (
              <SelectHand gameData={game} setBet={setBet} />
            )}
          </Grid>
        </Grid>
        {account && !!game?.hand && !userIsPlayer1 ? (
          <PlayerTwoMove game={game} setBet={setBet} />
        ) : null}
        {account && userIsPlayer1 && game.timeoutIsOver ? (
          <Cancel game={game} />
        ) : null}
      </>
    );
  };

  return (
    <Container maxWidth="sm" sx={styles.Container}>
      <h2 style={styles.h2}>{t("joingame.title")}</h2>
      {gameData.length > 0 ? (
        <h3 style={styles.h3}>
          {gameData.length}
          {gameData.length === 1
            ? t("joingame.subtitle1")
            : t("joingame.subtitle2")}
        </h3>
      ) : (
        <PlaceholderGame />
      )}
      {gameData.map((game) => (
        <Box key={game.gameId} sx={styles.Box}>
          <Paper elevation={3}>{renderOpenGames(game)}</Paper>
        </Box>
      ))}
    </Container>
  );
};

export default JoinGame;

JoinGame.propTypes = {
  contractEvents: PropTypes.shape({
    Registered: PropTypes.array,
    NewGame: PropTypes.array,
    Canceled: PropTypes.array,
  }),
};
