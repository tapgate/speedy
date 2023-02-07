import React from 'react';

interface ITriggerProps {
  id: string;
  width: number;
  color: string;
  value: string;
}

const Trigger: React.FC<ITriggerProps> = ({ id, width, color, value }) => {
  return (
    <div
      id={id}
      className={`h-full border-2 border-black bg-${color}-500 mx-1 rounded-md`}
      style={{
        width: `calc(${width}px * var(--pixel-size)))`
      }}>
      <div className="relative w-full h-full">
        <div className="absolute z-10 bottom-[100%] w-full flex justify-center text-white text-xl hiden">
          {value}
        </div>
      </div>
    </div>
  );
};

export default Trigger;
