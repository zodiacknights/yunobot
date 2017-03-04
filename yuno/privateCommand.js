module.exports = function(localData, send){
  'use strict';
  var Promise = require('bluebird');
  var exec = Promise.promisify(require('child_process').exec);
  var fs = Promise.promisifyAll(require('fs'));

  function getPath(path){
    return localData.path[path];
  }

  function pathNotFound(room){
    send('i coudn\'t find the path for you.');
  }

  function handleErr(err, room){
    send('uh oh, it didn\'t work' + (err ? ' because:\n' + err : '.'));
  }

  return {
    addpath: function(name, arr){
      localData.path[arr[2]] = arr[3];
      fs.writeFileAsync('./LOCAL_DATA.json', JSON.stringify(localData, null, 2)).then(function(){
        send('i added the new path for you.');
      }).catch(function(err){
        handleErr(err, room);
      });
    },
    // cmd: function(name, arr){
    //  var cmd = 'cd ' + (getPath(arr[2]) ? getPath(arr[2]) : arr[2]) + ' && ' +  arr.slice(3).join(' ');
    //  exec(cmd).then(function(stdout){
    //  send('*yells command...* it worked!' + (stdout ? ' it says:\n' + result.stdout : ''));
    //  }).catch(function(err){
    //  handleErr(err, room);
    //  });
    // },
    branch: function(name, arr){
      if(!getPath(arr[2])) return pathNotFound(room);
      var branch = arr[3];
      var cmd = 'cd ' + getPath(arr[2]) + ' && git checkout -b ' + branch + ' upstream/master';
      exec(cmd).then(function(stdout){
        send('*breaks off a tree branch...* don\'t worry ' + branch + ', yuno will protect you.');
      }).catch(function(err){
        handleErr(err, room);
      });
    },
    commit: function(name, arr){
      if(!getPath(arr[2])) return pathNotFound(room);
      var commitMsg = arr.slice(3).join(' ');
      commitMsg = commitMsg.slice(0, 1).toUpperCase() + commitMsg.slice(1);
      var cmd = 'cd ' + getPath(arr[2]) + ' && git add -A && ';
      cmd += 'git commit -m "' + commitMsg + '"';
      exec(cmd).then(function(stdout){
        send('*writes commit message...* there, a hand written note.');
      }).catch(function(err){
        handleErr(err, room);
      });
    },
    delpath: function(name, arr){
      delete localData.path[arr[2]];
      fs.writeFileAsync('./LOCAL_DATA.json', JSON.stringify(localData, null, 2)).then(function(){
        send('path deleted. i\'m going to miss that one...');
      }).catch(function(err){
        handleErr(err, room);
      });
    },
    online: function(name, arr){
      send('Welcome back ' + name + '! :heartpulse:');
    },
    pull: function(name, arr){
      if(!getPath(arr[2])) return pathNotFound(room);
      var cmd = 'cd ' + getPath(arr[2]) + ' && ';
      cmd += 'git pull upstream master';
      exec(cmd).then(function(){
        send('*pulls with all her strength..* i did it, pull complete!');
      }).catch(function(err){
        handleErr(err, room);
      });
    },
    push: function(name, arr){
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
        send('*hnnng...* there we go, ' + arr[2] + ' push to branch ' + branch + ' complete!');
      }).catch(function(err){
        handleErr(err, room);
      });
    },
    rebase: function(name, arr){
      if(!getPath(arr[2])) return pathNotFound(room);
      var cmd = 'cd ' + getPath(arr[2]) + ' && ';
      cmd += 'git pull --rebase upstream master';
      exec(cmd).then(function(){
        send('*sorts commits...* let\'s see... this one goes here... aaand rebase complete!');
      }).catch(function(err){
        handleErr(err, room);
      });
    },
    seppuku: function(name, arr){
      send('i-if you say so...', function(){
        process.exit();
      });
    }
  };
};
