import { useEffect } from 'react';
import { AnimationController } from '../controllers/AnimationController';

export const useAnimation = (): typeof AnimationController => {
  useEffect(() => {
    return () => AnimationController.removeAll();
  }, []);

  return AnimationController;
};
