import { KaboomCtx } from 'kaboom';
import { Character } from './character';
import { GameObject } from './_object';

export class UI extends GameObject {
  private _player: Character;
  private _hearts: any[] = [];

  constructor(k: KaboomCtx, player: Character) {
    super(k);

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

    const comp = [k.origin('topleft'), k.layer('ui'), k.fixed()];

    const centerGuages = 10;

    const middleSegments = 0;

    const totalGuageWidth = 16 + 16 + 16 * centerGuages;

    const toalGuageHeight = 16 + 16 * middleSegments;

    const paddingBottom = 16 + toalGuageHeight;

    const addLeftGuage = () => {
      k.add([
        ...comp,
        k.sprite('guage/left/top'),
        k.pos(k.center().x - totalGuageWidth / 2, k.height() - paddingBottom)
      ]);

      for (let i = 0; i < middleSegments; i++) {
        k.add([
          ...comp,
          k.sprite('guage/left/middle'),
          k.pos(k.center().x - totalGuageWidth / 2, k.height() - paddingBottom + 16 + i * 16)
        ]);
      }

      k.add([
        ...comp,
        k.sprite('guage/left/bottom'),
        k.pos(
          k.center().x - totalGuageWidth / 2,
          k.height() - paddingBottom + 16 + middleSegments * 16
        )
      ]);
    };

    const addCenterGuage = (index: number) => {
      k.add([
        ...comp,
        k.sprite('guage/center/top'),
        k.pos(k.center().x + 16 + index * 16 - totalGuageWidth / 2, k.height() - paddingBottom)
      ]);

      for (let i = 0; i < middleSegments; i++) {
        k.add([
          ...comp,
          k.sprite('guage/center/middle'),
          k.pos(
            k.center().x + 16 + index * 16 - totalGuageWidth / 2,
            k.height() - paddingBottom + 16 + i * 16
          )
        ]);
      }

      k.add([
        ...comp,
        k.sprite('guage/center/bottom'),
        k.pos(
          k.center().x + 16 + index * 16 - totalGuageWidth / 2,
          k.height() - paddingBottom + 16 + middleSegments * 16
        )
      ]);
    };

    const addRightGuage = () => {
      k.add([
        ...comp,
        k.sprite('guage/right/top'),
        k.pos(
          k.center().x + 16 + centerGuages * 16 - totalGuageWidth / 2,
          k.height() - paddingBottom
        )
      ]);

      for (let i = 0; i < middleSegments; i++) {
        k.add([
          ...comp,
          k.sprite('guage/right/middle'),
          k.pos(
            k.center().x + 16 + centerGuages * 16 - totalGuageWidth / 2,
            k.height() - paddingBottom + 16 + i * 16
          )
        ]);
      }

      k.add([
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

    const player = this._player;

    const health = player.health;
    const maxHealth = player.maxHealth;

    this._hearts.forEach((heart) => {
      k.destroy(heart);
    });

    for (let i = 0; i < maxHealth; i++) {
      if (i < health) {
        this._hearts.push(
          k.add([
            k.sprite('heart/full'),
            k.pos(4 + i * (16 + 4), 4),
            k.origin('topleft'),
            k.layer('ui'),
            k.fixed()
          ])
        );
      } else {
        this._hearts.push(
          k.add([
            k.sprite('heart/empty'),
            k.pos(4 + i * (16 + 4), 4),
            k.origin('topleft'),
            k.layer('ui'),
            k.fixed()
          ])
        );
      }
    }
  }

  load(compList: any): void {
    super.load([
      ...compList,
      {
        instance: this
      }
    ]);
    const k = this.k;

    const object = this.object;
    const playerObj = this._player.object;

    this.renderHealth();
    this.renderExp();

    playerObj.onHurt(() => {
      this.renderHealth();
    });

    playerObj.onHeal(() => {
      this.renderHealth();
    });
  }
}
