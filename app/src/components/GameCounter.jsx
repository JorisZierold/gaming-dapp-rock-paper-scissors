import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Container } from "@mui/material";

const CANCEL_TIMEOUT = parseFloat(import.meta.env.VITE_CANCEL_TIMEOUT);
const REVEAL_TIMEOUT = parseFloat(import.meta.env.VITE_REVEAL_TIMEOUT);

const styles = {
  Container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

const GameCounter = (props) => {
  const { game, setTimeoutIsOver } = props;

  const { t } = useTranslation();

  const [date, setDate] = useState(new Date());

  // Check if game is open, else it is already running
  const gameIsOpen = !!game.openingTime;
  const startTime = gameIsOpen
    ? game.openingTime
    : game.endTime - REVEAL_TIMEOUT;
  const timeout = gameIsOpen ? CANCEL_TIMEOUT : REVEAL_TIMEOUT;

  const currentTime = Math.floor(date / 1000);
  const timePast = currentTime - startTime;
  const timeoutIsOver = timePast > timeout;

  useEffect(() => {
    timeoutIsOver ? setTimeoutIsOver(game.key) : null;
  }, [timeoutIsOver]);

  const renderTime = (
    <span>
      {timePast > 60
        ? `${Math.floor(timePast / 60)} ${t("gamecounter.min")}`
        : ""}
      {` ${timePast % 60} ${t("gamecounter.sec")}`}
    </span>
  );

  useEffect(() => {
    const timerId = setInterval(refreshDate, 1000);
    return function cleanup() {
      clearInterval(timerId);
    };
  }, []);

  function refreshDate() {
    setDate(new Date());
  }

  return (
    <Container sx={styles.Container}>
      <p>
        {gameIsOpen ? t("gamecounter.info1") : t("gamecounter.info2")}
        {renderTime}
      </p>
    </Container>
  );
};

export default GameCounter;

GameCounter.propTypes = {
  game: PropTypes.shape({
    openingTime: PropTypes.string,
    endTime: PropTypes.string,
    key: PropTypes.number.isRequired,
  }),
};
