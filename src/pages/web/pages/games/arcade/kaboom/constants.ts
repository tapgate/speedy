export const mapTile = {
  width: 16,
  height: 16
};

export enum IGameStateEnum {
  STARTING = 'starting',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game-over'
}

export enum IGameSceneEnum {
  GAME_OVER = 'game-over',
  GAME = 'game'
}
