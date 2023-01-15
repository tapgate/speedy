import { useEffect, useState } from "react";
import { Icon } from "../../../../../components/icons";
import { GameEventTrigger, GameState, GameView, useGame } from "../../../../../context/game";
import { useUser } from "../../../../../context/user";
import { IGameMode } from "../../../../../models/game";
import { clockSpeedPoint } from "../../../../../utils/game";
import pocketbase from "../../../../../utils/pocketbase";
import { timeToStamp } from "../../../../../utils/time";

const GamePlayView = () => {

    const game = useGame();
    const { user } = useUser();

    return (
        <div className="w-full h-full overflow-y-auto">

            <div className="w-full h-[100px] bg-tapgate-gray-200 text-tapgate-gray-800 text-md rounded-b-lg">
                <div className="w-full h-1/2 flex justify-between items-center p-4 bg-tapgate-white-300 text-tapgate-gray-500 rounded-b-lg shadow-md">
                    <div className="">
                        Player
                    </div>
                    <div className="">
                        {user?.name}
                    </div>
                </div>
                <div className="w-full h-1/2 flex justify-between items-center p-4">
                    <div className="">
                        Lives
                    </div>
                    <div className="flex items-center justify-center gap-x-2">
                        {new Array(3).fill(0).map((_, index) => {
                            return (
                                <div key={index} className="inline-block w-4 h-4 rounded-full text-tapgate-gray">
                                    {(game.lives ?? 0) - index > 0 ? <Icon.HeartSolid /> : <Icon.Heart />}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="w-full p-4">

                <div className="mb-1">Get ready to tap the buy button as fast as you can!</div>
                <div>Once the time drops to <span className="text-tapgate-yellow-300 font-bold">0</span> you will be able to click the buy button.</div>
                <div>The faster you click the buy button the more points you will get.</div>
                <div>If you click the buy button after <span className="text-tapgate-green-300 font-bold">{game.mode?.speed} ms</span> you will get <span className="text-tapgate-red-300 font-bold">0 points</span>.</div>
                <div>You have only 3 lives. So make sure you don't click the buy button before or after <span className="text-tapgate-green-300 font-bold">{game.mode?.speed} ms</span>.</div>

                <div className="mt-2">
                    <div className="flex justify-between mb-1">
                        <div>Speed</div>
                        <div>Point (s)</div>
                    </div>
                    {game.pointsArray?.map((pointsArray) => {
                        return (
                            <div className="flex justify-between">
                                <div>{pointsArray[0]} ms</div>
                                <div>{pointsArray[1]}</div>
                            </div>
                        )
                    })}
                </div>

            </div>

            <div className="w-full h-[15vh] grid grid-rows-2 gap-y-4 p-4">

                <div className="flex justify-between items-center bg-tapgate-black rounded-lg cursor-pointer hover:opacity-90 active:opacity-75 active:scale-95" onClick={() => game.triggerEvent(GameEventTrigger.HIT)}>
                    <div className="h-full flex items-center gap-x-2 p-2 px-4">
                        <span className="text-tapgate-blue-600">
                            <Icon.ClockSolid />
                        </span>
                        {game.clockedTime ?? 0 > 0 ? `${game.clockedTime} ms` : '---'}
                    </div>
                    <div className="h-full border-l-2 border-tapgate-gray-700">
                        <div className="h-full flex justify-between items-center p-2 px-4">
                            <span className="text-tapgate-blue">
                                <Icon.FingerPrint />
                            </span>
                            {game.state == GameState.READY && (<div className="ml-2">Tap Now</div>)}
                            {game.state == GameState.COUNTDOWN && (<div className="ml-2">Tap in {timeToStamp((game.timeLeft ?? 0) * 1000)}</div>)}
                            {game.state == GameState.FINISHED && (<div className="ml-2">Restart</div>)}
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center bg-tapgate-black/75 rounded-lg p-2 px-4">
                    <div className="h-full flex justify-between items-center gap-x-2">
                        <span className="text-tapgate-red">
                            <Icon.StopCircleSolid />
                        </span>
                        Points
                    </div>
                    {game.score ?? 0}
                </div>

            </div>

            <div className="w-full px-4">

                <div className="flex items-center">
                    <div className="p-2 whitespace-nowrap">
                        Overall Stats
                    </div>
                    <div className="w-full bg-tapgate-white-700 p-[0.5px] mt-1"></div>
                </div>

                <div className="w-full h-[25vh] grid grid-cols-3 gap-x-4 py-4">
                    <div className="">
                        <div className="w-full h-full flex justify-center items-center font-black bg-tapgate-black rounded-lg">
                            <div className="grid grid-rows-2">
                                <div className="flex justify-center items-center text-3xl tracking-widest">{String(game.streak ?? 0).padStart(4, '0')}</div>
                                <div className="flex justify-center items-center">
                                    STREAK
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="">
                        <div className="w-full h-full flex justify-center items-center font-black bg-tapgate-black rounded-lg">
                            <div className="grid grid-rows-2">
                                <div className="flex justify-center items-center text-3xl tracking-widest">{String(game.averageTime ?? 0).padStart(4, '0')}</div>
                                <div className="flex justify-center items-center">
                                    AVG TIME
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="">
                        <div className="w-full h-full flex justify-center items-center font-black bg-tapgate-black rounded-lg">
                            <div className="grid grid-rows-2">
                                <div className="flex justify-center items-center text-3xl tracking-widest">{String(game.bestTime ?? 0).padStart(4, '0')}</div>
                                <div className="flex justify-center items-center">
                                    BST TIME
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="w-full grid grid-cols-2 gap-x-4 p-4">
                <div className="w-full h-[50px] flex items-center justify-center bg-tapgate-red text-tapgate-white rounded-lg cursor-pointer hover:opacity-90 active:opacity-75 active:scale-95"
                    onClick={() => game.triggerEvent(GameEventTrigger.QUIT)}>
                    Quit
                </div>
                <div className="w-full h-[50px] flex items-center justify-center bg-tapgate-blue-700 text-tapgate-white rounded-lg cursor-pointer hover:opacity-90 active:opacity-75 active:scale-95"
                    onClick={() => game.triggerEvent(GameEventTrigger.RESTART)}>
                    Restart
                </div>
            </div>

        </div>
    );
};

export default GamePlayView;