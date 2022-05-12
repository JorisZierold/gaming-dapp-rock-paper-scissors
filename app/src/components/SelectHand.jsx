import React from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { useAccount, useNetwork } from "wagmi";
import { Chip, Stack, IconButton } from "@mui/material";
import { toast } from "react-toastify";
import { Hands } from "../constants/hands";

export const SelectHand = (props) => {
  const { gameData, setBet } = props;

  const { t } = useTranslation();

  const [{ data: account }] = useAccount();
  const [{ data: network }] = useNetwork();

  function handleSelectHand(event) {
    if (account && !network?.chain?.unsupported) {
      setBet({
        ...gameData,
        hand: event.target.name,
      });
    } else if (!account) {
      toast.warn(t("tx.loginFirst"));
    } else if (network?.chain?.unsupported) {
      toast.warn(t("tx.wrongNetwork"));
    } else {
      toast.warn(t("tx.unknownError"));
    }
  }

  function handleDelete() {
    setBet({
      ...gameData,
      hand: "",
    });
  }

  const styles = {
    handIcon: { fontSize: "50px", minHeight: "80px", minWidth: "80px" },
    activeHandIcon: {
      fontSize: "50px",
      minHeight: "80px",
      minWidth: "80px",
      backgroundColor: "#1976d2",
    },
    margin: { marginBottom: "20px" },
  };

  return (
    <>
      <h3>{t("selecthand.title")}</h3>
      <Stack direction="row" alignItems="center" spacing={2} sx={styles.margin}>
        {Hands.map(
          (hand, index) =>
            !!index && (
              <IconButton
                color="primary"
                variant="contained"
                sx={
                  gameData?.hand == index
                    ? styles.activeHandIcon
                    : styles.handIcon
                }
                onClick={handleSelectHand}
                name={String(index)}
                aria-label="hand"
                key={hand.name}
              >
                {hand.icon}
              </IconButton>
            )
        )}
      </Stack>
      {!!gameData?.hand && (
        <Chip
          color="primary"
          label={t(`selecthand.${Hands[gameData.hand]?.name}`)}
          variant="outlined"
          onDelete={handleDelete}
          sx={styles.margin}
        />
      )}
    </>
  );
};

SelectHand.propTypes = {
  gameData: PropTypes.shape({
    hand: PropTypes.string,
  }),
  setBet: PropTypes.func,
};
