import { Accounts } from 'meteor/accounts-base';

Accounts.registerLoginHandler('login-links', async function (loginRequest) {
  const token = loginRequest['login-links/accessToken']

  if (!token) {
    console.log('login-links/Accounts.registerLoginHandler no token');
    Accounts._handleError('login-links/missing-token');
  }

  try {
    const { user, savedToken } = await LoginLinks._lookupToken(token);

    console.log('login-links/Accounts.registerLoginHandler token:', token, 'user:', user._id);

    if (!user) {
      Accounts._handleError('User not found');
    }
    for (const hook of LoginLinks._tokenLoginHooks) {
      hook(savedToken, user);
    }

    return { userId: user._id }
  } catch (e) {
    console.error('login-links/Accounts.registerLoginHandler/connectionLogin error:', e);
    Accounts._handleError(e, false, 'login-links/connectionLogin-error');
  }
});
