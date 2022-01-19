// Name any p5.js functions we use in `global` so Glitch can recognize them.
/* global
 *    createCanvas,background,createButton,random, loadJSON, createP, text, width, height
 *    fill, round, textAlign, CENTER,rect,counts,map, colorMode, HSB, floor, resizeCanvas
 *    noStroke, clear,strokeWeight,strokeCap, ROUND,erase
 */

let playlistIndex;
let durationArray = [];
let totalDurationInMS, totalDurationInMinutes, averageDuration, myDuration;
let popularityArray = [];
let totalPopularity, averagePopularity, myPopularity;
let releaseDateArray = [];
let textSize = 50;
let releaseYearCounts = {};
let myReleaseDate;
let artistCounts = {};
let individualArtistArray = [];
let myArtist;
let showWelcomeMessage = true;
let badInput = false;
let myCanvas;
// let myGenre;

// var showText = function (target,message,index,interval){
//   if(index < message.length){
//     $(target).text($(target).text()+ message[index ++]);
//     setTimeout(function(){ showText(target,message,index,interval);},interval);
//   }
// }

// $(function () {
//   showText("#msg", "Spotify",0,80);
// });


function setup() {
  myCanvas = createCanvas(0, 0).parent("visualization-container");
  background('#FFFFFF');
}

class Duration {
  constructor(trackArray) {
    document.getElementById("visualization-container").style.display = "none";
    erase();
    continueMessage();
  
    continueMessage();
    for (let i = 0; i < trackArray.length; i++) {
      durationArray.push(trackArray[i].track.duration_ms);
    } 
  }
  
  findAverageDuration() {
    totalDurationInMS = 0;
    for (let i = 0; i < durationArray.length; i++) {
      totalDurationInMS += durationArray[i];
    }
    totalDurationInMinutes = totalDurationInMS/60000;
    let average = totalDurationInMinutes/(durationArray.length);
    return average;
  }
  
  printAverageDuration() {
    let minutes = floor(this.findAverageDuration());
    let decimal = this.findAverageDuration() - minutes;
    let seconds = round(decimal * 60);
    let middleString = "minutes and ";
    if (minutes == 1) {
      middleString = "minute and ";
    }
    let finalString = " seconds.";
    if (seconds == 1) {
      finalString = " second.";
    }
    var durationMessage = $('<h2 id="durationMessage"> The average length of a song on your playlist is ' + minutes + ' ' + middleString + seconds + finalString + '</h2>');
    durationMessage.appendTo('#analysis-container');
  }
}

class Popularity {
  constructor(trackArray) {
    document.getElementById("visualization-container").style.display = "none";
    erase();
    continueMessage();
    this.trackArray = trackArray;
    this.popularity2Message, this.popularity3Message = "";
    for (let i = 0; i < trackArray.length; i++) {
      popularityArray.push(trackArray[i].track.popularity);
    } 
  }
  
  findAveragePopularity() {
    totalPopularity = 0;
    for (let i = 0; i < popularityArray.length; i++) {
      totalPopularity += popularityArray[i];
    }
    let average = totalPopularity/(popularityArray.length);
    return average;
  }
  
  extremePopular() {
    popularityArray.sort();
    let leastPopularValue = popularityArray[0];
    let leastPopularTrackName = this.trackArray[0].track.name;
    let mostPopularTrackName = this.trackArray[0].track.name;
    let mostPopularValue = popularityArray[popularityArray.length - 1];
    for (let i = 1; i < this.trackArray.length; i++) {
      if (this.trackArray[i].track.popularity == leastPopularValue) {
        leastPopularTrackName = this.trackArray[i].track.name;
      }
      if (this.trackArray[i].track.popularity == mostPopularValue) {
        mostPopularTrackName = this.trackArray[i].track.name;
      }
    }
    this.popularity2Message = '<h2 id="popularity2Message"> The least popular song on this playlist is &quot;' + leastPopularTrackName + "&quot; with a popularity score of " + leastPopularValue + ".</h2>"
    this.popularity3Message = '<h2 id="popularity3Message"> The most popular song on this playlist is &quot;' + mostPopularTrackName + "&quot; with a popularity score of " + mostPopularValue + ".</h2>"
  }
  
  printAveragePopularity(){
    let result = this.findAveragePopularity();
    var popularityMessage = $('<h2 id="popularityMessage"> A typical song on the playlist has a popularity score of ' + round(result) + '.</h2>');
    popularityMessage.appendTo('#analysis-container');
    this.extremePopular();
    $(this.popularity2Message).appendTo('#analysis-container');
    $(this.popularity3Message).appendTo('#analysis-container');
  }
}

