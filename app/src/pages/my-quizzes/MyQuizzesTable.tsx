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
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { dateTimeFormatter } from '@/utilities/intlFormats';
import Button from '@mui/material/Button';
import PublicIcon from '@mui/icons-material/Public';
import PublicOffIcon from '@mui/icons-material/PublicOff';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LinkButton from '@/components/LinkButton';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

type Props = {
  quizzes: GetMyQuizzesResponseQuiz[];
};

export function MyQuizzesTable({ quizzes }: Props) {
  const t = useTranslations('myQuizzes.table');
  const theme = useTheme();
  const { mode } = useColorMode();

  const columnHelper = createColumnHelper<GetMyQuizzesResponseQuiz>();

  const columns = [
    columnHelper.accessor('title', {
      header: () => t('column.quiz.header'),
      cell: (props) => {
        const { imageUrl, title, description } = props.row.original;
        const imageSize = {
          width: 112.5,
          height: 75,
        };
        return (
          <Stack direction="row" gap={2}>
            {imageUrl != null ? (
              <Image
                src={prefixWithBackendUrl(imageUrl)}
                alt={t('column.quiz.image.alt')}
                width={imageSize.width}
                height={imageSize.height}
                style={{
                  objectFit: 'cover',
                  width: imageSize.width,
                  height: imageSize.height,
                  minWidth: imageSize.width,
                  borderRadius: '4px',
                }}
                priority
                unoptimized
              />
            ) : (
              <Box
                sx={{
                  width: imageSize.width,
                  height: imageSize.height,
                  minWidth: imageSize.width,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  backgroundColor:
                    mode === 'light'
                      ? lighten(theme.palette.secondary.light, 0.7)
                      : darken(theme.palette.secondary.light, 0.7),
                }}
              >
                <ImageIcon fontSize="large" />
              </Box>
            )}
            <Stack gap={1} sx={{ maxWidth: '30ch' }}>
              <Typography
                variant="body1"
                color="textPrimary"
                sx={{
                  overflow: 'hidden',
                  whiteSpace: 'pre',
                  textOverflow: 'ellipsis',
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{
                  overflow: 'hidden',
                  whiteSpace: 'pre-line',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                }}
              >
                {description}
              </Typography>
            </Stack>
          </Stack>
        );
      },
    }),
    columnHelper.accessor('uuid', {
      header: () => t('column.actions.header'),
      cell: () => (
        <Stack direction="row" sx={{ marginTop: -1.5 }}>
          <Tooltip title={t('column.actions.edit.label')} enterDelay={500} enterNextDelay={500} arrow>
            <Box>
              <IconButton color="inherit">
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          </Tooltip>
          <Tooltip title={t('column.actions.delete.label')} enterDelay={500} enterNextDelay={500} arrow>
            <Box>
              <IconButton color="inherit">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Tooltip>
          <Tooltip title={t('column.actions.copyLink.label')} enterDelay={500} enterNextDelay={500} arrow>
            <Box>
              <IconButton color="inherit">
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Tooltip>
          <Tooltip title={t('column.actions.play.label')} enterDelay={500} enterNextDelay={500} arrow>
            <Box>
              <IconButton color="inherit">
                <PlayArrowIcon fontSize="small" />
              </IconButton>
            </Box>
          </Tooltip>
        </Stack>
      ),
    }),
    columnHelper.accessor('isPublished', {
      header: () => t('column.isPublished.header'),
      cell: (props) => (
        <Box sx={{ marginTop: -1 }}>
          {props.getValue() ? (
            <Button startIcon={<PublicIcon />} size="small" color="inherit">
              {t('column.isPublished.option.isPublished')}
            </Button>
          ) : (
            <Button startIcon={<PublicOffIcon />} size="small" color="inherit">
              {t('column.isPublished.option.notPublished')}
            </Button>
          )}
        </Box>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: () => t('column.createdAt.header'),
      cell: (props) => (
        <Stack>
          <Typography variant="body2">{dateTimeFormatter.format(new Date(props.getValue()))}</Typography>
          <Typography variant="body2" color="textSecondary">
            {t('column.createdAt.cell.label')}
          </Typography>
        </Stack>
      ),
    }),
    columnHelper.accessor('updatedAt', {
      header: () => t('column.updatedAt.header'),
      cell: (props) => (
        <Stack>
          <Typography variant="body2">{dateTimeFormatter.format(new Date(props.getValue()))}</Typography>
          <Typography variant="body2" color="textSecondary">
            {t('column.updatedAt.cell.label')}
          </Typography>
        </Stack>
      ),
    }),
    columnHelper.accessor('playCount', {
      header: () => t('column.playCount.header'),
      cell: (props) => (
        <Stack>
          <Typography variant="body2" noWrap>
            {t.rich('column.playCount.label', {
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
                sx={{
                  verticalAlign: 'top',
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
