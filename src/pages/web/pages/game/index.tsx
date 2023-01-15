import { useEffect } from "react";
import GameProvider, { GameView, useGame } from "../../../../context/game";
import GameModeSelectView from "./views/gameModeSelect";
import GamePlayView from "./views/gamePlay";


const GamePage = () => {

    const { view, setView} = useGame();

    useEffect(() => {

        // if back button is pressed, go back to lobby
        const handleBackButton = () => {
            if (view === GameView.GAME) {
                setView(GameView.LOBBY);
            }
        }

        window.addEventListener('popstate', handleBackButton);

        return () => {
            window.removeEventListener('popstate', handleBackButton);
        }
    }, []);

    switch (view) {
        case GameView.LOBBY:
            return <GameModeSelectView />;
        case GameView.GAME:
            return <GamePlayView />
    }
}

const GamePageContainer = () => {
    return (
        <GameProvider>
            <GamePage />
        </GameProvider>
    );
}

export default GamePageContainer;