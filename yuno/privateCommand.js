module.exports = function(localData, send){
	'use strict';
	var Promise = require('bluebird');
	var exec = Promise.promisify(require('child_process').exec);
	var fs = Promise.promisifyAll(require('fs'));

	function getPath(path){
		return localData.path[path];
	}

	function pathNotFound(room){
		send(room, 'i coudn\'t find the path for you.');
	}

	function handleErr(err, room){
		send(room, 'uh oh, it didn\'t work' + (err ? ' because:\n' + err : '.'));
	}

	return {
		addpath: function(name, room, arr){
			localData.path[arr[2]] = arr[3];
			send(room, 'i added the new path for you.', function(){
				fs.writeFileAsync('./LOCAL_DATA.json', JSON.stringify(localData, null, 2));
			});
		},
		cmd: function(name, room, arr){
			var cmd = 'cd ' + (getPath(arr[2]) ? getPath(arr[2]) : arr[2]) + ' | ' +  arr.slice(3).join(' ');
			exec(cmd).then(function(result){
				send(room, '*yells command...* it worked! ' + (result.stdout ? ' it says:\n' + result.stdout : ''));
			}).catch(function(err){
				handleErr(err, room);
			});
		},
		commit: function(name, room, arr){
			if(!getPath(arr[2])) return pathNotFound(room);
			var commitMsg = arr.slice(3).join(' ');
			commitMsg = commitMsg.slice(0, 1).toUpperCase() + commitMsg.slice(1);
			var cmd = 'cd ' + getPath(arr[2]) + ' | git commit -am "' + commitMsg + '"';
			send(room, '*writes commit mesage...* there, a hand written note.', function(){
				exec(cmd).then(function(stdout){
					console.log(stdout);
				}).catch(function(err){
					handleErr(err, room);
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
			exec(cmd).then(function(){
				send(room, '*pulls with all her strength..* i did it, pull complete!');
			}).catch(function(err){
				handleErr(err, room);
			});
		},
		push: function(name, room, arr){
			if(!getPath(arr[2])) return pathNotFound(room);
			var cmd = 'cd ' + getPath(arr[2]) + ' | git push origin ' + arr[3];
			exec(cmd).then(function(){
				send(room, '*hnnng...* there we go, ' + arr[2] + ' push complete!');
			}).catch(function(err){
				handleErr(err, room);
			});
		},
		rebase: function(name, room, arr){
			if(!getPath(arr[2])) return pathNotFound(room);
			var cmd = 'cd ' + getPath(arr[2]) + ' | git pull --rebase upstream master';
			exec(cmd).then(function(){
				send(room, '*sorts commits...* let\'s see... this one goes here... aaand rebase complete!');
			}).catch(function(err){
				handleErr(err, room);
			});
		},
		seppuku: function(name, room, arr){
			send(room, 'i-if you say so...', function(){
				throw 'yuno: *dies*';
			});
		}
	};
};