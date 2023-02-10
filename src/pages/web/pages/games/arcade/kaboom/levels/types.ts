import { KaboomCtx, Level } from 'kaboom';

export interface IMapLevelRoutes {
  name: string;
  load: () => Level;
}

export interface IMapLevel {
  name: string;
  routes: IMapLevelRoutes[];
}

export interface IMapLevels {
  [key: string]: IMapLevel;
}

export interface IGameMap {
  [key: string]: (k: KaboomCtx) => IMapLevel;
}
