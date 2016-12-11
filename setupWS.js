module.exports = function(wsUrl, localData){
	'use strict';
	var WebSocket = require('ws');
	var yuno = require('./yuno/yuno')(localData);
	var Promise = require('bluebird');
	var fs = Promise.promisifyAll(require('fs'));

	var keepAliveInterval;
	var reconnectAttempts = 1;

	connect();

	function connect(){
		var ws = new WebSocket(wsUrl);

		ws.on('open', function(){
			console.log('yuno: connecting to ' + wsUrl + '.');
			reconnectAttempts = 1;
			var connect = {
				op: 2,
				d: {
					token: localData.token,
					properties: {
						$os: 'Windows',
						$browser: 'Chrome',
						$device: '',
						$referrer: 'https://discordapp.com/@me',
						$referring_domain: 'discordapp.com'
					},
					large_theshold: 250
				}
			};
			ws.send(JSON.stringify(connect));
		});

		ws.on('message', function(data){
			data = JSON.parse(data);
			console.log(data);
			if(data.t === 'READY' || data.t === 'RESUMED') keepAlive(ws, data.d.heartbeat_interval);
			if(data.t === 'MESSAGE_CREATE' &&
				(data.d.content.split(' ')[0].toLowerCase() === 'yuno' ||
					(data.d.channel_id === localData.privateroom && data.d.author.username !== localData.screenname))){
				console.log(data.d.author.username + ': ' + data.d.content);
				yuno(data.d.author.username, data.d.channel_id, data.d.content);
			}
			if(data.t === 'PRESENCE_UPDATE' && data.d.user.id === localData.userid && data.d.status === 'online' && !data.d.guild_id)
				yuno(data.d.user.username, localData.privateroom, 'online');
			if(data.t === 'TYPING_START' && data.d.channel_id === localData.privateroom){
				if(localData.userid !== data.d.user_id){
					localData.userid = data.d.user_id;
					fs.writeFileAsync('LOCAL_DATA.json', JSON.stringify(localData, null, 2));
				}
			}
		});

		ws.on('close', reconnect);
	}

	function keepAlive(ws, newInterval){
		if(keepAliveInterval) clearInterval(keepAliveInterval);
		keepAliveInterval = setInterval(function(){
			ws.send(JSON.stringify({op: 1, d: String(Date.now())}));
		}, newInterval);
	}

	function reconnect(){
		console.log('yuno: disconnected from ' + wsUrl + '.');
		var time = generateInterval(reconnectAttempts);

		setTimeout(function(){
			reconnectAttempts++;
			connect();
		}, time);
	}

	function generateInterval(k){
		return Math.min(30, (Math.pow(2, k) - 1)) * 1000;
	}
};
