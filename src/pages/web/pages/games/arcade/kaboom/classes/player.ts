import { GameObj, LevelComp } from 'kaboom';
import { Character } from './character';

export class Player extends Character {
  init(level: GameObj<any>): GameObj {
    super.init(level);

    const k = this.k;

    const lc = level as unknown as LevelComp;

    const body = this.object!;

    if (body) {
      this.onOutOfBounds(() => {
        body.pos = this.spawnPoint;
      });
    }

    return body;
  }
}
