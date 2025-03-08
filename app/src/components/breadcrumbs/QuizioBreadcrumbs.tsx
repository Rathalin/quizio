import HomeIcon from '@mui/icons-material/Home';
import Breadcrumbs, { BreadcrumbsProps } from '@mui/material/Breadcrumbs';
import { grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import Link from 'next/link';
import { PropsWithChildren } from 'react';

type Props = PropsWithChildren<BreadcrumbsProps>;

export function QuizioBreadcrumbs({ children, ...other }: Props) {
  return (
    <Breadcrumbs aria-label="breadcrumb" {...other}>
      <Link href="/">
        <IconButton
          sx={{
            marginRight: -1,
            color: grey[500],
            ':hover': {
              color: grey[300],
            },
          }}
        >
          <HomeIcon />
        </IconButton>
      </Link>
      {children}
    </Breadcrumbs>
  );
}
