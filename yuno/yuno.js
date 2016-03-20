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
		['how about you ', '. :smirk:']
	];

	function getDefaultResponse(message){
		var num = Math.floor(Math.random() * (defaultResponses.length + 1));
		return defaultResponses[num][0] + message + defaultResponses[num][1];
	}

	function parse(message){
		message = message.replace(/[,\*]/g, '');
		message = message.toLowerCase();
		return message.split(' ');
	}

	function send(room, message){
		request.postAsync({
			url: 'https://discordapp.com/api/channels/' + room + '/messages',
			form: {content: message},
			headers: {Authorization: localData.token}
		}).then(function(res){
			console.log('yuno: ' + message);
		}).catch(function(err){
			console.log(err);
		});
	}

	return function(userID, name, room, message){
		var arr = parse(message);
		if(checkRoom(room)){
			console.log('(private)');
			if(arr[0] !== 'yuno') arr.unshift('yuno');
		}
		if(checkRoom(room) && privateCommand[arr[1]]) privateCommand[arr[1]](name, room, arr); 
		else if(command[arr[1]]) command[arr[1]](name, room, arr);
		else if(!arr[1]) send(room, 'hmm?');
		else send(room, getDefaultResponse(arr.slice(1).join(' ')));
	};
};