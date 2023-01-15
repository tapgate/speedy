import { createContext, useState, useEffect, useContext, useRef } from "react";
import { matchPath, useNavigate, useLocation } from "react-router-dom";
import pocketbase from "../utils/pocketbase";
import { toast } from "react-toastify";
import { IGameMode } from "../models/game";
import { clockSpeedPoint, speedToPointsArray } from "../utils/game";
import _ from "lodash";

pocketbase.autoCancellation(false);

export enum GameView {
    LOBBY = "lobby",
    GAME = "game",
}

export enum GameEventTrigger {
    RESET = "reset",
    NEW_ROUND = "new_round",
    HIT = "hit",
    QUIT = "quit",
    RESTART = "restart",
}

export enum GameState {
    READY = "ready",
    COUNTDOWN = "countdown",
    FINISHED = "finished",
}

interface GameContext {
    loading: boolean;
    view: GameView;
    setView: (view: GameView) => void;
    mode?: IGameMode;
    lives?: number;
    pointsArray?: number[][];
    timeLeft?: number;
    waitTimeElapsed?: number;
    clockedTime?: number;
    averageTime?: number;
    bestTime?: number;
    score?: number;
    streak?: number;
    state: GameState;
    triggerEvent: (event: GameEventTrigger) => void;
    setMode: (mode: IGameMode) => void;
}

const Context = createContext<GameContext>({} as GameContext);

