const _ = require('lodash');
const Promise = require('bluebird');
const request = Promise.promisifyAll(Promise.promisify(require('request')));

function weather(name, arr){
  var location = _.capitalize(arr[2]);
  if (arr[3]) location += " " + _.capitalize(arr[3]);
  return request.getAsync({
    url:"https://query.yahooapis.com/v1/public/yql?q=select item.condition from weather.forecast where woeid in (select woeid from geo.places(1) where text='" + location + "')&format=json"
  }).then(function(res){
    var data = JSON.parse(res.body);
    var status = '';
    data = data.query.results.channel.item.condition;
    if (data.code === '32' || data.code === '34'){
      status = ' :sunny::relaxed::sunny:';
    }
    else if(data.code === '9' || data.code === '11'|| data.code === '12' || data.code === '40'){
      status = ' :sweat_drops::confounded::umbrella:' + " Take an umbrella!";
    }
    else if(data.code === '16' || data.code === '17' || data.code === '41' || data.code === '43'){
      status = ' :snowflake::snowman::snowflake: ';
    }
    else if(parseInt(data.code) > 25 && parseInt(data.code) < 31){
      status= ' :cloud::star2::partly_sunny:';
    }
    var message = 'It\'s ' + data.temp + '\u2109 in ' + location + '. ' + data.text + '!' + status;
    return message;
  }).catch(function(err){
    console.log(err);
  });
}

module.exports = weather;
