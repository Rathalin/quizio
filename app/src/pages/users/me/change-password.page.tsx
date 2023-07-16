import { useAuthHeader } from '@/custom-hooks/useAuthHeader';
import { useRedirectOnUnauthenticated } from '@/custom-hooks/useRedirectOnUnauthenticated';
import { changePasswordGQL } from '@/graphql/changePassword';
import {
  Alert,
  Button,
  Card,
  CardContent,
  FormHelperText,
  Stack,
  Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import request from 'graphql-request';
import { useSession } from 'next-auth/react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import QuizioPasswordField from '@/components/inputs/QuizioPasswordField';
import { ZodFieldErrors } from '../../../../types/hook-form-zod';
import { useHandleGqlUnauthorized } from '@/custom-hooks/useHandleGqlUnauthorized';

const passwordMinLength = 6;
const passwordMaxLength = 30;
const passwordMinLengthError = `Password must be at least ${passwordMinLength} characters long`;
const schema = z
  .object({
    currentPassword: z
      .string()
      .min(passwordMinLength, { message: passwordMinLengthError }),
    password: z
      .string()
      .min(passwordMinLength, { message: passwordMinLengthError }),
    passwordConfirmation: z
      .string()
      .min(passwordMinLength, { message: passwordMinLengthError }),
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
const defaultValues = {
  currentPassword: '',
  password: '',
  passwordConfirmation: '',
};

export default function ChangePasswordPage() {
  const {  status } = useSession();
  const { authHeader } = useAuthHeader();

  const { control, handleSubmit, formState, reset } =
    useForm<ChangePaswordForm>({
      defaultValues,
      resolver: zodResolver(schema),
    });
  const errors = formState.errors as ZodFieldErrors<ChangePaswordForm>;

  const changePasswordMutation = useMutation({
    mutationKey: ['changePassword'],
    mutationFn: (changePasswordData: ChangePaswordForm) =>
      request(
        process.env.NEXT_PUBLIC_GRAPHQL_URL,
        changePasswordGQL,
        changePasswordData,
        authHeader
      ),
    onSuccess: () => {
      reset(defaultValues);
    },
  });
  useHandleGqlUnauthorized([changePasswordMutation.error]);

  useHandleGqlUnauthorized([changePasswordMutation.isError]);
  useRedirectOnUnauthenticated(status);

  function onSubmit(data: ChangePaswordForm) {
    changePasswordMutation.mutate(data);
  }

  return (
    <Card sx={{ marginTop: 4, padding: 2 }} elevation={2}>
      <CardContent>
        <Typography variant="h1" sx={{ marginTop: 0 }}>
          Change your password
        </Typography>
        <form
          onSubmit={(e) => {
            changePasswordMutation.reset();
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
                  inputProps={{ maxLength: passwordMaxLength }}
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
                  inputProps={{ maxLength: passwordMaxLength }}
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
                  inputProps={{ maxLength: passwordMaxLength }}
                  {...field}
                />
              )}
              control={control}
              rules={{ required: true }}
            />
          </Stack>
          <Stack>
            <FormHelperText error>
              {errors.global?.passwordMatch?.message}
            </FormHelperText>
            <FormHelperText error>
              {errors.global?.passwordDifferent?.message}
            </FormHelperText>
          </Stack>
          {changePasswordMutation.isError && (
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              Incorrect password
            </Alert>
          )}
          {changePasswordMutation.isSuccess && (
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
