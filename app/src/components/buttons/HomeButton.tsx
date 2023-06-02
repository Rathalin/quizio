import LinkButton, { LinkButtonProps } from '../LinkButton';

type HomeButtonProps = Omit<
  LinkButtonProps,
  'hrefObserver' | 'navigateOnClick'
> & {};

export default function HomeButton({
  children,
  variant = 'outlined',
  ...props
}: HomeButtonProps) {
  return (
    <LinkButton hrefObserver="/" navigateOnClick variant={variant} {...props}>
      {children != null ? children : 'Home'}
    </LinkButton>
  );
}
