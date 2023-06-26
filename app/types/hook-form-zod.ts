import { FieldErrors, FieldValues } from 'react-hook-form';

export type ZodFieldErrors<T extends FieldValues> = Omit<
  FieldErrors<T>,
  'root'
> & {
  global?: FieldErrors['root'];
};
