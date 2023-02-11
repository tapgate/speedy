import { GameObj, KaboomCtx, Vec2 } from 'kaboom';
import { ICharacterDirectionEnum } from '../classes/character';

const KCamera = (k: KaboomCtx) => {
  return {
    smoothFollow: (target: GameObj, offset: Vec2) => {
      const currentPos = k.vec2(0, 0);

      return {
        update() {
          // lerp current position to target position
          // const targetPos = k.vec2(target.pos.x + offset.x, target.pos.y + offset.y);

          // k.camPos(targetPos);

          // /*
          const cameraTarget = this as any;
          const player = k.get('player').shift();

          if (player) {
            const facingDirection = player.facingDirection;

            const cameraTargetPos = player.pos.add(
              facingDirection === ICharacterDirectionEnum.UP
                ? k.vec2(0, -48)
                : facingDirection === ICharacterDirectionEnum.LEFT
                ? k.vec2(-48, 0)
                : facingDirection === ICharacterDirectionEnum.DOWN
                ? k.vec2(0, 48)
                : k.vec2(48, 0)
            );

            // offset y camera target position to be above player
            cameraTargetPos.y -= 48;

            // lerp camera target position
            cameraTarget.pos = cameraTarget.pos.lerp(cameraTargetPos, 0.1);

            k.camPos(cameraTarget.pos);
          }
          // */
        }
      };
    }
  };
};

export default KCamera;