const GameProvider = ({ children }: any) => {

    const [state, setState] = useState<GameState>(GameState.READY);

    const [mode, setMode] = useState<IGameMode>();
    const [prevMode, setPrevMode] = useState<IGameMode>();
    const [view, setView] = useState<GameView>(GameView.LOBBY);
    const [previousView, setPreviousView] = useState<GameView>(GameView.LOBBY);

    const [lives, setLives] = useState<number>(3);
    const [pointsArray, setPointsArray] = useState<number[][]>([]);

    const [score, setScore] = useState<number>(0);
    const [streak, setStreak] = useState<number>(0);
    const [timeMax, setTimeMax] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [timeElapsed, setTimeElapsed] = useState<number>(0);
    const [clockedTime, setClockedTime] = useState<number>(0);
    const [averageTime, setAverageTime] = useState<number>(0);
    const [bestTime, setBestTime] = useState<number>(0);
    const [timeLog, setTimeLog] = useState<number[]>([]);
    const [waitTimeElapsed, setWaitTimeElapsed] = useState<number>(0);

    const [loading, setLoading] = useState<boolean>(true);
    const [firstLoad, setFirstLoad] = useState<boolean>(true);

    const timeElapsedRef = useRef<number>(0);
    const waitTimeElapsedRef = useRef<number>(0);
    const stateRef = useRef<GameState>(GameState.COUNTDOWN);

    useEffect(() => {

        if (_.isEqual(mode, prevMode) || !mode) return;
        
        setPrevMode(mode);

        setLives(3);
        setTimeLeft(mode.timer);
        setTimeMax(mode.timer);
        timeElapsedRef.current = 0;
        setPointsArray(speedToPointsArray(mode.speed));

        pocketbase.collection('speedy_game_modes').subscribe(mode.id, (data) => {
            const record = data.record as unknown as IGameMode;

            console.log('mode updated', record);

            switch (data.action) {
                case "update":
                    setMode(record);
                    break;
                default:
                    break;
            }
        });

        return () => {
            pocketbase.collection('speedy_game_modes').unsubscribe(mode.id);
        }
    }, [mode]);

    useEffect(() => {
        console.log('view changed', view);

        if (view === GameView.LOBBY) {
            setMode(undefined);
        };

        if (view !== GameView.GAME) return;

        // usae request animation frame to update time elapsed
        //  use time delta to update time left
        let timestamp = Date.now();

        const update = () => {
            const newTimestamp = Date.now();
            const delta = newTimestamp - timestamp;
            const state = stateRef.current;

            timestamp = newTimestamp;

            if (state !== GameState.FINISHED) {

                if (state === GameState.READY) {
                    waitTimeElapsedRef.current += delta;
                    console.log("ready")
                    setWaitTimeElapsed(waitTimeElapsedRef.current);
                } else if (state === GameState.COUNTDOWN) {
                    console.log("countdown")
                    timeElapsedRef.current += delta;
                    setTimeElapsed(timeElapsedRef.current / 1000);
                }
            }

            requestAnimationFrame(update);
        };

        const animation = requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(animation);
        };
    }, [view]);

    useEffect(() => {
        if (timeMax === 0) return;

        if (state === GameState.COUNTDOWN) {
            const timeLeft = timeMax - timeElapsed;
        
            if (timeLeft > 0) {
                setTimeLeft(Math.floor(timeLeft));
            } else {
                setState(GameState.READY);
            }
        }

    }, [timeElapsed]);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    useEffect(() => {
        if (lives <= 0) {
            toast.error('Game Over', { position: 'bottom-center', autoClose: 1500, toastId: "game-alert-finished" });
            gameOver();
        } else {
            newRound();
        }
    }, [lives]);

    const resetGame = () => {
        setLives(3);
        setScore(0);
        setClockedTime(0);
        setAverageTime(0);
        setBestTime(0);
        setTimeLog([]);
        setStreak(0);
        newRound();
    };

    const newRound = () => {
        setTimeLeft(timeMax);
        setTimeElapsed(0);
        timeElapsedRef.current = 0;
        waitTimeElapsedRef.current = 0;
        setWaitTimeElapsed(0);
        setState(GameState.COUNTDOWN);
    };

    const gameOver = () => {
        setState(GameState.FINISHED);
    };
    
    const triggerEvent = (event: GameEventTrigger) => {
        if (!mode) return;

        switch (event) {
            case GameEventTrigger.QUIT:
                // reload page
                window.location.reload();
                break;
            case GameEventTrigger.RESTART:
                resetGame();
                break;
            case GameEventTrigger.RESET:
                resetGame();
                break;
            case GameEventTrigger.HIT:
                if (state !== GameState.FINISHED) {
                    let timeTrack = waitTimeElapsed;

                    if (!timeTrack) {
                        timeTrack = 0
                    }

                    const newTimeLog = [...timeLog, timeTrack];

                    setTimeLog(newTimeLog);

                    if (newTimeLog.length > 1) {
                        let newAverage = Math.round(newTimeLog.reduce((a, b) => a + b, 0) / newTimeLog.length);
                        
                        if (isNaN(newAverage)) {
                            newAverage = 0;
                        }
                        setAverageTime(newAverage);
                    } else {
                        setAverageTime(timeTrack);
                    }


                    if (timeTrack < bestTime || bestTime === 0) {
                        setBestTime(timeTrack);
                    }

                    if (state == GameState.READY) {
                        console.log('hit', waitTimeElapsed);
                        
                        const points = clockSpeedPoint(waitTimeElapsed, mode.speed);
    
                        setClockedTime(waitTimeElapsed);

                        if (points > 0) {
                            setScore(score + points);
                            setStreak(streak + 1);

                            newRound();
                            // toast.success(`+${points} points!`, { position: "bottom-center", autoClose: 800 });
                        } else {
                            const newLife = lives - 1;
                            setLives(newLife);
                            setStreak(0);
                            // if (newLife > 0) toast.error(`Too slow!`, { position: "bottom-center", autoClose: 800 });
                        }
                    } else {
                        const newLife = lives - 1;
                        setLives(newLife);
                        if (newLife > 0) toast.error(`Too soon!`, { position: "bottom-center", autoClose: 800 });
                    }
                } else {
                    resetGame();
                }
                break;
            case GameEventTrigger.NEW_ROUND:
                newRound();
                break;
        }
    };

    const exposed = {
        loading,
        view,
        setView,
        mode,
        lives,
        pointsArray,
        timeLeft,
        waitTimeElapsed,
        state,
        score,
        clockedTime,
        averageTime,
        bestTime,
        streak,
        triggerEvent,
        setMode,
    };

    return <Context.Provider value={exposed}>{children}</Context.Provider>;
};

export const useGame = () => useContext(Context);

export default GameProvider;