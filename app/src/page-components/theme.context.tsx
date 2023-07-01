import { PaletteMode } from '@mui/material';
import { createContext, PropsWithChildren, useContext } from 'react';

const ColorModeContext = createContext({
  mode: 'dark' as PaletteMode,
  toggleColorMode: () => {},
});

export function ColorModeProvider({
  mode,
  toggleColorMode,
  children,
}: PropsWithChildren<{
  mode: PaletteMode;
  toggleColorMode: () => void;
}>) {
  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  return useContext(ColorModeContext);
}
