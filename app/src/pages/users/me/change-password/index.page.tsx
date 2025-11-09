import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import QuizioPasswordField from '@/components/inputs/QuizioPasswordField';
import { ZodFieldErrors } from '../../../../../types/hook-form-zod';
import { useChangePasswordMutation } from '@/data/useChangePasswordMutation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import FormHelperText from '@mui/material/FormHelperText';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import { QuizioBreadcrumbs } from '@/components/breadcrumbs/QuizioBreadcrumbs';
import Link from 'next/link';
import GradientText from '@/components/GradientText';
import { GetServerSideProps } from 'next';
import { getMessages } from '@/utilities/getMessages';
import { useTranslations } from 'next-intl';
import SaveIcon from '@mui/icons-material/Save';
import { useMemo } from 'react';
import LoadingCircle from '@/components/LoadingCircle';
import { useToastStore } from '@/persistence/taost.store';
import Head from 'next/head';
import { quizioTitle } from '@/utilities/quizioTitle';
import { RuleCheck } from './RuleCheck';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const messages = await getMessages(ctx.locale, ['changePassword']);

  return {
    props: {
      messages,
    },
  };
};

const passwordMinLength = 8;
const passwordMaxLength = 50;
const capitalRegex = /[A-Z]/;
const lowercaseRegex = /[a-z]/;
const digitRegex = /\d/;
const specialCharacterRegex = /[^A-Za-z0-9]/;

function useChangePasswordSchema() {
  const t = useTranslations('changePassword.form.schema.errorMessage');
  return useMemo(
    () =>
      z
        .object({
          currentPassword: z.string().min(passwordMinLength, t('password.minLength', { count: passwordMinLength })),
          password: z
            .string()
            .min(passwordMinLength, t('newPassword.minLength', { count: passwordMinLength }))
            .regex(capitalRegex, t('passwordComplexity')) // At least one uppercase letter
            .regex(lowercaseRegex, t('passwordComplexity')) // At least one lowercase letter
            .regex(digitRegex, t('passwordComplexity')) // At least one digit
            .regex(specialCharacterRegex, t('passwordComplexity')), // At least one special character
          passwordConfirmation: z
            .string()
            .min(passwordMinLength, t('newPasswordConfirm.minLength', { count: passwordMinLength })),
        })
        .refine((data) => data.password === data.passwordConfirmation, {
          message: t('passwordMatch'),
          path: ['global', 'passwordMatch'],
        })
        .refine((data) => data.currentPassword !== data.password, {
          message: t('passwordDifferent'),
          path: ['global', 'passwordDifferent'],
        }),
    [t],
  );
}
type ChangePaswordForm = z.infer<ReturnType<typeof useChangePasswordSchema>>;
const defaultValues: ChangePaswordForm = {
  currentPassword: '',
  password: '',
  passwordConfirmation: '',
};

export default function ChangePasswordPage() {
  const t = useTranslations('changePassword');
  const theme = useTheme();
  const { showSuccessToast, showErrorToast } = useToastStore();
  const schema = useChangePasswordSchema();
  const { control, handleSubmit, formState, reset, watch } = useForm<ChangePaswordForm>({
    defaultValues,
    resolver: zodResolver(schema),
  });
  const errors = formState.errors as ZodFieldErrors<ChangePaswordForm>;

  const { mutateAsync: changePassword, isPending, reset: resetChangePassword } = useChangePasswordMutation();

  async function onSubmit(data: ChangePaswordForm) {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.password,
      });
      reset(defaultValues);
      showSuccessToast(t('form.status.success'));
    } catch (error) {
      showErrorToast(t('form.status.error'));
    }
  }

  return (
    <>
      <Head>
        <title>{quizioTitle(t('meta.title'))}</title>
      </Head>
      <QuizioBreadcrumbs>
        <Link href="/users/me/change-password" aria-current="page">
          {t('breadcrumbs.current')}
        </Link>
      </QuizioBreadcrumbs>
      <Card sx={{ marginTop: 2, padding: 2, maxWidth: theme.breakpoints.values.sm }} elevation={2}>
        <CardContent>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              marginBottom: 3,
            }}
          >
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
            <Stack sx={{ marginLeft: 1 }}>
              <FormHelperText error>{errors.global?.passwordMatch?.message}</FormHelperText>
              <FormHelperText error>{errors.global?.passwordDifferent?.message}</FormHelperText>
            </Stack>
            <Stack>
              <RuleCheck
                valid={watch('password').match(lowercaseRegex) != null}
                label={t('form.check.atLeastOneLowercaseLetter')}
              />
              <RuleCheck
                valid={watch('password').match(capitalRegex) != null}
                label={t('form.check.atLeastOneCapitalLetter')}
              />
              <RuleCheck valid={watch('password').match(digitRegex) != null} label={t('form.check.atLeastOneDigit')} />
              <RuleCheck
                valid={watch('password').match(specialCharacterRegex) != null}
                label={t('form.check.atLeastOneSpecialCharacter')}
              />
              <RuleCheck
                valid={watch('password').length > passwordMinLength}
                label={t('form.check.minCharacters', { count: passwordMinLength })}
              />
            </Stack>
            <Stack sx={{ marginTop: 2 }} direction="row" justifyContent="end">
              <Button
                variant="contained"
                type="submit"
                startIcon={isPending ? <LoadingCircle /> : <SaveIcon />}
                disabled={isPending}
              >
                {t('form.submit.label')}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
