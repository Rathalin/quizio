import { PropsWithChildren } from 'react';
import Header from './Header';
import Footer from './footer/Footer';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

type LayoutProps = PropsWithChildren<{}>;

export default function Layout({ children }: LayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Header />
      <Container maxWidth="lg" sx={{ flex: 1, marginTop: 2 }}>
        <main>{children}</main>
      </Container>
      <Footer
        sx={{
          marginTop: 10,
        }}
      />
    </Box>
  );
}
