import React from "react";
import { useTranslation } from "react-i18next";
import links from "../constants/links.json";

const styles = {
  footer: {
    position: "absolute",
    bottom: "0px",
    width: "100%",
    height: "40px",
    background: "#1876d1",
    color: "#ffd238",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "15px",
  },
  footerLinks: {
    color: "#ffd238",
    paddingLeft: "3px",
    fontWeight: "500",
    textDecoration: "none",
  },
  divider: {
    paddingLeft: 10,
    paddingRight: 10,
  },
};

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer style={styles.footer}>
      {t("footer.credits")}
      <a
        style={styles.footerLinks}
        href={links.referrals.joriszierold}
        target="_blank"
      >
        Joris Zierold
      </a>
      <span style={styles.divider}>|</span>
      <a
        style={styles.footerLinks}
        href={links.referrals.githubRepo}
        target="_blank"
      >
        {t("footer.github")}
      </a>
    </footer>
  );
};

export default Footer;
