import { BodyComp, Comp, LevelOpt, PosComp } from 'kaboom';
import { Character, ICharacterDirectionEnum } from '../../classes/character';
import { UI } from '../../classes/ui';
import { Components } from '../../components';
import { mapTile } from '../../constants';
import { IKaboomCtxExt } from '../../shared/types';
import { IMapLevel } from '../types';

export const Unotown = (k: IKaboomCtxExt): IMapLevel => {
  k.loadSpriteAtlas('images/map/001.png', {
    map001: {
      x: 0,
      y: 0,
      height: 128,
      width: 128,
      sliceX: 8,
      sliceY: 8
    },
    'maps/001/ground-tl': {
      ...mapTile,
      x: 0,
      y: 0
    },
    'maps/001/ground-tc': {
      ...mapTile,
      x: 16,
      y: 0
    },
    'maps/001/ground-tr': {
      ...mapTile,
      x: 32,
      y: 0
    },
    'maps/001/ground-ml': {
      ...mapTile,
      x: 0,
      y: 16
    },
    'maps/001/ground-mc': {
      ...mapTile,
      x: 16,
      y: 16
    },
    'maps/001/ground-mr': {
      ...mapTile,
      x: 32,
      y: 16
    },
    'maps/001/ground-bl': {
      ...mapTile,
      x: 0,
      y: 32
    },
    'maps/001/ground-bc': {
      ...mapTile,
      x: 16,
      y: 32
    },
    'maps/001/ground-br': {
      ...mapTile,
      x: 32,
      y: 32
    },
    'maps/001/ground-sm-t': {
      ...mapTile,
      x: 48,
      y: 0
    },
    'maps/001/ground-sm-m': {
      ...mapTile,
      x: 48,
      y: 16
    },
    'maps/001/ground-sm-b': {
      ...mapTile,
      x: 48,
      y: 32
    },
    'maps/001/slab-l': {
      ...mapTile,
      x: 0,
      y: 48
    },
    'maps/001/slab-c': {
      ...mapTile,
      x: 16,
      y: 48
    },
    'maps/001/slab-r': {
      ...mapTile,
      x: 32,
      y: 48
    },
    'maps/001/slab-sm': {
      ...mapTile,
      x: 48,
      y: 48
    },
    'maps/001/ground-tl-ground': {
      ...mapTile,
      x: 0,
      y: 64
    },
    'maps/001/ground-tr-ground': {
      ...mapTile,
      x: 32,
      y: 64
    }
  });

  type PlatformFloorComp = {
    update: () => void;
  };

  const playerMadeSolid = (s: any, player: any): boolean => {
    if (player && player.pos) {
      return s.pos.dist(player.pos) <= 32;
    }

    return false;
  };

  function solidOptimized() {
    return {
      update() {
        const s = this as any;
        const player = k.get('player').shift() as unknown as BodyComp & PosComp;
        s.solid = true;
      }
    } as PlatformFloorComp;
  }

  function jumpToPlatform() {
    return {
      update() {
        const s = this as any;
        const player = k.level.get('player').shift() as unknown as BodyComp & PosComp;

        if (player) {
          s.solid = player.pos.y < s.pos.y && playerMadeSolid(s, player);

          if (player && player.pos) {
            // if player is directly under this object set solid to false
            if (
              player.pos.y > s.pos.y &&
              player.pos.x > s.pos.x &&
              player.pos.x < s.pos.x + s.width
            ) {
              s.solid = false;
            }
          }
        }
      }
    } as PlatformFloorComp;
  }

  const definitions = (): LevelOpt => ({
    tileWidth: 16,
    tileHeight: 16,
    tiles: {
      '⌜': () => [
        k.sprite('maps/001/ground-tl'),
        k.area(),
        k.body({ isStatic: true }),
        solidOptimized()
      ],
      '―': () => [
        k.sprite('maps/001/ground-tc'),
        k.area(),
        k.body({ isStatic: true }),
        solidOptimized()
      ],
      '⌝': () => [
        k.sprite('maps/001/ground-tr'),
        k.area(),
        k.body({ isStatic: true }),
        solidOptimized()
      ],
      '(': () => [
        k.sprite('maps/001/ground-tl'),
        k.area(),
        k.body({ isStatic: true }),
        jumpToPlatform()
      ],
      '#': () => [
        k.sprite('maps/001/ground-tc'),
        k.area(),
        k.body({ isStatic: true }),
        jumpToPlatform()
      ],
      ')': () => [
        k.sprite('maps/001/ground-tr'),
        k.area(),
        k.body({ isStatic: true }),
        jumpToPlatform()
      ],
      '[': () => [
        k.sprite('maps/001/ground-ml'),
        k.area(),
        k.body({ isStatic: true }),
        solidOptimized()
      ],
      '@': () => [k.sprite('maps/001/ground-mc')],
      ']': () => [
        k.sprite('maps/001/ground-mr'),
        k.area(),
        k.body({ isStatic: true }),
        solidOptimized()
      ],
      '!': () => [k.sprite('maps/001/ground-ml')],
      '|': () => [k.sprite('maps/001/ground-mr')],
      '{': () => [
        k.sprite('maps/001/ground-bl'),
        k.area(),
        k.body({ isStatic: true }),
        solidOptimized()
      ],
      '=': () => [k.sprite('maps/001/ground-bc')],
      '}': () => [
        k.sprite('maps/001/ground-br'),
        k.area(),
        k.body({ isStatic: true }),
        solidOptimized()
      ],
      '+': () => [
        k.sprite('maps/001/ground-sm-t'),
        k.area(),
        k.body({ isStatic: true }),
        solidOptimized()
      ],
      '-': () => [
        k.sprite('maps/001/ground-sm-m'),
        k.area(),
        k.body({ isStatic: true }),
        solidOptimized()
      ],
      '*': () => [
        k.sprite('maps/001/ground-sm-b'),
        k.area(),
        k.body({ isStatic: true }),
        solidOptimized()
      ],
      '/': () => [
        k.sprite('maps/001/ground-tl-ground'),
        k.area(),
        k.body({ isStatic: true }),
        solidOptimized()
      ],
      '\\': () => [
        k.sprite('maps/001/ground-tr-ground'),
        k.area(),
        k.body({ isStatic: true }),
        solidOptimized()
      ]
    }
  });

  return {
    name: 'Unotown',
    routes: [
      {
        name: 'Route 1',
        load: ({ player }) => {
          k.setGravity(1600);

          const levelLayout = [
            '                                                                                                   ',
            '                                                                                                   ',
            '                                                                                                   ',
            '                                                                                                   ',
            '                                                                                                   ',
            '                                                                                                   ',
            '⌜―――⌝                                                                                              ',
            '[@@@]                                                                                              ',
            '[@@@]                                                                                              ',
            '[@@@]                                  (##)                                                        ',
            '[@@@]                                  !@@|                                                        ',
            '[@@@]                                  !@@|                                                        ',
            '[@(###############################################################################################)',
            '[@[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@]',
            '[@[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@]',
            '[@[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@]',
            '[@[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@]',
            '[@[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@]',
            '[@[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@]',
            '[@[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@]',
            '{=[================================================================================================}'
          ];

          const level = k.addLevel(levelLayout, {
            ...definitions()
          });

          level.spawnPoint = k.vec2(8, 13.4);

          const { Camera } = Components(k);

          player.init(level);

          const ui = new UI(k, player);

          ui.init({
            ...level,
            spawnPoint: k.vec2(0, 0)
          });

          const cameraTarget = level.spawn(
            [
              'camera-target',
              k.rect(16, 16),
              k.area(),
              k.anchor('center'),
              k.color(75, 180, 255),
              k.opacity(0)
            ],
            level.spawnPoint
          );

          if (player.object) {
            cameraTarget.use(Camera.smoothFollow(player.object));
          }

          const sam = new Character(k, {
            name: 'Sam',
            tag: 'npc'
          });

          sam.init({
            ...level,
            spawnPoint: k.vec2(41, level.spawnPoint.y)
          });

          sam.setFacingDirection(ICharacterDirectionEnum.DOWN);

          if (sam.object) {
            sam.object.use({
              damageRadius: 16
            } as Comp);

            const levelPos = sam.object.pos;

            sam.object.onUpdate(() => {
              const npc = sam.object;

              // if player is on the same y axis as the npc and is within 32px of the npc damage the player and knock them back out of the radius
              if (player.object && npc) {
                const playerObj = player.object;

                if (
                  playerObj.pos.y > npc.pos.y &&
                  playerObj.pos.dist(npc.pos) <= npc.damageRadius
                ) {
                  // make npc turn to face player
                  const direction: ICharacterDirectionEnum =
                    playerObj.pos.x > npc.pos.x
                      ? ICharacterDirectionEnum.RIGHT
                      : ICharacterDirectionEnum.LEFT;

                  //  jump up and down
                  sam.jump();

                  k.wait(0.3, () => {
                    npc.pos.y += 2;
                    sam.setFacingDirection(direction);
                  });

                  k.wait(1.5, () => {
                    sam.setFacingDirection(ICharacterDirectionEnum.DOWN);
                    npc.pos = levelPos;
                  });

                  playerObj.hurt(1);

                  // knock back in the opposite direction of the npc
                  playerObj.pos.x = Math.ceil(
                    playerObj.pos.x +
                      (npc.pos.x > playerObj.pos.x ? -npc.damageRadius : npc.damageRadius) * 2
                  );
                }
              }
            });
          }

          return level;
        }
      }
    ]
  };
};
