// a react component that will take a time in seconds, countdown to zero, and then trigger a callback function all using requestAnimationFrame

import { useEffect, useState } from 'react';

export interface ICoolDownProps {
  time: number;
  barColor?: string;
  bgColor?: string;
  update?: (timeLeft: number) => void;
  complete?: () => void;
}

function CoolDown({ time, barColor, bgColor, update, complete }: ICoolDownProps) {
  const [timeLeft, setTimeLeft] = useState(time);

  useEffect(() => {
    let timeLeft = time;
    let timeStamp = Date.now();

    let animation: number | null = null;

    // update function using time delta to diminish timeLeft
    const update = () => {
      const now = Date.now();
      const delta = now - timeStamp;
      timeStamp = now;

      timeLeft -= delta / 1000;

      setTimeLeft(timeLeft);

      if (timeLeft <= 0) {
        animation = null;
      } else {
        animation = requestAnimationFrame(update);
      }
    };

    animation = requestAnimationFrame(update);

    return () => {
      if (animation) {
        cancelAnimationFrame(animation);
      }
    };
  }, [time]);

  useEffect(() => {
    update && update(timeLeft);

    if (timeLeft <= 0) {
      complete && complete();
    }
  }, [timeLeft, update]);

  return (
    <div
      className="w-full h-full relative flex items-center justify-center"
      title={`timeLeft:${timeLeft}`}>
      {/* <div className="absolute inset-0 flex items-center justify-center text-xs">
        Time Left: {timeLeft.toFixed(2)}
      </div> */}
      {/* progress bar */}
      <div className={`w-full h-full ${bgColor ? bgColor : 'bg-gray-400'}`}>
        <div
          className={`w-full h-full ${barColor ? barColor : 'bg-green-500'}`}
          style={{ width: `${(timeLeft / time) * 100}%` }}></div>
      </div>
    </div>
  );
}

export default CoolDown;