class ReleaseDate {
  constructor(trackArray) {
    document.getElementById("visualization-container").style.display = "block";
    erase();
    continueMessage();
    this.trackArray = trackArray;
    this.maxYear = 0;
    erase();
    continueMessage();
    for (let i = 0; i < trackArray.length; i++){
      if (trackArray[i].track.album.release_date_precision == "day" || trackArray[i].track.album.release_date_precision == "year" || trackArray[i].track.album.release_date_precision == "month") {
        let key = trackArray[i].track.album.release_date.split("-")[0];
        if (releaseYearCounts.hasOwnProperty(key)) {
          releaseYearCounts[key]++;
        } else {
          releaseYearCounts[key] = 1;
        }
      } else {
        console.log("Not yet handled.");
        console.log(trackArray[i].track.album.release_date_precision);
        console.log(trackArray[i].track.album.release_date);
      }
    }
    this.years = Object.keys(releaseYearCounts).sort();
  }
  findOldest() {
    let oldestSongYear = this.years[0];
    for (let i = 0; i < this.trackArray.length; i++) {
      if(this.trackArray[i].track.album.release_date.split("-")[0] == oldestSongYear) {
        return [this.trackArray[i].track.name, oldestSongYear, this.trackArray[i].track.album.artists[0].name];
      }
    }
  }
  drawHistogram() {
    for (let i = 0; i < this.years.length; i++){
      let year = this.years[i];
      let num = releaseYearCounts[year];
      if (num > this.maxYear){
        this.maxYear = num;
      }
    }
    
    resizeCanvas(1000, 500);
    background(40,40,33,255);
    
    let w = width / this.years.length;
    
    for(let i = 0; i < this.years.length; i++){
      let year = this.years[i];
      let num = releaseYearCounts[year];
      let h = map(num,0,this.maxYear,0,300);
      fill('#1DB954');
      noStroke();
      rect(i*w,height-h,w-1,h,2);
      fill('#ffffff');
      text(year, i * w + w/4, height - h - 5);
    }
  }
  printReleaseDate() {
    this.drawHistogram();
    var releaseDateMessage = $('<h2 id="releaseDateMessage"> One of the oldest songs on this playlist is \"' + this.findOldest()[0] + '.\"</h2>');
    var release2DateMessage = $('<h2 id="release2DateMessage"> It&apos;s a ' + this.findOldest()[2] + ' song from ' + this.findOldest()[1] + '.</h2>');
    var release3DateMessage = $('<h2 id="release3DateMessage"> The greatest number of songs from any given year is ' + this.maxYear + ".");
    var release4DateMessage = $('<h2 id="release4DateMessage"> See below for a visualization of the release years of songs on this playlist: </h2>');
    releaseDateMessage.appendTo('#analysis-container');
    release2DateMessage.appendTo('#analysis-container');
    release3DateMessage.appendTo('#analysis-container');
    release4DateMessage.appendTo('#analysis-container');
  }
}

class Artist {
  constructor(trackArray) {
    document.getElementById("visualization-container").style.display = "none";
    erase();
    continueMessage();
    for (let i = 0; i < trackArray.length; i++) {
      individualArtistArray = trackArray[i].track.artists;
      for (let j = 0; j < individualArtistArray.length; j++) {
        let key = trackArray[i].track.artists[j].name;
        if (artistCounts.hasOwnProperty(key)) {
          artistCounts[key]++;
        } else {
          artistCounts[key] = 1;
        }
      }
    }
  }
  
  findMostCommonArtist() {
    // Citation: https://stackoverflow.com/questions/51510272/getting-keys-with-maximum-value-in-javascript-hashmap-object
    let max = Object.keys(artistCounts).reduce((a, v) => Math.max(a, artistCounts[v]), -Infinity);
    let result = Object.keys(artistCounts).filter(v => artistCounts[v] === max);
    // End Citation
    console.log(max);
    console.log(result);
    if (result.length == 1) {
      return '<h2 id="artistMessage">' + result[0] + ' is the artist with the greatest number of songs in this playlist (' + max + ' songs).</h2>'
    }
    if (max > 1) {
      if (result.length == 2) {
        return '<h2 id="artistMessage">' + result[0] + ' and ' + result[1] + ' are the artists with the greatest number of songs in this playlist (' + max + ' songs).</h2>'
      }
      return '<h2 id="artistMessage>" Multiple artists have ' + max + ' songs in this playlist. </h2>'
    }
    return '<h2 id="artistMessage"> No artist has more than one song on this playlist. </h2>'
  }
  
  printArtist() {
    $(this.findMostCommonArtist()).appendTo('#analysis-container');
  }
}


