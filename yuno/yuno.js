module.exports = function(localData){
	'use strict';
	var Promise = require('bluebird');
	var request = Promise.promisifyAll(Promise.promisify(require('request')));
	var command = require('./command')(localData, send);
	var privateCommand = require('./privateCommand')(localData, send);

	function checkRoom(room){
		return room === localData.privateroom;
	}

	var defaultResponses = [
		['how do i ', '? :confused:'],
		['*tries her best to ', '.*'],
		['how about you ', '. :smirk:'],
		['*puts knife away* ok, i\'ll ', ' instead.']
	];

	function getDefaultResponse(message){
		var num = Math.floor(Math.random() * defaultResponses.length);
		return defaultResponses[num][0] + message + defaultResponses[num][1];
	}

	function parse(message){
		message = message.replace(/[\*]/g, '');
		message = message.toLowerCase();
		return message.split(' ');
	}

	var rateLimit = 1000;
	var lastSend = Date.now();

	function send(room, message, cb){
		var now = Date.now();
		if(lastSend + rateLimit > now){
			setTimeout(function(){
				send(room, message, cb);
			}, lastSend + rateLimit - now);
			return;
		}
		lastSend = Date.now();
		request.postAsync({
			url: 'https://discordapp.com/api/channels/' + room + '/messages',
			form: {content: message},
			headers: {Authorization: localData.token}
		}).then(function(res){
			console.log('yuno: ' + message);
			if(cb) cb();
		}).catch(function(err){
			console.log(err);
			if(cb) cb();
		});
	}

	return function(name, room, message){
		var arr = parse(message);
		if(checkRoom(room)){
			console.log('(private)');
			if(arr[0].slice(0, 4) !== 'yuno') arr.unshift('yuno');
		}
		if(checkRoom(room) && privateCommand[arr[1]]) privateCommand[arr[1]](name, room, arr); 
		else if(command[arr[1]]) command[arr[1]](name, room, arr);
		else if(!arr[1]) send(room, 'hmm?');
		else send(room, getDefaultResponse(arr.slice(1).join(' ')));
	};
};