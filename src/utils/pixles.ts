export function CSSDimensionsWithPixelSize(
  width: string,
  height: string
): { width: string; height: string } {
  return {
    width: `calc(${width} * var(--pixel-size))`,
    height: `calc(${height} * var(--pixel-size))`
  };
}
