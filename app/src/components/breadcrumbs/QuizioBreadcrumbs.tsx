import HomeIcon from '@mui/icons-material/Home';
import { grey } from '@mui/material/colors';
import Breadcrumbs, { BreadcrumbsProps } from '@mui/material/Breadcrumbs';
import IconButton from '@mui/material/IconButton';
import Link from 'next/link';
import { PropsWithChildren } from 'react';

type Props = PropsWithChildren<BreadcrumbsProps>;

export function QuizioBreadcrumbs({ children, ...other }: Props) {
  return (
    <Breadcrumbs aria-label="breadcrumb" {...other}>
      <Link href="/">
        <IconButton sx={{ color: grey[600], marginRight: -1 }}>
          <HomeIcon />
        </IconButton>
      </Link>
      {children}
    </Breadcrumbs>
  );
}
