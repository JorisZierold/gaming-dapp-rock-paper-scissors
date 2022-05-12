import React from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import Blockies from "react-blockies";
import { Chip, Avatar, Tooltip } from "@mui/material";

const styles = {
  userAvatar: {
    backgroundColor: "#ffffff",
    fontSize: "16px",
    height: "37.5px",
    borderRadius: "50px",
    padding: "10px",
    zIndex: 1,
  },
  tooltip: { fontSize: "13px", padding: "5px 10px" },
  playerAvatar: {
    backgroundColor: "#ffffff",
    fontSize: "16px",
  },
};

export const UserAvatar = (props) => {
  const { account } = props;
  const { t } = useTranslation();
  const label = `${account.substr(0, 5)}...${account.substr(
    account.length - 4,
    4
  )}`;

  return (
    <Tooltip
      title={
        <p style={styles.tooltip}>
          {t("useravatar.tooltip", { account: account })}
        </p>
      }
      placement="bottom"
      arrow
    >
      <Chip
        sx={styles.userAvatar}
        variant="outlined"
        color="primary"
        avatar={
          <Avatar>
            <Blockies seed={account.toUpperCase()} size={6} scale={4} />
          </Avatar>
        }
        label={label}
      />
    </Tooltip>
  );
};

UserAvatar.propTypes = {
  account: PropTypes.string.isRequired,
};

export const PlayerAvatar = (props) => {
  const { account, name } = props;
  const { t } = useTranslation();
  const label = name;

  return (
    <Tooltip
      title={
        account ? <p>{t("playeravatar.tooltip", { account: account })}</p> : ""
      }
      placement="bottom"
      arrow
    >
      <Chip
        sx={styles.playerAvatar}
        variant="outlined"
        color="primary"
        avatar={
          <Avatar>
            {account && (
              <Blockies seed={account?.toUpperCase()} size={6} scale={4} />
            )}
          </Avatar>
        }
        label={label}
      />
    </Tooltip>
  );
};

PlayerAvatar.propTypes = {
  account: PropTypes.string,
  name: PropTypes.string.isRequired,
};
