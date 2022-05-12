import React from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { useAccount } from "wagmi";
import { PlayerAvatar } from "./Avatars";
import { userIsCurrentPlayer } from "../utils/user/validate-user";
import { Hands } from "../constants/hands";

const styles = {
  handPlaceholder: {
    fontSize: "50px",
    minHeight: "80px",
    minWidth: "80px",
    paddingTop: "15px",
  },
};

const PlayedHand = (props) => {
  const { player, hand, name } = props;
  const { t } = useTranslation();
  const [{ data: account }] = useAccount();

  const userIsPlayer = userIsCurrentPlayer(account?.address, player);
  const namePersonalized = userIsPlayer
    ? `${name} ${t("playedhand.playerSuffix")}`
    : name;

  return player ? (
    <div>
      <div style={styles.handPlaceholder}>{hand ? Hands[hand].icon : "❓"}</div>
      <PlayerAvatar account={player} name={namePersonalized} />
    </div>
  ) : (
    <div>
      <div style={styles.handPlaceholder}>🤷‍♂️</div>
      <PlayerAvatar name={t("playedhand.nobody")} />
    </div>
  );
};

export default PlayedHand;

PlayedHand.propTypes = {
  player: PropTypes.string,
  hand: PropTypes.string,
  name: PropTypes.string.isRequired,
};
