import MadeWithLove from './MadeWithLove';
import Socials from './Socials';
import Legal from './Legal';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import { SxProps, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';

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
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(auto-fit, minmax(200px, 1fr))',
            },
            gap: 6,
          }}
        >
          <Box sx={{ justifySelf: { xs: 'start', md: 'start' } }}>
            <MadeWithLove />
          </Box>
          <Box sx={{ justifySelf: { xs: 'start', md: 'center' } }}>
            <Socials />
          </Box>
          <Box sx={{ justifySelf: { xs: 'start', md: 'end' } }}>
            <Legal />
          </Box>
        </Box>
      </Container>
    </Paper>
  );
}
