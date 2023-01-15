
export const timeToStamp = (time: number) => {
return `${(Math.floor(time/(1000*60))%60)}m  ${(Math.floor(time/1000)%60)}s`;
}