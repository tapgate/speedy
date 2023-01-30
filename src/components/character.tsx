import React from 'react';
import { CSSDimensionsWithPixelSize } from '../utils/pixles';

export enum CharacterFacingDirectionEnum {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}

interface CharacterProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
      className={`character ${isFocused ? 'is-focused' : ''} ${
        isMoving ? 'bg-green-500x' : 'bg-red-500x'
      } ${isJumping ? 'jump' : isMoving ? 'move' : 'idle'}-${facingDirection}`}
      style={{ ...CSSDimensionsWithPixelSize(`${width ?? 32}px`, `${height ?? 64}px`) }}>
      {name && (
        <div className="absolute bottom-[75%] flex justify-center items-center w-full h-[50px] bg-white border-2 border-black rounded-md">
          <div>{name}</div>
        </div>
      )}

      <div
        className="character-skin pixel-art sheet animated-object absolute"
        style={{
          ...CSSDimensionsWithPixelSize('128px', '256px'),
          backgroundImage: `url(/images/${type}/skin/${skin}.png)`
        }}></div>
      <div
        className="character-outline pixel-art sheet animated-object absolute"
        style={{
          ...CSSDimensionsWithPixelSize('128px', '256px'),
          backgroundImage: `url(/images/${type}/outline.png)`
        }}></div>
      <div
        className={`outline-hover pixel-art sheet animated-object absolute ${
          disableEffects ? 'hidden' : ''
        }`}
        style={{
          ...CSSDimensionsWithPixelSize('128px', '256px'),
          backgroundImage: 'url(/images/${type}/outline-hover.png)'
        }}></div>
      <div
        className={`character-outfit ${
          outfit && outfit ? '' : 'opacity-75'
        } pixel-art sheet animated-object absolute`}
        style={{
          ...CSSDimensionsWithPixelSize('128px', '256px'),
          backgroundImage: `url(/images/${type}/outfit/${
            outfit ? outfit + '.png' : 'naked-censor.gif'
          })`
        }}></div>
      <div
        className={`outline-hover pixel-art sheet animated-object absolute ${
          disableEffects ? 'hidden' : ''
        }`}
        style={{
          ...CSSDimensionsWithPixelSize('128px', '256px'),
          backgroundImage: `url(/images/${type}/outfit/${outfit}-hover.png)`
        }}></div>
    </div>
  );
};

export default Character;
