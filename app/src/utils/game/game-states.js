import { ethers } from "ethers";
import { AddressZero } from "@ethersproject/constants";
import i18n from "i18next";

/* ----------------------------- Game State OPEN ---------------------------- */
export const getOpenGames = (
  eventsRegistered,
  eventsNewGame,
  eventsDecided
) => {
  let openGames = [];
  // Go trough Events and count Registered Events with similar `round`
  eventsRegistered.forEach((event) => {
    let gameId = event.args.gameId;
    let isRunningGame = eventExists(eventsNewGame, gameId);
    let isDecidedGame = eventExists(eventsDecided, gameId);
    if (!isRunningGame && !isDecidedGame) openGames.push(event);
  });
  openGames = openGames.map((game, key) => {
    return {
      key: key,
      player1: game.args.player1,
      amount: ethers.utils.formatEther(game.args.bet),
      gameId: game.args.gameId,
      openingTime: game.args.openingTime.toString(),
      timeoutIsOver: false,
    };
  });
  return openGames;
};

/* --------------------------- Game State RUNNING --------------------------- */
export const getRunningGames = (
  eventsNewGame,
  eventsDecided,
  eventsRevealed
) => {
  let runningGames = [];
  eventsNewGame.forEach((event) => {
    let gameId = event.args.gameId;
    let isDecidedGame = eventExists(eventsDecided, gameId);
    if (!isDecidedGame) runningGames.push(event);
  });
  runningGames = runningGames.map((game, key) => {
    const gameId = game.args.gameId;
    const player1Revealed = eventsRevealed.some(
      (event) => event.args.gameId === gameId
    );
    return {
      key: key,
      player1: game.args.player1,
      player2: game.args.player2,
      handPlayer1: "", // NOTE hand is hidden until player1 reveals
      handPlayer2: "", // NOTE hand is visible on-chain but not in logged in `NewGame` event
      amount: ethers.utils.formatEther(game.args.potSize),
      gameId: game.args.gameId,
      endTime: game.args.endTime.toString(),
      player1Revealed: player1Revealed,
      timeoutIsOver: false,
    };
  });
  return runningGames;
};

/* --------------------------- Game State DECIDED --------------------------- */
export const getDecidedGames = (
  eventsNewGame,
  eventsDecided,
  eventsRevealed
) => {
  const decidedGames = eventsDecided.map((game, key) => {
    const gameId = game.args.gameId;
    const revealedGame = eventsRevealed.findIndex(
      (event) => event.args.gameId === gameId
    );
    const runningGame = eventsNewGame.findIndex(
      (event) => event.args.gameId === gameId
    );
    return {
      blockNumber: game.blockNumber,
      key: key,
      player1:
        runningGame === -1
          ? game.args.winner1
          : eventsNewGame[runningGame]?.args?.player1,
      player2: eventsNewGame[runningGame]?.args?.player2,
      winner1: game.args.winner1,
      winner2: game.args.winner2,
      handPlayer1: eventsRevealed[revealedGame]?.args?.handPlayer1,
      handPlayer2: eventsNewGame[runningGame]?.args?.handPlayer2,
      amount: ethers.utils.formatEther(game.args.potSize),
      gameId: game.args.gameId,
      result:
        runningGame === -1
          ? i18n.t("gamestates.canceled")
          : revealedGame === -1
          ? i18n.t("gamestates.noreveal")
          : game.args.winner2 !== AddressZero
          ? i18n.t("gamestates.draw")
          : game.args.winner1 === eventsNewGame[runningGame]?.args?.player1
          ? i18n.t("gamestates.firstplayerwon")
          : i18n.t("gamestates.secondplayerwon"),
    };
  });
  return decidedGames;
};

/* --------------------------------- helper --------------------------------- */
const eventExists = (events, gameId) => {
  if (events !== undefined) {
    return events.some((event) => event.args.gameId === gameId);
  } else {
    return false;
  }
};
