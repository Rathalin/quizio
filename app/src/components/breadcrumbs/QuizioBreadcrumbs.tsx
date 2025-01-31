import HomeOutlined from '@mui/icons-material/HomeOutlined';
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
          <HomeOutlined />
        </IconButton>
      </Link>
      {children}
    </Breadcrumbs>
  );
}
