import { KaboomCtx } from 'kaboom';
import KCamera from './camera';

export const Components = (k: KaboomCtx) => {
  return {
    Camera: KCamera(k)
  };
};
