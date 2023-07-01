import LogoButton from '@/components/buttons/LogoButton';
import { AppBar, Container, Grid, Stack, Toolbar } from '@mui/material';
import AccountMenu from './dashboard/AccountMenu';
import LinkButton from '@/components/LinkButton';
import { useSession } from 'next-auth/react';
import { useIsMobile } from '@/custom-hooks/useIsMobile';
import { ThemeSwitch } from '@/components/buttons/ThemeSwitch';

export default function Header() {
  const session = useSession();
  const isMobile = useIsMobile();

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
            >
              {session.status === 'authenticated' && (
                <Stack
                  direction="row"
                  justifyContent="center"
                  sx={{ flexGrow: 1 }}
                  gap={2}
                >
                  <LinkButton
                    hrefObserver="/quiz/create"
                    navigateOnClick
                    iconSide="left"
                  >
                    {isMobile ? 'Create' : 'Create your own quiz'}
                  </LinkButton>
                </Stack>
              )}
            </Grid>
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
