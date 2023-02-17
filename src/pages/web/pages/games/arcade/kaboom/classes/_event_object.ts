import EventEmitter from 'events';

export class EventObject {
  private _eventEmitter = new EventEmitter();

  public on(event: string, listener: (...args: any[]) => void) {
    this._eventEmitter.on(event, listener);
  }

  public off(event: string, listener: (...args: any[]) => void) {
    this._eventEmitter.off(event, listener);
  }

  public emit(event: string, ...args: any[]) {
    this._eventEmitter.emit(event, ...args);
  }
}
