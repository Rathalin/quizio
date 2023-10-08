export default {
  graphql: {
    config: {
      endpoint: "/graphql",
      shadowCRUD: true,
      playgroundAlways: false,
      depthLimit: 50,
      amountLimit: 500,
      apolloServer: {
        tracing: false,
        introspection: true,
      },
    },
  },
}
