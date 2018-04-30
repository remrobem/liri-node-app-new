const dotenv = require('dotenv').config();
const twitter = require('twitter');
const Spotify = require('node-spotify-api');
const request = require('request');
const fs = require('fs');
const keys = require('./keys.js');

let outputLogOnly = false;

// Spotify variables
// let spotifyKeys = new spotify(keys.spotify);


// Twitter variables
let client = new twitter(keys.twitter);
let user = 'mysta2u';
let tweetCount = 20;
let twitterParams = {
    screen_name: user,
    count: tweetCount
};

// randon variables
let fileName = 'random.txt';

// request variables
let command = process.argv[2];
let argument = process.argv[3];

// output variables
let logFile = 'log.txt'
let outputData = '';

processCommand();

function processCommand() {
    // proces the input request
    outputLogOnly = true;
    outputProcess(command);
    outputLogOnly = false;

    switch (command) {

        case `my-tweets`:
            tweets();
            break;
        case `spotify-this-song`:
            song();
            break;
        case `movie-this`:
            movie();
            break;
        case `do-what-it-says`:
            random();
            break;
        case `?`:
            help();
            break;
        default:
            badCommand();
    };
};

//Twitter API to search user timeline for tweets. Each tweet is written to console log along with the Twitter create data/time
function tweets() {

    client.get('statuses/user_timeline', twitterParams, function (error, tweets, response) {
        if (!error) {
            console.log(`Last ${tweetCount} tweets for @${user}:`)
            tweets.forEach(tweet => {
                outputData = (`Tweet: ${tweet.text} | Created: ${tweet.created_at}`);
                outputProcess(outputData);
            });
        } else {
            console.log(`Twitter Error: ${error}`);
        }
    });
};

function song() {

    let songTitle = parameterString();

    let spotify = new Spotify({
        id: 'ceb5029fb31b4621bc2793887cc86c7c',
        secret: 'fd98057b83cd43c6ad18a4bdf9a47d8d'
    });

    let spotifyResults = new Promise(function (resolve, reject) {
        spotify
            .search({
                type: 'track',
                query: songTitle
            }).then(response => {
                // console.log(response);
                // console.log('back from spotify');
                resolve(response);
            })
            .catch(err => {
                console.log(`Spotify search error occured for ${songTitle}:${err}`);
                reject(err);
            });
    });

    spotifyResults
        .then((response) => {
            // console.log('bach from search');
            // console.log(response);
            let items = response.tracks.items;

            items.forEach(item => {
                let artistList = '';
                item.artists.forEach(artist => {
                    artistList = artistList + artist.name + ', ';
                })
                outputData = (`Artists: ${artistList}`);
                outputProcess(outputData);
                outputData = (`Song Title: ${item.name}`);
                outputProcess(outputData);
                outputData = (`Preview: ${item.preview_url}`);
                outputProcess(outputData);
                outputData = (`Album: ${item.album.name}`);
                outputProcess(outputData);

                outputData = (`-----------------------------------------------------------------------------------`);
                outputProcess(outputData);


            })
            //  console.log(response.tracks.items["0"].artists["0"].name);   
            //  console.log(response.tracks.items["0"].name);          
            //  console.log(response.tracks.items["0"].preview_url);
            //  console.log(response.tracks.items["0"].album.name);


            // let spotifySongs = JSON.parse(response);
            //console.log(spotifySongs);


        })
        .catch((err) => console.log(`Spotify search error occured for ${songTitle}:${err}`));
};


function movie() {
    let movieInfo = getOMDB(parameterString());
};

function getOMDB(movieTitle) {

    // OMDB API goes here

    let movieInfo = {
        'title': 'aa'
    };
    return movieInfo;
};

function random() {

    fs.readFile(fileName, 'utf8', function (err, data) {
        if (err) {
            outputData = (`fs error on ${fileName}: ${err}`);
            outputProcess(outputData);
        }
        //input file can have multiple lines of requests

        // remove any " that might be in the request data read from the file
        data = data.replace(/"/g, '');

        //create a new array for each line in the request input file
        let requestArr = data.split('\r\n');

        // attempt to process the request command for each entry in the request array
        // the array entry is split at a comma - this is the seperator between command and argument in the request file
        requestArr.forEach(element => {
            let requestItem = element.split(',');
            command = requestItem[0];
            argument = requestItem[1];
            processCommand();
        });
    });
};

// convert the paramaters passed after the command into a string
function parameterString() {
    let parameters = process.argv.slice(3, process.argv.length);
    let parameterStr = '';
    parameters.forEach((word) => {
        parameterStr = parameterStr + ' ' + word;
    });
    // remove the 1st character from the string. Not sure why it is getting added.
    parameterStr = parameterStr.substring(1);
    return parameterStr;
};

function help() {
    outputData = (`Valid requests are: `);
    outputProcess(outputData);
    outputData = (`  my-tweets`);
    outputProcess(outputData);
    outputData = (`  spotify-this-song <song title>`);
    outputProcess(outputData);
    outputData = (`  movie <movie title>`);
    outputProcess(outputData);
    outputData = (`  do-what-it-says`);
    outputProcess(outputData);
};

function badCommand() {
    outputData = (`${command} is not a valid request`);
    outputProcess(outputData);
    outputData = (`use ? to display valid requests`);
    outputProcess(outputData);
};

// write all console logs to log.txt
function outputProcess(data) {

    timestamp = new Date().toISOString().slice(-24).replace(/\D/g, '').slice(0, 14);
    if (!outputLogOnly) {
        console.log(data);
    };

    return new Promise(function (resolve, reject) {
        fs.appendFileSync(logFile, `${timestamp}:${data}\n`, function (err) {
            if (err) {
                console.log(`Error appending to ${logFile}:${err}`);
                reject(err);
            } else {
                resolve(data);
            }
        });
    });


    
    
    // fs.appendFile(logFile, `${timestamp}:${data}\n`, function (err) {
    //     if (err) {
    //         console.log(`Error appending to ${logFile}:${err}`);
    //     }
    // });
};