import React, { Suspense } from "react";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./layouts/Navbar";
import Footer from "./layouts/Footer";
import JoinGame from "./pages/JoinGame";
import StartGame from "./pages/StartGame";
import Home from "./pages/Home";
import RunningGames from "./pages/RunningGames";
import EventListener from "./components/EventListener";
import GameResults from "./pages/GameResults";

function App() {
  const [contractEvents, setContractEvents] = useState(undefined);

  const styles = {
    mainContent: {
      marginBottom: "80px",
      background: "#ffffff",
    },
  };

  return (
    <Suspense fallback={null}>
      <Router>
        <div>
          <ToastContainer position="top-center" />
          <div style={styles.mainContent}>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />}></Route>
              <Route path="/start-game" element={<StartGame />}></Route>
              <Route
                path="/join-game"
                element={<JoinGame contractEvents={contractEvents} />}
              ></Route>
              <Route
                path="/running-games"
                element={<RunningGames contractEvents={contractEvents} />}
              ></Route>
              <Route
                path="/game-results"
                element={<GameResults contractEvents={contractEvents} />}
              ></Route>
            </Routes>
          </div>
          <Footer />
        </div>
        <EventListener
          contractEvents={contractEvents}
          setContractEvents={setContractEvents}
        />
      </Router>
    </Suspense>
  );
}

export default App;
