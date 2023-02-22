import { AreaComp, GameObj, LevelOpt } from 'kaboom';
import { ICharacterDirectionEnum } from '../../classes/character';
import { NPC } from '../../classes/npc';
import { UI } from '../../classes/ui';
import { Components } from '../../components';
import Sign from '../../components/sign';
import { mapTile } from '../../constants';
import { IKaboomCtxExt } from '../../shared/types';
import { IMapLevel } from '../types';

export const Unotown = (k: IKaboomCtxExt): IMapLevel => {
  const spawnPoint = k.vec2(8, 13.4);

  k.loadSpriteAtlas('images/props.png', {
    props: {
      x: 0,
      y: 0,
      height: 128,
      width: 128,
      sliceX: 8,
      sliceY: 8
    },
    'props/sign': {
      ...mapTile,
      x: 0,
      y: 0
    }
  });

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
    'maps/001/ground-ground-tl': {
      ...mapTile,
      x: 0,
      y: 64
    },
    'maps/001/ground-ground-tr': {
      ...mapTile,
      x: 32,
      y: 64
    },
    'maps/001/door-top-left': {
      ...mapTile,
      x: 64,
      y: 0
    },
    'maps/001/door-top-center': {
      ...mapTile,
      x: 80,
      y: 0
    },
    'maps/001/door-top-right': {
      ...mapTile,
      x: 96,
      y: 0
    },
    'maps/001/door-bottom-left': {
      ...mapTile,
      x: 64,
      y: 16
    },
    'maps/001/door-bottom-center': {
      ...mapTile,
      x: 80,
      y: 16
    },
    'maps/001/door-bottom-right': {
      ...mapTile,
      x: 96,
      y: 16
    }
  });

  const platform = (tag?: string) => {
    return {
      add: (p: GameObj & AreaComp) => {
        p.use('platform');

        if (tag) {
          p.use(tag);
        }

        p.onHover(() => {
          // add an outline
          p.use(k.outline(4));
        });

        p.onHoverEnd(() => {
          p.unuse('outline');
        });
      }
    };
  };

  const boundary = (tag?: string) => {
    return {
      add: (p: GameObj & AreaComp) => {
        p.use('boundary');

        if (tag) {
          p.use(tag);
        }
      }
    };
  };

  const definitions = (): LevelOpt => ({
    tileWidth: 16,
    tileHeight: 16,
    tiles: {
      L: () => [
        'left-boundary',
        boundary(),
        k.sprite('maps/001/ground-tl'),
        k.area(),
        k.body({ isStatic: true })
      ],
      R: () => [
        'right-boundary',
        boundary(),
        k.sprite('maps/001/ground-tl'),
        k.area(),
        k.body({ isStatic: true })
      ],
      '⌜': () => [
        platform('soft'),
        k.sprite('maps/001/ground-tl'),
        k.area(),
        k.body({ isStatic: true })
      ],
      '―': () => [
        platform('soft'),
        k.sprite('maps/001/ground-tc'),
        k.area(),
        k.body({ isStatic: true })
      ],
      '⌝': () => [
        platform('soft'),
        k.sprite('maps/001/ground-tr'),
        k.area(),
        k.body({ isStatic: true })
      ],
      '(': () => [platform(), k.sprite('maps/001/ground-tl'), k.area(), k.body({ isStatic: true })],
      '#': () => [platform(), k.sprite('maps/001/ground-tc'), k.area(), k.body({ isStatic: true })],
      ')': () => [platform(), k.sprite('maps/001/ground-tr'), k.area(), k.body({ isStatic: true })],
      '≤': () => [
        platform(),
        k.sprite('maps/001/ground-ground-tl'),
        k.area(),
        k.body({ isStatic: true })
      ],
      '≥': () => [
        platform(),
        k.sprite('maps/001/ground-ground-tr'),
        k.area(),
        k.body({ isStatic: true })
      ],
      '[': () => [platform(), k.sprite('maps/001/ground-ml'), k.area(), k.body({ isStatic: true })],
      '@': () => [k.sprite('maps/001/ground-mc')],
      d: () => [k.sprite('maps/001/door-top-left')],
      f: () => [k.sprite('maps/001/door-top-center')],
      g: () => [k.sprite('maps/001/door-top-right')],
      c: () => [k.sprite('maps/001/door-bottom-left')],
      v: () => [k.sprite('maps/001/door-bottom-center')],
      b: () => [k.sprite('maps/001/door-bottom-right')],
      ']': () => [platform(), k.sprite('maps/001/ground-mr'), k.area(), k.body({ isStatic: true })],
      '!': () => [k.sprite('maps/001/ground-ml')],
      '|': () => [k.sprite('maps/001/ground-mr')],
      '{': () => [platform(), k.sprite('maps/001/ground-bl'), k.area(), k.body({ isStatic: true })],
      '=': () => [k.sprite('maps/001/ground-bc')],
      '}': () => [platform(), k.sprite('maps/001/ground-br'), k.area(), k.body({ isStatic: true })],
      '^': () => [
        platform(),
        k.sprite('maps/001/ground-sm-t'),
        k.area(),
        k.body({ isStatic: true })
      ],
      '+': () => [
        platform(),
        k.sprite('maps/001/ground-sm-m'),
        k.area(),
        k.body({ isStatic: true })
      ],
      '-': () => [
        platform(),
        k.sprite('maps/001/ground-sm-b'),
        k.area(),
        k.body({ isStatic: true })
      ],
      '/': () => [
        platform(),
        k.sprite('maps/001/ground-tl-ground'),
        k.area(),
        k.body({ isStatic: true })
      ],
      '\\': () => [
        platform(),
        k.sprite('maps/001/ground-tr-ground'),
        k.area(),
        k.body({ isStatic: true })
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
            '                                                                                                     ',
            '                                                                                                     ',
            '                                                                                                     ',
            '                                                                                                     ',
            '                                                                                                     ',
            '                                                                                                     ',
            ' (###)                                                                                               ',
            ' [@@@]                                                                                               ',
            ' [@@@]                                  ⌜―――――⌝                                                      ',
            ' [@@@]                                  !@@@@@|                                                      ',
            ' [@@@]                                  !@dfg@|                                                      ',
            ' [@@@]                                  !@cvb@|                                                      ',
            ' [@≤###############################################################################################) ',
            ' [@[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@] ',
            ' [@[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@] ',
            ' [@[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@] ',
            ' [@[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@] ',
            ' [@[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@] ',
            ' [@[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@] ',
            ' [@[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@] ',
            'L{=[================================================================================================}R'
          ];

          const level = k.addLevel(levelLayout, {
            ...definitions()
          });

          level.spawnPoint = spawnPoint;

          const load = () => {
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
              cameraTarget.use(
                Camera.smoothFollow({
                  target: player.object,
                  level
                })
              );
            }

            level.spawn(
              Sign(k, {
                message: 'Nothing to see here. Hop along now.',
                player
              }),
              k.vec2(37.75, level.spawnPoint.y - 2.4)
            );

            const sam = new NPC(k, {
              name: 'Sam',
              tag: 'npc',
              isBlocking: true
            });

            sam.init({
              ...level,
              spawnPoint: k.vec2(42.5, 13.4)
            });

            sam.setFacingDirection(ICharacterDirectionEnum.DOWN);

            if (sam.object) {
              const levelPos = sam.object.pos;

              sam.object.onUpdate(() => {
                const npc = sam.object;
                const playerObj = player.object;

                // if player is on the same y axis as the npc and is within 32px of the npc damage the player and knock them back out of the radius
                if (playerObj && npc) {
                  // sam.lookAt(playerObj);
                }
              });

              sam.onInteract((player) => {
                sam.openDialogue({
                  target: player,
                  messages: [
                    `Hey! Watch it!`,
                    `Didn't you see the sign?`,
                    `You're not supposed to be here!`,
                    `This leads to Kah-nah-da...`,
                    `A treacherous place....`,
                    `Filled with danger and Mooserats!`,
                    `Now hop along before you get hurt!`
                  ]
                });
              });
            }
          };

          load();

          return level;
        }
      }
    ]
  };
};
