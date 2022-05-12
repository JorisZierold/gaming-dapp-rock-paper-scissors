import React from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Tooltip } from "@mui/material";

const styles = {
  info: {
    fontWeight: 500,
    marginBottom: "0px",
  },
};

const GameState = (props) => {
  const { game } = props;

  const { t } = useTranslation();

  return (
    <Tooltip title={`Game ID / hash: ${game?.gameId}`}>
      <p style={styles.info}>
        {t("gamestate.info", {
          gameId: game?.gameId.substr(0, 6),
          amount: game?.amount,
        })}
      </p>
    </Tooltip>
  );
};

export default GameState;

GameState.propTypes = {
  game: PropTypes.shape({
    amount: PropTypes.string.isRequired,
    gameId: PropTypes.string.isRequired,
  }),
};
