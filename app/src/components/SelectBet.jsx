import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import {
  Box,
  Skeleton,
  Chip,
  Button,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";

const MIN_BET = parseFloat(import.meta.env.VITE_MIN_BET_IN_ETH) ?? 1;
const TOKEN_NAME = import.meta.env.VITE_TOKEN_NAME;
const TOKEN_SYMBOL = import.meta.env.VITE_TOKEN_SYMBOL;

const styles = {
  token: { marginBottom: "20px" },
  box: { width: "80%", marginTop: "50px" },
};

export const SelectBet = (props) => {
  const { betData, setBet } = props;
  const { t } = useTranslation();

  function handleBetData(event) {
    setBet({
      ...betData,
      amount: event?.target?.value.toString(),
    });
  }

  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {props.betData.hand ? (
        <>
          <h3>{t("selectbet.title")}</h3>
          <Chip
            sx={styles.token}
            deleteIcon={<KeyboardArrowDown />}
            variant="outlined"
            color="primary"
            onDelete={handleClickOpen}
            avatar={<Avatar>{TOKEN_SYMBOL}</Avatar>}
            label={TOKEN_NAME}
          />
          <TextField
            helperText={t("selectbet.helpertext", { amount: MIN_BET })}
            size="small"
            id="filled-basic"
            label={t("selectbet.inputlabel")}
            type="number"
            InputProps={{
              inputProps: {
                min: MIN_BET,
              },
            }}
            variant="outlined"
            value={props?.betData?.amount}
            name="amount"
            onChange={handleBetData}
          />
        </>
      ) : (
        <Box sx={styles.box}>
          <Skeleton />
          <Skeleton animation="wave" />
          <Skeleton animation={false} />
        </Box>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{t("selectbet.setTokenTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("selectbet.setTokenDescription")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("selectbet.closeDialog")}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

SelectBet.propTypes = {
  betData: PropTypes.shape({
    amount: PropTypes.string,
    hand: PropTypes.string,
  }),
  setBet: PropTypes.func,
};
