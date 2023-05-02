import { Chip } from '@mui/material';

type PublishStateChipProps = {
  published: boolean;
};

export default function PublishStateChip({ published }: PublishStateChipProps) {
  return published ? (
    <Chip label="Published" color="success" variant="outlined" />
  ) : (
    <Chip label="Unpublished" color="warning" variant="outlined" />
  );
}
