import React, { useState } from 'react';
import './OAuthIntegration.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OAuthIntegration = () => {
    const [jsonOutput, setJsonOutput] = useState('');
    const [playlistIds, setPlaylistIds] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState('');

    const fetchData = async (url) => {
        try {
            const response = await fetch(url);
            const data = await response.json();
            setJsonOutput(JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchPlaylistIds = async () => {
        try {
            const response = await fetch('http://localhost:9080/oauth/spotify/getPlayListIDS');
            const data = await response.json();
            setPlaylistIds(data); // Assuming response contains a list of IDs
        } catch (error) {
            console.error('Error fetching Playlist IDs:', error);
        }
    };

    const savePlaylistSongs = async () => {
        if (!selectedPlaylist) {
            alert('Please select a playlist');
            return;
        }

        try {
            const response = await fetch(`http://localhost:9080/oauth/spotify/StoreAllPlayListSongs?id=${selectedPlaylist}`, {
                method: 'GET',
            });
            const data = await response.json();
            setJsonOutput(JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving Playlist Songs:', error);
        }
    };

    const handleSpotifyLogin = () => {
        toast.success('Login Successful with Spotify!');
    };

    return (
        <div className="oauth-container">
            <div className="oauth-sections">
                {/* Reddit OAuth Section */}
                <div className="oauth-section">
                    <h2 className="oauth-title">Reddit OAuth Integration</h2>
                    <a href="http://localhost:9080/oauth/reddit/login">
                        <button className="oauth-button login-button">Login with Reddit</button>
                    </a>
                    <div className="oauth-button-group">
                        <button className="oauth-button spaced-button" onClick={() => fetchData('http://localhost:9080/oauth/reddit/fetchSavedPosts')}>Get Saved Posts</button>
                        <button className="oauth-button spaced-button" onClick={() => fetchData('http://localhost:9080/oauth/reddit/upVotedPosts')}>Get UpVoted Posts</button>
                        <button className="oauth-button spaced-button" onClick={() => fetchData('http://localhost:9080/oauth/reddit/downVotedPosts')}>Get DownVoted Posts</button>
                    </div>
                </div>

                {/* Spotify OAuth Section */}
                <div className="oauth-section">
                    <h2 className="oauth-title">Spotify OAuth Integration</h2>
                    <a href="http://localhost:9080/oauth/spotify/login" onClick={handleSpotifyLogin}>
                        <button className="oauth-button login-button">Login with Spotify</button>
                    </a>
                    <div className="oauth-button-group">
                        <button className="oauth-button spaced-button" onClick={() => fetchData('http://localhost:9080/oauth/spotify/getTopArt')}>Top Artists</button>
                        <button className="oauth-button spaced-button" onClick={() => fetchData('http://localhost:9080/oauth/spotify/getUserPlaylists')}>Fetch Playlists</button>
                    </div>

                    {/* Dropdown to select a Playlist */}
                    <div className="dropdown-container">
                        <button className="oauth-button spaced-button" onClick={fetchPlaylistIds}>Get Playlist IDs</button>
                        <select
                            className="oauth-dropdown"
                            value={selectedPlaylist}
                            onChange={(e) => setSelectedPlaylist(e.target.value)}
                        >
                            <option value="">Select Playlist</option>
                            {playlistIds.map((id) => (
                                <option key={id} value={id}>{id}</option>
                            ))}
                        </select>
                        <button className="oauth-button spaced-button" onClick={savePlaylistSongs}>Save Playlist Songs</button>
                    </div>
                </div>
            </div>

            <textarea
                id="jsonOutput"
                rows="15"
                cols="80"
                readOnly
                value={jsonOutput}
                className="oauth-output"
            />
            <ToastContainer />
        </div>
    );
};

export default OAuthIntegration;
