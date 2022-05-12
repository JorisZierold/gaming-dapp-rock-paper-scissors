import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, Chip } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { SUPPORTED_LOCALES, LOCALE_LABLE } from "../../public/locales";

const styles = {
  switcher: { marginLeft: "5px", marginRight: "5px" },
  menu: { top: "35px" },
  menuContent: { display: "flex", flexDirection: "column" },
  language: { marginBottom: "10px", width: "85px" },
};

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const changeLanguage = (lng) => {
    handleClose();
    i18n.changeLanguage(lng);
  };

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Chip
        label={LOCALE_LABLE[i18n.language]}
        onClick={handleMenu}
        color="primary"
        variant="outlined"
        style={styles.switcher}
        size="small"
        icon={<KeyboardArrowDownIcon />}
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
        sx={styles.menu}
        elevation={0}
      >
        <div style={styles.menuContent}>
          {SUPPORTED_LOCALES.map((locale, key) =>
            i18n.language === locale ? null : (
              <Chip
                label={LOCALE_LABLE[locale]}
                onClick={() => changeLanguage(locale)}
                style={styles.language}
                key={locale + key}
                color="primary"
              />
            )
          )}
        </div>
      </Menu>
    </div>
  );
};

export default LanguageSwitcher;
