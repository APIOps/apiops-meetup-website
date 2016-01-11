# APIOps Meetup Website

Under development

Based on - https://github.com/MeteorMTL/website

# Installation

1. Install Meteor.js
2. Clone https://github.com/APIOps/apiops-meetup-website
3. Create settings.json
4. Type ```meteor --settings /path/to/settings.json``` in the project directory

# Settings.json

Your ```settings.json``` file should have the following structure:

```
{
  "environment" :  "production",
  "production" : {
    "meetup" : {
      "oauth_key" : "xxx",
      "oauth_secret" : "xxx",
      "api_key" : "xxx",
      "group_urlname" : "Your Meetup Group Name"
    }
  },
  "development" : {
    "meetup" : {
      "oauth_key" : "xxx",
      "oauth_secret" : "xxx",
      "api_key" : "xxx",
      "group_urlname" : "Your Meetup Group Name"
    }
  },
  "public" : {
    "meetup" : {
      "group_name" : "Your Meetup Group Name",
      "group_urlname" : "Your Meetup Group Name"
    },
    "links" : {
      "meetup": "Your Meetup Group URL",
      "twitter": "Your Meetup Group Twitter URL",
      "github": "Your Meetup Group Github URL"
    }
  }
}
```
