// import LinkButton from '@/components/LinkButton';
// import MyQuizOverview from '@/components/MyQuizOverview';
// import MyQuizOverviewPlaceholder from '@/components/MyQuizOverviewPlaceholder';
// import { queryMyQuizsOverviewOfOwner } from '@/graphql/myQuizs';
// import { Typography, Box, Alert } from '@mui/material';
// import { useQuery } from '@tanstack/react-query';
// import request from 'graphql-request';
// import { useSession } from 'next-auth/react';

// export default function MyQuizzes() {
//   const { data: session, status } = useSession();
//   const isAuthenticated = status === 'authenticated';
//   const userId = session?.user?.id?.toString() ?? '';

//   const myQuizsOverviewQuery = useQuery({
//     queryKey: ['myQuizs'],
//     queryFn: () =>
//       request(
//         process.env.NEXT_PUBLIC_GRAPHQL_URL,
//         queryMyQuizsOverviewOfOwner,
//         {
//           ownerId: userId,
//         }
//       ),
//     enabled: isAuthenticated,
//   });

//   if (!isAuthenticated) return null;

//   return (
//     <>
//       <Typography variant="h2" sx={{ marginTop: 4 }}>
//         Your quizes
//       </Typography>
//       <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: 2 }}>
//         {myQuizsOverviewQuery.isFetching && <MyQuizOverviewPlaceholder />}
//         {myQuizsOverviewQuery.isError && (
//           <Alert severity="error">Could not load your quizes.</Alert>
//         )}
//         {myQuizsOverviewQuery.isSuccess &&
//           myQuizsOverviewQuery.data.quizzes?.data.map((quiz) => (
//             <MyQuizOverview
//               key={quiz.id}
//               title={quiz.attributes?.title ?? ''}
//               description={quiz.attributes?.description ?? ''}
//               questionCount={quiz.attributes?.questions?.data?.length ?? 0}
//               published={quiz.attributes?.published ?? false}
//             />
//           ))}
//       </Box>

//       <Box
//         sx={{
//           marginTop: 4,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       >
//         <LinkButton
//           hrefObserver="/create/1-general"
//           navigateOnClick
//           iconSide="right"
//           variant="contained"
//         >
//           Create a new quiz
//         </LinkButton>
//       </Box>
//     </>
//   );
// }
