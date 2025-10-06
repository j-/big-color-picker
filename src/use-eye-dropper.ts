import { useCallback, useMemo } from 'react';

export const useEyeDropper = () => {
  const eyeDropper = useMemo(() => {
    if (!window.EyeDropper) {
      return null;
    }

    return new window.EyeDropper();
  }, []);

  const open = useCallback(
    async (options?: ColorSelectionOptions) => {
      if (!eyeDropper) {
        throw new Error('Not supported');
      }
      
      return eyeDropper.open(options);
    },
    [eyeDropper]
  );

  const value = useMemo(() => ({
    eyeDropper,
    open,
  }), [
    eyeDropper,
    open,
  ]);

  return value;
};
