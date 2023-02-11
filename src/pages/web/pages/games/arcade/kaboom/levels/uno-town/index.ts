import { BodyComp, GameObj, HealthComp, KaboomCtx, PosComp } from 'kaboom';
import { Character, ICharacterDirectionEnum } from '../../classes/character';
import { mapTile } from '../../constants';
import { IMapLevel } from '../types';

export const Unotown = (k: KaboomCtx): IMapLevel => {
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
      ...k.area(),
      update() {
        const s = this as any;
        const player = k.get('player').shift() as unknown as BodyComp & PosComp;
        s.solid = playerMadeSolid(s, player);
      }
    } as PlatformFloorComp;
  }

  function jumpToPlatform() {
    return {
      ...k.area(),
      update() {
        const s = this as any;
        const player = k.get('player').shift() as unknown as BodyComp & PosComp;
        s.solid = player.pos.y < s.pos.y && playerMadeSolid(s, player);

        if (player && player.pos) {
          // if player is directly under this object set solid to false
          if (
            player.pos.y > s.pos.y &&
            player.pos.x > s.pos.x &&
            player.pos.x < s.pos.x + s.width
          ) {
            s.solid = false;
            console.log('s', s);
          }
        }
      }
    } as PlatformFloorComp;
  }

  const definitions = () => ({
    width: 16,
    height: 16,
    '⌜': () => [k.sprite('maps/001/ground-tl'), solidOptimized()],
    '―': () => [k.sprite('maps/001/ground-tc'), solidOptimized()],
    '⌝': () => [k.sprite('maps/001/ground-tr'), solidOptimized()],
    '(': () => [k.sprite('maps/001/ground-tl'), jumpToPlatform()],
    '#': () => [k.sprite('maps/001/ground-tc'), jumpToPlatform()],
    ')': () => [k.sprite('maps/001/ground-tr'), jumpToPlatform()],
    '[': () => [k.sprite('maps/001/ground-ml'), solidOptimized()],
    '@': () => [k.sprite('maps/001/ground-mc')],
    ']': () => [k.sprite('maps/001/ground-mr'), solidOptimized()],
    '!': () => [k.sprite('maps/001/ground-ml')],
    '|': () => [k.sprite('maps/001/ground-mr')],
    '{': () => [k.sprite('maps/001/ground-bl'), solidOptimized()],
    '=': () => [k.sprite('maps/001/ground-bc')],
    '}': () => [k.sprite('maps/001/ground-br'), solidOptimized()],
    '+': () => [k.sprite('maps/001/ground-sm-t'), solidOptimized()],
    '-': () => [k.sprite('maps/001/ground-sm-m'), solidOptimized()],
    '*': () => [k.sprite('maps/001/ground-sm-b'), solidOptimized()],
    '/': () => [k.sprite('maps/001/ground-tl-ground'), solidOptimized()],
    '\\': () => [k.sprite('maps/001/ground-tr-ground'), solidOptimized()]
  });

  return {
    name: 'Unotown',
    routes: [
      {
        name: 'Route 1',
        load: () => {
          const mapLayout = [
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

          const map = k.addLevel(mapLayout, {
            ...definitions()
          });

          const npc = k.add([
            k.sprite('npc'),
            k.pos(map.getPos(41, 11.4)),
            k.origin('center'),
            k.area({
              offset: k.vec2(0, 1),
              scale: k.vec2(0.25, 0.25)
            }),
            {
              damageRadius: 24
            }
          ]);

          npc.onUpdate(() => {
            // if player is on the same y axis as the npc and is within 32px of the npc damage the player and knock them back out of the radius
            const player = k.get('player').shift() as unknown as BodyComp &
              PosComp &
              HealthComp &
              GameObj;
            if (player && player.pos) {
              const instance = player.instance as unknown as Character;

              if (player.pos.y > npc.pos.y && player.pos.dist(npc.pos) <= npc.damageRadius) {
                // make npc turn to face player
                const direction: ICharacterDirectionEnum =
                  player.pos.x > npc.pos.x
                    ? ICharacterDirectionEnum.RIGHT
                    : ICharacterDirectionEnum.LEFT;

                //  jump up and down
                npc.play('jump-' + direction);

                npc.pos.y -= 2;
                k.wait(0.3, () => {
                  npc.pos.y += 2;
                  npc.play('idle-' + direction);
                });

                k.wait(1.5, () => {
                  npc.play('idle-' + ICharacterDirectionEnum.DOWN);
                });

                // make player flash opacity
                instance.lockMovements();

                player.use(k.opacity(0.5));
                k.wait(0.1, () => {
                  player.use(k.opacity(1));
                });
                k.wait(0.15, () => {
                  player.use(k.opacity(0.5));
                });
                k.wait(0.2, () => {
                  player.use(k.opacity(1));
                });
                k.wait(0.25, () => {
                  player.use(k.opacity(0.5));
                });
                k.wait(0.3, () => {
                  player.use(k.opacity(1));
                  instance.unlockMovements();
                });

                player.hurt(1);

                // knock back in the opposite direction of the npc
                player.pos.x = Math.ceil(
                  player.pos.x +
                    (npc.pos.x > player.pos.x ? -npc.damageRadius : npc.damageRadius) * 1.05
                );
              }
            }
          });

          return map;
        }
      }
    ]
  };
};
