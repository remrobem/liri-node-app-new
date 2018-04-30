# liri-node-app-new

This is a node applcation that responds with console log messages.

The application will return:
    song details        Spotify is used as the source for song details
    movie details       IMDB (via the OBDM API) is the source for movie details
    tweets              Twitter is the source for tweets

Execute by running:

node liri.js <command> <parameter>

Valid commands and parameters are:

    my-tweets
        node liri.js my-tweets
        * up to the last 20 tweets for @mysta2u are retrieved

    spotify-this-song <song title>
        node liri.js spotify-this-song star wars
        * if no song name is provided, you will receive results for the song The Sign

    movie-this <movie title>
        node liri.js help me
        * if no movie name is provided, you will receive results for the movie Mr. Nobody

    do-what-it-says
         node liri.js do-what-is-says
         * file random.txt contains a list of command/parameters that are processed

    ?
    help
        povides a list of valid commands