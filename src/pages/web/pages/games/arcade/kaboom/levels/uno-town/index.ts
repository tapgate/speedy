import { BodyComp, KaboomCtx, PosComp } from 'kaboom';
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

          k.add([
            k.sprite('npc'),
            k.pos(map.getPos(41, 11.4)),
            k.origin('center'),
            k.area({
              offset: k.vec2(0, 1),
              scale: k.vec2(0.25, 0.25)
            })
          ]);

          return map;
        }
      }
    ]
  };
};
