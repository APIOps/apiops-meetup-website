Meteor.users.before.insert(function (userId, doc) {
  doc.createdAt = moment().toDate();
  doc.profile.points = 0;
});
