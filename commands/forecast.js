const _ = require('lodash');
const Promise = require('bluebird');
const request = Promise.promisifyAll(Promise.promisify(require('request')));


function forecast(name, arr){
  var location = _.capitalize(arr[2]);
  if (arr[4]) location += " " + _.capitalize(arr[4]);
  if (arr[3]) location += " " + _.capitalize(arr[3]);
  return request.getAsync({
    url:"https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='" + location + "')&format=json"
  }).then(function(res){
    var highs = '';
    var lows = '';
    var message = '';
    var data = JSON.parse(res.body);
    var day = [];
    var night = [];
    console.log(day)
    console.log(night)
    data = data.query.results.channel.item.forecast.slice(0, 3);
    _.forEach(data, function(forecast, key){
      day.push(forecast.high);
      night.push(forecast.low);
    });

    console.log(day)
    console.log(night)
    convert = function(forecast){
      console.log(forecast)
      var temps = [];
      return _.forEach(forecast, function(value, key){
        if (forecast > 100){
          temps.push({'temp': 'scorching'})
        }
        else if (value > 81 && value <= 101){
          temps.push({'temp': 'hot'});
        }
        else if (value > 61 && value <= 81 ){
          temps.push({'temp': 'warm'})
        }
        else if(value > 41 && value <= 61){
          temps.push({'temp':'cool'});
        }
        else if(value <= 41){
          temps.push({'temp':'cold'});
        }
      });
      return temps;
    }
    day = convert(day);
    night = convert(night);
    console.log(day)
    if (_.every(day, ['temp', day[0].temp])){
      // if (day[0].temp === 'scorching' || day[0].temp === 'hot' ){
      //  highs += ':sunny::sweat_drops: ';
      // }
      // else if(day[0].temp === 'warm'){
      //  highs += ':gift_heart: ';
      // }
      // else if(day[0].temp === 'cool' || day[0].temp === 'cold'){
      //  highs += ':dash::wind_chime:';
      // }
      highs += 'It\'s ' + day[0].temp + ' the next three days!';
    }
    else{
      if(day[0].temp === day[1].temp){
        highs = ' It\'s' + day[0].temp + ' until the next two days but ' + day[2].temp + ' on the third!';
      }
      else{
        highs += 'It\'s ' + day[0].temp + ' tomorrow but ' + day[1].temp + ' the day after and ' + day[2].temp + ' on the third!';
      }
    }
    if (_.every(night,['temp', night[0].temp])){
      lows += ' ' + _.capitalize(night[0].temp) + ' the next three nights.';
      // if (night[0].temp === 'Scorching' || night[0].temp === 'Hot' ){
      //  lows += ':crescent_moon::sweat_drops: ';
      // }
      // else if(night[0].temp === 'warm'){
      //  lows += ':gift_heart: ';
      // }
      // else if(night[0].temp === 'cool' || night[0].temp === 'cold'){
      //  lows += ':milky_way::wind_chime:';
      // }
    }
    else{
      if(night[0].temp === night[1].temp){
        lows = ' ' + _.capitalize(night[0].temp) + ' until the next two nights but ' + night[2].temp + ' on the third.';
      }
      else{
        lows += ' ' + _.capitalize(night[0].temp) + ' tomorrow night but ' + night[1].temp + ' the night after and ' + night[2].temp + ' on the third.';
      }
    }

    message += highs + lows;
    return message;
  }).catch(function(err){
    console.log(err);
  });
}

module.exports = forecast;