$(function() {
   
  $('#login').click(function() {
    // Call the authorize endpoint, which will return an authorize URL, then redirect to that URL
    $.get('/authorize', function(data) {
      window.location = data;
    });
  });
  
  const hash = window.location.hash
    .substring(1)
    .split('&')
    .reduce(function (initial, item) {
      if (item) {
        var parts = item.split('=');
        initial[parts[0]] = decodeURIComponent(parts[1]);
      }
      return initial;
    }, {});
    window.location.hash = '';
  
  if (hash.access_token) {
    document.getElementById("login").style.display = "none";
    
    $.get({url: '/playlistsendpoint', headers: {"Authorization": `Bearer ${hash.access_token}`}}, function(data) {
      // "Data" is the array of playlist objects we get from the API. See server.js for the function that returns it.
      var title = $('<h3>Your playlists:</h3>');
      title.prependTo('#data-container');

      // For each of the playlists, create an element
      data.items.forEach(function(playlist) {
        // textAlign(CENTER);
        // text(playlist.name, width/2, height/2);
        var playlistDiv = $('<li class="playlist"></li>');
        playlistDiv.text(playlist.name);
        playlistDiv.appendTo('#data-container ol');
      });
      var title2 = $('<h3 id="playlistSelectionTitle">Which playlist would you like to analyze?</h3>');
      title2.appendTo('#data-container');
      
      document.getElementById("playlistSelectionInput").style.display = "block";
      document.getElementById("playlistSelectionButton").style.display = "block";
      
      $('#playlistSelectionButton').click(function() {
        document.getElementById("data-container").style.display = "none";
        document.getElementById("playlistSelectionTitle").style.display = "none";
        document.getElementById("playlistSelectionInput").style.display = "none";
        document.getElementById("playlistSelectionButton").style.display = "none";
        let userInput = document.getElementById("playlistSelectionInput").value;
        if (userInput >= 1 && userInput <= data.items.length) {
          playlistIndex = round(userInput) - 1;
        } else {
          badInput = true;
          playlistIndex = 0;
        }
        var title2 = $('<h2 id="exploreCategoryTitle"> Let&apos;s get started. Select a category for analysis: </h2>');
        title2.prependTo('#welcome-container');
        if (badInput === false) {
          var title = $('<h2 id="successfulSelection">&quot;' + data.items[playlistIndex].name + '&quot; is an excellent choice.' + '</h2>');
        } else {
          var title = $('<h2 id="successfulSelection"> Your playlist choice is invalid, so we&apos;ve chosen &quot;' + data.items[playlistIndex].name + '&quot; for you.' + '</h2>'); 
        }
        title.prependTo('#welcome-container'); 
        
        document.getElementById("artistButton").style.display = "block";
        document.getElementById("durationButton").style.display = "block";
        document.getElementById("popularityButton").style.display = "block";
        document.getElementById("releaseDateButton").style.display = "block";
        
        let playlistID = data.items[playlistIndex].id;
        if (hash.access_token) {
          $.get({url: '/specificplaylistendpoint', headers: {"Authorization": `Bearer ${hash.access_token}`, "PlaylistID": playlistID}}, function(data) {
            console.log(data.body.items);
            let trackArray = data.body.items;
            if (hash.access_token) {
              $.get({url: '/specificplaylist2endpoint', headers: {"Authorization": `Bearer ${hash.access_token}`, "PlaylistID": playlistID}}, function(data) {
                console.log(trackArray.concat(data.body.items));
                $('#durationButton').click(function() {
                  deleteWelcomeMessage();
                  document.getElementById("analysis-container").innerHTML = "";
                  document.getElementById("durationButton").style.display = "none";
                  myDuration = new Duration(trackArray);
                  myDuration.printAverageDuration();
                });
                $('#popularityButton').click(function() {
                  deleteWelcomeMessage();
                  document.getElementById("analysis-container").innerHTML = "";
                  document.getElementById("popularityButton").style.display = "none";
                  myPopularity = new Popularity(trackArray);
                  myPopularity.printAveragePopularity();
                });
                $('#releaseDateButton').click(function() {
                  deleteWelcomeMessage();
                  document.getElementById("analysis-container").innerHTML = "";
                  document.getElementById("releaseDateButton").style.display = "none";
                  myReleaseDate = new ReleaseDate(trackArray);
                  myReleaseDate.printReleaseDate();
                });
                $('#artistButton').click(function() {
                  deleteWelcomeMessage();
                  document.getElementById("analysis-container").innerHTML = "";
                  document.getElementById("artistButton").style.display = "none";
                  myArtist = new Artist(trackArray);
                  myArtist.printArtist();
                });
              });
          }
        });
      }
    });
    });
  }
});

function deleteWelcomeMessage() {
  $("#welcome-container").html("");
}

function continueMessage() {
  let releaseDateIsDisplayed = (document.getElementById("releaseDateButton").style.display == "block");
  let durationIsDisplayed = (document.getElementById("durationButton").style.display == "block");
  let popularityIsDisplayed = (document.getElementById("popularityButton").style.display == "block");
  let artistIsDisplayed = (document.getElementById("artistButton").style.display == "block");
  if (releaseDateIsDisplayed || durationIsDisplayed || popularityIsDisplayed || artistIsDisplayed) {
    document.getElementById("continueMessage").style.display = "block";
  } else {
    document.getElementById("continueMessage").innerText = "Thanks for using Unwrapped for Spotify! Log out to analyze another playlist.";
  }
}


