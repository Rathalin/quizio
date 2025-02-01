import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import QuizioPasswordField from '@/components/inputs/QuizioPasswordField';
import { ZodFieldErrors } from '../../../../types/hook-form-zod';
import { useChangePasswordMutation } from '@/data/useChangePasswordMutation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import FormHelperText from '@mui/material/FormHelperText';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import { QuizioBreadcrumbs } from '@/components/breadcrumbs/QuizioBreadcrumbs';
import Link from 'next/link';
import GradientText from '@/components/GradientText';
import { GetServerSideProps } from 'next';
import { getMessages } from '@/utilities/getMessages';
import { useTranslations } from 'next-intl';
import SaveIcon from '@mui/icons-material/Save';

const passwordMinLength = 8;
const passwordMaxLength = 50;
const passwordMinLengthError = `Password must be at least ${passwordMinLength} characters long`;
const passwordComplexityError =
  'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character';
const schema = z
  .object({
    currentPassword: z.string().min(passwordMinLength, { message: passwordMinLengthError }),
    password: z
      .string()
      .min(passwordMinLength, { message: passwordMinLengthError })
      .regex(/[A-Z]/, { message: passwordComplexityError }) // At least one uppercase letter
      .regex(/[a-z]/, { message: passwordComplexityError }) // At least one lowercase letter
      .regex(/\d/, { message: passwordComplexityError }) // At least one digit
      .regex(/[^A-Za-z0-9]/, { message: passwordComplexityError }), // At least one special character
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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const messages = await getMessages(ctx.locale, ['changePassword']);

  return {
    props: {
      messages,
    },
  };
};

export default function ChangePasswordPage() {
  const t = useTranslations('changePassword');
  const theme = useTheme();
  const { control, handleSubmit, formState, reset } = useForm<ChangePaswordForm>({
    defaultValues,
    resolver: zodResolver(schema),
  });
  const errors = formState.errors as ZodFieldErrors<ChangePaswordForm>;

  const { mutateAsync: changePassword, isError, isSuccess, reset: resetChangePassword } = useChangePasswordMutation();

  async function onSubmit(data: ChangePaswordForm) {
    await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.password,
    });
    reset(defaultValues);
  }

  return (
    <>
      <QuizioBreadcrumbs>
        <Link href="/users/me/change-password" aria-current="page">
          {t('breadcrumbs.current')}
        </Link>
      </QuizioBreadcrumbs>
      <Card sx={{ marginTop: 2, padding: 2, maxWidth: theme.breakpoints.values.sm }} elevation={2}>
        <CardContent>
          <Typography variant="h3" component="h1" sx={{ marginTop: 0 }}>
            {t.rich('heading', {
              gradient: (chunks) => <GradientText>{chunks}</GradientText>,
            })}
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
                    label={t('form.currentPassword.label')}
                    fullWidth
                    error={errors.currentPassword != null}
                    helperText={errors.currentPassword?.message}
                    slotProps={{
                      htmlInput: {
                        maxLength: passwordMaxLength,
                      },
                    }}
                    autoComplete="current-password"
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
                    label={t('form.newPassword.label')}
                    fullWidth
                    error={errors.password != null}
                    helperText={errors.password?.message}
                    slotProps={{
                      htmlInput: {
                        maxLength: passwordMaxLength,
                      },
                    }}
                    autoComplete="new-password"
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
                    label={t('form.confirmPassword.label')}
                    fullWidth
                    error={errors.passwordConfirmation != null}
                    helperText={errors.passwordConfirmation?.message}
                    slotProps={{
                      htmlInput: {
                        maxLength: passwordMaxLength,
                      },
                    }}
                    autoComplete="new-password"
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
                {t('form.status.error')}
              </Alert>
            )}
            {isSuccess && (
              <Alert severity="success" sx={{ marginBottom: 2 }}>
                {t('form.status.success')}
              </Alert>
            )}
            <Stack sx={{ marginTop: 2 }} direction="row" justifyContent="end">
              <Button variant="contained" type="submit" startIcon={<SaveIcon />}>
                {t('form.submit.label')}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
