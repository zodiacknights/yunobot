(function(){
	'use strict';
	var Promise = require('bluebird');
	var request = Promise.promisifyAll(Promise.promisify(require('request')));
	var fs = Promise.promisifyAll(require('fs'));
	var localData;
	try{
		localData = require('./LOCAL_DATA');
	}catch(err){
		fs.writeFileAsync('LOCAL_DATA.json', JSON.stringify({
			screenname: '--yuno discord name--',
			login: {
				email: '--email--',
				password: '--password--'
			},
			paths: {},
			privateroom: '',
			ignore: []
		}, null, 2)).then(function(){
			throw 'yuno: please open LOCAL_DATA.json and fill in my login info.';
		});
	}
	var setupWS = require('./setupWS.js');

	function getToken(){
		if(localData.token){
			return new Promise(function(resolve){
				resolve();
			});
		}else{
			return request.postAsync({
				url: 'https://discordapp.com/api/auth/login',
				form: localData.login
			}).then(function(res){
				var token = JSON.parse(res.body).token;
				if(!token) throw 'yuno: login failed, maybe the email or password is incorrect?';
				localData.token = token;
				fs.writeFile('LOCAL_DATA.json', JSON.stringify(localData, null, 2));
				return getToken();
			});
		}
	}

	if(localData){
		getToken().then(function(){
			return request.getAsync({
				url: 'https://discordapp.com/api/gateway',
				headers: {Authorization: localData.token}
			});
		}).then(function(res){
			var wsUrl = JSON.parse(res.body).url;
			console.log('yuno: connecting to ' + wsUrl + '.');
			setupWS(wsUrl, localData);
		});
	}
})();