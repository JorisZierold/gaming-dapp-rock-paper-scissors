import React from "react";
import { useTranslation } from "react-i18next";
import { useNetwork } from "wagmi";
import { Avatar, Chip, Menu, MenuItem } from "@mui/material";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import EthereumLogo from "../assets/img/ethereum-logo.png";

const styles = {
  menu: {
    top: "45px",
  },
  menuContent: {
    width: "250px",
    paddingLeft: "15px",
    paddingRight: "15px",
  },
  chainLogo: {
    height: "20px",
    paddingRight: "10px",
  },
  menuItemDisabled: {
    border: "1px solid",
    textAlign: "center",
  },
  networkSwitch: {
    height: "37.5px",
    borderRadius: "50px",
    padding: "10px",
    marginRight: "10px",
  },
  networkButton: {
    borderRadius: "35px",
    border: "1px solid #e7e7e7",
  },
  unsupportedNetwork: {
    fontSize: "13px",
    color: "red",
    textAlign: "center",
  },
  errorMessage: {
    border: "1px solid red",
    padding: "5px",
    color: "red",
    fontSize: "14px",
  },
};

export const NetworkSelector = () => {
  const { t } = useTranslation();

  const [{ data: network, error: switchNetworkError }, switchNetwork] =
    useNetwork();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Chip
        deleteIcon={<KeyboardArrowDown />}
        variant="filled"
        style={styles.networkSwitch}
        color="error"
        label={t("networkselector.button")}
        onClick={handleMenu}
        avatar={
          <Avatar>
            <PriorityHighIcon />
          </Avatar>
        }
      />
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        open={Boolean(anchorEl)}
        onClose={() => handleClose()}
        style={styles.menu}
      >
        <div style={styles.menuContent}>
          <p>{t("networkselector.dialogTitle")}</p>
          {switchNetwork &&
            network.chains.map((x) =>
              x.id === network.chain?.id ? null : (
                <MenuItem
                  key={x.id}
                  onClick={() => switchNetwork(x.id)}
                  selected={false}
                  style={styles.networkButton}
                >
                  <img src={EthereumLogo} style={styles.chainLogo} />
                  {x.name}
                </MenuItem>
              )
            )}
          <p style={styles.unsupportedNetwork}>
            {`${t("networkselector.info1")} ${
              network.chain?.name ?? network.chain?.id
            } ${network.chain?.unsupported && t("networkselector.info2")}`}
          </p>
          {switchNetworkError && (
            <p style={styles.errorMessage}>
              Error: {switchNetworkError?.message}
            </p>
          )}
        </div>
      </Menu>
    </div>
  );
};
