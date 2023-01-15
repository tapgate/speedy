export interface IGameMode {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  level: string;
  speed: number;
  timer: number;
  color: string;
}

export type IGameModes = IGameMode[];
