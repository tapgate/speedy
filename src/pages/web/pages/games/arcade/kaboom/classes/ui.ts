import { GameObj } from 'kaboom';
import { IKaboomCtxExt } from '../shared/types';
import { Character } from './character';
import { GameObject } from './_object';

export enum UITimeOfDayEnum {
  DAY = 'day',
  EVENING = 'evening',
  NIGHT = 'night'
}

export class UI extends GameObject {
  private _player: Character;
  private _hearts: any[] = [];

  private _timeOfDay: UITimeOfDayEnum = UITimeOfDayEnum.NIGHT;

  public get timeOfDay() {
    return this._timeOfDay;
  }

  constructor(k: IKaboomCtxExt, player: Character) {
    super(k, [
      'ui',
      k.fixed(),
      k.pos(0, 0),
      k.opacity(0.5),
      k.anchor('topleft'),
      k.rect(k.width(), k.height()),
      k.state('day', ['day', 'evening', 'night']),
      k.z(1000)
    ]);

    this._player = player;

    this.generateSprites();
  }

  async generateSprites() {
    const k = this.k;

    const baseTile = {
      x: 0,
      y: 0,
      height: 128,
      width: 128,
      sliceX: 8,
      sliceY: 8
    };

    k.loadSpriteAtlas('images/ui.png', {
      'heart/empty': {
        ...baseTile
      },
      'heart/full': {
        ...baseTile,
        x: 16
      },
      'heart/extra': {
        ...baseTile,
        x: 32
      },
      'guage/left/top': {
        ...baseTile,
        y: 32
      },
      'guage/left/middle': {
        ...baseTile,
        y: 48
      },
      'guage/left/bottom': {
        ...baseTile,
        y: 64
      },
      'guage/center/top': {
        ...baseTile,
        x: 16,
        y: 32
      },
      'guage/center/middle': {
        ...baseTile,
        x: 16,
        y: 48
      },
      'guage/center/bottom': {
        ...baseTile,
        x: 16,
        y: 64
      },
      'guage/right/top': {
        ...baseTile,
        x: 32,
        y: 32
      },
      'guage/right/middle': {
        ...baseTile,
        x: 32,
        y: 48
      },
      'guage/right/bottom': {
        ...baseTile,
        x: 32,
        y: 64
      }
    });
  }

  renderExp() {
    const k = this.k;

    const player = this._player;

    const exp = player.exp;
    const expToNextLevel = player.expToNextLevel;

    const comp = [k.anchor('topleft'), k.fixed()];

    const centerGuages = 10;

    const middleSegments = 0;

    const totalGuageWidth = 16 + 16 + 16 * centerGuages;

    const toalGuageHeight = 16 + 16 * middleSegments;

    const paddingBottom = 16 + toalGuageHeight;

    const addLeftGuage = () => {
      this.add([
        ...comp,
        k.sprite('guage/left/top'),
        k.pos(k.center().x - totalGuageWidth / 2, k.height() - paddingBottom)
      ]);

      for (let i = 0; i < middleSegments; i++) {
        this.add([
          ...comp,
          k.sprite('guage/left/middle'),
          k.pos(k.center().x - totalGuageWidth / 2, k.height() - paddingBottom + 16 + i * 16)
        ]);
      }

      this.add([
        ...comp,
        k.sprite('guage/left/bottom'),
        k.pos(
          k.center().x - totalGuageWidth / 2,
          k.height() - paddingBottom + 16 + middleSegments * 16
        )
      ]);
    };

    const addCenterGuage = (index: number) => {
      this.add([
        ...comp,
        k.sprite('guage/center/top'),
        k.pos(k.center().x + 16 + index * 16 - totalGuageWidth / 2, k.height() - paddingBottom)
      ]);

      for (let i = 0; i < middleSegments; i++) {
        this.add([
          ...comp,
          k.sprite('guage/center/middle'),
          k.pos(
            k.center().x + 16 + index * 16 - totalGuageWidth / 2,
            k.height() - paddingBottom + 16 + i * 16
          )
        ]);
      }

      this.add([
        ...comp,
        k.sprite('guage/center/bottom'),
        k.pos(
          k.center().x + 16 + index * 16 - totalGuageWidth / 2,
          k.height() - paddingBottom + 16 + middleSegments * 16
        )
      ]);
    };

    const addRightGuage = () => {
      this.add([
        ...comp,
        k.sprite('guage/right/top'),
        k.pos(
          k.center().x + 16 + centerGuages * 16 - totalGuageWidth / 2,
          k.height() - paddingBottom
        )
      ]);

      for (let i = 0; i < middleSegments; i++) {
        this.add([
          ...comp,
          k.sprite('guage/right/middle'),
          k.pos(
            k.center().x + 16 + centerGuages * 16 - totalGuageWidth / 2,
            k.height() - paddingBottom + 16 + i * 16
          )
        ]);
      }

      this.add([
        ...comp,
        k.sprite('guage/right/bottom'),
        k.pos(
          k.center().x + 16 + centerGuages * 16 - totalGuageWidth / 2,
          k.height() - paddingBottom + 16 + middleSegments * 16
        )
      ]);
    };

    addLeftGuage();

    for (let i = 0; i < centerGuages; i++) {
      addCenterGuage(i);
    }

    addRightGuage();
  }

  renderHealth() {
    const k = this.k;
    const object = this.object;

    const player = this._player;

    const health = player.health;
    const maxHealth = player.maxHealth;

    if (object) {
      if (this._hearts.length > 0) {
        this._hearts.forEach((heart) => {
          heart.destroy();
        });
        this._hearts = [];
      }
    }

    for (let i = 0; i < maxHealth; i++) {
      let heart: GameObj | undefined;

      if (i < health) {
        heart = this.add([
          'heart',
          k.sprite('heart/full'),
          k.pos(4 + i * (16 + 4), 4),
          k.anchor('topleft'),
          k.fixed()
        ]);
      } else {
        heart = this.add([
          'heart',
          k.sprite('heart/empty'),
          k.pos(4 + i * (16 + 4), 4),
          k.anchor('topleft'),
          k.fixed()
        ]);
      }

      if (heart) {
        this._hearts.push(heart);
      }
    }
  }

  init(level: GameObj): GameObj {
    super.init(level);

    const k = this.k;

    const object = this.object!;
    const playerObj = this._player.object;

    if (object) {
      object.onStateEnter(UITimeOfDayEnum.DAY, () => {
        object.opacity = 0;
      });

      object.onStateUpdate(UITimeOfDayEnum.DAY, () => {
        if (this.timeOfDay !== UITimeOfDayEnum.DAY) {
          object.enterState(this.timeOfDay);
        }
      });

      object.onStateEnter(UITimeOfDayEnum.EVENING, () => {
        object.use(k.color(48, 96, 130));
      });

      object.onStateUpdate(UITimeOfDayEnum.EVENING, () => {
        if (this.timeOfDay !== UITimeOfDayEnum.EVENING) {
          object.enterState(this.timeOfDay);
        }
      });

      object.onStateEnter(UITimeOfDayEnum.NIGHT, () => {
        object.use(k.color(63, 63, 116));
      });

      object.onStateUpdate(UITimeOfDayEnum.NIGHT, () => {
        if (this.timeOfDay !== UITimeOfDayEnum.EVENING) {
          object.enterState(this.timeOfDay);
        }
      });

      object.enterState(this.timeOfDay);
    }

    if (playerObj) {
      this.renderHealth();
      this.renderExp();

      playerObj.onHurt(() => {
        this.renderHealth();
      });

      playerObj.onHeal(() => {
        this.renderHealth();
      });
    }

    return object;
  }
}
