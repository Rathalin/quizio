import { Container, Box } from '@mui/material';
import { PropsWithChildren } from 'react';
import Header from './Header';

type LayoutProps = PropsWithChildren<{}>;

export default function Layout({ children }: LayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 10,
      }}
    >
      <Header />
      <Container maxWidth="lg" sx={{ flex: 1, marginTop: 4 }}>
        <main>{children}</main>
      </Container>
      <footer></footer>
    </Box>
  );
}
