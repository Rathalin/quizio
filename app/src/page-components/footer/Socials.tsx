import { GitHub, LinkedIn, Twitter } from '@mui/icons-material';
import { Stack, useTheme } from '@mui/material';
import Link from 'next/link';
import { ElementType } from 'react';

export default function Socials() {
  return (
    <Stack direction="row" gap={2} flexWrap="wrap">
      <SocialIcon href="https://github.com/rathalin/" icon={GitHub} />
      <SocialIcon
        href="https://www.linkedin.com/in/daniel-flockert-63ba26201/"
        icon={LinkedIn}
      />
      <SocialIcon href="https://twitter.com/Rathalin" icon={Twitter} />
    </Stack>
  );
}

function SocialIcon({ href, icon: Icon }: { href: string; icon: ElementType }) {
  const theme = useTheme();
  const hoverColor = theme.palette.primary.main;

  return (
    <Link href={href}>
      <Icon sx={{ '&:hover': { color: hoverColor } }} />
    </Link>
  );
}
