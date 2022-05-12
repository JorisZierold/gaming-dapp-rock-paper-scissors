import React from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Grid, Paper } from "@mui/material";
import { Hands } from "../constants/hands";

const styles = {
  maincontent: { width: "600px", marginBottom: "80px" },
  GridItem: { padding: "20px" },
  handIcon: { fontSize: "50px", minHeight: "80px", minWidth: "80px" },
  title: { margin: "10px" },
  subtitle: { margin: "10px", fontWeight: 100 },
};

const GameStats = (props) => {
  const { allGames } = props;

  const { t } = useTranslation();

  let totalHandsPlayed = 0;
  Hands.forEach((hand, key) => {
    let playedTimes = 0;
    allGames.forEach((game) => {
      playedTimes +=
        (game?.handPlayer1 === key ? 1 : 0) +
        (game?.handPlayer2 === key ? 1 : 0);
    });
    Hands[key].frequency = playedTimes;
    totalHandsPlayed += playedTimes;
  });

  return (
    <Paper elevation={3} sx={styles.maincontent}>
      <h3>{t("gamestats.title")}</h3>
      <Grid container>
        {Hands.map(
          (hand, key) =>
            !!key && (
              <Grid item xs={4} sx={styles.GridItem} elevation={3} key={key}>
                <h4 style={styles.title}>
                  {totalHandsPlayed
                    ? `${Math.round(
                        (hand?.frequency / totalHandsPlayed) * 100
                      )} %`
                    : "0,0 %"}
                </h4>
                <div style={styles.handIcon}>{hand.icon}</div>
                <h4 style={styles.subtitle}>
                  {`${hand?.frequency}x\n`}
                  {t(`gamestats.${hand.name}`)}
                </h4>
              </Grid>
            )
        )}
      </Grid>
    </Paper>
  );
};

export default GameStats;

GameStats.propTypes = {
  allGames: PropTypes.arrayOf(
    PropTypes.shape({
      handPlayer1: PropTypes.number,
      handPlayer2: PropTypes.number,
    })
  ),
};
