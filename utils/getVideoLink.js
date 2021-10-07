require('dotenv').config();
const { google } = require('googleapis');
const { Spotify } = require('spotify-it');
const spotify = new Spotify( {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET,
});
const soundcloud = require('soundcloud-downloader').default;
const spdl = require('spdl-core').default;
const ytdl = require('ytdl-core');
const parseString = require('./parseString');
const youtube = google.youtube('v3');
const auth = new google.auth.GoogleAuth({
    scopes: [
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.force-ssl',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtubepartner',
    ],
});
const authClient = auth.fromAPIKey(process.env.API);
google.options({ auth: authClient });

/**
 * 
 * @param {string} query 
 * @returns 
 */
const getVideoLink = async (query) => {
    var search = query;
    var item;
    try {
        if (query.startsWith('https://')) {
            const ytmatch = query.match(`^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$`);
            if (ytmatch) {
                try {
                    search = ytdl.getURLVideoID(query);
                    const res = await youtube.videos.list({
                        part: ['snippet'],
                        id: [search],
                        maxResults: 1,
                    });
                    item = res.data.items[0];
                } catch(err) {}
            } else if (query.includes('open.spotify.com')) {
                if (Spotify.validate(query, 'TRACK')) {
                    const info = await spdl.getInfo(query);
                    const track = await spotify.getTrack(query);
                    if (track) {
                        try {
                            const buffer = await track.stream();
                            return {
                                url: track.url,
                                title: parseString(track.title),
                                author: parseString(track.artists.join(', ')),
                                thumbnail: info.thumbnail,
                                resource: buffer,
                                list: [],
                            }
                        } catch(err) {
                            return;
                        }
                    }
                }
                if (Spotify.validate(query, 'PLAYLIST')) {
                    return new Promise(async (resolve, reject) => {
                        const playlist = await spotify.getPlaylist(query, 5);
                        const resources = [];
                        for await (const track of playlist.tracks) {
                            const info = await spdl.getInfo(track.url);
                            try {
                                const buffer = await track.stream();
                                resources.push({
                                    url: track.url,
                                    title: parseString(track.title),
                                    author: parseString(track.artists.join(', ')),
                                    thumbnail: info.thumbnail,
                                    resource: buffer
                                });
                            } catch(err) {
                                continue;
                            }
                        }
                        resolve({
                            author: parseString(playlist.owner.name),
                            title: parseString(playlist.name),
                            url: playlist.url,
                            list: resources
                        });
                    });
                }
                if (Spotify.validate(query, 'ALBUM')) {
                    return new Promise(async(resolve, reject) => {
                        const album = await spotify.getAlbum(query, 5);
                        const resources = [];
                        for await (const track of album.tracks) {
                            const info = await spdl.getInfo(track.url);
                            try {
                                const buffer = await track.stream();
                                resources.push({
                                    url: track.url,
                                    title: parseString(track.title),
                                    author: parseString(track.artists.join(', ')),
                                    thumbnail: info.thumbnail,
                                    resource: buffer
                                });
                            } catch(err) { continue; }
                        }
                        resolve({
                            author: parseString(album.artists.map(u => u.name).join(', ')),
                            title: parseString(album.name),
                            url: album.url,
                            list: resources
                        });
                    });
                }
            } else if (query.includes('soundcloud.com')) {
                if (soundcloud.isPlaylistURL(query)) {
                    return new Promise(async(resolve, reject) => {
                        const info = await soundcloud.getSetInfo(query);
                        const resources = [];
                        var i = 0;
                        for await (const track of info.tracks) {
                            if (++i > 5) break;
                            try {
                                const buffer = await soundcloud.download(track.permalink_url);
                                resources.push({
                                    url: track.permalink_url,
                                    title: track.title,
                                    author: track.user.full_name,
                                    thumbnail: track.artwork_url,
                                    resource: buffer
                                });
                            } catch(e) { continue; }
                        }
                        resolve({
                            author: info.user.full_name,
                            title: info.label_name,
                            url: info.uri,
                            list: resources
                        });
                    });
                } else if (soundcloud.isValidUrl(query)) {
                    const stream = await soundcloud.download(query);
                    if (!stream) return;
                    const info = await soundcloud.getInfo(query);
                    return {
                        url: info.permalink_url,
                        title: parseString(info.title),
                        author: parseString(info.user.full_name),
                        thumbnail: info.artwork_url,
                        resource: stream,
                        list: [],
                    }
                }
            }
        }
        if (!item) {
            const res = await youtube.search.list({
                part: ['snippet'],
                q: search,
                maxResults: 1,
                type: 'video'
            });
            item = res.data.items[0];
        }
        if (!item) return;
        const url = `https://www.youtube.com/watch?v=${item.id.videoId ? item.id.videoId : item.id}`;
        const info = await ytdl.getInfo(item.id.videoId ? item.id.videoId : item.id);
        return {
            url,
            title: parseString(item.snippet.title),
            author: parseString(item.snippet.channelTitle),
            thumbnail: item.snippet.thumbnails.medium.url,
            resource: ytdl.downloadFromInfo(info, {
                format: ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'lowestaudio' })
            }),
            list: [],
        };
    } catch(err) {
        console.log(err.message);
        return;
    }
}

module.exports = getVideoLink;