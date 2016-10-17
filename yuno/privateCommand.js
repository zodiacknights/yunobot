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

	function addIgnores(cmd, checkout){
		var action = checkout ? 'checkout' : 'reset';
		return localData.ignore.reduce(function(newCmd, ignore){
			return newCmd + 'git ' + action + ' -- ' + ignore + ' && ';
		}, cmd);
	}

	return {
		addpath: function(name, room, arr){
			localData.path[arr[2]] = arr[3];
			fs.writeFileAsync('./LOCAL_DATA.json', JSON.stringify(localData, null, 2)).then(function(){
				send(room, 'i added the new path for you.');
			}).catch(function(err){
				handleErr(err, room);
			});
		},
		// cmd: function(name, room, arr){
		// 	var cmd = 'cd ' + (getPath(arr[2]) ? getPath(arr[2]) : arr[2]) + ' && ' +  arr.slice(3).join(' ');
		// 	exec(cmd).then(function(stdout){
		// 		send(room, '*yells command...* it worked!' + (stdout ? ' it says:\n' + result.stdout : ''));
		// 	}).catch(function(err){
		// 		handleErr(err, room);
		// 	});
		// },
		branch: function(name, room, arr){
			if(!getPath(arr[2])) return pathNotFound(room);
			var branch = arr[3];
			var cmd = 'cd ' + getPath(arr[2]) + ' && git checkout -b ' + branch + ' upstream/master';
			exec(cmd).then(function(stdout){
				send(room, '*breaks off a tree branch...* don\'t worry ' + branch + ', yuno will protect you.');
			}).catch(function(err){
				handleErr(err, room);
			});
		},
		commit: function(name, room, arr){
			if(!getPath(arr[2])) return pathNotFound(room);
			var commitMsg = arr.slice(3).join(' ');
			commitMsg = commitMsg.slice(0, 1).toUpperCase() + commitMsg.slice(1);
			var cmd = 'cd ' + getPath(arr[2]) + ' && git add -A && ';
			cmd = addIgnores(cmd);
			cmd += 'git commit -m "' + commitMsg + '"';
			exec(cmd).then(function(stdout){
				send(room, '*writes commit message...* there, a hand written note.');
			}).catch(function(err){
				handleErr(err, room);
			});
		},
		delpath: function(name, room, arr){
			delete localData.path[arr[2]];
			fs.writeFileAsync('./LOCAL_DATA.json', JSON.stringify(localData, null, 2)).then(function(){
				send(room, 'path deleted. i\'m going to miss that one...');
			}).catch(function(err){
				handleErr(err, room);
			});
		},
		online: function(name, room, arr){
			send(room, 'Welcome back ' + name + '! :heartpulse:');
		},
		pull: function(name, room, arr){
			if(!getPath(arr[2])) return pathNotFound(room);
			var cmd = 'cd ' + getPath(arr[2]) + ' && ';
			cmd = addIgnores(cmd, true);
			cmd += 'git pull upstream master';
			exec(cmd).then(function(){
				send(room, '*pulls with all her strength..* i did it, pull complete!');
			}).catch(function(err){
				handleErr(err, room);
			});
		},
		push: function(name, room, arr){
			if(!getPath(arr[2])) return pathNotFound(room);
			var cmd = 'cd ' + getPath(arr[2]) + ' && git branch';
			var branch;
			exec(cmd).then(function(stdout){
				var branches = stdout.split('\n');
				branch = branches.find(function(branch){
					return branch[0] === '*';
				});
				branch = branch.slice(2);
				cmd = 'cd ' + getPath(arr[2]) + ' && git push origin ' + branch;
				return exec(cmd);
			}).then(function(){
				send(room, '*hnnng...* there we go, ' + arr[2] + ' push to branch ' + branch + ' complete!');	
			}).catch(function(err){
				handleErr(err, room);
			});
		},
		rebase: function(name, room, arr){
			if(!getPath(arr[2])) return pathNotFound(room);
			var cmd = 'cd ' + getPath(arr[2]) + ' && ';
			cmd += 'git pull --rebase upstream master';
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