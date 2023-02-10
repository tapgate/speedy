import { KaboomCtx } from 'kaboom';
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
      x: 3,
      y: 0
    },
    'maps/001/ground-sm-m': {
      ...mapTile,
      x: 0,
      y: 0
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
    }
  });

  const definitions = () => ({
    width: 16,
    height: 16,
    '(': () => [k.sprite('maps/001/ground-tl'), k.area(), k.solid()],
    '#': () => [k.sprite('maps/001/ground-tc'), k.area(), k.solid()],
    ')': () => [k.sprite('maps/001/ground-tr'), k.area(), k.solid()],
    '[': () => [k.sprite('maps/001/ground-ml'), k.area(), k.solid()],
    '@': () => [k.sprite('maps/001/ground-mc')],
    ']': () => [k.sprite('maps/001/ground-mr'), k.area(), k.solid()],
    '{': () => [k.sprite('maps/001/ground-bl'), k.area(), k.solid()],
    '=': () => [k.sprite('maps/001/ground-bc')],
    '}': () => [k.sprite('maps/001/ground-br'), k.area(), k.solid()],
    '(#)': () => [k.sprite('maps/001/ground-sm-t'), k.area(), k.solid()],
    '[@]': () => [k.sprite('maps/001/ground-sm-m'), k.area(), k.solid()],
    '{=}': () => [k.sprite('maps/001/ground-sm-b'), k.area(), k.solid()]
    // '': () => [k.sprite('slab-l'), k.area(), k.solid()],
    // '': () => [k.sprite('slab-c'), k.area(), k.solid()],
    // '': () => [k.sprite('slab-r'), k.area(), k.solid()],
    // '': () => [k.sprite('slab-sm'), k.area(), k.solid()],
  });

  return {
    name: 'Unotown',
    routes: [
      {
        name: 'Route 1',
        load: () => {
          const mapLayout = [
            'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            '(###)xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            '[@@@]xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            '[@@@]xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            '[@@@]xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            '[@@@]xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            '[@@@]xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx%xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            '[@(###############################################################################################)',
            '[@[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@]',
            '[@[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@]',
            '[@[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@]',
            '[@[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@]',
            '[@[@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@]',
            '{=[================================================================================================}'
          ];

          const map = k.addLevel(mapLayout, {
            ...definitions(),
            '%': () => [
              k.sprite('npc'),
              k.pos(6, 6),
              k.origin('center'),
              k.area({
                offset: k.vec2(0, 1),
                scale: k.vec2(0.25, 0.25)
              })
            ]
          });

          return map;
        }
      }
    ]
  };
};
