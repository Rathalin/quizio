import { AccountBox, GitHub, LinkedIn, Twitter } from '@mui/icons-material';
import { Box, Stack, useTheme } from '@mui/material';
import Link from 'next/link';
import { PropsWithChildren } from 'react';

export default function Socials() {
  return (
    <Stack direction="row" gap={2} flexWrap="wrap">
      <SocialIcon href="https://flockert.at/">
        <AccountBox />
      </SocialIcon>
      <SocialIcon href="https://github.com/rathalin/">
        <GitHub />
      </SocialIcon>
      <SocialIcon href="https://www.linkedin.com/in/daniel-flockert-63ba26201/">
        <LinkedIn />
      </SocialIcon>
      <SocialIcon href="https://twitter.com/Rathalin">
        <Twitter />
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
