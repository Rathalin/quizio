import { useTranslations } from 'next-intl';
import LinkButton, { LinkButtonProps } from '../LinkButton';

type HomeButtonProps = Omit<LinkButtonProps, 'hrefObserver' | 'navigateOnClick'> & {};

export default function HomeButton({ children, iconSide = 'right', variant = 'outlined', ...props }: HomeButtonProps) {
  const t = useTranslations('common');
  return (
    <LinkButton hrefObserver="/" navigateOnClick variant={variant} iconSide={iconSide} {...props}>
      {children != null ? children : t('button.toDashboard.label')}
    </LinkButton>
  );
}
