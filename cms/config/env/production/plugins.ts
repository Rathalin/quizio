export default {
  graphql: {
    config: {
      endpoint: "/graphql",
      shadowCRUD: true,
      playgroundAlways: false,
      depthLimit: 1000,
      amountLimit: 1000,
      apolloServer: {
        tracing: false,
        introspection: true,
      },
    },
  },
}
