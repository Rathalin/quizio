import LogoButton from '@/components/buttons/LogoButton';
import AccountMenu from './dashboard/AccountMenu';
import { ThemeSwitch } from '@/components/buttons/ThemeSwitch';
import { useColorMode } from './theme.context';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Grid from '@mui/material/Grid';

export default function Header() {
  const { mode } = useColorMode();
  return (
    <AppBar
      position="sticky"
      sx={{
        backdropFilter: 'blur(6px)',
        backgroundColor: mode === 'light' ? '#0000001a' : 'transparent',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Grid container>
            <Grid
              item
              xs={4}
              sx={{
                display: 'flex',
                justifyContent: 'start',
                alignItems: 'center',
              }}
            >
              <LogoButton />
            </Grid>
            <Grid
              item
              xs={4}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            ></Grid>
            <Grid
              item
              xs={4}
              sx={{
                display: 'flex',
                justifyContent: 'end',
                alignItems: 'center',
              }}
              gap={1}
            >
              <ThemeSwitch />
              <AccountMenu />
            </Grid>
          </Grid>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
