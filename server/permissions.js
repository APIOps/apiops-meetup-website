Meteor.users.allow({
  'insert': function (userId,doc) {
    return true;
  },

  'update': function(userId, doc, fields, modifier) {
    return userId && userId === doc._id;
  }
});

Meteor.users.deny({
  update: function (userId, doc, fields, modifier) {
    return _.contains(_.keys(modifier.$set), 'profile.points');
  }
});
