import { GetServerSideProps } from 'next';
import { useCreatePasskeyMutation } from './useCreatePasskeyMutation';
import { getMessages } from '@/utilities/getMessages';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const messages = await getMessages(ctx.locale, []);

  return {
    props: {
      messages,
    },
  };
};

export default function PasskeyPage() {
  const { mutate: createPasskey, status, data, error } = useCreatePasskeyMutation();

  return (
    <Box>
      <Button variant="contained" onClick={() => createPasskey()}>
        {'Create passkey'}
      </Button>
      <Typography>{status}</Typography>
      <Typography>{JSON.stringify(data)}</Typography>
      <Typography color="error">{error?.message}</Typography>
    </Box>
  );
}
