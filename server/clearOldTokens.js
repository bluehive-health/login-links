import { Meteor } from 'meteor/meteor';
LoginLinks._expireTokens = async function () {
  Meteor.users.find({
    'services.accessTokens.tokens': {
      $exists: true,
      $ne: []
    }
  }).forEach(function (user) {
    for (const token of user.services.accessTokens.tokens) {
      const accessToken = new LoginLinks.AccessToken(token)
      if (accessToken.isExpired) {
        Meteor.users.updateAsync(user._id, {
          $pull: {
            'services.accessTokens.tokens': {
              hashedToken: token.hashedToken
            }
          }
        })
      }
    }
  })
};

Meteor.setInterval(async function () {
  LoginLinks._expireTokens()
}, 60 * 60 * 1000) // 1 hour
