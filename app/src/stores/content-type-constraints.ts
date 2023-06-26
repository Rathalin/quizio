export const constraints = {
  quiz: {
    title: {
      maxLength: 50,
    },
    description: {
      maxLength: 200,
    },
    question: {
      title: {
        maxLength: 200,
      },
    },
    answer: {
      title: {
        maxLength: 100,
      },
    },
  },
  user: {
    password: {
      minLength: 6,
      maxLength: 50,
    },
  },
} as const;
