import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import {
  useProvider,
  useWebSocketProvider,
  useContract,
  useBlockNumber,
} from "wagmi";
import { Tooltip } from "@mui/material";
import { contractABIList } from "../utils/contracts/contracts";
import { eventTypes } from "../constants/contract-events";
import links from "../constants/links.json";

const { RockPaperScissors: GAME_ABI } = contractABIList;
const GAME_ADDRESS = import.meta.env.VITE_CONTRACT_RPC;

const EventListener = (props) => {
  const { contractEvents, setContractEvents } = props;
  const { t } = useTranslation();
  const [startBlockNumber, setStartBlockNumber] = useState(undefined);
  const [latestBlockNumber, setLatestBlockNumber] = useState(undefined);
  const [activeEventListeners, setActiveEventListeners] = useState(false);

  const [{ data: blockNumber }, getBlockNumber] = useBlockNumber({
    enabled: false,
  });
  const provider = useProvider();
  const webSocketProvider = useWebSocketProvider();

  useEffect(() => {
    setStartBlockNumber(blockNumber);
  }, [blockNumber]);

  const gameContract = useContract({
    addressOrName: GAME_ADDRESS,
    contractInterface: GAME_ABI,
    signerOrProvider: webSocketProvider?.anyNetwork
      ? webSocketProvider
      : provider,
  });

  useEffect(() => {
    if (gameContract?.provider) {
      getBlockNumber;

      // Subscribe to all event types
      eventTypes.forEach((eventType) => {
        gameContract.on(eventType, (...args) => {
          const event = args[args.length - 1];
          setLatestBlockNumber(event.blockNumber);
        });
        // console.log(`Subscribed to event ${eventType}`);
        setActiveEventListeners(true);
      });
      // Clean up callback function to unsubsribe all eventlistener's
      return () => {
        eventTypes.forEach((eventType) => {
          gameContract.removeListener(eventType);
          // console.log(`Removed event listener for ${eventType}`);
          setActiveEventListeners(false);
        });
      };
    }
  }, [webSocketProvider, provider]);

  useEffect(() => {
    if (gameContract?.provider && startBlockNumber) {
      getAllEvents();
    }
  }, [gameContract, startBlockNumber, latestBlockNumber]);

  async function getAllEvents() {
    if (latestBlockNumber <= startBlockNumber) return;
    // console.log(
    //   `Get all events - latestBlockNumber is: ${latestBlockNumber} and startBlockNumber is: ${startBlockNumber}`
    // );
    const filter = latestBlockNumber === undefined ? false : true;
    let eventsObject = {};
    for (let i = 0; i < eventTypes.length; i++) {
      const eventType = eventTypes[i];
      let eventsLogged = await gameContract.queryFilter(
        eventType,
        filter ? (startBlockNumber, latestBlockNumber) : null
      );
      eventsObject[eventType] =
        contractEvents?.[eventType] === undefined
          ? [...eventsLogged]
          : [...contractEvents[eventType], ...eventsLogged];
    }
    // console.log("Alls events are queried.", eventsObject);
    setContractEvents(eventsObject);

    latestBlockNumber === undefined
      ? setLatestBlockNumber(startBlockNumber)
      : setStartBlockNumber(latestBlockNumber);
  }

  const styles = {
    updateIndicatorContainer: {
      position: "sticky",
      bottom: "0px",
      margin: "0px",
      padding: "15px",
      display: "flex",
      justifyContent: "flex-end",
      width: "fit-content",
      float: "right",
    },
    updateIndicatorContent: {
      borderRadius: "10px",
      padding: "0px 8px",
      background: "white",
      display: "flex",
      flexDirection: "row",
      alignContent: "center",
      alignItems: "center",

      border: "1px solid rgb(231, 231, 231)",
    },
    blockNumber: {
      fontSize: "14px",
      color: activeEventListeners ? "green" : "red",
      paddingRight: "10px",
      display: "inline-block",
      margin: "0px",
    },
    updateIndicator: {
      width: "10px",
      height: "10px",
      background: activeEventListeners ? "green" : "red",
      borderRadius: "10px",
      display: "inline-block",
    },
    linkEtherscan: {
      textDecoration: "none",
    },
    tooltip: { fontSize: "13px", paddingLeft: "20px" },
  };

  const tooltipUpdateIndicator = (
    <p style={styles.tooltip}>
      {t("eventlistener.tooltip1", { number: latestBlockNumber })}.
      {activeEventListeners
        ? t("eventlistener.tooltip2")
        : t("eventlistener.tooltip3")}
    </p>
  );
  const updateIndicator = (
    <div style={styles.updateIndicatorContainer}>
      <Tooltip title={tooltipUpdateIndicator} placement="top-start" arrow>
        <a
          href={`${links.blockExplorer.block}${latestBlockNumber}`}
          target="_blank"
          style={styles.linkEtherscan}
        >
          <div style={styles.updateIndicatorContent}>
            <p style={styles.blockNumber}>{latestBlockNumber}</p>
            <span style={styles.updateIndicator} />
          </div>
        </a>
      </Tooltip>
    </div>
  );

  if (latestBlockNumber) return updateIndicator;

  return null;
};

export default EventListener;

EventListener.propTypes = {
  setContractEvents: PropTypes.func.isRequired,
};
