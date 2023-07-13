export const constraints = {
  quiz: {
    title: {
      minLength: 1,
      maxLength: 50,
    },
    description: {
      maxLength: 200,
    },
    question: {
      title: {
        minLength: 1,
        maxLength: 200,
      },
      explanation: {
        maxLength: 400,
      },
    },
    answer: {
      title: {
        minLength: 1,
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
