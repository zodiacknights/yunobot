const localData = require('../LOCAL_DATA.json');
const commands = require('../commands/index.js');
const privateCommand = require('./privateCommand');

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
  function sendQuery(name, arr){
    return commands[arr[1]](name,arr);
  }
  function handleMessage(message){
    if (message.author.bot) return;
    const name = message.author.username;
    const arr = parse(message.content);
    const privateCommandObj = privateCommand(localData,
      message.channel.sendMessage.bind(message.channel));
    if (checkRoom(message.channel.id)) {
      console.log('(private)');
      if (arr[0].slice(0, 4) !== 'yuno') arr.unshift('yuno');
    }
    if (arr[0] !== 'yuno') return;
    if (checkRoom(message.channel.id) && privateCommandObj[arr[1]]) {
      privateCommandObj[arr[1]](name, arr);
    } else if (commands[arr[1]]) {
      const result = sendQuery(name, arr);
      if (typeof result === 'string') {
        message.channel.sendMessage(result);
      } else {
        result.then(function (msg) {
          message.channel.sendMessage(msg);
        }).catch((err) => {
          message.channel.sendMessage(`uh oh, it didn't work because:\n${err}`);
        });
      }
    } else if (!arr[1]) {
      message.channel.sendMessage('hmm?');
    } else {
      message.channel.sendMessage(getDefaultResponse(arr.slice(1).join(' ')));
    }
  };

  module.exports = {
    checkRoom,
    getDefaultResponse,
    parse,
    handleMessage
  }
