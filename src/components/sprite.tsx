import React, { useEffect } from 'react';
import { CSSDimensionsWithPixelSize } from '../utils/pixles';

export enum SpriteFacingDirectionEnum {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}

export interface ISpriteSheet {
  className: string;
  image: string;
}

interface SpriteProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  fps?: number;
  width: number;
  height: number;
  rows?: number;
  cols?: number;
  row?: number;
  frames?: number;
  frame?: number;
  pause?: boolean;
  sheets?: ISpriteSheet[];
  sheet?: ISpriteSheet;
}

const SpriteSheet = ({ id, order, sheet }: { id: string; order?: number; sheet: ISpriteSheet }) => {
  return (
    <div
      id={`sprite-${id}`}
      className={`sheet ${sheet.className} pixel-art animated-object absolute bg-contain bg-no-repeat`}
      style={{
        zIndex: order ?? 0,
        ...CSSDimensionsWithPixelSize('128px', '256px'),
        backgroundImage: `url(/images/${sheet.image}.png)`
      }}></div>
  );
};

class SpriteAnimation {
  public id: string;
  public fps: number;
  public width: number;
  public height: number;
  public rows: number;
  public cols: number;
  public row: number;
  public frames: number;
  public frame: number | undefined;
  public pause: boolean | undefined;
  public sheets?: ISpriteSheet[];
  public sheet?: ISpriteSheet;

  constructor({
    id,
    fps,
    width,
    height,
    rows,
    cols,
    row,
    frames,
    frame,
    pause,
    sheets,
    sheet
  }: SpriteProps) {
    this.id = id;
    this.fps = fps ?? 6;
    this.width = width;
    this.height = height;
    this.rows = rows ?? 1;
    this.cols = cols ?? 1;
    this.row = row ?? 0;
    this.frames = frames ?? cols ?? 1;
    this.frame = frame;
    this.pause = pause;
    this.sheets = sheets;
    this.sheet = sheet;
  }
}

const Sprite: React.FC<SpriteProps> = (props) => {
  const animatetionRef = React.useRef<number>(0);
  const timeTillNextStepRef = React.useRef<number>(Date.now());

  const spriteAnimationRef = React.useRef<SpriteAnimation>(new SpriteAnimation(props));

  useEffect(() => {
    if (animatetionRef.current) {
      cancelAnimationFrame(animatetionRef.current);
    }

    let step = 0;

    const update = () => {
      const now = Date.now();
      const spriteAnimation = spriteAnimationRef.current;

      if (timeTillNextStepRef.current) {
        if (timeTillNextStepRef.current - now <= 0) {
          const sprites = document.querySelectorAll(`#sprite-${spriteAnimation.id}`);

          let pausedSheets = 0;

          sprites.forEach((sprite) => {
            const el = sprite as HTMLDivElement;
            if (el) {
              const animationPlayState = el.style.animationPlayState;

              if (animationPlayState != 'paused') {
                el.style.backgroundPositionX = `calc(-${
                  step * spriteAnimation.width
                }px * var(--pixel-size))`;
                el.style.backgroundPositionY = `calc(-${
                  (spriteAnimation.row ?? 0) * spriteAnimation.height
                }px * var(--pixel-size))`;
                el.title = `frame-${step}`;
              } else {
                pausedSheets++;
              }
            }
          });

          if (spriteAnimation.frame) {
            step = spriteAnimation.frame - 1;
          } else {
            if (pausedSheets === 0) {
              step++;

              if (step >= (spriteAnimation.frames ?? spriteAnimation.cols ?? 1)) {
                step = 0;
              }
            }
          }

          if (spriteAnimation.pause) {
            timeTillNextStepRef.current = 0;
          } else {
            const msTillNextStep = 1000 / (spriteAnimation.fps ?? 10);
            timeTillNextStepRef.current = Date.now() + msTillNextStep;
          }
        }
      }

      animatetionRef.current = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(animatetionRef.current);
    };
  }, []);

  useEffect(() => {
    const newAnimation = new SpriteAnimation(props);
    const spriteAnimation = spriteAnimationRef.current;

    if (
      newAnimation.pause !== spriteAnimation.pause ||
      newAnimation.frame !== spriteAnimation.frame
    ) {
      cancelAnimationFrame(animatetionRef.current);
      animatetionRef.current = 0;
      timeTillNextStepRef.current = Date.now();
      spriteAnimationRef.current.pause = newAnimation.pause;
      spriteAnimationRef.current.frame = newAnimation.frame;
    }
  }, [props.frame, props.pause]);

  const spriteAnimation = spriteAnimationRef.current;

  let content;

  if (spriteAnimation.sheet) {
    content = <SpriteSheet id={spriteAnimation.id} sheet={spriteAnimation.sheet} />;
  } else if (spriteAnimation.sheets) {
    content = spriteAnimation.sheets.map((sheet, index) => (
      <SpriteSheet key={index + sheet.image} id={spriteAnimation.id} order={index} sheet={sheet} />
    ));
  }

  return (
    <div
      className={`relative overflow-hidden`}
      style={{
        ...CSSDimensionsWithPixelSize(
          `${spriteAnimation.width ?? 16}px`,
          `${spriteAnimation.height ?? 32}px`
        )
      }}>
      {content}
    </div>
  );
};

export default Sprite;
