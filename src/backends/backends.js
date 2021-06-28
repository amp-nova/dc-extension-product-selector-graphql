import { GraphQLBackend } from './GraphQL';

export const getBackend = (params) => {
  return new GraphQLBackend(params)
}