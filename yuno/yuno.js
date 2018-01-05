const localData = require('../LOCAL_DATA.json');
const commands = require('../commands/index.js');
const privateCommand = require('./privateCommand');
const lobby = [];

function checkRoom(room){
  return room === localData.privateroom;
}
function listLobby(message) {
  let lobbyMsg = [];
  for (let i = 0; i < lobby.length; i++) {
    lobbyMsg.push(`${i+1}) ${lobby[i]}`);
  }
  message.channel.sendMessage(lobbyMsg);
}

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
  console.log(message)
  const name = message.author.username;
  const arr = parse(message.content);
  const privateCommandObj = privateCommand(localData,
    message.channel.sendMessage.bind(message.channel));
    console.log(arr)
  if (arr[0].includes('steam://joinlobby/')) {
    lobby.push(`${message.author.username}: ${message.content}`);
    listLobby(message);
  }
  if (arr[0] !== 'janus') return;
  if (arr[1].includes('list')) {
    listLobby(message);
  }
  if (arr[1].includes('close')) {
    lobby.splice(parseInt(arr[2]) - 1, 1);
    listLobby(message);
  }
};

module.exports = {
  checkRoom,
  getDefaultResponse,
  parse,
  handleMessage
}
