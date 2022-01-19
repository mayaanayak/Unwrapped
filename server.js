// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});


//-------------------------------------------------------------//


// init Spotify API wrapper
var SpotifyWebApi = require('spotify-web-api-node');

// Replace with your redirect URI, required scopes, and show_dialog preference
var redirectUri = 'https://unwrapped.glitch.me/callback';
var scopes = ['user-top-read', 'playlist-read-collaborative', 'playlist-read-private'];
var showDialog = true;

// The API object we'll use to interact with the API
var spotifyApi = new SpotifyWebApi({
  clientId : process.env.CLIENT_ID,
  clientSecret : process.env.CLIENT_SECRET,
  redirectUri : redirectUri
});

app.get("/authorize", function (request, response) {
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, null, showDialog);
  console.log('authorzation call');
  console.log(authorizeURL)
  response.send(authorizeURL);
});

// Exchange Authorization Code for an Access Token
app.get("/callback", function (request, response) {
  var authorizationCode = request.query.code;
  
  spotifyApi.authorizationCodeGrant(authorizationCode)
  .then(function(data) {
    console.log(data)
    response.redirect(`/#access_token=${data.body['access_token']}&refresh_token=${data.body['refresh_token']}`)
  }, function(err) {
    console.log('Something went wrong when retrieving the access token!', err.message);
  });
});

app.get("/logout", function (request, response) {
  response.redirect('/'); 
});

app.get('/myendpoint', function (request, response) {
  var loggedInSpotifyApi = new SpotifyWebApi();
  console.log(request.headers['authorization'].split(' ')[1]);
  loggedInSpotifyApi.setAccessToken(request.headers['authorization'].split(' ')[1]);
  // Search for a track!
  loggedInSpotifyApi.getMyTopTracks()
    .then(function(data) {
      console.log(data.body);
      response.send(data.body);
    }, function(err) {
      console.error(err);
    });
  
});

app.get('/playlistsendpoint', function (request, response) {
  var loggedInSpotifyApi = new SpotifyWebApi();
  console.log(request.headers['authorization'].split(' ')[1]);
  loggedInSpotifyApi.setAccessToken(request.headers['authorization'].split(' ')[1]);
  // Search for a playlist!
  loggedInSpotifyApi.getUserPlaylists()
    .then(function(data) {
      console.log(data.body);
      response.send(data.body);
    }, function(err) {
      console.error(err);
    });
});

app.get('/specificplaylistendpoint', function (request, response) {
  var loggedInSpotifyApi = new SpotifyWebApi();
  loggedInSpotifyApi.setAccessToken(request.headers['authorization'].split(' ')[1]);
  loggedInSpotifyApi.getPlaylistTracks(request.headers['playlistid'], {
    offset: 0,
    limit: 100,
    fields: 'items'
  })
    .then(function(data) {
      console.log(data.body);
      response.send(data);
    }, function(err) {
      console.error(err);
    });
});

app.get('/specificplaylist2endpoint', function (request, response) {
  var loggedInSpotifyApi = new SpotifyWebApi();
  loggedInSpotifyApi.setAccessToken(request.headers['authorization'].split(' ')[1]);
  loggedInSpotifyApi.getPlaylistTracks(request.headers['playlistid'], {
    offset: 100,
    limit: 100,
    fields: 'items'
  })
    .then(function(data) {
      console.log(data.body);
      response.send(data);
    }, function(err) {
      console.error(err);
    });
});

app.get('/artistendpoint', function (request, response) {
  var loggedInSpotifyApi = new SpotifyWebApi();
  loggedInSpotifyApi.setAccessToken(request.headers['authorization'].split(' ')[1]);
  loggedInSpotifyApi.getArtists(request.headers['artistids'])
    .then(function(data) {
      console.log(data.body);
      response.send(data);
    }, function(err) {
      console.error(err);
    });
});


//-------------------------------------------------------------//


// listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
