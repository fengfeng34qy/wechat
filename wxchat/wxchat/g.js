'use strict';

var sha1 = require('sha1');
var getRawBody = require('raw-body'); //把request对象去拼装它的数据，得到buffer的xml数据;
var Wechat = require('./wechat');
var util = require('./util');

module.exports = function(config){
    var wechat = new Wechat(config);
    return function *(next){
        var that = this;
        var token = config.token;
        var signature = this.query.signature;
        var nonce = this.query.nonce;
        var timestamp = this.query.timestamp;
        var echostr = this.query.echostr;

        var str = [token, timestamp, nonce].sort().join('');
        var sha = sha1(str);
        console.log('this.method = '+ this.method);
        if(this.method === 'GET'){
            if(sha === signature){
                this.body = echostr + '';
            }else{
                this.body = '微信测试服务器，关注微信: lov3jj1314。网络日志请访问 http://42.51.12.57:8000';
            }
        }else if(this.method === 'POST'){
            if(sha !== signature){
                this.body = 'wrong';
                return false;
            }
            var data = yield getRawBody(this.req, {
                length: this.length,
                limit: 'lmb',
                encoding: this.charset
            });
            console.log(data.toString());
            var content = yield util.parseXMLAsync(data);
            var message = util.formatMessage(content.xml);
            if(message.MsgType === 'event'){
                if(message.Event === 'subscribe'){
                    console.log('关注事件成功');
                    var now = new Date().getTime();
                    that.status = 200;
                    that.type = 'application/xml';
                    that.body = '<xml>'+
                        '<ToUserName><![CDATA['+message.FromUserName+']]></ToUserName>'+
                        '<FromUserName><![CDATA['+message.ToUserName+']]></FromUserName>'+
                        '<CreateTime>'+now+'</CreateTime>'+
                        '<MsgType><![CDATA[text]]></MsgType>'+
                        '<Content><![CDATA[你好哇！]]></Content>'+
                        '</xml>';
                    return ;
                }
            }
        }
    };
};