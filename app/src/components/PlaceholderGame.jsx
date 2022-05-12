import React from "react";
import { useTranslation } from "react-i18next";
import { useAccount } from "wagmi";
import { Grid, Paper, Box, Skeleton } from "@mui/material";

const styles = {
  content: {
    width: 600,
    bgcolor: "background.paper",
    height: 200,
  },
  description: {
    margin: "0px",
    paddingTop: "40px",
    fontFamily: "Josefin Sans",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  box1: { height: "101px", width: "80%", marginTop: "30px" },
  box2: { width: "80%", marginTop: "30px" },
};

const PlaceholderGame = () => {
  const { t } = useTranslation();

  const [{ data: account }] = useAccount();

  return (
    <Box sx={styles.content}>
      <Paper elevation={3}>
        <p style={styles.description}>
          {account
            ? t("placeholdergame.startorwait")
            : t("placeholdergame.loginfirst")}
        </p>
        <Grid container>
          <Grid item xs={6} sx={styles.grid}>
            <Box sx={styles.box1}>
              <Skeleton />
              <Skeleton animation="wave" />
              <Skeleton animation={false} />
            </Box>
          </Grid>
          <Grid item xs={6} sx={styles.grid}>
            <Box sx={styles.box2}>
              <Skeleton />
              <Skeleton animation="wave" />
              <Skeleton animation={false} />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default PlaceholderGame;
