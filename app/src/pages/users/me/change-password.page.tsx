import { useRedirectOnUnauthenticated } from '@/custom-hooks/useRedirectOnUnauthenticated';
import { Alert, Button, Card, CardContent, FormHelperText, Stack, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import QuizioPasswordField from '@/components/inputs/QuizioPasswordField';
import { ZodFieldErrors } from '../../../../types/hook-form-zod';
import { useChangePasswordMutation } from '@/data/useChangePasswordMutation';

const passwordMinLength = 6;
const passwordMaxLength = 30;
const passwordMinLengthError = `Password must be at least ${passwordMinLength} characters long`;
const schema = z
  .object({
    currentPassword: z.string().min(passwordMinLength, { message: passwordMinLengthError }),
    password: z.string().min(passwordMinLength, { message: passwordMinLengthError }),
    passwordConfirmation: z.string().min(passwordMinLength, { message: passwordMinLengthError }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['global', 'passwordMatch'],
  })
  .refine((data) => data.currentPassword !== data.password, {
    message: 'New password must be different from current password',
    path: ['global', 'passwordDifferent'],
  });
type ChangePaswordForm = z.infer<typeof schema>;
const defaultValues: ChangePaswordForm = {
  currentPassword: '',
  password: '',
  passwordConfirmation: '',
};

export default function ChangePasswordPage() {
  const { status } = useSession();

  const { control, handleSubmit, formState, reset } = useForm<ChangePaswordForm>({
    defaultValues,
    resolver: zodResolver(schema),
  });
  const errors = formState.errors as ZodFieldErrors<ChangePaswordForm>;

  const { mutateAsync: changePassword, isError, isSuccess, reset: resetChangePassword } = useChangePasswordMutation();

  useRedirectOnUnauthenticated(status);

  async function onSubmit(data: ChangePaswordForm) {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.password,
      });
      reset(defaultValues);
    } catch (error) {}
  }

  return (
    <Card sx={{ marginTop: 4, padding: 2 }} elevation={2}>
      <CardContent>
        <Typography variant="h1" sx={{ marginTop: 0 }}>
          Change your password
        </Typography>
        <form
          onSubmit={(e) => {
            resetChangePassword();
            handleSubmit(onSubmit)(e);
          }}
        >
          <Stack gap={2}>
            <Controller
              name="currentPassword"
              render={({ field }) => (
                <QuizioPasswordField
                  id="currentPassword"
                  label="Current password"
                  fullWidth
                  error={errors.currentPassword != null}
                  helperText={errors.currentPassword?.message}
                  slotProps={{
                    htmlInput: {
                      maxLength: passwordMaxLength,
                    },
                  }}
                  {...field}
                />
              )}
              control={control}
              rules={{ required: true }}
            />
            <Controller
              name="password"
              render={({ field }) => (
                <QuizioPasswordField
                  id="password"
                  label="New password"
                  fullWidth
                  error={errors.password != null}
                  helperText={errors.password?.message}
                  slotProps={{
                    htmlInput: {
                      maxLength: passwordMaxLength,
                    },
                  }}
                  {...field}
                />
              )}
              control={control}
              rules={{ required: true }}
            />
            <Controller
              name="passwordConfirmation"
              render={({ field }) => (
                <QuizioPasswordField
                  id="passwordConfirmation"
                  label="Confirm password"
                  fullWidth
                  error={errors.passwordConfirmation != null}
                  helperText={errors.passwordConfirmation?.message}
                  slotProps={{
                    htmlInput: {
                      maxLength: passwordMaxLength,
                    },
                  }}
                  {...field}
                />
              )}
              control={control}
              rules={{ required: true }}
            />
          </Stack>
          <Stack>
            <FormHelperText error>{errors.global?.passwordMatch?.message}</FormHelperText>
            <FormHelperText error>{errors.global?.passwordDifferent?.message}</FormHelperText>
          </Stack>
          {isError && (
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              Incorrect password
            </Alert>
          )}
          {isSuccess && (
            <Alert severity="success" sx={{ marginBottom: 2 }}>
              Password changed successfully
            </Alert>
          )}
          <Stack sx={{ marginTop: 2 }} direction="row" justifyContent="end">
            <Button variant="contained" type="submit">
              Change password
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
