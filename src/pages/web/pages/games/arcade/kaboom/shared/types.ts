import { KaboomCtx, GameObj } from 'kaboom';

export interface IKaboomCtxExt extends KaboomCtx {
  layers: {
    [key: string]: GameObj;
  };
  level: GameObj;
}
