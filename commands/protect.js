function protect(name, arr){
  name = arr[2] === 'me' || arr[2] === undefined ? name : arr[2];
  var message = 'don\'t worry ' + name + ', yuno will protect you. :revolving_hearts:';
  return message;
}

module.exports = protect;
