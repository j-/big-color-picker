import type { FC } from 'react';

export type RootBackgroundColorProps = {
  color: string;
};

export const RootBackgroundColor: FC<
  RootBackgroundColorProps
> = ({ color }) => (
  <style dangerouslySetInnerHTML={{
    __html: `
      :root {
        background-color: ${color};
      }
      body {
        background-color: transparent;
      }
    `,
  }} />
);
