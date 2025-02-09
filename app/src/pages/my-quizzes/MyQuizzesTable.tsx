import { GetMyQuizzesResponseQuiz } from '@/api-client';
import { useColorMode } from '@/page-components/theme.context';
import { prefixWithBackendUrl } from '@/utilities/urlUtils';
import Box from '@mui/material/Box';
import { darken, lighten, useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import ImageIcon from '@mui/icons-material/Image';

type Props = {
  quizzes: GetMyQuizzesResponseQuiz[];
};

export function MyQuizzesTable({ quizzes }: Props) {
  const t = useTranslations('myQuizzes.table');
  const theme = useTheme();
  const { mode } = useColorMode();

  const columnHelper = createColumnHelper<GetMyQuizzesResponseQuiz>();

  const columns = [
    columnHelper.accessor('imageUrl', {
      header: () => t('column.imageUrl.header'),
      cell: (props) => {
        const imageUrl = props.getValue();
        return imageUrl != null ? (
          <Image
            src={prefixWithBackendUrl(imageUrl)}
            alt="QuizImage"
            width={150}
            height={100}
            style={{
              objectFit: 'cover',
              width: 150,
              height: 100,
            }}
            priority
            unoptimized
          />
        ) : (
          <Box
            sx={{
              minHeight: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                mode === 'light'
                  ? lighten(theme.palette.secondary.light, 0.7)
                  : darken(theme.palette.secondary.light, 0.7),
            }}
          >
            <ImageIcon fontSize="large" />
          </Box>
        );
      },
    }),
    columnHelper.accessor('title', {
      header: () => t('column.title.header'),
      cell: (props) => props.getValue(),
    }),
    columnHelper.accessor('description', {
      header: () => t('column.description.header'),
      cell: (props) => props.getValue(),
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
              <TableRow key={row.id}>
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
