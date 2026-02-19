import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function Pomodoro() {
  const [mode, setMode] = useState("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const [showPicker, setShowPicker] = useState(false);
  const [hrs, setHrs] = useState(0);
  const [mins, setMins] = useState(25);
  const [secs, setSecs] = useState(0);

  const [cycleLength, setCycleLength] = useState(25);
  const [breakLength] = useState(5);

  const [sessionTotal, setSessionTotal] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [isSessionMode, setIsSessionMode] = useState(false);

  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const audioRef = useRef(null);
  const endTimeRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("/notification.wav");
    audioRef.current.load();
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? String(h).padStart(2, "0") + ":" : ""}${String(
      m
    ).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!isRunning) return;

    endTimeRef.current = Date.now() + timeLeft * 1000;

    const interval = setInterval(() => {
      const remaining = Math.round(
        (endTimeRef.current - Date.now()) / 1000
      );

      if (remaining > 0) {
        setTimeLeft(remaining);
      } else {
        setTimeLeft(0);
        clearInterval(interval);
        handleTimerComplete();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, mode, currentCycle, isSessionMode]);

  const handleTimerComplete = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    if (isSessionMode) {
      const focusSeconds = cycleLength * 60;
      const breakSeconds = breakLength * 60;
      const completedFocusTime = currentCycle * focusSeconds;

      if (mode === "focus") {
        if (completedFocusTime >= sessionTotal) {
          setPopupMessage(
            `🎉 You completed 1 session of ${formatTime(
              sessionTotal
            )} with ${cycleLength}-minute cycles!`
          );
          setShowPopup(true);
          setIsRunning(false);
          setIsSessionMode(false);
          return;
        }

        setMode("break");
        setTimeLeft(breakSeconds);
        setIsRunning(true);
      } else {
        setMode("focus");
        setTimeLeft(focusSeconds);
        setCurrentCycle((prev) => prev + 1);
        setIsRunning(true);
      }
    } else {
      if (mode === "focus") {
        setMode("break");
        setTimeLeft(5 * 60);
      } else {
        setMode("focus");
        setTimeLeft(25 * 60);
      }
      setIsRunning(true);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(newMode === "focus" ? 25 * 60 : 5 * 60);
    setIsRunning(false);
    setIsSessionMode(false);
  };

  const applyCustomTime = () => {
    const totalSeconds = hrs * 3600 + mins * 60 + secs;
    if (totalSeconds > 0) {
      setSessionTotal(totalSeconds);
      setTimeLeft(cycleLength * 60);
      setMode("focus");
      setCurrentCycle(1);
      setIsSessionMode(true);
      setIsRunning(false);
    }
    setShowPicker(false);
  };

  return (
    <div className="appcontainer">
      <h1>Pomodoro Timer</h1>

      <div className="timer-card">
        <span className="timer-text">{formatTime(timeLeft)}</span>

        {isSessionMode && (
          <p className="session-info">
            Cycle {currentCycle} • {cycleLength}-min focus
          </p>
        )}

        <div className="timer-controls">
          <button onClick={() => setIsRunning(!isRunning)} className="start-btn">
            {isRunning ? "Pause" : "Start"}
          </button>
          <button onClick={() => setShowPicker(true)} className="set-btn">
            Set Session
          </button>
        </div>
      </div>

      {showPicker && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Set Total Session Time</h3>

            <div className="time-inputs">
              <input
                type="number"
                min="0"
                value={hrs}
                onChange={(e) => setHrs(Number(e.target.value))}
              />
              hrs
              <input
                type="number"
                min="0"
                value={mins}
                onChange={(e) => setMins(Number(e.target.value))}
              />
              min
              <input
                type="number"
                min="0"
                value={secs}
                onChange={(e) => setSecs(Number(e.target.value))}
              />
              sec
            </div>

            <div className="cycle-options">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <label>Break every:</label>
              <select
                value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value))}
              >
                <option value={25}>25 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>

            <div className="modal-buttons">
              <button onClick={applyCustomTime}>Apply</button>
              <button onClick={() => setShowPicker(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="mode-buttons">
        <button
          className={`mode-btn ${mode === "focus" ? "active" : ""}`}
          onClick={() => switchMode("focus")}
        >
          Focus
        </button>
        <button
          className={`mode-btn ${mode === "break" ? "active" : ""}`}
          onClick={() => switchMode("break")}
        >
          Break
        </button>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <p>{popupMessage}</p>
            <button onClick={() => setShowPopup(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pomodoro;
