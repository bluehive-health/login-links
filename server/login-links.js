import { Meteor } from 'meteor/meteor';
Meteor.users.createIndexAsync(
  { 'services.accessTokens.tokens.hashedToken': 1 },
  { name: 'login-links:services.accessTokens' }
);

Object.assign(LoginLinks, {

  /**
   * Generate a token to send and later use for loginWithToken or connectionLogin
   * @param {string|object} user
   * @param {object} opts - `{type: String}` or `{expirationInSeconds: Integer}`. Any additional fields in `opts` will be copied to the stored token that is provided to any hooks.
   */
  generateAccessToken(user, opts) {
    let stampedToken;
    let hashStampedToken;

    check(user, Match.OneOf(String, Object), '`user` must be a string or basic object');
    check(opts, Match.Optional(Object));

    if (typeof user === 'string') {
      user = { _id: user };
    } else if (typeof user !== 'object') {
      throw new Error("login-links error: invalid user argument");
    }

    stampedToken = Accounts._generateStampedLoginToken();
    hashStampedToken = Accounts._hashStampedToken(stampedToken);

    if (opts) {
      Object.assign(hashStampedToken, opts);
    }

    Meteor.users.updateAsync(user._id, {
      $push: {
        'services.accessTokens.tokens': hashStampedToken
      }
    });

    //console.log({hashStampedToken})

    return stampedToken.token;
  }, // end generateAccessToken

  /**
   * @callback loginHook
   * @param {string} token
   * @param {object} user - only contains `_id` and `services.accessTokens.tokens`
   */

  _tokenLoginHooks: [],

  /**
   * When loginWithToken is used to successfully login a user, this hook is called before completion.
   * @param {loginHook} hook
   */
  onTokenLogin(hook) {
    this._tokenLoginHooks.push(hook);
  },

  _connectionHooks: [],

  /**
   * When connectionLogin is used to successfully login a user, this hook is called before completion. If you return an object, the object's fields will be added to the `data` object that is passed to the client connectionLogin callback.
   * @param {loginHook} hook
   */
  onConnectionLogin(hook) {
    this._connectionHooks.push(hook);
  },

  _lookupToken(token) {
    return new Promise(async (resolve, reject) => {
      check(token, String);

      const hashedToken = Accounts._hashLoginToken(token);

      // $elemMatch projection doesn't work on nested fields
      const fields = {
        _id: 1,
        'services.accessTokens.tokens': 1
      };

      const user = await Meteor.users.findOneAsync({
        'services.accessTokens.tokens.hashedToken': hashedToken
      }, { fields });

      if (!user) {
        return reject('login-links/user-token-not-found');
      }

      const savedToken = user.services.accessTokens.tokens.find(t => t.hashedToken === hashedToken);
      const accessToken = new LoginLinks.AccessToken(savedToken);

      if (accessToken.isExpired) {
        return reject('login-links/token-expired: ' + accessToken.expirationReason);
      }

      resolve({ user, savedToken });
    });
  }

}); // end Object.assign(LoginLinks, ...)