const localData = require('../LOCAL_DATA.json');
const command = require('./command');
const privateCommand = require('./privateCommand');

module.exports = function yuno() {
  function checkRoom(room){
    return room === localData.privateroom;
  }

  const defaultResponses = [
    ['how do i ', '? :confused:'],
    ['*tries her best to ', '.*'],
    ['how about you ', '. :smirk:'],
    ['*puts knife away* ok, i\'ll ', ' instead.'],
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

  return function handleMessage(message) {
    if (message.author.bot) return;
    console.log(message);
    const name = message.author.username;
    const arr = parse(message.content);
    const privateCommandObj = privateCommand(localData,
      message.channel.sendMessage.bind(message.channel));
    const commandObj = command(localData, message.channel.sendMessage.bind(message.channel));
    if (checkRoom(message.channel.id)) {
      console.log('(private)');
      if (arr[0].slice(0, 4) !== 'yuno') arr.unshift('yuno');
    }
    if (arr[0] !== 'yuno') return;
    if (checkRoom(message.channel.id) && privateCommandObj[arr[1]]) {
      privateCommandObj[arr[1]](name, arr);
    } else if (commandObj[arr[1]]) {
      commandObj[arr[1]](name, arr);
    } else if (!arr[1]) {
      message.channel.sendMessage('hmm?');
    } else {
      message.channel.sendMessage(getDefaultResponse(arr.slice(1).join(' ')));
    }
  };
};
