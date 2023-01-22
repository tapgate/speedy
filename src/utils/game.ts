import { IGameLevel } from '../models/game';
import uuid from 'react-uuid';

export const speedToPointsArray = (speed: number): number[][] => {
  const pointsArray: number[][] = new Array(10).fill(0).map(() => [0, 0]);

  pointsArray.forEach((_, index) => {
    const clockSpeed = Math.floor((speed ?? 1) * ((10 - index) / 10));
    const points = Math.floor((10 * (index / 1) + 10) ** 2 / 100);

    pointsArray[index] = [clockSpeed, points];
  });

  return pointsArray;
};

export const clockSpeedPoint = (speed: number, maxSpeed: number): number => {
  const pointsArray = speedToPointsArray(maxSpeed);

  // based on speed get closest clock speed
  const posibilities = pointsArray
    .map((curr) => {
      return speed <= curr[0] ? curr[0] : -1;
    })
    .filter((x) => x !== -1);

  const closestClockSpeed = posibilities.pop();

  // based on closest clock speed get points
  const points = pointsArray.find((point) => point[0] === closestClockSpeed)?.pop();

  return points ?? 0;
};

export enum GameModeEnum {
  Arcade = 'arcade',
  Classic = 'classic'
}

export enum GameLevelNameEnum {
  Easy = 'easy',
  Fast = 'fast',
  Pro = 'pro',
  hero = 'hero'
}

export enum GameStateEnum {
  Interim = 'interim',
  CountDown = 'countdown',
  Waiting = 'waiting',
  GameOver = 'gameover'
}

export enum GameEventEnum {
  Hit = 'hit',
  Stop = 'stop'
}

export interface IGameData {
  level: IGameLevel;
  speed: number;
  score: number;
  lives: number;
  maxLives: number;
  clockedTime: number;
  averageTime: number;
  bestTime: number;
  streak: number;
  timeLog: number[];
  timerMin: number;
  timerMax: number;
  timer: number;
  timeLeft: number;
  timeWaiting: number;
  stopWaiting: boolean;
  state: GameStateEnum;
  pointsArray: number[][];
}

export class Game {
  private _id!: string;

  private _level!: IGameLevel;
  private _speed!: number;
  private _score!: number;

  private _lives!: number;
  private _maxLives!: number;

  private _clockedTime!: number;
  private _averageTime!: number;
  private _bestTime!: number;
  private _streak!: number;

  private _timeLog!: number[];

  private _timerMin!: number;
  private _timerMax!: number;
  private _timer!: number;

  private _timeLeft!: number;
  private _timeWaiting!: number;
  private _stopWaiting!: boolean;

  private _state!: GameStateEnum;

  private _pointsArray!: number[][];

  private _timeStamp!: number;
  private _timeDelta!: number;

  constructor(mode: IGameLevel) {
    this.setLevel(mode);
  }

  public get state() {
    return this._state;
  }

  public get level() {
    return this._level;
  }

  public get speed() {
    return this._speed;
  }

  public get pointsArray() {
    return this._pointsArray;
  }

  public get maxLives() {
    return this._maxLives;
  }

  public get lives() {
    return this._lives;
  }

  public get score() {
    return this._score;
  }

  public get streak() {
    return this._streak;
  }

  public get timeLeft() {
    return this._timeLeft;
  }

  public get clockedTime() {
    return this._clockedTime;
  }

  public get averageTime() {
    return this._averageTime;
  }

  public get bestTime() {
    return this._bestTime;
  }

  public get data(): IGameData {
    return {
      level: this._level,
      speed: this._speed,
      score: this._score,
      lives: this._lives,
      maxLives: this._maxLives,
      clockedTime: this._clockedTime,
      averageTime: this._averageTime,
      bestTime: this._bestTime,
      streak: this._streak,
      timeLog: this._timeLog,
      timerMin: this._timerMin,
      timerMax: this._timerMax,
      timer: this._timer,
      timeLeft: this._timeLeft,
      timeWaiting: this._timeWaiting,
      stopWaiting: this._stopWaiting,
      state: this._state,
      pointsArray: this._pointsArray
    };
  }

  setLevel(mode: IGameLevel) {
    this._id = uuid();
    this._level = mode;
    this._speed = mode.speed;
    this._timerMin = Math.round(mode.timer * 0.1);
    this._timerMax = mode.timer;
    this._pointsArray = speedToPointsArray(this._speed);

    this.reset();

    this._state = GameStateEnum.Interim;
  }

  resetTimer() {
    this._timer = this._timerMax;
    //Math.floor(Math.random() * (this._timerMax - this._timerMin + 1)) + this._timerMin;
    this._timeLeft = this._timer;
  }

  reset() {
    this._score = 0;

    this._maxLives = 5;
    this._lives = this._maxLives;

    this._clockedTime = 0;
    this._averageTime = 0;
    this._bestTime = 0;
    this._timeLog = [];

    this._streak = 0;
    this._timeLeft = 0;
    this._timeWaiting = 0;
    this._stopWaiting = false;
    this._state = GameStateEnum.Interim;

    this.resetTimer();
  }

  countdown() {
    // console.log('countdown');

    if (this._timeLeft > 0) {
      this._timeLeft -= 1 * (this._timeDelta / 1000);
      return;
    }

    this._state = GameStateEnum.Waiting;
  }

  async wait() {
    // console.log('wait');

    if (!this._stopWaiting) {
      this._timeWaiting += this._timeDelta;
      return;
    }
  }

  public async nextRound() {
    this._stopWaiting = false;
    this._timeWaiting = 0;
    this._state = GameStateEnum.CountDown;
    this.resetTimer();

    console.log('next round');
  }

  public update() {
    this._timeDelta = Date.now() - this._timeStamp;
    this._timeStamp = Date.now();

    switch (this._state) {
      case GameStateEnum.Interim:
        this.nextRound();
        break;
      case GameStateEnum.CountDown:
        this.countdown();
        break;
      case GameStateEnum.Waiting:
        this.wait();
        break;
      case GameStateEnum.GameOver:
        break;
    }
  }

  public trigger(trigger: GameEventEnum) {
    if (!this.trigger) return;

    console.log('trigger', trigger);

    switch (trigger) {
      case GameEventEnum.Stop:
        this._state = GameStateEnum.GameOver;
        break;
      case GameEventEnum.Hit:
        if (this._state === GameStateEnum.GameOver) {
          this.reset();
          this._state = GameStateEnum.Interim;
          return;
        }

        if (this._state === GameStateEnum.Waiting) {
          console.log('hit');
          this._state = GameStateEnum.Interim;

          this._stopWaiting = true;

          this._clockedTime = this._timeWaiting;

          if (this._bestTime === 0 || this._clockedTime < this._bestTime) {
            this._bestTime = this._clockedTime;
          }

          this._timeLog.push(this._clockedTime);

          this._averageTime = Math.round(
            this._timeLog.reduce((a, b) => a + b, 0) / this._timeLog.length
          );

          this._score += clockSpeedPoint(this._clockedTime, this._speed);

          if (this._score > 0) {
            this._streak++;
          } else {
            this._streak = 0;
            this._lives--;

            if (this._lives === 0) {
              this._state = GameStateEnum.GameOver;
            }
          }

          return;
        }

        console.log('miss');
        this._streak = 0;
        this._lives--;

        if (this._lives === 0) {
          this._state = GameStateEnum.GameOver;
        }

        this.resetTimer();
        break;
    }
  }
}
