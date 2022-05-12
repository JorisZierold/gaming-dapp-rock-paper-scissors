const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const truffleAssert = require("truffle-assertions");

const MIN_BET = "1000"; // 100 wei
const REVEAL_TIMEOUT = "5"; // 5000 ms
const CANCEL_TIMEOUT = "5"; // 5000 ms
const FIXEDSUPPLY = "1000.0"; // 1000.0 ether
const PLAYERS_STARTING_BALANCE = "10000000000000000000"; // 10.0 ether

const Hand = {
  None: 0,
  Rock: 1,
  Paper: 2,
  Scissors: 3,
};

// Helper function for deployment.
async function deploy(name, ...params) {
  const Contract = await ethers.getContractFactory(name);
  return await Contract.deploy(...params).then((f) => f.deployed());
}

describe("contracts/RockPaperScissors", function () {
  /* -------------------------------------------------------------------------- */
  /*    Deploy contracts freshly and populate users before each test section    */
  /* -------------------------------------------------------------------------- */
  beforeEach(async function () {
    this.mytoken = await deploy("MyToken");
    this.rockpaperscissors = await deploy(
      "RockPaperScissors",
      MIN_BET,
      REVEAL_TIMEOUT,
      CANCEL_TIMEOUT
    );
    this.accounts = await ethers.getSigners();
    // Most test's will be done with two user who can be either player1 or player2
    const user1 = this.accounts[1];
    const user2 = this.accounts[2];
    // Supply tokens to main user's and approve tokens to RockPaperScissors contract.
    // Send Token from owner to user1.
    await this.mytoken
      .transfer(user1.address, PLAYERS_STARTING_BALANCE)
      .then((tx) => tx.wait());
    // Approve Token from user1 to RockPaperScissors contract.
    const mytokenWithUser1 = this.mytoken.connect(user1);
    await mytokenWithUser1.approve(
      this.rockpaperscissors.address,
      PLAYERS_STARTING_BALANCE
    );
    // Send Token from owner to user2.
    await this.mytoken
      .transfer(user2.address, PLAYERS_STARTING_BALANCE)
      .then((tx) => tx.wait());
    // Approve Token from user2 to RockPaperScissors contract.
    const mytokenWithUser2 = this.mytoken.connect(user2);
    await mytokenWithUser2.approve(
      this.rockpaperscissors.address,
      PLAYERS_STARTING_BALANCE
    );
    // Whitelist Token for RockPaperScissors.
    const role = await this.rockpaperscissors.WHITELISTED_TOKEN();
    const rockpaperscissorsWithOwner = this.rockpaperscissors.connect(
      this.accounts[0]
    );
    await rockpaperscissorsWithOwner.grantRole(role, this.mytoken.address);
  });
  /* -------------------------------------------------------------------------- */
  /*                     Test that the token supply settled.                    */
  /* -------------------------------------------------------------------------- */
  it("Token supply should be according to the init (population of user's).", async function () {
    accounts = this.accounts;
    token = this.mytoken;

    const owner = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];

    // Token balances after population of user's
    const balanceOfOwner = await token.balanceOf(owner.address);
    const balanceOfUser1 = await token.balanceOf(user1.address);
    const balanceOfUser2 = await token.balanceOf(user2.address);

    // Sum all user`s balances and compare it with the `FIXEDSUPPLY`.
    const totalSupply = ethers.utils.formatEther(
      balanceOfOwner.add(balanceOfUser1).add(balanceOfUser2)
    );
    expect(totalSupply).to.equal(
      FIXEDSUPPLY,
      "Calculated token supply does not match initial supply."
    );
  });
  /* -------------------------------------------------------------------------- */
  /*       Test that User's approved Tokens to RockPaperScissors contract.      */
  /* -------------------------------------------------------------------------- */
  it("User's should approved Tokens to RockPaperScissors contract.", async function () {
    accounts = this.accounts;
    token = this.mytoken;
    game = this.rockpaperscissors;

    const user1 = accounts[1];
    const user2 = accounts[2];

    const approvedAmount = ethers.BigNumber.from(PLAYERS_STARTING_BALANCE);

    // Get allowance from user1 to RockPaperScissors contract.
    const allowanceFromUser1 = await token.allowance(
      user1.address,
      game.address
    );
    assert(
      approvedAmount.eq(allowanceFromUser1),
      "Allowance from user1 is not set correct."
    );

    // Get allowance from user2 to RockPaperScissors contract.
    const allowanceFromUser2 = await token.allowance(
      user2.address,
      game.address
    );
    assert(
      approvedAmount.eq(allowanceFromUser2),
      "Allowance from user2 is not set correct."
    );
  });
  /* -------------------------------------------------------------------------- */
  /*    Test that game is configured correctly by checking the data storages.   */
  /* -------------------------------------------------------------------------- */
  it("Game should be setup correctly after registration phase.", async function () {
    accounts = this.accounts;
    token = this.mytoken;
    game = this.rockpaperscissors;

    const player1 = accounts[1]; // user1 fixed as player1.
    const player2 = accounts[2]; // user1 fixed as player2.

    gamePlayer1Signs = this.rockpaperscissors.connect(player1);
    gamePlayer2Signs = this.rockpaperscissors.connect(player2);

    const bet = "100000000000000000"; // 0.1 ether
    const finalPot = "200000000000000000"; // 0.2 ether

    // Preparing hand for player1 e.g. creating hash.
    const handPlayer1 = Hand.Scissors;
    const passwordPlayer1 = "a-strong-password";
    const hash = await game.hashHelper(
      handPlayer1,
      passwordPlayer1,
      player1.address
    );
    // Hand of player2.
    const handPlayer2 = Hand.Paper;

    // player1 commits the 1st move.
    const movePlayer1 = await gamePlayer1Signs
      .playerOneMove(hash, bet, token.address)
      .then((tx) => tx.wait());

    // Assert that the contract emitted the `Registered` Event.
    expect(movePlayer1.events[0].event).to.equal(
      "Registered",
      "Contract does not emitted the expected Registered Event"
    );

    // Check data storage after the 1st move is registered.

    let GameRound = await game.games(hash);
    assert(
      GameRound.player1 === player1.address &&
        GameRound.handPlayer1 === Hand.None &&
        GameRound.player2 === ethers.constants.AddressZero &&
        GameRound.potSize.eq(ethers.BigNumber.from(bet)) &&
        expect(GameRound.endTime).to.equal(ethers.constants.Zero) &&
        GameRound.tokenAddress === token.address,
      "Game with player1 is not set correct."
    );

    // player2 commits the 2nd move.
    const movePlayer2 = await gamePlayer2Signs
      .playerTwoMove(hash, handPlayer2)
      .then((tx) => tx.wait());
    // Assert that the contract emitted the `Registered` and `NewGame` Event.
    expect(movePlayer2.events[0].event).to.equal(
      "NewGame",
      "Contract does not emitted the expected NewGame Event"
    );

    // Check that data storage is set correctly after the 2nd move is registered.
    const GameRoundUpdated = await game.games(hash);
    const endTime = GameRoundUpdated.endTime.toNumber() * 1000; // convert BN to unix timestamp in milliseconds
    const now = Date.now();

    assert(
      GameRoundUpdated.player1 === player1.address &&
        GameRoundUpdated.handPlayer1 === Hand.None &&
        GameRoundUpdated.player2 === player2.address &&
        GameRoundUpdated.handPlayer2 === handPlayer2 &&
        GameRoundUpdated.potSize.eq(ethers.BigNumber.from(finalPot)) &&
        endTime > now &&
        GameRoundUpdated.tokenAddress === token.address,
      "Game with both players is not set correct."
    );
  });
  /* -------------------------------------------------------------------------- */
  /*      Test that playerOneMove() reverts, when requirements are not met.     */
  /* -------------------------------------------------------------------------- */
  it("Function playerOneMove() should revert when requirements are not met.", async function () {
    const accounts = this.accounts;
    token = this.mytoken;
    const game = this.rockpaperscissors;

    const player1 = accounts[1];
    gamePlayer1Signs = game.connect(player1);

    const errMsg1 = "RockPaperScissors::playerOneMove: Hash cannot be 0x0.";
    const errMsg2 =
      "RockPaperScissors::playerOneMove: Your bet is to small, raise you bet up to MIN_BET.";
    const errMsg3 =
      "RockPaperScissors::playerOneMove: Not enough tokens are approved or bet exceed your balance.";

    // Preparing hand for player1 e.g. creating hash.
    const hand = Hand.Paper;
    const password = "myStrongPassword";
    const hash = await game.hashHelper(hand, password, player1.address);
    // constant bet of 0.1 ether
    const bet = "100000000000000000";

    // Revert #1
    const hashZero = ethers.constants.HashZero;
    await truffleAssert.reverts(
      gamePlayer1Signs.playerOneMove(hashZero, bet, token.address),
      errMsg1
    );

    // Revert #2
    const toSmallBet = MIN_BET - 1;
    await truffleAssert.reverts(
      gamePlayer1Signs.playerOneMove(hash, toSmallBet, token.address),
      errMsg2
    );

    // Revert #3
    const toBigBet = PLAYERS_STARTING_BALANCE + "0";
    await truffleAssert.reverts(
      gamePlayer1Signs.playerOneMove(hash, toBigBet, token.address),
      errMsg3
    );
  });
  /* -------------------------------------------------------------------------- */
  /*      Test that playerTwoMove() reverts, when requirements are not met.     */
  /* -------------------------------------------------------------------------- */
  it("Function playerTwoMove() should revert when requirements are not met.", async function () {
    const accounts = this.accounts;
    const token = this.mytoken;
    const game = this.rockpaperscissors;

    const player1 = accounts[1];
    const player2 = accounts[2];
    const gamePlayer1Signs = game.connect(player1);
    const gamePlayer2Signs = game.connect(player2);

    // TODO add test case for "RockPaperScissors::playerTwoMove: There is no free seat in this Game."
    const errMsg1 = "RockPaperScissors: Game does not exists, under this hash.";
    const errMsg2 =
      "RockPaperScissors::playerTwoMove: Not enough tokens are approved or bet exceed your balance";

    const hand = Hand.Paper;
    const password = "myStrongPassword";
    const hash = await game.hashHelper(hand, password, player1.address);

    // Revert #1
    await truffleAssert.reverts(
      gamePlayer2Signs.playerTwoMove(hash, hand),
      errMsg1
    );

    // Register a playerOneMove.
    await gamePlayer1Signs.playerOneMove(hash, MIN_BET, token.address);

    // Empty token balance of player2.
    const tokenPlayer2Signs = token.connect(player2);
    await tokenPlayer2Signs.transfer(
      accounts[0].address,
      PLAYERS_STARTING_BALANCE
    );

    // Revert #2
    await truffleAssert.reverts(
      gamePlayer2Signs.playerTwoMove(hash, hand),
      errMsg2
    );
  });
  /* -------------------------------------------------------------------------- */
  /*         Test that reveal() reverts, when requirements are not met.         */
  /* -------------------------------------------------------------------------- */
  it("Function reveal() should revert when requirements are not met.", async function () {
    const accounts = this.accounts;
    token = this.mytoken;
    const game = this.rockpaperscissors;

    const player1 = accounts[1];
    const player2 = accounts[2];
    const gamePlayer1Signs = game.connect(player1);
    const gamePlayer2Signs = game.connect(player2);

    const errMsg1 = "RockPaperScissors: Game does not started yet.";
    const errMsg2 =
      "RockPaperScissors::reveal: You are not registered as player1 of this round.";
    // const errMsg3 = "RockPaperScissors::reveal: Your hand is not valid."; Deleted from smart contract, not needed due to enum's
    const errMsg4 =
      "RockPaperScissors::reveal: Your hand does not match the encrypted version.";
    const errMsg5 =
      "RockPaperScissors::reveal: You already revealed your hand.";
    const errMsg6 =
      "RockPaperScissors::reveal: You are to late, the reveal phase is over.";

    // Playing the 1st round with an invalid hand
    let handPlayer1 = Hand.None; // invalid hand
    const handPlayer2 = Hand.Scissors;
    let password = "myStrongPassword";
    const hash = await game.hashHelper(handPlayer1, password, player1.address);

    await gamePlayer1Signs
      .playerOneMove(hash, MIN_BET, token.address)
      .then((tx) => tx.wait());

    // Revert #1
    await truffleAssert.reverts(
      gamePlayer1Signs.reveal(handPlayer1, password, hash),
      errMsg1
    );

    await gamePlayer2Signs
      .playerTwoMove(hash, handPlayer2)
      .then((tx) => tx.wait());

    // Revert #3
    // await truffleAssert.reverts(
    //   gamePlayer1Signs.reveal(handPlayer1, password, round),
    //   errMsg3
    // );

    // Revert #2
    await truffleAssert.reverts(
      gamePlayer2Signs.reveal(handPlayer2, password, hash),
      errMsg2
    );

    // Revert #4
    handPlayer1 = Hand.Rock; // Change hand to something valid, but not in-line w/ hash.
    await truffleAssert.reverts(
      gamePlayer1Signs.reveal(handPlayer1, password, hash),
      errMsg4
    );

    // Playing round 2, player2 starts the new game round.
    const hash2 = await game.hashHelper(handPlayer2, password, player2.address);
    await gamePlayer2Signs
      .playerOneMove(hash2, MIN_BET, token.address)
      .then((tx) => tx.wait());
    await gamePlayer1Signs
      .playerTwoMove(hash2, handPlayer1)
      .then((tx) => tx.wait());

    // Revert #5
    await gamePlayer2Signs
      .reveal(handPlayer2, password, hash2)
      .then((tx) => tx.wait);
    await truffleAssert.reverts(
      gamePlayer2Signs.reveal(handPlayer2, password, hash2),
      errMsg5
    );

    // Playing round 3, player2 starts the new game round.
    password = "newpassword";
    const hash3 = await game.hashHelper(handPlayer2, password, player2.address);
    await gamePlayer2Signs.playerOneMove(hash3, MIN_BET, token.address);

    const delay = Number(REVEAL_TIMEOUT) * 1000 * 1.2;

    // Helper function to delay the further execution.
    function timeout(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // player1 make the second move, then wait until REVEAL_TIMEOUT is over.
    await Promise.all([
      gamePlayer1Signs.playerTwoMove(hash3, handPlayer1),
      timeout(delay),
    ]);

    // Revert #6
    await truffleAssert.reverts(
      gamePlayer2Signs.reveal(handPlayer2, password, hash3),
      errMsg6
    );
  });
  /* -------------------------------------------------------------------------- */
  /*       Test that gameResult() reverts, when requirements are not met.       */
  /* -------------------------------------------------------------------------- */
  it("Function gameResult() should revert when requirements are not met.", async function () {
    const accounts = this.accounts;
    token = this.mytoken;
    const game = this.rockpaperscissors;

    const player1 = accounts[1];
    const player2 = accounts[2];
    const gamePlayer1Signs = game.connect(player1);
    const gamePlayer2Signs = game.connect(player2);

    const errMsg1 = "RockPaperScissors: Game does not exists, under this hash.";
    const errMsg2 =
      "RockPaperScissors::gameResult: You are not played this round.";
    const errMsg3 =
      "RockPaperScissors::gameResult: You did not revealed your hand so far.";
    const errMsg4 = "RockPaperScissors::gameResult: The game is still running.";
    const errMsg5 =
      "RockPaperScissors::gameResult: The bets have been already liquidated.";

    // Preparing hand for player1 e.g. creating hash.
    const handPlayer1 = Hand.Scissors;
    const handPlayer2 = Hand.Paper;
    const password = "a-strong-password";
    const hash = await game.hashHelper(handPlayer1, password, player1.address);

    // Revert #1
    await truffleAssert.reverts(gamePlayer1Signs.gameResult(hash), errMsg1);

    await gamePlayer1Signs
      .playerOneMove(hash, MIN_BET, token.address)
      .then((tx) => tx.wait);
    await gamePlayer2Signs
      .playerTwoMove(hash, handPlayer2)
      .then((tx) => tx.wait);

    // Revert #2
    await truffleAssert.reverts(game.gameResult(hash), errMsg2);

    // Revert #3
    await truffleAssert.reverts(gamePlayer1Signs.gameResult(hash), errMsg3);

    // Revert #4
    await truffleAssert.reverts(gamePlayer2Signs.gameResult(hash), errMsg4);

    await gamePlayer1Signs
      .reveal(handPlayer1, password, hash)
      .then((tx) => tx.wait);

    await gamePlayer1Signs.gameResult(hash).then((tx) => tx.wait);

    // Revert #5
    await truffleAssert.reverts(gamePlayer1Signs.gameResult(hash), errMsg5);
  });
  /* -------------------------------------------------------------------------- */
  /*   Test during several game rounds that winners & payouts computed right.   */
  /* -------------------------------------------------------------------------- */
  it("Game should compute and payout all hands right.", async function () {
    accounts = this.accounts;
    token = this.mytoken;
    game = this.rockpaperscissors;

    const user1 = accounts[1];
    const user2 = accounts[2];

    // Static game plane which get played through.
    const handsPlayer1 = [
      Hand.Scissors,
      Hand.Paper,
      Hand.Rock,
      Hand.Rock,
      Hand.Rock,
      Hand.Paper,
      Hand.Paper,
      Hand.Scissors,
      Hand.Scissors,
      Hand.Paper,
      Hand.Rock,
      Hand.Paper,
    ];
    const handsPlayer2 = [
      Hand.Paper,
      Hand.Paper,
      Hand.Paper,
      Hand.Scissors,
      Hand.Rock,
      Hand.Scissors,
      Hand.Rock,
      Hand.Rock,
      Hand.Scissors,
      Hand.Paper,
      Hand.Rock,
      Hand.Scissors,
    ];
    const results = [
      "player1",
      "draw",
      "player2",
      "player1",
      "draw",
      "player2",
      "player1",
      "player2",
      "draw",
      "draw",
      "draw",
      "player2",
    ];
    let resultsFromLog = [];

    const bet = "100000000000000000"; // 0.1 ether
    const password = "a-strong-password";

    // Tracking cash flow during each game round.
    let user1CashFlow = ethers.BigNumber.from("0");
    let user2CashFlow = ethers.BigNumber.from("0");

    // Starting playing hands.
    let player1;
    let player2;
    for (let round = 1; round <= handsPlayer1.length; round++) {
      // in odd round's (1,3,5, ...) user1 is player1 and in even round's user1 is player2
      if (round % 2) {
        // round is odd
        player1 = user1;
        player2 = user2;
      } else {
        // round is even
        player1 = user2;
        player2 = user1;
      }
      const gamePlayer1Signs = this.rockpaperscissors.connect(player1);
      const gamePlayer2Signs = this.rockpaperscissors.connect(player2);

      handPlayer1 = handsPlayer1[round - 1];
      handPlayer2 = handsPlayer2[round - 1];
      let password = "password-round" + round;
      const hash = await game.hashHelper(
        handPlayer1,
        password,
        player1.address
      );

      // player1 commits the 1st move.
      await gamePlayer1Signs
        .playerOneMove(hash, bet, token.address)
        .then((tx) => tx.wait());
      // player2 commits the 2nd move.
      await gamePlayer2Signs
        .playerTwoMove(hash, handPlayer2)
        .then((tx) => tx.wait());
      // player1 reveals his hands.
      await gamePlayer1Signs
        .reveal(handPlayer1, password, hash)
        .then((tx) => tx.wait());
      // player2 requests the game result.
      const result = await gamePlayer2Signs
        .gameResult(hash)
        .then((tx) => tx.wait());

      // Calculate game results and pay outs based on event logs.
      const GameDecided = result.events[0].args;
      const potSize = GameDecided.potSize;
      const betBN = ethers.BigNumber.from(bet);
      user1CashFlow = user1CashFlow.sub(betBN);
      user2CashFlow = user2CashFlow.sub(betBN);
      if (
        GameDecided.winner1 === player1.address &&
        GameDecided.winner2 === player2.address
      ) {
        // draw
        resultsFromLog.push("draw");
        const split = potSize.div(2);
        user1CashFlow = user1CashFlow.add(split);
        user2CashFlow = user2CashFlow.add(split);
      } else if (GameDecided.winner1 === player1.address) {
        // player1 won
        resultsFromLog.push("player1");
        player1.address == user1.address
          ? (user1CashFlow = user1CashFlow.add(potSize))
          : (user2CashFlow = user2CashFlow.add(potSize));
      } else {
        // player2 won
        resultsFromLog.push("player2");
        player2.address == user1.address
          ? (user1CashFlow = user1CashFlow.add(potSize))
          : (user2CashFlow = user2CashFlow.add(potSize));
      }
    }
    // Assert results based on the event logs matches the expected results.
    for (let i = 0; i < results.length; i++) {
      expect(results[i]).to.equal(
        resultsFromLog[i],
        "Game results are not as expected."
      );
    }
    // Assert that token balances of the players changed according to the results.
    const startingBalance = ethers.BigNumber.from(PLAYERS_STARTING_BALANCE);
    // For user1
    const user1Balance = await token.balanceOf(user1.address);
    const user1BalanceCashFlow = ethers.BigNumber.from(user1CashFlow);
    const user1BalanceEnd = startingBalance.add(user1BalanceCashFlow);
    assert(
      user1Balance.eq(user1BalanceEnd),
      "Balance of user1 is not as expected."
    );
    // For user2
    const user2Balance = await token.balanceOf(user2.address);
    const user2BalanceCashFlow = ethers.BigNumber.from(user2CashFlow);
    const user2BalanceEnd = startingBalance.add(user2BalanceCashFlow);
    assert(
      user2Balance.eq(user2BalanceEnd),
      "Balance of user2 is not as expected."
    );
  });
  // TODO Test that player1 is able to cancel a Game after CANCEL_TIMEOUT expired.
});
