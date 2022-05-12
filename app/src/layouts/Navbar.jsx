import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNetwork, useAccount } from "wagmi";
import { Chip } from "@mui/material";
import { UserAvatar } from "../components/Avatars";
import { WalletModal } from "../components/WalletModal";
import { NetworkSelector } from "../components/NetworkSelector";
import { TokenBalance } from "../components/TokenBalance";
import LanguageSwitcher from "../components/LanguageSwitcher";
import logo from "../assets/img/Rock-Paper-Scissors-Logo.png";

const styles = {
  navWrapper: {
    margin: "0px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userWrapper: {
    display: "flex",
    height: "37.5px",
    margin: "0px",
    position: "relative",
    top: "5px",
  },
  navbar: {
    paddingTop: "10px",
    color: "#ffd239",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navlinks: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    listStyleType: "none",
    backgroundColor: "#ffd239",
    color: "#1876d0",
    margin: "0px",
    padding: "6px 0px 6px 30px",
    borderRadius: "30px",
    left: "-40px",
    top: "5px",
    position: "relative",
    border: "1px solid #eaa453",
  },
  listItem: {
    paddingRight: "25px",
    padding: "0px 1px",
    borderRadius: "25px",
  },
  link: {
    textDecoration: "none",
    fontWeight: 500,
    color: "#1876d1",
    fontSize: "15px",
    padding: "11px 10px",
    borderRadius: "25px",
  },
  activeLinkStyles: {
    textDecoration: "none",
    background: "white",
    color: "#333333",
    fontWeight: 500,
    fontSize: "15px",
    padding: "9px 10px",
    borderRadius: "25px",
  },
  connectedUser: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  userAvatar: {
    zIndex: 1,
  },
  connectWallet: {
    backgroundColor: "#ffd239",
    color: "#000000",
    boxShadow: "rgb(14 14 44 / 40%) 0px -1px 0px 0px inset",
    height: "49.5px",
    borderRadius: "50px",
  },
  rpcLogoNavlink: {
    zIndex: "1",
  },
  rpcLogo: {
    width: "120px",
    zIndex: "1",
  },
};

const Navbar = () => {
  const { t } = useTranslation();

  const [{ data: network }] = useNetwork();
  const [{ data: account }] = useAccount();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navWrapper}>
        <NavLink to="/" style={styles.rpcLogoNavlink}>
          <img src={logo} style={styles.rpcLogo} />
        </NavLink>
        <ul style={styles.navlinks}>
          <LanguageSwitcher />
          <li style={styles.listItem}>
            <NavLink
              to="/"
              style={({ isActive }) =>
                isActive ? styles.activeLinkStyles : styles.link
              }
            >
              {t("navbar.intro")}
            </NavLink>
          </li>
          <li style={styles.listItem}>
            <NavLink
              to="/start-game"
              style={({ isActive }) =>
                isActive ? styles.activeLinkStyles : styles.link
              }
            >
              {t("navbar.startgame")}
            </NavLink>
          </li>
          <li style={styles.listItem}>
            <NavLink
              to="/join-game"
              style={({ isActive }) =>
                isActive ? styles.activeLinkStyles : styles.link
              }
            >
              {t("navbar.joingame")}
            </NavLink>
          </li>
          <li style={styles.listItem}>
            <NavLink
              to="/running-games"
              style={({ isActive }) =>
                isActive ? styles.activeLinkStyles : styles.link
              }
            >
              {t("navbar.runninggames")}
            </NavLink>
          </li>
          <li style={styles.listItem}>
            <NavLink
              to="/game-results"
              style={({ isActive }) =>
                isActive ? styles.activeLinkStyles : styles.link
              }
            >
              {t("navbar.results")}
            </NavLink>
          </li>
        </ul>
      </div>

      <div style={styles.userWrapper}>
        {network?.chain?.unsupported && <NetworkSelector />}
        {account?.address && (
          <div style={styles.connectedUser}>
            <UserAvatar
              style={styles.userAvatar}
              account={account?.address}
              showAddress={true}
            />
            <TokenBalance />
          </div>
        )}
        {!account?.address && (
          <div style={styles.conntectWallet}>
            <Chip
              style={styles.connectWallet}
              variant="filled"
              color="primary"
              label={t("navbar.connectwallet")}
              onClick={openLoginModal}
            />
          </div>
        )}
        <WalletModal
          isLoginModalOpen={isLoginModalOpen}
          setIsLoginModalOpen={setIsLoginModalOpen}
        />
      </div>
    </nav>
  );
};

export default Navbar;
