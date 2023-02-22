import { GameObj, KaboomCtx, LevelComp } from 'kaboom';
import { clamp } from 'lodash';
import { ICharacterDirectionEnum } from '../classes/character';

const KCamera = (k: KaboomCtx) => {
  return {
    smoothFollow: ({ level, target }: { level: GameObj; target: GameObj }) => {
      const currentPos = k.vec2(0, 0);
      level = level as GameObj & LevelComp;

      return {
        update() {
          const cameraTarget = this as any;
          const player = target;

          if (player) {
            const facingDirection = player.facingDirection;

            const mod = 48;

            // TODO: based on some scale change mod

            const cameraTargetPos = player.pos.add(
              facingDirection === ICharacterDirectionEnum.UP
                ? k.vec2(0, -mod)
                : facingDirection === ICharacterDirectionEnum.LEFT
                ? k.vec2(-mod, 0)
                : facingDirection === ICharacterDirectionEnum.DOWN
                ? k.vec2(0, mod)
                : k.vec2(mod, 0)
            );

            // offset y camera target position to be above player
            cameraTargetPos.y -= 48;

            // lerp camera target position
            cameraTarget.pos = cameraTarget.pos.lerp(cameraTargetPos, 0.1);

            const pos = cameraTarget.pos;

            const leftBoundary = level.get('left-boundary').shift() as GameObj;
            const leftBoundaryPos = leftBoundary?.pos;

            const rightBoundary = level.get('right-boundary').shift() as GameObj;
            const rightBoundaryPos = rightBoundary?.pos;

            const bounds = {
              left: leftBoundaryPos.x + k.width() * 0.5 + leftBoundary.width,
              right: rightBoundaryPos.x - k.width() * 0.5 - rightBoundary.width,
              bottom: leftBoundaryPos.y - k.height() * 0.5 - leftBoundary.height
            };

            // clamp camera position to bounds
            pos.x = clamp(pos.x, bounds.left, bounds.right);
            pos.y = clamp(pos.y, 0, bounds.bottom);

            console.log(pos);

            k.camPos(pos);
          }
        }
      };
    }
  };
};

export default KCamera;
