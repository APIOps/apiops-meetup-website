var subs = new SubsManager();

Router.map(function() {

  Router.configure({
    loadingTemplate: 'loading'
  });

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
    name: 'meetupDetail',
    path: '/meetups/:meetupId-:slug',
    waitOn: function() {
      return [
        subs.subscribe("meetup", this.params.slug),
        subs.subscribe("members")
      ];
    },
    subscriptions: function() {
      return Meteor.subscribe('meetupDetail', this.params.slug);
    },
    data: function() {
      return {
        meetup: Meetups.findOne({"slug": this.params.slug}),
        members: Meteor.users.find({}, {sort: {'profile.points': -1}})
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

  Router._scrollToHash = function(hash) {
    var section = $(hash);
    if (section.length) {
      var sectionTop = section.offset().top;
      $("html, body").animate({
        scrollTop: sectionTop
      }, "slow");
    }
  };
});
