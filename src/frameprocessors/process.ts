export const processWorkletColors = (colors: Record<'red' | 'green' | 'blue', number>[], callback: (_: any) => any) => {
  if (!colors?.length) {
    return;
  }

  callback(colors.map(({ red, green, blue }) => [red, green, blue]));
};

export const processWorkletBounds = (bounds: string[], callback: (_: any) => any) => {
  if (!bounds?.length) {
    return;
  }

  callback(bounds);
};
