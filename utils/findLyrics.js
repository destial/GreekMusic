const { searchSong, getLyrics } = require('genius-lyrics-api');
const findLyrics = async (track) => {
    const songs = await searchSong({
        apiKey: process.env.GENIUS_TOKEN,
        title: track.title,
        artist: new String(''),
        optimizeQuery: true,
    });
    if (!songs.length) return;
    const lyrics = await getLyrics(songs[0].url);
    return {
        url: songs[0].url,
        lyrics
    }
}

module.exports = findLyrics;