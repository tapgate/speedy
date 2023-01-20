import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../../../../components/icons';
import MobileView from '../../../../components/mobile-view';
import { GameView, useGame } from '../../../../context/game';
import { useUser } from '../../../../context/user';
import { IGameState, IGameEvent } from '../../../../utils/game';
import { timeCollapse, timeToStamp } from '../../../../utils/time';

const GamePlay = () => {
  const navigate = useNavigate();

  const game = useGame();

  const { user } = useUser();

  const {
    trigger,
    data: {
      state,
      level,
      maxLives,
      lives,
      timeLeft,
      score,
      streak,
      averageTime,
      bestTime,
      pointsArray,
      clockedTime,
      speed
    }
  } = game;

  const [showPoints, setShowPoints] = useState(false);

  useEffect(() => {
    game.setView(GameView.PLAY);

    if (!level) {
      navigate('/game');
    }
  }, []);

  return (
    <MobileView title={`Game Play ${game.data.level}`}>
      <div className="w-full h-full pb-[80px] overflow-auto">
        <div className="w-full h-[300px] bg-tapgate-black">
          <div className="w-full h-full flex justify-center items-center">
            <div
              className={`w-3/5 h-2/3 p-4 shadow rounded-md bg-tapgate-white/75 backdrop-blur-lg text-tapgate-gray flex flex-wrap justify-center items-center`}>
              <div
                className={`w-full h-2/3 bg-tapgate-white/50 rounded-lg flex items-center justify-center`}>
                <div className="">
                  <div className="text-center font-black text-6xl uppercase">{speed}</div>
                  <div className="text-xl">Milliseconds</div>
                </div>
              </div>
              <div className="w-full h-1/3 flex justify-between items-end">
                <div className={`font-black text-2xl uppercase`}>{level}</div>
                <div className={`font-black text-2xl uppercase`}>MODE</div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-[100px] bg-tapgate-gray-200 text-tapgate-gray-800 text-md rounded-b-lg">
          <div className="w-full h-1/2 flex justify-between items-center p-4 bg-tapgate-white-300 text-tapgate-gray-500 rounded-b-lg shadow-md">
            <div className="">Player</div>
            <div className="">{user?.name}</div>
          </div>
          <div className="w-full h-1/2 flex justify-between items-center p-4">
            <div className="">Lives</div>
            <div className="flex items-center justify-center gap-x-2">
              {new Array(maxLives).fill(0).map((_, index) => {
                return (
                  <div key={index} className="inline-block w-4 h-4 rounded-full text-tapgate-red">
                    {(lives ?? 0) - index > 0 ? Icons.HeartSolid : Icons.Heart}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full p-4 pb-0">
          <div className="mb-1">Get ready to tap the buy button as fast as you can!</div>
          <div>
            Once the time drops past <span className="text-tapgate-yellow-300 font-bold">0</span>{' '}
            you will be able to click the buy button
            {!showPoints && (
              <>
                ...{' '}
                <span className="text-tapgate-blue-700" onClick={() => setShowPoints(true)}>
                  more
                </span>
              </>
            )}
          </div>

          {showPoints && (
            <>
              <div>The faster you click the buy button the more points you will get.</div>
              <div>
                If you click the buy button after{' '}
                <span className="text-tapgate-green-300 font-bold">{speed} ms</span> you will get{' '}
                <span className="text-tapgate-red-300 font-bold">0 points</span>.
              </div>
              <div>
                You have only {maxLives} lives. So make sure you don't click the buy button before
                or after <span className="text-tapgate-green-300 font-bold">{speed} ms</span>
              </div>
              <div className="mt-2">
                <div className="flex justify-between mb-1">
                  <div>Speed</div>
                  <div>Point (s)</div>
                </div>
                {pointsArray?.map((pointsArray) => {
                  return (
                    <div key={pointsArray.join('-')} className="flex justify-between">
                      <div>{pointsArray[0]} ms</div>
                      <div>{pointsArray[1]}</div>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center">
                  ....
                  <div className="text-tapgate-blue-700" onClick={() => setShowPoints(false)}>
                    less
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="w-full h-[150px] grid grid-rows-2 gap-y-4 p-4">
          <div
            className="flex justify-between items-center bg-tapgate-black rounded-lg cursor-pointer hover:opacity-90 active:opacity-75 active:scale-95"
            onClick={() => trigger(IGameEvent.Hit)}>
            <div className="h-full flex items-center gap-x-2 p-2 px-4">
              <span className="text-tapgate-blue-600">{Icons.ClockSolid}</span>
              {clockedTime ?? 0 > 0 ? `${clockedTime} ms` : '---'}
            </div>
            <div className="h-full border-l-2 border-tapgate-gray-700">
              <div className="h-full flex justify-between items-center p-2 px-4">
                <span className="text-tapgate-blue">{Icons.FingerPrint}</span>
                {state == IGameState.Waiting && <div className="ml-2">Tap Now</div>}
                {state == IGameState.CountDown && (
                  <div className="ml-2">Tap in {timeToStamp((timeLeft ?? 0) * 1000)}</div>
                )}
                {state == IGameState.GameOver && <div className="ml-2">Restart</div>}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center bg-tapgate-black/75 rounded-lg p-2 px-4">
            <div className="h-full flex justify-between items-center gap-x-2">
              <span className="text-tapgate-red">{Icons.StopCircleSolid}</span>
              Points
            </div>
            {score ?? 0}
          </div>
        </div>

        <div className="w-full px-4">
          <div className="flex items-center">
            <div className="p-2 whitespace-nowrap">Overall Stats</div>
            <div className="w-full bg-tapgate-white-700 p-[0.5px] mt-1"></div>
          </div>

          <div className="w-full h-[25vh] grid grid-cols-3 gap-x-4 py-4">
            <div className="">
              <div className="w-full h-full flex justify-center items-center font-black bg-tapgate-black rounded-lg">
                <div className="grid grid-rows-2">
                  <div className="flex justify-center items-center text-3xl tracking-widest">
                    {String(streak ?? 0).padStart(4, '0')}
                  </div>
                  <div className="flex justify-center items-center">STREAK</div>
                </div>
              </div>
            </div>
            <div className="">
              <div className="w-full h-full flex justify-center items-center font-black bg-tapgate-black rounded-lg">
                <div className="grid grid-rows-2">
                  <div className="flex justify-center items-center text-3xl tracking-widest">
                    {timeCollapse(averageTime ?? 0)}
                  </div>
                  <div className="flex justify-center items-center">AVG TIME</div>
                </div>
              </div>
            </div>
            <div className="">
              <div className="w-full h-full flex justify-center items-center font-black bg-tapgate-black rounded-lg">
                <div className="grid grid-rows-2">
                  <div className="flex justify-center items-center text-3xl tracking-widest">
                    {timeCollapse(bestTime ?? 0)}
                  </div>
                  <div className="flex justify-center items-center">BST TIME</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 bg-tapgate-black w-full h-[83px] grid grid-cols-2 gap-x-4 p-4">
          <div
            className="w-full h-[51px] flex items-center justify-center bg-tapgate-red text-tapgate-white rounded-lg cursor-pointer hover:opacity-90 active:opacity-75 active:scale-95"
            onClick={() => game.quitGame()}>
            Quit
          </div>
          <div
            className="w-full h-[51px] flex items-center justify-center bg-tapgate-blue-700 text-tapgate-white rounded-lg cursor-pointer hover:opacity-90 active:opacity-75 active:scale-95"
            onClick={() => game.restartGame()}>
            Restart
          </div>
        </div>
      </div>
    </MobileView>
  );
};

export default GamePlay;
