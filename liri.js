const dotenv = require('dotenv').config();
const twitter = require('twitter');
const Spotify = require('node-spotify-api');
const request = require('request');
const fs = require('fs');
const keys = require('./keys.js');
const moment = require('moment');

let outputLogOnly = false;

//keys
let omdbAPIKey = '986e832b';
let spotifyClient = new Spotify(keys.spotify);
let twitterClient = new twitter(keys.twitter);

// Spotify variables
let defaultSong = `The Sign`;

//OMDB default values
let songTitle = parameterString();
let defaultMovie = `Mr. Nobody`;

// Twitter variables
let user = 'mysta2u';
let tweetCount = 20;
let twitterParams = {
    screen_name: user,
    count: tweetCount
};

// randon variables
let fileName = 'random.txt';

// output variables
let logFile = 'log.txt'
let outputData = '';

// request variables
let command = process.argv[2];
let argument = parameterString();

// process the single command proved in the direct request 
processCommand();

// process the commands requested
async function processCommand() {
    // proces the input request
    outputLogOnly = true;
    outputData = (`Request: ${command}`);
    outputProcess(outputData);
    outputLogOnly = false;

    switch (command) {

        case `my-tweets`:
            await tweets();
            break;
        case `spotify-this-song`:
            await song();
            break;
        case `movie-this`:
            await movie();
            break;
        case `do-what-it-says`:
            random();
            break;
        case `?`:
            help();
            break;
        case `help`:
            help();
            break;
        default:
            badCommand();
    };
};

//Twitter API to search user timeline for tweets. Each tweet is written to console log along with the Twitter create data/time
async function tweets() {

    return new Promise(resolve => {

        twitterClient.get('statuses/user_timeline', twitterParams, function (error, tweets, response) {
            outputData = (`-----------------------------------------------------------------------------------`);
            outputProcess(outputData);
            outputData = (`Last ${tweetCount} tweets for @${user}:`);
            outputProcess(outputData);

            if (!error && response.statusCode === 200) {
                // return(tweets);
                tweets.forEach(tweet => {
                    outputData = (`Tweet: ${tweet.text} | Created: ${tweet.created_at}`);
                    outputProcess(outputData);
                });
            } else {
                outputData = (`Something went wrong with the Twitter request`);
                outputProcess(outputData);
                message = JSON.stringify(error);
                outputData = (`Error:${message}`);
                outputProcess(outputData);
                outputData = (`Status Code:${response.statusCode}`);
                outputProcess(outputData);
                message = JSON.stringify(response);
                outputData = (`Response:${message}`);
                outputProcess(outputData);
            }
            outputData = (`-----------------------------------------------------------------------------------`);
            outputProcess(outputData);
            resolve();
        });
    });
};

// get song details
// using Promise to wait for results to reutrn before displaying results
async function song() {

    return new Promise(resolve => {

        let songTitle = argument;
        outputData = (`Song Title Requested:${songTitle}`);
        outputProcess(outputData);

        if (songTitle.length === 0) {
            songTitle = defaultSong;
            outputData = (`Default Song Title Used:${songTitle}`);
            outputProcess(outputData);
        };

        let spotifyResults = new Promise(function (resolve, reject) {
            spotifyClient
                .search({
                    type: 'track',
                    query: songTitle
                }).then(response => {
                    resolve(response);
                })
                .catch(err => {
                    console.log(`Spotify search error occured for ${songTitle}:${err}`);
                    reject(err);
                });
        });

        spotifyResults
            .then((response) => {

                let items = response.tracks.items;
                outputData = (`-----------------------------------------------------------------------------------`);
                outputProcess(outputData);

                items.forEach(item => {
                    if (item.name.toLowerCase() === songTitle.toLowerCase()) {

                        let artistList = '';
                        item.artists.forEach(artist => {
                            artistList = artistList + artist.name + ', ';
                        })
                        outputData = (`Artists: ${artistList}`);
                        outputProcess(outputData);
                        outputData = (`Song Title: ${item.name}`);
                        outputProcess(outputData);
                        if (item.preview_url === null) {
                            item.preview_url = `(not available)`;
                        }
                        outputData = (`Preview: ${item.preview_url}`);
                        outputProcess(outputData);
                        outputData = (`Album: ${item.album.name}`);
                        outputProcess(outputData);

                        outputData = (`-----------------------------------------------------------------------------------`);
                        outputProcess(outputData);
                    };

                });
            });
        resolve();
    });
};


