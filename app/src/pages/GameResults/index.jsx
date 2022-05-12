import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Container, Grid, Paper, Box } from "@mui/material";
import GameState from "../../components/GameState";
import PlayedHand from "../../components/PlayedHand";
import { getDecidedGames } from "../../utils/game/game-states";
import GameStats from "../../components/GameStats";

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
  Box: {
    width: 600,
    bgcolor: "background.paper",
    height: 200,
    marginBottom: "150px",
  },
  h2: { margin: "50px" },
  gameStatus: { paddingTop: "10px" },
};

const GameResults = (props) => {
  const { contractEvents } = props;
  const { t } = useTranslation();
  const [allGameData, setAllGameData] = useState([]);

  const maxRenderedLogs = 20;

  useEffect(() => {
    if (contractEvents !== undefined) {
      lookupGames();
    }
  }, [contractEvents]);

  const lookupGames = () => {
    if (contractEvents.GameDecided.length > 0) {
      const openGameRounds = getDecidedGames(
        contractEvents.NewGame,
        contractEvents.GameDecided,
        contractEvents.Revealed
      );

      openGameRounds.sort((a, b) =>
        a.blockNumber < b.blockNumber
          ? 1
          : b.blockNumber < a.blockNumber
          ? -1
          : 0
      );

      setAllGameData(openGameRounds);
    }
  };

  const renderDecidedGames = (game) => {
    return (
      <Box key={game?.gameId} sx={styles.Box}>
        <Paper elevation={3}>
          <div style={styles.gameStatus}>
            <h3>{game?.result}</h3>
            <GameState game={game} />
          </div>
          <Grid container sx={styles.Grid}>
            <Grid item xs={6} sx={styles.GridItem}>
              <PlayedHand
                player={game?.player1}
                hand={game?.handPlayer1}
                name={t("gameresults.firstplayer")}
              />
            </Grid>
            <Grid item xs={6} sx={styles.GridItem}>
              <PlayedHand
                player={game?.player2}
                hand={game?.handPlayer2}
                name={t("gameresults.secondplayer")}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  };

  let results = [];
  if (allGameData?.length > 0) {
    for (let i = 0; i < maxRenderedLogs; i++) {
      const game = allGameData[i];
      results.push(renderDecidedGames(game));
      if (i === allGameData?.length - 1) break;
      results;
    }
  }

  return (
    <Container maxWidth="sm" sx={styles.Container}>
      <h2 style={styles.h2}>{t("gameresults.title")}</h2>
      <GameStats allGames={allGameData} />
      {results}
    </Container>
  );
};

export default GameResults;

GameResults.propTypes = {
  contractEvents: PropTypes.shape({
    NewGame: PropTypes.array,
    GameDecided: PropTypes.array,
    Revealed: PropTypes.array,
  }),
};
