import { GameObj } from 'kaboom';
import { Character } from '../classes/character';
import { IKaboomCtxExt } from '../shared/types';

export interface IMapLevelRoutes {
  name: string;
  load: ({ player }: { player: Character }) => GameObj;
}

export interface IMapLevel {
  name: string;
  routes: IMapLevelRoutes[];
}

export interface IMapLevels {
  [key: string]: IMapLevel;
}

export interface IGameMap {
  [key: string]: (k: IKaboomCtxExt) => IMapLevel;
}
