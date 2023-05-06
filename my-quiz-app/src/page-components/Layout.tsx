import { Container, Box } from '@mui/material';
import { PropsWithChildren } from 'react';

type LayoutProps = PropsWithChildren<{}>;

export default function Layout({ children }: LayoutProps) {
  const decorationHeight = '0px';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header>
        <Box
          sx={{
            height: decorationHeight,
            background: 'linear-gradient(270deg, #ae7f2d 0%, #95da94 100%)',
          }}
        ></Box>
      </header>
      <Container maxWidth="lg" sx={{ flex: 1, marginTop: 4 }}>
        <main>{children}</main>
      </Container>
      <footer></footer>
    </Box>
  );
}
