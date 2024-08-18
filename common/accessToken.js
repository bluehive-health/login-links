class AccessToken {

  constructor(token) {
    if (!token.hashedToken || !token.when)
      throw new Meteor.Error('login-links error: access token is missing a field');

    // Ensure that `token.when` is a Date object
    if (!(token.when instanceof Date)) {
      token.when = new Date(token.when);
    }

    // Use Object.assign to extend the token properties to the instance
    Object.assign(this, token);
  }

  get typeConfig() {
    let config;

    if (this.type)
      config = LoginLinks._accessTokenTypes[this.type];

    return config || {};
  }

  getExpirationInSeconds() {
    // console.log('getExpirationInSeconds', this.expirationInSeconds, this.type, LoginLinks._accessTokenTypes, this.typeConfig)
    return this.expirationInSeconds ||
      this.typeConfig.expirationInSeconds ||
      LoginLinks._defaultExpirationInSeconds;
  }

  get expiresAt() {
    const expirationInMilliseconds = this.getExpirationInSeconds() * 1000;
    return this.when.getTime() + expirationInMilliseconds;
  }

  get isExpired() {
    return this.expiresAt < Date.now();
  }

  get expirationReason() {
    const reason = "This access token (type '"
          + this.type
          + "') has a "
          + this.getExpirationInSeconds()
          + '-second expiry, and expired at '
          + new Date(this.expiresAt);
    return reason;
  }

}

LoginLinks.AccessToken = AccessToken;