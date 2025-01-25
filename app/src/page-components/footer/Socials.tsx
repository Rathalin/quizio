import Link from 'next/link';
import { PropsWithChildren } from 'react';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

export default function Socials() {
  return (
    <Stack direction="row" gap={2} flexWrap="wrap">
      <SocialIcon href="https://flockert.at/">
        <AccountBoxIcon />
      </SocialIcon>
      <SocialIcon href="https://github.com/rathalin/">
        <GitHubIcon />
      </SocialIcon>
      <SocialIcon href="https://www.linkedin.com/in/daniel-flockert-63ba26201/">
        <LinkedInIcon />
      </SocialIcon>
      <SocialIcon href="https://twitter.com/Rathalin">
        <TwitterIcon />
      </SocialIcon>
    </Stack>
  );
}

function SocialIcon({ href, children }: PropsWithChildren<{ href: string }>) {
  const theme = useTheme();
  const hoverColor = theme.palette.primary.main;

  return (
    <Link href={href}>
      <Box sx={{ '&:hover': { color: hoverColor } }}>{children}</Box>
    </Link>
  );
}
