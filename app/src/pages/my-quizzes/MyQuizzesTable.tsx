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
import { dateTimeFormatter } from '@/utilities/intlFormats';
import Button from '@mui/material/Button';
import PublicIcon from '@mui/icons-material/Public';
import PublicOffIcon from '@mui/icons-material/PublicOff';
import { useState } from 'react';
import { QuizColumn } from './QuizColumn';

type Props = {
  quizzes: GetMyQuizzesResponseQuiz[];
};

export function MyQuizzesTable({ quizzes }: Props) {
  const t = useTranslations('myQuizzes');
  const theme = useTheme();
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
      },
    }),
    columnHelper.accessor('isPublished', {
      header: () => t('table.column.isPublished.header'),
      cell: (props) => (
        <Box sx={{ marginTop: -1 }}>
          {props.getValue() ? (
            <Button startIcon={<PublicIcon />} size="small" color="inherit">
              {t('table.column.isPublished.option.isPublished')}
            </Button>
          ) : (
            <Button startIcon={<PublicOffIcon />} size="small" color="inherit">
              {t('table.column.isPublished.option.notPublished')}
            </Button>
          )}
        </Box>
      ),
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
      ),
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
      ),
    }),
    columnHelper.accessor('playCount', {
      header: () => t('table.column.playCount.header'),
      cell: (props) => (
        <Stack>
          <Typography variant="body2" noWrap>
            {t.rich('table.column.playCount.label', {
              count: props.getValue(),
              span: (chunks) => <Box component="span">{chunks}</Box>,
              spanSecondary: (chunks) => (
                <Typography component="span" color="textSecondary" variant="body2" noWrap>
                  {chunks}
                </Typography>
              ),
            })}
          </Typography>
        </Stack>
      ),
    }),
  ];

  const table = useReactTable({
    data: quizzes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow) => originalRow.uuid,
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
                    backgroundColor: theme.palette.action.hover,
                  },
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
