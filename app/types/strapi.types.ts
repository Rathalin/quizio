export type StrapiUserReponse = {
  jwt: string;
  user: {
    id: string;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
  };
};
