// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Rock Paper Scissors as a Gaming DApp
 * @author Joris Zierold
 * @notice Approve tokens to this contract in order to bet with them.
 * @dev It's asynchronous setting, therefore the gameplay is serialized
 * and the commit reveal scheme was applied.
 * The smart contract works with ERC20 Token, which need to be whitelisted.
 */

contract RockPaperScissors is AccessControl {
    using SafeERC20 for IERC20;

    /* ------------------------------ DATA STORAGE ------------------------------ */
    struct Game {
        address player1;
        address player2;
        Hand handPlayer1;
        Hand handPlayer2;
        uint256 potSize;
        address tokenAddress;
        uint256 openingTime;
        uint256 endTime;
    }

    mapping(bytes32 => Game) public games;

    enum Hand {
        None,
        Rock,
        Paper,
        Scissors
    }

    uint256 public MIN_BET;
    uint256 public REVEAL_TIMEOUT;
    uint256 public CANCEL_TIMEOUT;
    bytes32 public constant WHITELISTED_TOKEN = keccak256("WHITELISTED_TOKEN");

    /* --------------------------------- EVENTS --------------------------------- */
    event Registered(
        address indexed player1,
        uint256 bet,
        uint256 openingTime,
        bytes32 gameId
    );
    event NewGame(
        address indexed player1,
        address indexed player2,
        Hand handPlayer2,
        uint256 potSize,
        uint256 endTime,
        bytes32 gameId
    );
    event Revealed(address indexed player, Hand handPlayer1, bytes32 gameId);
    event GameDecided(
        address indexed winner1,
        address indexed winner2,
        uint256 potSize,
        bytes32 gameId
    );

    /* -------------------------------- MODIFIERS ------------------------------- */

    // Throws if game does not exist.
    modifier gameExists(bytes32 hash) {
        require(
            games[hash].player1 != address(0),
            "RockPaperScissors: Game does not exists, under this hash."
        );
        _;
    }

    // Throws if game exist.
    modifier gameNotExists(bytes32 hash) {
        require(
            games[hash].player1 == address(0),
            "RockPaperScissors: Game is already registered, under this hash."
        );
        _;
    }

    // Throws if `tokenAddress` is not whitelisted.
    modifier isWhitelisted(address tokenAddress) {
        require(
            hasRole(WHITELISTED_TOKEN, tokenAddress),
            "RockPaperScissors: Token is not whitelisted."
        );
        _;
    }

    // Throws if the game is not started (i.e. no 2nd Player registered) yet.
    modifier gameStarted(bytes32 hash) {
        require(
            games[hash].player2 != address(0),
            "RockPaperScissors: Game does not started yet."
        );
        _;
    }

    /* ------------------------------- CONSTRUCTOR ------------------------------ */
    constructor(
        uint256 _minBet,
        uint256 _revealTimeout,
        uint256 _cancelTimeout
    ) {
        MIN_BET = _minBet;
        REVEAL_TIMEOUT = _revealTimeout;
        CANCEL_TIMEOUT = _cancelTimeout;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /* ------------------------------ playerOneMove ----------------------------- */
    /**
     * @notice Function to open a new game round as the 1st Player.
     * @dev Need allowance from the user to transfer `bet` into the smart contract.
     * @param hash : Created client-side according to `hashHelper` and in line w/ commit reveal scheme.
     * @param bet : Amount of Tokens to bet with (need to be approved to this contract).
     * @param tokenAddress : ERC20 token address (needs to be a `WHITELISTED_TOKEN`).
     * @return gameId : i.e. the `hash` which is used as a key identifier across the game.
     *
     * Emits an {Registered} event.
     */
    function playerOneMove(
        bytes32 hash,
        uint256 bet,
        address tokenAddress
    )
        public
        gameNotExists(hash)
        isWhitelisted(tokenAddress)
        returns (bytes32 gameId)
    {
        // Throws if it's a zero hash.
        require(
            hash != 0x0,
            "RockPaperScissors::playerOneMove: Hash cannot be 0x0."
        );

        // Throws if the `bet` is not equal or greater than `MIN_BET`.
        require(
            bet >= MIN_BET,
            "RockPaperScissors::playerOneMove: Your bet is to small, raise you bet up to MIN_BET."
        );

        // Throws if user has not approved the desired `bet` to the smart contract.
        IERC20 token = IERC20(tokenAddress);
        uint256 approvedTokens = token.allowance(msg.sender, address(this));
        uint256 balancePlayer = token.balanceOf(msg.sender);
        require(
            approvedTokens >= bet && balancePlayer >= bet,
            "RockPaperScissors::playerOneMove: Not enough tokens are approved or bet exceed your balance."
        );

        // Registering the game and user as 1st player, by storing the essential game information.
        games[hash].player1 = msg.sender;
        games[hash].potSize = bet;
        games[hash].openingTime = block.timestamp;
        games[hash].tokenAddress = tokenAddress;

        emit Registered(msg.sender, bet, block.timestamp, hash);

        // Transferring the `bet` from the user to the smart contract.
        token.safeTransferFrom(msg.sender, address(this), bet);

        return hash;
    }

    /* ------------------------------ playerTwoMove ----------------------------- */
    /**
     * @notice Function to join an existing game round as the 2nd Player.
     * @dev Need allowance fromt the user to transfer `bet` to the smart contract.
     * @param hash : Key to identify the game round which the user want to join.
     * @param hand : Enum (of 1-3) which points to the hand the user selected.
     * @return success : i.e. bool of true when the move is executed.
     *
     * Emits an {NewGame} event.
     */
    function playerTwoMove(bytes32 hash, Hand hand)
        public
        gameExists(hash)
        returns (bool success)
    {
        // Throws if a second player is already registered.
        require(
            games[hash].player2 == address(0),
            "RockPaperScissors::playerTwoMove: There is no free seat in this Game."
        );

        // Throws if user has not approved the desired bet to the smart contract.
        address tokenAddress = games[hash].tokenAddress;
        IERC20 token = IERC20(tokenAddress);
        uint256 approvedTokens = token.allowance(msg.sender, address(this));
        uint256 balancePlayer = token.balanceOf(msg.sender);
        uint256 bet = games[hash].potSize;
        require(
            approvedTokens >= games[hash].potSize && balancePlayer >= bet,
            "RockPaperScissors::playerTwoMove: Not enough tokens are approved or bet exceed your balance"
        );

        // Registering the user 2nd player, store his hand (uncoded) and set `endTime`.
        games[hash].player2 = msg.sender;
        games[hash].handPlayer2 = hand;
        games[hash].potSize += bet;
        games[hash].endTime = block.timestamp + REVEAL_TIMEOUT;
        emit NewGame(
            games[hash].player1,
            msg.sender,
            games[hash].handPlayer2,
            games[hash].potSize,
            block.timestamp + REVEAL_TIMEOUT,
            hash
        );
        // Transferring the `bet` from the user to the smart contract.
        token.safeTransferFrom(msg.sender, address(this), bet);

        return true;
    }

    /* --------------------------------- reveal --------------------------------- */
    /**
     * @notice Function to reveal hidden hand as 1st Player of a given game round.
     * @dev The `recoveredHash` needs to match the originally stored hash in order to reveal.
     * @param hand : Enum (of 1-3) which points to the hand the user initially selected.
     * @param password : A random password which was generated on the client-side before.
     * @param hash : Key to identify the game round.

     * @return success : i.e. bool of true when the hand is revealed.
     *
     * Emits an {Revealed} event.
     */
    function reveal(
        Hand hand,
        string memory password,
        bytes32 hash
    ) public gameExists(hash) gameStarted(hash) returns (bool success) {
        // Throws if `msg.sender`is not the 1st Player of this game round.
        require(
            msg.sender == games[hash].player1,
            "RockPaperScissors::reveal: You are not registered as player1 of this round."
        );

        // Throws if the `recoveredHash` does not match the initially stored `hash`.
        bytes32 recoveredHash = hashHelper(hand, password, msg.sender);
        require(
            recoveredHash == hash,
            "RockPaperScissors::reveal: Your hand does not match the encrypted version."
        );

        // Throws if `endTime` i.e. the `REVEAL_TIMEOUT` passed by.
        require(
            block.timestamp <= games[hash].endTime,
            "RockPaperScissors::reveal: You are to late, the reveal phase is over."
        );

        // Throws if the hand was already revealed.
        require(
            games[hash].handPlayer1 == Hand.None,
            "RockPaperScissors::reveal: You already revealed your hand."
        );

        // Store the revealed hand.
        games[hash].handPlayer1 = hand;

        emit Revealed(msg.sender, hand, hash);

        return true;
    }

    /* ------------------------------- gameResult ------------------------------- */
    /**
     * @notice Function to call for the game result and payout of a given game round.
     * @dev Game can be evaluated after 1st Player revealed or the `endTime` expired.
     * @param hash : Key to identify the game round.
     * @return success : i.e. bool of true when the game round is decided/over.
     *
     * Emits indirect via `payOut` an {GameDecided} event.
     */
    function gameResult(bytes32 hash)
        public
        gameExists(hash)
        gameStarted(hash)
        returns (bool success)
    {
        // Throws if the `potSize` is already liquidated.
        require(
            games[hash].potSize > 0,
            "RockPaperScissors::gameResult: The bets have been already liquidated."
        );

        // Throws if the user is not a player of the given game round.
        address _player1 = games[hash].player1;
        address _player2 = games[hash].player2;
        require(
            msg.sender == _player1 || msg.sender == _player2,
            "RockPaperScissors::gameResult: You are not played this round."
        );

        // Recall the played hands.
        Hand hand1 = games[hash].handPlayer1;
        Hand hand2 = games[hash].handPlayer2;

        bool hand1Revealed = hand1 != Hand.None;
        bool revealTimeout = (block.timestamp >= games[hash].endTime);

        // Throws if user is 1st Player and not yet revealed his hand.
        if (msg.sender == _player1 && !revealTimeout) {
            require(
                hand1Revealed,
                "RockPaperScissors::gameResult: You did not revealed your hand so far."
            );
        }

        // Throws if the 1st Player not revealed his hand OR reveal phase not ended yet.
        require(
            hand1Revealed || revealTimeout,
            "RockPaperScissors::gameResult: The game is still running."
        );

        // Compute the winning hand(s) and trigger the `payOut` accordingly.
        if (hand1 == hand2) {
            // DRAW: Return pot equally.
            payOut(_player1, _player2, hash);
        } else if (
            // Scissor cut Paper, Paper covers Rock, Rock smashes Scissor.
            (hand2 == Hand.Scissors && hand1 == Hand.Paper) ||
            (hand2 == Hand.Paper && hand1 == Hand.Rock) ||
            (hand2 == Hand.Rock && hand1 == Hand.Scissors) ||
            // OR 1st Player has not revealed his hand.
            !hand1Revealed
        ) {
            // 2nd Player wins.
            payOut(_player2, address(0), hash);
        } else {
            // 1st Player wins.
            payOut(_player1, address(0), hash);
        }

        return true;
    }

    /* --------------------------------- payOut --------------------------------- */
    /**
     * @dev Private function to that handles the distribution of funds to the winner(s)
     * @param winner1 : Address of the winner of the game round.
     * @param winner2 : Only occupied in case of it draw, otherwise Zero Address.
     * @param hash : Key to identify the game round.
     *
     * Emits an {GameDecided} event.
     */
    function payOut(
        address winner1,
        address winner2,
        bytes32 hash
    ) private {
        uint256 pot = games[hash].potSize;
        // Rebalancing the account before transferring the funds.
        games[hash].potSize = 0;

        emit GameDecided(winner1, winner2, pot, hash);

        // Recall `tokenAddress`to prepare interface to transfer the funds.
        address tokenAddress = games[hash].tokenAddress;
        IERC20 token = IERC20(tokenAddress);

        // If it's a draw, the initial bets are returned to each player,
        // otherwise, the winner takes all.
        if (winner1 != address(0) && winner2 != address(0)) {
            uint256 split = pot / 2;
            IERC20(token).safeTransfer(winner1, split);
            IERC20(token).safeTransfer(winner2, split);
        } else {
            IERC20(token).safeTransfer(winner1, pot);
        }
    }

    /* --------------------------------- cancel --------------------------------- */
    /**
     * @notice Function to cancel the game as 1st Player, if nobody is joining the round.
     * @dev Game can be canceled after the `CANCEL_TIMEOUT` expired.
     * @param hash : Key to identify the game round.
     *
     * Emits indirect via `payOut` an {GameDecided} event.
     */
    function cancel(bytes32 hash)
        public
        gameExists(hash)
        returns (bool success)
    {
        // Throws if `msg.sender`is not the 1st Player of this game round.
        require(
            msg.sender == games[hash].player1,
            "RockPaperScissors::cancel: You are not a player1 of this round."
        );

        // Throws if the game already started.
        require(
            games[hash].endTime == 0,
            "RockPaperScissors::cancel: Game already started yet, cancellation is no longer possible."
        );

        // Throws if `CANCEL_TIMEOUT` has not expired.
        require(
            block.timestamp >= (games[hash].openingTime + CANCEL_TIMEOUT),
            "RockPaperScissors::cancel: The timeout is not expired yet, please wait."
        );

        // Refund the initial bet of the 1st Player.
        payOut(msg.sender, address(0), hash);

        return true;
    }

    /* ---------------------------- HELPER FUNCTIONS ---------------------------- */
    // Specify how the hand of the 1st Player get decoded.
    function hashHelper(
        Hand _hand,
        string memory _password,
        address _sender
    ) public pure returns (bytes32 _hash) {
        return keccak256(abi.encodePacked(_hand, _password, _sender));
    }
}
