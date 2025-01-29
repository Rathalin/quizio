import Typography from '@mui/material/Typography';

export function BuildNumber() {
  const buildNumber = process.env.NEXT_PUBLIC_BUILD_NUMBER;
  if (buildNumber == null) {
    return null;
  }
  return <Typography color="textDisabled">{buildNumber}</Typography>;
}
