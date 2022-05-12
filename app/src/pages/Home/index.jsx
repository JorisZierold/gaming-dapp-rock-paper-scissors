import React from "react";
import { useTranslation } from "react-i18next";
import { Container, Paper, Divider } from "@mui/material";
import ApproveToken from "./ApproveToken";
import links from "../../constants/links.json";

const styles = {
  Container: { padding: "50px 40px 0px 40px", lineHeight: 1.5 },
  blue: { color: "#1976d2" },
  title: { marginBottom: "0px", color: "#1976d2" },
  subtitle: { marginTop: "5px", color: "#1976d2" },
  frame: { width: "488px", height: "278px", display: "contents" },
  embedGiphy: {
    width: "480px",
    height: "270px",
    pointerEvents: "none",
    border: "4px solid #ffd238",
  },
  giphyLink: {
    position: "relative",
    display: "grid",
    bottom: "30px",
    zIndex: 1,
    color: "#ffd238de",
    fontSize: "13px",
    textDecoration: "none",
  },
  Divider: {
    marginTop: "100px",
    marginBottom: "100px",
  },
};

const Home = () => {
  const { t } = useTranslation();
  const rpcGiphy = "https://giphy.com/embed/26FLaFO3cGWxt2qHe";

  return (
    <Container maxWidth="sm" sx={styles.Container}>
      <h1 className="logo" style={styles.title}>
        {t("home.title")}
      </h1>
      <h3 style={styles.subtitle}>{t("home.subtitle")}</h3>

      <Paper elevation={3} style={styles.frame}>
        <iframe
          src={rpcGiphy}
          frameBorder="0"
          style={styles.embedGiphy}
        ></iframe>
        <a style={styles.giphyLink} href={rpcGiphy} target="_blank">
          @CBS | Giphy
        </a>
      </Paper>
      <Divider>
        <h2 color="primary">{t("home.introTitle")}</h2>
      </Divider>
      <p>{t("home.introDescription")}</p>
      <Divider>
        <h2>{t("home.howitworksTitle")}</h2>
      </Divider>
      <p>{t("home.howitworksDescription")}</p>
      <p>
        <a
          style={styles.blue}
          href={links.referrals.githubRepo}
          target="_blank"
        >
          {t("home.repolink")}
        </a>
      </p>
      <Divider>
        <h2>{t("home.starthereTitle")}</h2>
      </Divider>
      <h3>{t("home.step1")}</h3>
      <h3>{t("home.step2")}</h3>
      <h3>{t("home.step3")}</h3>
      <Divider sx={styles.Divider} />
      <ApproveToken />
    </Container>
  );
};

export default Home;
