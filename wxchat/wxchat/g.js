var Koa = require('koa');
var sha1 = require('sha1');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var mpPrefix = 'https://mp.weixin.qq.com/cgi-bin/';
var semanticUrl = 'https://api.weixin.qq.com/semantic/search?';
var api = {
    accessToken: prefix + 'token?grant_type=client_credential'
};
/*var api = {
    semanticUrl: semanticUrl,
    accessToken: prefix + 'token?grant_type=client_credential',
    temporary: {
        upload: prefix + 'media/upload?',
        fetch: prefix + 'media/get?'
    },
    permanent: {
        upload: prefix + 'material/add_material?',
        fetch: prefix + 'material/get_material?',
        uploadNews: prefix + 'material/add_news?',
        uploadNewsPic: prefix + 'media/uploadimg?',
        del: prefix + 'material/del_material?',
        update: prefix + 'material/update_news?',
        count: prefix + 'material/get_materialcount?',
        batch: prefix + 'material/batchget_material?'
    },
    group: {
        create: prefix + 'groups/create?',
        fetch: prefix + 'groups/get?',
        check: prefix + 'groups/getid?',
        update: prefix + 'groups/update?',
        move: prefix + 'groups/members/update?',
        batchupdate: prefix + 'groups/members/batchupdate?',
        del: prefix + 'groups/delete?'
    },
    user: {
        remark: prefix + 'user/info/updateremark?',
        fetch: prefix + 'user/info?',
        batchFetch: prefix + 'user/info/batchget?',
        list: prefix + 'user/get?'
    },
    mass: {
        group: prefix + 'message/mass/sendall?',
        openId: prefix + 'message/mass/send?',
        del: prefix + 'message/mass/delete?',
        preview: prefix + 'message/mass/preview?',
        check: prefix + 'message/mass/get?'
    },
    menu: {
        create: prefix + 'menu/create?',
        get: prefix + 'menu/get?',
        del: prefix + 'menu/delete?',
        current: prefix + 'get_current_selfmenu_info?'
    },
    qrcode: {
        create: prefix + 'qrcode/create?',
        show: mpPrefix + 'showqrcode?'
    },
    shortUrl: {
        create: prefix + 'shorturl?'
    },
    ticket: {
        get: prefix + 'ticket/getticket?'
    }
};*/
function Wechat(opts){
    var that = this;
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.appAccessToken = opts.appAccessToken;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
    this.getAccessToken()
        .then(function(data){
            try{
                data = JSON.parse(data);
            }catch(e){
                return that.updateAccessToken(data);
            }
            if(that.isValidAccessToken(data)){
                return Promise.resolve(data);
            }else{
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

module.exports = function(config){
    var wechat = new Wechat(config);
    return function *(next){
        var token = config.token;
        var signature = this.query.signature;
        var nonce = this.query.nonce;
        var timestamp = this.query.timestamp;
        var echostr = this.query.echostr;

        var str = [token, timestamp, nonce].sort().join('');
        var sha = sha1(str);
        if(sha === signature){
            this.body = echostr + '';
        }else{
            this.body = '微信测试服务器，关注微信 lov3jj1314。网络日志请访问 http://42.51.12.57:8000';
        }
    };
};