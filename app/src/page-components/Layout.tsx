import LogoButton from '@/components/buttons/LogoButton';
import { Container, Box, AppBar, Toolbar } from '@mui/material';
import { PropsWithChildren } from 'react';
import AccountMenu from './AccountMenu';

type LayoutProps = PropsWithChildren<{}>;

export default function Layout({ children }: LayoutProps) {
  // const decorationHeight = '2px';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 10,
      }}
    >
      {/* <Box
        sx={{
          height: decorationHeight,
          background: 'linear-gradient(270deg, #ae7f2d 0%, #95da94 100%)',
        }}
      ></Box> */}
      <AppBar position="sticky">
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <LogoButton />
            <Box sx={{ marginLeft: 'auto' }}>
              <AccountMenu />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="lg" sx={{ flex: 1, marginTop: 6 }}>
        <main>{children}</main>
      </Container>
      <footer></footer>
    </Box>
  );
}
