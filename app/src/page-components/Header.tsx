import LogoButton from '@/components/buttons/LogoButton';
import { AppBar, Box, Container, Toolbar } from '@mui/material';
import AccountMenu from './dashboard/AccountMenu';

export default function Header() {
  return (
    <AppBar
      position="sticky"
      sx={{ backdropFilter: 'blur(6px)', backgroundColor: 'transparent' }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <LogoButton />
          <Box sx={{ marginLeft: 'auto' }}>
            <AccountMenu />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
