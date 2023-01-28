export function CSSDimensionsWithPixelSize(
  width: string,
  height: string
): { width: string; height: string } {
  return {
    width: `calc(${width} * var(--pixel-size))`,
    height: `calc(${height} * var(--pixel-size))`
  };
}

export function CSSPositionPixelSize(left: string, top: string): { left: string; top: string } {
  return {
    left: `calc(${left} * var(--pixel-size))`,
    top: `calc(${top} * var(--pixel-size))`
  };
}
