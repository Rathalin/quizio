import { QuizioBreadcrumbs } from '@/components/breadcrumbs/QuizioBreadcrumbs';
import GenericLoadingErrorMessage from '@/components/GenericLoadingErrorMessage';
import GradientText from '@/components/GradientText';
import UserStats from '@/components/users/UserStats';
import { useMyUserProfileQuery } from '@/data/useMyUserProfileQuery';
import MyProfilePlaceholder from '@/page-components/user/me/MyProfilePlaceholder';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function MePage() {
  const { data: session } = useSession();
  const { data, isPending, isError, isSuccess } = useMyUserProfileQuery();

  return (
    <>
      <QuizioBreadcrumbs>
        <Link href="/users/me" aria-current="page">
          {'My profile'}
        </Link>
      </QuizioBreadcrumbs>
      <Box sx={{ marginTop: 2 }}>
        <Card elevation={2} sx={{ paddingBottom: 2 }}>
          <CardContent sx={{ padding: 4 }}>
            <Typography variant="h1" sx={{ marginBlock: 0 }}>
              <GradientText>{session?.user.username ?? 'Profile'}</GradientText>
            </Typography>
            {session?.user.uuid === data?.user.uuid && (
              <Typography sx={{ marginBottom: 4, marginTop: 2 }}>
                <Link href={`/users/${session?.user.uuid}`}>{'Go to my public profile'}</Link>
              </Typography>
            )}
            {isPending && <MyProfilePlaceholder />}
            {isSuccess && (
              <>
                <UserStats
                  createdAt={new Date(data.user.createdAt)}
                  quizCount={data.quizStats.totalQuizzesCreated}
                  quizViewsTotal={data.quizStats.totalQuizzesPlayCount}
                />
              </>
            )}
            {isError && <GenericLoadingErrorMessage />}
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