// make sync calls to get movie data
async function movie() {

    return new Promise(resolve => {

        let movie = argument;
        outputData = (`Movie Requested: ${movie}`);
        outputProcess(outputData);

        if (movie.length === 0) {
            movie = defaultMovie;
            outputData = (`Default Movie Used: ${movie}`);
            outputProcess(outputData);
        };

        movie = encodeURIComponent(movie);
        let queryURL = `https://www.omdbapi.com/?t=${movie}&type=movie&y=&plot=&apikey=${omdbAPIKey}`;

        // call to get movie details
        request(queryURL, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                // resolve(body);
                movieDetails = JSON.parse(body);
                if (movieDetails.Response === "False") {
                    outputData = (`Sorry, your movie was not found. Check your spelling or start words with Capital Letters and try again.`);
                    outputProcess(outputData);
                } else {
                    outputData = (`-----------------------------------------------------------------------------------`);
                    outputProcess(outputData);
                    outputData = (`Title: ${movieDetails.Title}`);
                    outputProcess(outputData);
                    outputData = (`Year: ${movieDetails.Year}`);
                    outputProcess(outputData);
                    outputData = (`IMDB Rating: ${movieDetails.imdbRating}`);
                    outputProcess(outputData);
                    let movieRatings = movieDetails.Ratings;
                    let rtRating = 'N/A';
                    movieRatings.forEach(item => {
                        if (item.Source === 'Rotten Tomatoes') {
                            rtRating = item.Value;
                        }
                    });
                    outputData = (`Rotten Tomatoes Rating: ${rtRating}`);
                    outputProcess(outputData);
                    outputData = (`Produced in: ${movieDetails.Country}`);
                    outputProcess(outputData);
                    outputData = (`Language: ${movieDetails.Language}`);
                    outputProcess(outputData);
                    outputData = (`Plot: ${movieDetails.Plot}`);
                    outputProcess(outputData);
                    outputData = (`Actors: ${movieDetails.Actors}`);
                    outputProcess(outputData);
                    outputData = (`-----------------------------------------------------------------------------------`);
                    outputProcess(outputData);
                }
            } else {
                outputData = (`Something went wrong with the OMDB request`);
                outputProcess(outputData);
                outputData = (`Error:${error}`);
                outputProcess(outputData);
                outputData = (`Status Code:${response.statusCode}`);
                outputProcess(outputData);
                outputData = (`Body:${body}`);
                outputProcess(outputData);
            };

            resolve();
        });
    });
};


// process each command found in the random.txt file
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

        //loop thru the requests one time to display them and write to log
        requestArr.forEach(element => {
            let requestItem = element.split(',');
            command = requestItem[0];
            argument = requestItem[1];
            outputData = (`do-what-it-says: Request: ${command} Using:${argument}`);
            outputProcess(outputData);
        });
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
        parameterStr += ' ' + word;
    });
    // remove the 1st character from the string.
    parameterStr = parameterStr.substring(1);
    return parameterStr;
};

//display valid commands
function help() {
    outputData = (`Valid requests are: `);
    outputProcess(outputData);
    outputData = (`  my-tweets`);
    outputProcess(outputData);
    outputData = (`  spotify-this-song <song title>`);
    outputProcess(outputData);
    outputData = (`  movie-this <movie title>`);
    outputProcess(outputData);
    outputData = (`  do-what-it-says`);
    outputProcess(outputData);
};

// handle bad command
function badCommand() {
    outputData = (`${command} is not a valid request`);
    outputProcess(outputData);
    outputData = (`use ? to display valid requests`);
    outputProcess(outputData);
};

// write all console logs to log.txt
function outputProcess(data) {

    timestamp = new moment().format('YYYYMMDDHHmmSS')

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
};