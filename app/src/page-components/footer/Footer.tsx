import { Container, Paper, Stack, SxProps, Theme } from '@mui/material';
import MadeWithLove from './MadeWithLove';
import Socials from './Socials';
import Legal from './Legal';

type FooterProps = { sx: SxProps<Theme> };

export default function Footer({ sx }: FooterProps) {
  return (
    <Paper
      sx={{
        borderRadius: 0,
        padding: 3,
        ...sx,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          justifyContent="space-between"
          gap={4}
        >
          <MadeWithLove />
          <Socials />
          <Legal />
        </Stack>
      </Container>
    </Paper>
  );
}
