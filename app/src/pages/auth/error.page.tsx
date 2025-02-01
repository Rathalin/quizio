import { getMessages } from '@/utilities/getMessages';
import Box from '@mui/material/Box';
import { GetStaticProps } from 'next';

export const getStaticProps: GetStaticProps = async (ctx) => {
  const messages = await getMessages(ctx.locale, []);

  return {
    props: {
      messages,
    },
  };
};

export default function ErrorPage() {
  return <Box>Auth Error</Box>;
}
