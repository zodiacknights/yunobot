const choose = (name, arr) => {
  arr = arr.slice(2).join(' ').split(', ');
  var chosen = arr[Math.floor(Math.random() * arr.length)];
  var message = "I choose " + chosen + "!";
  return message;
}


module.exports = choose;
