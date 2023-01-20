export const timeToStamp = (time: number) => {
  return `${Math.floor(time / (1000 * 60)) % 60}m  ${Math.floor(time / 1000) % 60}s`;
};

export const timeCollapse = (time: number) => {
  if (time > 1000 * 60 * 60) {
    const perc = Math.floor((Math.floor(time / (1000 * 60 * 60)) % 60) / 60);
    return `${Math.floor(time / (1000 * 60 * 60))}${perc > 0 ? `.${perc}` : ''}h`;
  } else if (time > 1000 * 60) {
    const perc = Math.floor((Math.floor(time / 1000) % 60) / 60);
    return `${Math.floor(time / (1000 * 60))}${perc > 0 ? `.${perc}` : ''}m`;
  } else if (time > 1000) {
    const perc = Math.floor((time % 1000) / 1000);
    return `${Math.floor(time / 1000)}${perc > 0 ? `.${perc}` : ''}s`;
  } else {
    return `${time}`;
  }
};
