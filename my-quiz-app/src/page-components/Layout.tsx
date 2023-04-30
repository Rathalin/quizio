import { Container, Box, Divider } from '@mui/material';
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
      <Container maxWidth="md" sx={{ flex: 1, marginTop: 4 }}>
        <main>{children}</main>
      </Container>
      <footer>
        {/* <Box>
          <Container maxWidth="md" sx={{ flex: 1 }}>
            <Divider />
            <Box
              sx={{
                display: 'flex',
                columnGap: 1,
                padding: 4,
              }}
            >
              <span>Daniel Flockert</span>
              <span>©</span>
              <span>{new Date().getFullYear()}</span>
            </Box>
          </Container>
        </Box> */}
      </footer>
    </Box>
  );
}
