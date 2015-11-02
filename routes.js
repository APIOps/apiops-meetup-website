var subs = new SubsManager();

Router.map(function() {
  this.route('home', {
    path: '/',
    waitOn: function() {
      return subs.subscribe("meetups");
    },
    data: {
      upcomingMeetup: Meetups.find({dateTime : {$gt : new Date()} }, {sort: {dateTime: 1}, limit: 1})
    }
  });

  this.route('meetups', {
    path: '/meetups',
    waitOn: function() {
      return subs.subscribe("meetups");
    },
    data: {
      upcomingMeetup: Meetups.find({dateTime : {$gt : new Date()} }, {sort: {dateTime: 1}, limit: 1}),
      previousMeetups: Meetups.find({dateTime : {$lt : new Date()} }, {sort: {dateTime: -1}})
    },
    onAfterAction: function() {
      SEO.set({
        title: 'Meetups | ' + SEO.settings.title
      });
    }
  });
  this.route('meetupDetail', {
    path: '/meetups/:_id',
    waitOn: function() {
      return [
        subs.subscribe("meetup", this.params._id),
        subs.subscribe("members")
      ];
    },
    data: function() {
      return {
        meetup: Meetups.findOne({_id: this.params._id}),
        members: Meteor.users.find({})
      };
    },
    onAfterAction: function() {
      if(this.ready()) {
        SEO.set({
          title: this.data().meetup.title + ' | Meetups | ' + SEO.settings.title
        });
      }
    }
  });

  this.route('members', {
    path: '/members',
    waitOn: function() {
      return subs.subscribe("members");
    },
    data: {
      members: Meteor.users.find({})
    },
    onAfterAction: function() {
      SEO.set({
        title: 'Members | ' + SEO.settings.title
      });
    }
  });

  this.route('notFound', {
    path: '*',
    where: 'server',
    action: function() {
      this.response.statusCode = 404;
      this.response.end(Handlebars.templates['404']());
    }
  });
});
