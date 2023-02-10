import { KaboomCtx, CompList } from 'kaboom';
import uuid from 'react-uuid';

export class GameObject {
  protected k: KaboomCtx;

  public id: string;

  private _object: any;

  public get object() {
    return this._object;
  }

  constructor(k: KaboomCtx) {
    this.k = k;
    this.id = uuid();
  }

  load(compList: CompList<any>) {
    const gameObj = this.k.add(compList);

    this._object = gameObj;
  }

  destroy() {
    this.k.destroy(this._object);
  }
}
