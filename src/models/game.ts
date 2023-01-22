import { GameLevelNameEnum } from '../utils/game';

export interface IGameLevel {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  name: GameLevelNameEnum;
  speed: number;
  timer: number;
  color: string;
}

export type IGameLevels = IGameLevel[];
