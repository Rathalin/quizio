/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: 'https://quizio.flockert.at',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: ['/users/'],
      },
    ],
  },
  exclude: [
    '/404',
    '/en/404',
    '/500',
    '/en/500',
    '/debug',
    '/en/debug',
    '/auth/*',
    '/en/auth/*',
    '/users/*',
    '/en/users/*',
    '/quiz/create',
    '/en/quiz/create',
    '/my-quizzes',
    '/en/my-quizzes',
    '/quiz/create',
    '/en/quiz/create',
    '/quiz/edit/*',
    '/en/quiz/edit/*',
    '/quiz/my-quizzes/*',
    '/en/quiz/my-quizzes/*',
  ],
  additionalPaths: async () => {
    const locales = ['', '/en'];
    const publicQuizUuids = await fetch('https://go.quizio.flockert.at/seo/published-quizzes-uuids', {
      headers: {
        Authorization: `Bearer ${process.env.SEO_API_KEY}`,
      },
    }).then((response) => response.json());
    return publicQuizUuids.flatMap((uuid) =>
      locales.map((l) => ({
        loc: `${l}/play/${uuid}`,
        changefreq: 'weekly',
        priority: 0.8,
      })),
    );
  },
};
