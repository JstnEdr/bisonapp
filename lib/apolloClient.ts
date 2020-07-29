/* eslint-disable no-restricted-globals */
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { LOGIN_TOKEN_KEY } from '../context/auth';

export function createApolloClient(ctx?: Record<string, any>) {
  // Apollo needs an absolute URL when in SSR, so determine host
  let host, protocol;
  let hostUrl = process.env.API_URL;

  if (ctx) {
    host = ctx?.req.headers['x-forwarded-host'];
    protocol = ctx?.req.headers['x-forwarded-proto'] || 'http';
    hostUrl = `${protocol}://${host}`;
  } else if (typeof location !== 'undefined') {
    host = location.host;
    protocol = location.protocol;
    hostUrl = `${protocol}//${host}`;
  }

  const uri = `${hostUrl}/api/graphql`;

  const httpLink = createHttpLink({
    uri,
  });

  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = localStorage.getItem(LOGIN_TOKEN_KEY);
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  return client;
}