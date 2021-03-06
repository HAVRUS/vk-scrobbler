(function () {
  'use strict';

  const lastFmClient = new window.LastFMClient(window.vkScrobbler.LastFmApiConfig);

  const LastFmApi = function (secretKey, userName, onReauth) {
    this.secretKey = secretKey;
    this.userName = userName;
    this.onReauth = onReauth;
  };

  LastFmApi.prototype._sendRequest = function (params, data) {
    return lastFmClient.signedCall('POST', Object.assign({
      artist: params.artist,
      track: params.title,
      sk: this.secretKey
    }, data))
      .catch(function (err) {
        if (err.status === 403 || err.status === 401) {
          return this.onReauth && this.onReauth(err);
        }
        throw err;
      }.bind(this));
  };

  LastFmApi.prototype.scrobble = function (params) {
    const ts = Math.round(new Date().getTime() / 1000);

    return this._sendRequest(params, {
      method: 'track.scrobble',
      timestamp: ts
    });
  };

  LastFmApi.prototype.nowPlaying = function (params) {
    return this._sendRequest(params, {method: 'track.updateNowPlaying'});
  };

  LastFmApi.prototype.makeLoved = function (params) {
    return this._sendRequest(params, {method: 'track.love'});
  };

  LastFmApi.prototype.makeNotLoved = function (params) {
    return this._sendRequest(params, {method: 'track.unlove'});
  };

  LastFmApi.prototype.getTrackInfo = function (params) {
    return this._sendRequest(params, {
      method: 'track.getInfo',
      username: this.userName
    });
  };

  window.vkScrobbler.LastFmApi = LastFmApi;
})();
