Meteor.publish("meetups", function() {
  return Meetups.find({});
});

Meteor.publish('meetupDetail', function(slug){
  check(slug, String);
  var data = Meetups.find({"slug": slug});
  if (data) {
    return data;
  }
  this.ready();
});

Meteor.publishComposite("meetup", function(_id) {
  return {
    find: function() {
      return Meetups.find({_id: _id});
    },
    children: [
      {
        find: function(meetup) {
          if (meetup.attendeeIds) {
            return Meteor.users.find({_id: {$in: meetup.attendeeIds}});
          }
        }
      }
    ]
  };
});

Meteor.publish("members", function () {
  return Meteor.users.find({}, {fields: {'profile': 1}});
});

Meteor.publishComposite("member", function(_id) {
  return {
    find: function() {
      return Meteor.users.find({_id: _id});
    },
    children: [
      {
        find: function(user) {
          return Activities.find({userId: user._id});
        }
      }
    ]
  };
});
