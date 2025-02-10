import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export function MyQuizzesTablePlaceholder() {
  return (
    <Stack>
      <Stack direction="row" sx={{ paddingInline: 2, marginTop: 1, marginBottom: 2 }}>
        <Box sx={{ width: '50%' }}>
          <Skeleton width="20%" height="2rem" />
        </Box>
        <Box sx={{ width: '12.5%' }}>
          <Skeleton width="40%" height="2rem" />
        </Box>
        <Box sx={{ width: '12.5%' }}>
          <Skeleton width="60%" height="2rem" />
        </Box>
        <Box sx={{ width: '12.5%' }}>
          <Skeleton width="60%" height="2rem" />
        </Box>
        <Box sx={{ width: '12.5%' }}>
          <Skeleton width="50%" height="2rem" />
        </Box>
      </Stack>
      <Divider />
      <Stack sx={{ paddingInline: 2, marginBlock: -1 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Box key={i}>
            <Stack direction="row">
              <Box sx={{ width: '50%' }}>
                <Stack direction="row" gap={2}>
                  <Skeleton width={112.5} height={75 / 0.6} />
                  <Stack marginTop={3} flex={1}>
                    <Skeleton width="30%" height="2rem" />
                    <Skeleton width="50%" height="2rem" />
                  </Stack>
                </Stack>
              </Box>
              <Box sx={{ width: '12.5%', marginTop: 3 }}>
                <Skeleton width="60%" height="2rem" />
              </Box>
              <Box sx={{ width: '12.5%', marginTop: 2.6 }}>
                <Skeleton width="80%" height="3rem" />
              </Box>
              <Box sx={{ width: '12.5%', marginTop: 2.6 }}>
                <Skeleton width="80%" height="3rem" />
              </Box>
              <Box sx={{ width: '12.5%', marginTop: 3 }}>
                <Skeleton width="60%" height="2rem" />
              </Box>
            </Stack>
            <Divider />
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
