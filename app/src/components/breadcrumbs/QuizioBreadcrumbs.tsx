import HomeIcon from '@mui/icons-material/Home';
import Breadcrumbs, { BreadcrumbsProps } from '@mui/material/Breadcrumbs';
import IconButton from '@mui/material/IconButton';
import Link from 'next/link';
import { PropsWithChildren } from 'react';

type Props = PropsWithChildren<BreadcrumbsProps>;

export function QuizioBreadcrumbs({ children, ...other }: Props) {
  return (
    <Breadcrumbs aria-label="breadcrumb" {...other}>
      <Link href="/">
        <IconButton
          color="inherit"
          sx={{
            marginRight: -1,
            opacity: 0.8,
          }}
        >
          <HomeIcon />
        </IconButton>
      </Link>
      {children}
    </Breadcrumbs>
  );
}
