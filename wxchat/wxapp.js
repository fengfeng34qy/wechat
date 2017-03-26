var Koa = require('koa');
var sha1 = require('sha1');
var path = require('path');
var wechat = require('./wxchat/g');
var util = require('./libs/util');
var wechat_file = path.join(__dirname, './config/wechat.txt');
var config = {
    wechat: {
        appID: 'wxf9519c4681b18727',
        appSecret: 'ca6a7dfb84bbaa2f9e284d0ff0cf8051',
        token: 'sunfengfengdetoken',
        getAccessToken: function(){
            return util.readFileAsync(wechat_file);
        },
        saveAccessToken: function(data){
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file, data);
        }
    }
};
var app = new Koa();
app.use(wechat(config.wechat));

var port = 80;
app.listen(port);
console.log('service success! port: ' + port);