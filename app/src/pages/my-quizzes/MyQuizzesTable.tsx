import { GetMyQuizzesResponseQuiz } from '@/api-client';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { QuizColumn } from './QuizColumn';
import { VisibilityColumn } from './VisibilityColumn';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import LinkButton from '@/components/LinkButton';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useDateTimeFormatter } from '@/utilities/useDateFormatter';

type Props = {
  quizzes: GetMyQuizzesResponseQuiz[];
};

export function MyQuizzesTable({ quizzes }: Props) {
  const theme = useTheme();
  const t = useTranslations('myQuizzes');
  const dateTimeFormatter = useDateTimeFormatter();
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  const columnHelper = createColumnHelper<GetMyQuizzesResponseQuiz>();

  const columns = [
    columnHelper.accessor('uuid', {
      header: () => t('table.column.quiz.header'),
      cell: (props) => {
        const uuid = props.getValue();
        const { imageUrl, title, description } = props.row.original;
        return (
          <QuizColumn
            uuid={uuid}
            title={title}
            description={description}
            imageUrl={imageUrl}
            isHovered={hoveredRowId === uuid}
          />
        );
      }
    }),
    columnHelper.accessor('isPublished', {
      header: () => t('table.column.isPublished.header'),
      cell: (props) => (
        <Box sx={{ marginTop: -1 }}>
          <VisibilityColumn uuid={props.row.original.uuid} isPublished={props.getValue()} size="small" />
        </Box>
      )
    }),
    columnHelper.accessor('createdAt', {
      header: () => t('table.column.createdAt.header'),
      cell: (props) => (
        <Stack>
          <Typography variant="body2">{dateTimeFormatter.format(new Date(props.getValue()))}</Typography>
          <Typography variant="body2" color="textSecondary">
            {t('table.column.createdAt.cell.label')}
          </Typography>
        </Stack>
      )
    }),
    columnHelper.accessor('updatedAt', {
      header: () => t('table.column.updatedAt.header'),
      cell: (props) => (
        <Stack>
          <Typography variant="body2">{dateTimeFormatter.format(new Date(props.getValue()))}</Typography>
          <Typography variant="body2" color="textSecondary">
            {t('table.column.updatedAt.cell.label')}
          </Typography>
        </Stack>
      )
    }),
    columnHelper.accessor('playCount', {
      header: () => t('table.column.playCount.header'),
      cell: (props) => (
        <Stack>
          <Typography noWrap>
            {t.rich('table.column.playCount.label', {
              count: props.getValue(),
              b: (chunks) => (
                <Typography component="span" variant="body1">
                  {chunks}
                </Typography>
              ),
              secondary: (chunks) => (
                <Typography component="span" color="textSecondary" variant="body2" noWrap>
                  {chunks}
                </Typography>
              )
            })}
          </Typography>
          <LinkButton
            hrefObserver={`/my-quizzes/${props.row.original.uuid}/trends`}
            navigateOnClick
            startIcon={<TimelineIcon />}
          >
            {t('table.column.playCount.trendsButton.label')}
          </LinkButton>
        </Stack>
      )
    })
  ];

  const table = useReactTable({
    data: quizzes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.uuid
  });

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onMouseEnter={() => setHoveredRowId(row.id)}
                onMouseLeave={() => setHoveredRowId(null)}
                sx={{
                  verticalAlign: 'top',
                  ':hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export function MyQuizzesTableSkeleton() {
  return (
    <Box sx={{ overflowX: 'auto', overflowY: 'hidden' }}>
      <Stack sx={{ minWidth: '700px' }}>
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
          {Array.from({ length: 3 }).map((_, i) => (
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
    </Box>
  );
}
