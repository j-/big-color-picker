import { type FC, useEffect, useMemo, useRef } from 'react';
import useSessionStorageState from 'use-session-storage-state';
import { RootBackgroundColor } from './RootBackgroundColor';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useEyeDropper } from './use-eye-dropper';
import { alpha, createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import Stack from '@mui/material/Stack';

export const App: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [currentColor, setCurrentColor] = useSessionStorageState(
    'currentColor',
    { defaultValue: '#09c' },
  );

  const { eyeDropper, open } = useEyeDropper();
  const theme = useTheme();

  const innerTheme = useMemo(() => {
    const contrastColor = theme.palette.getContrastText(
      currentColor,
    );

    return createTheme({
      palette: {
        primary: {
          main: contrastColor,
        },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'initial',
              backgroundColor: alpha(contrastColor, 0.2),
              color: contrastColor,
              '&:hover': {
                backgroundColor: alpha(contrastColor, 0.3),
              },
            },
          },
        },
      },
    });
  }, [theme, currentColor]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const width = screen.width;
    const height = screen.height;

    video.width = width;
    video.height = height;

    const canvas = document.createElement('canvas')!;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = currentColor;
    ctx.fillRect(0, 0, width, height);

    const stream = canvas.captureStream(0);
    const [track] = stream.getVideoTracks() as CanvasCaptureMediaStreamTrack[];
    track.requestFrame();

    video.srcObject = new MediaStream([track]);
    video.preload = 'metadata';
    video.load();
    video.play();
  }, [currentColor]);

  return (
    <>
      <RootBackgroundColor color={currentColor} />
      <meta name="theme-color" content={currentColor} />

      <Box sx={{
        height: '100svh',
        display: 'flex',
        alignItems: 'flex-end',
      }}>
        <Stack direction="row" gap={2} m={2}>
          <ThemeProvider theme={innerTheme}>
            {eyeDropper && (
              <Button
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    const { sRGBHex } = await open();
                    setCurrentColor(sRGBHex);
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                Pick color
              </Button>
            )}

            {
              document.fullscreenEnabled &&
              typeof document.documentElement.requestFullscreen
                === 'function' &&
              (
                <Button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      if (document.fullscreenElement) {
                        await document.exitFullscreen();
                      } else {
                        await document.documentElement.requestFullscreen({
                          navigationUI: 'hide',
                        });
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  Full screen
                </Button>
              )
            }

            <Button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                try {
                  const video = videoRef.current as HTMLVideoElement & {
                    webkitEnterFullscreen: () => void;
                  };
                  if (!video) throw new Error('Video ref was empty');

                  if (document.fullscreenElement) {
                    await document.exitFullscreen();
                    alert('Exited fullscreen');
                  } else if (
                    typeof video.requestFullscreen === 'function'
                  ) {
                    await video.requestFullscreen({
                      navigationUI: 'hide',
                    });
                    alert('Requested fullscreen');
                  } else if (
                    typeof video.webkitEnterFullscreen === 'function'
                  ) {
                    video.webkitEnterFullscreen();
                    alert('Webkit entered fullscreen');
                  }
                } catch (err) {
                  alert(`Error requesting full screen:\n\n${err}`);
                }
              }}
            >
              Full screen (video)
            </Button>
          </ThemeProvider>
        </Stack>
      </Box>

      <Box sx={visuallyHidden}>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          controls={false}
          style={{
            backgroundColor: currentColor,
          }}
        />
      </Box>
    </>
  )
};
