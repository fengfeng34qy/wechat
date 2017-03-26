'use strict';

var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var api = {
    accessToken: prefix + 'token?grant_type=client_credential'
};

function Wechat(opts){
    var that = this;
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.appAccessToken = opts.appAccessToken;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
    // 只有this.getAccessToken执行过后返回Buffer类型，then才会有，否则报错
    this.getAccessToken()
        .then(function(data){
            console.log('data');
            console.log(data);
            try{
                data = JSON.parse(data);
            }catch(e){
                return that.updateAccessToken(data);
            }
            console.log('token是否过期:',!(that.isValidAccessToken(data)));
            if(that.isValidAccessToken(data)){
                console.log('token没有过期Promise.resolve: ');
                return Promise.resolve(data);
            }else{
                console.log('token已过期，重新更新token...');
                return that.updateAccessToken();
            }
        })
        .then(function(data){
            that.access_token = data.access_token;
            that.expires_in = data.expires_in;

            that.saveAccessToken(data);
        })
}

Wechat.prototype.isValidAccessToken = function(data){
    if(!data || !data.access_token || !data.expires_in){
        return false;
    }
    var access_token = data.access_token;
    var expires_in = data.expires_in;
    var now = new Date().getTime();
    if(now < expires_in){
        return true;
    }else{
        return false;
    }
};
Wechat.prototype.updateAccessToken = function() {
    var appID = this.appID;
    var appSecret = this.appSecret;
    var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;

    return new Promise(function(resolve, reject) {
        request({url: url, json: true}).then(function(response) {
            var data = response.body;
            console.log('data');
            console.log(data);
            var now = (new Date().getTime());
            var expires_in = now + (data.expires_in - 20) * 1000;

            data.expires_in = expires_in;

            resolve(data)
        })
    })
}

module.exports = Wechat;