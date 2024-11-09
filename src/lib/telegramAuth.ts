import axios from 'axios';

let initData = '';

if (window.Telegram && window.Telegram.WebApp) {
  initData = window.Telegram.WebApp.initData;
}

let telegramAuth: any;

export const ETHERFI_API_BASE_URL = 'http://localhost:443/etherfi';

export const etherfiApi = axios.create({
  baseURL: ETHERFI_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Telegram-Web-App-Data': initData,
  },
});

export const updateInitData = (newInitData: any) => {
  etherfiApi.defaults.headers['X-Telegram-Web-App-Data'] = newInitData;
};

export function initTelegramAuth() {
  return new Promise((resolve, reject) => {
    console.log('Initializing Telegram Auth', {});
    if (window.Telegram && window.Telegram.WebApp) {
      console.log('Telegram WebApp found', {});
      window.Telegram.WebApp.ready();
      telegramAuth = window.Telegram.WebApp.initData;
      updateInitData(telegramAuth);
      console.log('Telegram WebApp initialized', { initData: telegramAuth });
      resolve(true);
    } else if (window.TelegramGameProxy) {
      console.log('TelegramGameProxy found', {});
      if (typeof window.TelegramGameProxy.initParams === 'function') {
        window.TelegramGameProxy.initParams((params: any) => {
          telegramAuth = params;
          updateInitData(telegramAuth);
          console.log('TelegramGameProxy initialized', {
            params: telegramAuth,
          });
          resolve(true);
        });
      } else {
        console.log('TelegramGameProxy found, but initParams is not a function', {});
        telegramAuth = window.TelegramGameProxy;
        updateInitData(telegramAuth);
        resolve(true);
      }
    } else {
      const error = new Error('Neither Telegram WebApp nor TelegramGameProxy found');
      console.log('Telegram initialization error', { error: error.message });
      reject(error);
    }
  });
}

export function getUserData() {
  if (!telegramAuth) {
    console.log('Telegram auth data not initialized', {});
    return null;
  }

  console.log('Raw Telegram auth data', { data: telegramAuth });

  // Parse the URL-encoded data
  const params = new URLSearchParams(telegramAuth);
  const userString = params.get('user');

  if (!userString) {
    console.log('No user data found in Telegram auth data', {});
    return null;
  }

  try {
    const user = JSON.parse(userString);
    console.log('Parsed user data', { user });
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      photo_url: user.photo_url,
    };
  } catch (error: any) {
    console.log('Failed to parse user data', {
      error: error?.message,
      userString,
    });
    return null;
  }
}
