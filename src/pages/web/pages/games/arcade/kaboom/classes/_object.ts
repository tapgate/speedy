import { CompList, GameObj } from 'kaboom';
import { IKaboomCtxExt } from '../shared/types';

export class GameObject {
  protected k: IKaboomCtxExt;
  private _compList: CompList<any>;
  private _object: GameObj | undefined;
  public get object() {
    return this._object;
  }

  constructor(k: IKaboomCtxExt, compList: CompList<any>) {
    this.k = k;
    this._compList = compList;
  }

  static generateSptes(k: IKaboomCtxExt) {
    // Override this method to generate sprites
  }

  init(level: GameObj<any>): GameObj {
    this._object = level.spawn(this._compList, level.spawnPoint);
    return this._object!;
  }

  add(compList: any[]): GameObj | undefined {
    if (this.object) {
      return this.object.add(compList);
    }

    return undefined;
  }

  destroy(obj?: GameObj) {
    if (obj) {
      this.k.destroy(obj);
    } else {
      if (this.object) {
        this.object.destroy();
      }
    }
  }
}
