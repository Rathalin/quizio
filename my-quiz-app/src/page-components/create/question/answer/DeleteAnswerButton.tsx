// import { Delete as DeleteIcon } from '@mui/icons-material';
import { Tooltip, IconButton, Box } from '@mui/material';
import { useState } from 'react';

type DeleteAnswerButtonProps = {
  index: number;
  minAnswers: number;
  onDelete: () => void;
};

export default function DeleteAnswerButton({
  index,
  minAnswers,
  onDelete,
}: DeleteAnswerButtonProps) {
  const disabled = index <= minAnswers;

  return (
    <Tooltip
      title={
        disabled
          ? `You cannot delete the first ${minAnswers} answers.`
          : 'Delete answer'
      }
      arrow
    >
      <Box>
        <IconButton
          color="error"
          disabled={disabled}
          onClick={() => onDelete()}
        >
          {/* <DeleteIcon /> */}
        </IconButton>
      </Box>
    </Tooltip>
  );
}
