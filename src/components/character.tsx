import React from 'react';
import { CSSDimensionsWithPixelSize } from '../utils/pixles';
import Sprite from './sprite';

export enum CharacterFacingDirectionEnum {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}

interface CharacterProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name?: string;
  type?: string;
  skin?: string;
  outfit?: string;
  facingDirection?: CharacterFacingDirectionEnum;
  isMoving?: boolean;
  isJumping?: boolean;
  isFocused?: boolean;
  disableEffects?: boolean;
  width?: number;
  height?: number;
}

const Character: React.FC<CharacterProps> = ({
  id,
  name,
  type,
  skin,
  outfit,
  facingDirection,
  isMoving,
  isJumping,
  isFocused,
  disableEffects,
  width,
  height
}) => {
  if (!type) type = 'character';
  if (!skin) skin = 'yellow';

  return (
    <div
      className="relative"
      style={{
        ...CSSDimensionsWithPixelSize(`${width ?? 32}px`, `${height ?? 64}px`)
      }}>
      {name && (
        <div className="absolute bottom-[75%] flex justify-center items-center w-full h-[50px] bg-white text-black border-2 border-black rounded-md">
          <div>{name}</div>
        </div>
      )}
      <div className="absolute inset-0 flex justify-center items-start">
        <Sprite
          id={id}
          rows={4}
          cols={4}
          row={
            facingDirection === CharacterFacingDirectionEnum.UP
              ? 2
              : facingDirection === CharacterFacingDirectionEnum.DOWN
              ? 0
              : facingDirection === CharacterFacingDirectionEnum.LEFT
              ? 3
              : 1
          }
          frames={4}
          width={32}
          height={64}
          sheets={[
            {
              className: 'character-skin',
              image: `${type}/skin/${skin}`
            },
            {
              className: 'outline',
              image: `${type}/outline`
            },
            {
              className: 'outline-hover',
              image: isFocused && !outfit ? `${type}/outline-hover` : ''
            },
            {
              className: 'character-outfit',
              image: `${type}/outfit/${outfit}`
            },
            {
              className: 'outline-hover',
              image: isFocused && outfit ? `${type}/outfit/${outfit}-hover` : ''
            }
          ]}
        />
      </div>
    </div>
  );
};

export default Character;
