module.exports = function(wsUrl, localData){
	'use strict';
	var WebSocket = require('ws');
	var ws = new WebSocket(wsUrl);
	var yuno = require('./yuno/yuno')(localData);

	var interval;

	ws.on('open', function(){
		var connect = {
			op: 2,
			d: {
				token: localData.token,
				v: 3,
				properties: {
					$os: 'Windows',
					$browser: 'Chrome',
					$device: '',
					$referrer: 'https://discordapp.com/@me',
					$referring_domain: 'discordapp.com'
				},
				large_theshold: 100
			}
		};
		ws.send(JSON.stringify(connect));
	});

	ws.on('message', function(data){
		data = JSON.parse(data);
		if(data.t === 'READY' || data.t === 'RESUMED') keepAlive(data.d.heartbeat_interval);
		if(data.t === 'MESSAGE_CREATE' &&
			(data.d.content.split(' ')[0].toLowerCase() === 'yuno' || 
				(data.d.channel_id === localData.privateroom && data.d.author.username !== 'yunobot'))){
			console.log(data.d.author.username + ': ' + data.d.content);
			yuno(data.d.id, data.d.author.username, data.d.channel_id, data.d.content);
		}
	});

	function keepAlive(newInterval){
		if(interval) clearInterval(interval);
		interval = setInterval(function(){
			ws.send(JSON.stringify({op: 1, d: String(Date.now())}));
		}, newInterval);
	}
};