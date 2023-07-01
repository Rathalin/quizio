import LogoButton from '@/components/buttons/LogoButton';
import { AppBar, Container, Grid, Toolbar } from '@mui/material';
import AccountMenu from './dashboard/AccountMenu';
import { ThemeSwitch } from '@/components/buttons/ThemeSwitch';

export default function Header() {
  return (
    <AppBar
      position="sticky"
      sx={{ backdropFilter: 'blur(6px)', backgroundColor: 'transparent' }}
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
