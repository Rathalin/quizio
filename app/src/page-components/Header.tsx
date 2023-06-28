import LogoButton from '@/components/buttons/LogoButton';
import { AppBar, Box, Container, Stack, Toolbar } from '@mui/material';
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
          <Stack
            direction="row"
            justifyContent="center"
            sx={{ flexGrow: 1 }}
            gap={2}
          >
            {/* <LinkButton hrefObserver="/quiz/create" navigateOnClick>
              {'Manage my quizzes'}
            </LinkButton>
            <Divider orientation="vertical" flexItem /> */}
          </Stack>
          <Box>
            <AccountMenu />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
