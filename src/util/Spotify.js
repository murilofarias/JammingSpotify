let accessToken = '';
let expiresIn;
const clientID = 'cb97324c1d2e4d93936b53b6aa15f8fd';
const redirectURL = "http://SPOT_PLAYLIST.surge.sh";
const Spotify = {};

Spotify.getAccessToken = () => {
    const accessTokenKV = window.location.href.match(/access_token=([^&]*)/);
    if (accessToken)
        return accessToken;
    else if(accessTokenKV)
    {
        const expiresInKV = window.location.href.match(/expires_in=([^&]*)/);
        accessToken = accessTokenKV[1];
        expiresIn = expiresInKV[1];
        window.setTimeout(() => { accessToken = ''; Spotify.getAcessToken();}, expiresIn * 1000);
        window.history.pushState('Access Token', null, '/');
    }
    else
    {
        window.location = 'https://accounts.spotify.com/authorize?client_id=' +clientID+ '&response_type=token&scope=playlist-modify-public&redirect_uri=' +redirectURL;
    }
}



Spotify.search = searchTerm => {
    const url_endPoint = 'https://api.spotify.com/v1/search?type=track&q=' + searchTerm;
    return fetch(url_endPoint, {
        headers:{
            Authorization: 'Bearer ' + accessToken
        }
    })
    .then(response => {
        if(response.ok)
            return response.json();
        else
            throw new Error("Request failed!")
    }, networkError => {
        console.log(networkError.message);
    })
    .then(jsonResponse => {
            return jsonResponse.tracks.items.map(track => {
                return {
                    id: track.id,
                    name: track.name,
                    artist: track.artists[0].name,
                    album: track.album.name,
                    uri: track.uri
                };
        });
    });
}

/*Spotify.formatTrackList = trackURIs => {
    const formattedURIList = [];
    for(let trackURI of trackURIs)
        formattedURIList.push(`spotify:track:${trackURI}`);
    return formattedURIList;
}*/

Spotify.savePlaylist = (playlistName, trackURIs) => {
    if(!playlistName && !trackURIs)
        return;
    
    const headers = {
        Authorization: 'Bearer ' + accessToken
    }
    let userID;
    let playlistID;
    let bodyRequest;
    let snapshotID;
    let endpoint = 'https://api.spotify.com/v1/me';

    fetch(endpoint, {headers: headers})
    .then(response => {
        if(response.ok)
            return response.json();
        else
            throw new Error("Request failed!")
    }, networkError => {
        console.log(networkError.message);
    })
    .then(responseJson => {
        userID = responseJson.id;
        endpoint = `https://api.spotify.com/v1/users/${userID}/playlists`;
        bodyRequest= {name: playlistName};
        return fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(bodyRequest)
        })
    })
    .then(response => {
        if(response.ok)
            return response.json();
        else
            throw new Error("Request failed!")
    }, networkError => {
        console.log(networkError.message);
    })
    .then(responseJson => {
        playlistID = responseJson.id;
        endpoint = `https://api.spotify.com/v1/playlists/${playlistID}/tracks`;
        headers['Content-Type'] = 'application/json';
        bodyRequest = {"uris": trackURIs};
        let snapshotID;
        return fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(bodyRequest)
        });

    })
    .then(response => {
        if(response.ok)
            return response.json();
        else
            throw new Error("Request failed!")
    }, networkError => {
        console.log(networkError.message);
    })
    .then(responseJson => {
        snapshotID = responseJson.id;
    });

    


}

export default Spotify;