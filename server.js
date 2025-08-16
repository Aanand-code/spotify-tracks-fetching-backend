const PORT = process.env.PORT || 8888;
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

const getAccessToken = async () => {
  try {
    const basic = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', REFRESH_TOKEN);

    const response = await axios.post(TOKEN_ENDPOINT, params, {
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching in token', error.message);
  }
};

const fetchRecentTracks = async (accessToken) => {
  try {
    const response = await axios.get(
      'https://api.spotify.com/v1/me/player/recently-played?limit=6',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 204) {
      return;
    }

    const tracks = response.data.items;
    if (tracks) {
      const currentTracks = tracks.map((recentTrack) => ({
        spotifyUrl: recentTrack.track.external_urls.spotify,
      }));
      return currentTracks;
    }
  } catch (error) {
    console.error('Error fetching the current track', error.message);
  }
};

app.get('/', (req, res) => {
  getAccessToken().then((token) => {
    fetchRecentTracks(token).then((track) => {
      console.log('Request');

      res.json(track);
    });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port: ${PORT}`);
});
