import { Buffer } from 'buffer';
import { config } from './config';
import { routes } from './routes';
import { store } from '../configureStore';
import sessionActions from '../actions/session';


const url = (path) => `${config.hostname}:${config.port}${path}`;

const fetchProtectedResource = (path, args) => {
  return fetch(url(path), args)
    .then(res => {
      const accessToken = res.headers.get('Set-Authorization');
      const refreshToken = res.headers.get('Set-Refresh-Token');
      // If access token is expired then new tokens will be returned
      // in header because refresh token is included in original call header
      if (accessToken && refreshToken) {
        store.dispatch(sessionActions.setSession({
          accessToken: accessToken,
          refreshToken: refreshToken
        }));
      } 
      return res;
    });
};

export const createUser = (email, password) => {
  return fetch(url(routes.user.post), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
};

export const login = async (email, password) => {
  return fetch(url(routes.login), {
    method: 'GET',
    headers: {
      Authorization: `Basic ${new Buffer(`${email}:${password}`).toString('base64')}`
    }
  });
};

export const currentLogin = (accessToken, refreshToken) => {
  return fetchProtectedResource(routes.currentLogin, {
    method: 'GET',
    headers: {
      Authorization: accessToken,
      'Refresh-Token': refreshToken
    }
  });
};

export const logout = (accessToken, refreshToken) => {
  return fetchProtectedResource(routes.logout, {
    method: 'POST',
    headers: {
      Authorization: accessToken,
      'Refresh-Token': refreshToken
    }
  });
};

export const fetchShoes = (fromPage = 0, pageSize) => {
  return fetch(url(`${routes.shoes.get}?from=${fromPage}&size=${pageSize}`), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  });
};
