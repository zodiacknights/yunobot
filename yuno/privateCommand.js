module.exports = function(localData, send){
	'use strict';
	var exec = require('child_process').exec;
	var Promise = require('bluebird');
	var fs = Promise.promisifyAll(require('fs'));

	function getPath(path){
		return localData.path[path];
	}

	function pathNotFound(room){
		send(room, 'i coudn\'t find the path for you.');
	}

	function handleErr(err, room){
		send(room, 'uh oh, it didn\'t work because: ' + err);
	}

	return {
		addpath: function(name, room, arr){
			localData.path[arr[2]] = arr[3];
			send(room, 'i added the new path for you.', function(){
				fs.writeFileAsync('./LOCAL_DATA.json', JSON.stringify(localData, null, 2));
			});
		},
		cmd: function(name, room, arr){
			var cmd = ('cd ' + getPath(arr[2]) ? getPath(arr[2]) : arr[2]) + ' | ' +  arr.slice(3).join(' ');
			exec(cmd, function(err, stdout, stderr){
				if(err) send(room, 'i\'m sorry, i couldn\'t make it work.' + (stderr ? 'it says:\n' + stderr : ''));
				else send(room, '*yells command...* it worked! ' + (stdout ? ' it says:\n' + stdout : ''));
			});
		},
		commit: function(name, room, arr){
			if(!getPath(arr[2])) return pathNotFound(room);
			var commitMsg = arr.slice(3).join(' ');
			commitMsg = commitMsg.slice(0, 1).toUpperCase() + commitMsg.slice(1);
			var cmd = 'cd ' + getPath(arr[2]) + ' | git commit -am "' + commitMsg + '"';
			send(room, '*writes commit mesage...* there, a hand written note.', function(){
				exec(cmd, function(err, stdout, stderr){
					if(err) handleErr(err, room);
				});
			});
		},
		delpath: function(name, room, arr){
			delete localData.path[arr[2]];
			send(room, 'path deleted. i\'m going to miss that one...', function(){
				fs.writeFileAsync('./LOCAL_DATA.json', JSON.stringify(localData, null, 2));
			});
		},
		pull: function(name, room, arr){
			if(!getPath(arr[2])) return pathNotFound(room);
			var cmd = 'cd ' + getPath(arr[2]) + ' | git pull upstream master';
			exec(cmd, function(err){
				if(err) handleErr(err, room);
				else send(room, '*pulls with all her strength..* i did it, pull complete!');
			});
		},
		push: function(name, room, arr){
			if(!getPath(arr[2])) return pathNotFound(room);
			var cmd = 'cd ' + getPath(arr[2]) + ' | git push origin ' + arr[3];
			exec(cmd, function(err){
				if(err) handleErr(err, room);
				else send(room, '*hnnng...* there we go, ' + arr[2] + ' push complete!');
			});
		},
		rebase: function(name, room, arr){
			if(!getPath(arr[2])) return pathNotFound(room);
			var cmd = 'cd ' + getPath(arr[2]) + ' | git pull --rebase upstream master';
			exec(cmd, function(err){
				if(err) handleErr(err, room);
				else send(room, '*sorts commits...* let\'s see... this one goes here... aaand rebase complete!');
			});
		},
		seppuku: function(name, room, arr){
			send(room, 'i-if you say so...', function(){
				throw 'yuno: *dies*';
			});
		}
	};
};