import { Meteor } from 'meteor/meteor';
Meteor.methods({
  'login-links/connectionLogin': function (token) {
    console.log('login-links/connectionLogin method called with token:', token);
    LoginLinks._lookupToken(token).then(function ({ user, savedToken }) {
      console.log('connectionLogin user:', user._id);

      if (Meteor.userId() === user._id) {
        throw new Meteor.Error('login-links/already-fully-logged-in');
      }

      this.setUserId(user._id);

      let { hashedToken, ...data } = savedToken;

      for (let hook of LoginLinks._connectionHooks) {
        let value = hook(savedToken, user);
        if (typeof value === 'object')
          Object.assign(data, value);
      }

      data.userId = user._id;

      return data;
    }).catch(function (e) {
      console.error('connectionLogin error:', e);
      throw new Meteor.Error('login-links/connectionLogin-error', e.message);
    });
  }
});