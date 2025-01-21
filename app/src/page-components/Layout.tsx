import { Container, Box } from '@mui/material';
import { PropsWithChildren } from 'react';
import Header from './Header';
import Footer from './footer/Footer';

type LayoutProps = PropsWithChildren<{}>;

export default function Layout({ children }: LayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
        color: 'text.primary'
      }}
    >
      <Header />
      <Container maxWidth="lg" sx={{ flex: 1, marginTop: 4 }}>
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
  