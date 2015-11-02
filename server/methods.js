var	list=["getCategories","getCheckins","postCheckin","getCities","getOpenEvents","getConcierge","getEvents","postEvent","getEventComments","postEventComment","postEventCommentFlag","getEventCommentLikes","getEventRatings","postEventRating","getEventAttendance","takeEventAttendance","getEverywhereComments","postEverywhereComment","getEverywhereCommunities","postEverywhereCommunity","getEverywhereFollows","getEverywhereFollowers","postEverywhereFollow","postEverywhereContainer","getEverywhereContainers","postEverywhereSeed","postEverywhereEvent","getEverywhereEvents","postEverywhereRsvp","getEverywhereRsvps","getEverywhereSeeds","getActivity","getGroups","getComments","getMembers","postMemberPhoto","postMessage","getOEMBed","getOEMBed","getPhotoComments","postPhotoComment","getPhotoAlbums","getPhoto","getPhotos","postPhotoAlbum","postPhoto","getProfiles","postProfiles","postRSVP","getRSVPs","getOpenVenues","getVenues"],
    MeetupMe = Meteor.npmRequire("meetup-api");
var api_key = Meteor.settings[Meteor.settings.environment].meetup.api_key;
var group_urlname = Meteor.settings[Meteor.settings.environment].meetup.group_urlname;
var meetup = new MeetupMe(api_key);
var AsyncMeetup = Async.wrap(meetup, list);

Meteor.methods({
  MeetupAPI: function(endpoint, param) {
    switch(endpoint){
      case "getEvents":
        return AsyncMeetup.getEvents(param);
        break
        case "getProfiles":
        return AsyncMeetup.getProfiles(param);
        break
        case "getRSVPs":
        return AsyncMeetup.getRSVPs(param);
        break
        default:

    }
  },

  fetchProfiles: function() {
    //changed the end point from getMembers to getProfiles to utilize the returned "role" variable ( and "answers" variable ) - Abdul
    //var adminIds = [54118672, 57771272, 32213572, 28932772, 87620262, 11527138, 8187187];

    console.log ( "Fetching Meetup Member Profiles ");
    var adminRoles = ["Organizer", "Co-Organizer"];

    Meteor.call('MeetupAPI', 'getProfiles', {"group_urlname": group_urlname, "fields":"other_services"}, function(err, response) {

      for (var i = 0, l = response.meta.count; i < l; i++) {
        var node = response.results[i];

        if(response.results[i].hasOwnProperty("photo") && response.results[i].photo.photo_link !== "") {
          var thumbnailUrl = response.results[i].photo.photo_link;
        } else {
          var thumbnailUrl = "/default-avatar.png";
        }

        var socialLinks = [];
        var userId;
        var meetupUid = response.results[i].member_id;
        for (service in response.results[i].other_services) {
          if(service === "twitter") {
            var username = response.results[i].other_services['twitter']['identifier'];
            socialLinks.push({'service': 'twitter', 'url': 'https://twitter.com/' + username});
          } else if(service) {
            var url = response.results[i].other_services[service]['identifier'];
            socialLinks.push({'service': service, 'url': url});
          }
        }

        //console.log("member_id: ",  meetupUid);

        var existingUser = Meteor.users.findOne({'profile.meetupId': meetupUid});


        if (existingUser) {

          userId = existingUser._id;
          //console.log("User exists, updating: ", meetupUid);
          Meteor.users.update({'profile.meetupId': meetupUid},
                              { $set :
                               {
                                 'profile.name': response.results[i].name,
                                 'profile.bio': response.results[i].bio,
                                 'profile.meetupProfileUrl': response.results[i].profile_url,
                                 'profile.socialLinks': socialLinks,
                                 'profile.thumbnailUrl': thumbnailUrl,
                                 'profile.answers' : response.results[i].answers
                               }
                              });
        } else {
          userId = Meteor.users.insert({
            profile: {
              'meetupId': meetupUid,
              'name': response.results[i].name,
              'bio': response.results[i].bio,
              'meetupProfileUrl': response.results[i].profile_url,
              'socialLinks': socialLinks,
              'thumbnailUrl': thumbnailUrl,
              'answers' : response.results[i].answers
            },
            services: {
              meetup: {
                id: meetupUid
              }
            }
          });
        }

        //If the meetup user is in leadership team, then the json response will have a "role" variable returned with values such as "Organizer", "Co-Organizer" etc.
        if ( response.results[i].role ) {
          if (_(adminRoles).contains(response.results[i].role)) {
            Roles.addUsersToRoles(userId, ['admin']);
          }
        }


      }
    });
  },

  fetchEvents: function(status) {

    console.log ( "Fetching Meetup Events");
    Meteor.call('MeetupAPI', 'getEvents', {"group_urlname": group_urlname, "status": status, "fields":"featured"}, function(err, response) {

      for (var i = 0, l = response.meta.count; i < l; i++) {
        var meetupData = response.results[i];
        var existingMeetup = Meetups.findOne({meetupId: meetupData['id']});
        var meetupId;

        var meetup_hash = {
          title: meetupData['name'],
          description: meetupData['description'],
          meetupId: meetupData['id'],
          meetupUrl: meetupData['event_url'],
          featured : meetupData['featured'],
          dateTime: moment(meetupData['time']).toDate()
        }
        if(meetupData['venue']){
          meetup_hash = _.extend(meetup_hash, {location: {
            name: meetupData['venue']['name'],
            address: meetupData['venue']['address_1'],
            lat: meetupData['venue']['lat'],
            lon: meetupData['venue']['lon'],
            description: meetupData['how_to_find_us']
          }});
        }

        if (existingMeetup) {
          meetupId = existingMeetup._id;
          Meetups.update({_id: existingMeetup._id}, {$set: meetup_hash });
        } else {
          meetupId = Meetups.insert(meetup_hash);
        }

        Meteor.call('MeetupAPI', 'getRSVPs', {"event_id": meetupData['id'], "rsvp": "yes"}, function(err, response) {
          for (var j = 0, l = response.meta.count; j < l; j++) {
            var rsvpData = response.results[j];
            var meetupUserId = rsvpData['member']['member_id'];
            var user = Meteor.users.findOne({'profile.meetupId': meetupUserId});
            if (user) {
              var meetup = Meetups.findOne(meetupId);
            }
          }
        });
      }
    });
  },

  rsvp: function(params) {
    if (Meteor.userId()) {
      Meetups.update({_id: params.meetupId}, {$addToSet: {'attendeeIds': Meteor.userId()}})

      var meetup = Meetups.findOne(params.meetupId);
    }
  }
});
