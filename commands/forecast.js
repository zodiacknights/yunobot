const _ = require('lodash');
const Promise = require('bluebird');
const request = Promise.promisifyAll(Promise.promisify(require('request')));

function convert(tempuratures) {
  const temps = [];
  _.forEach(tempuratures, (value) => {
    if (value > 100) {
      temps.push({ temp: 'scorching' });
    } else if (value > 81 && value <= 101) {
      temps.push({ temp: 'hot' });
    } else if (value > 61 && value <= 81) {
      temps.push({ temp: 'warm' });
    } else if (value > 41 && value <= 61) {
      temps.push({ temp: 'cool' });
    } else if (value <= 41) {
      temps.push({ temp: 'cold' });
    }
  });
  return temps;
}

function getWeatherEmote(temp, isDaytime) {
  if (temp === 'scorching' || temp === 'hot') {
    return isDaytime ? ':sunny::sweat_drops:' : ':crescent_moon::sweat_drops:';
  } else if (temp === 'warm') {
    return isDaytime ? ':white_sun_small_cloud::gift_heart:' : ':star2::gift_heart:';
  }
  return isDaytime ? ':dash::wind_chime:' : ':milky_way::wind_chime:';
}

function forecast(name, arr) {
  let location = _.capitalize(arr[2]);
  if (arr[4]) location += ` ${_.capitalize(arr[4])}`;
  if (arr[3]) location += ` ${_.capitalize(arr[3])}`;
  return request.getAsync({
    url: `https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='${location}')&format=json`,
  }).then((res) => {
    let highs = '';
    let lows = '';
    let message = '';
    let data = JSON.parse(res.body);
    let day = [];
    let night = [];

    if (!data.query || !data.query.results) return 'uh oh, i couldn\'t find a forecast for that city';
    data = data.query.results.channel.item.forecast.slice(0, 3);
    _.forEach(data, (dailyForecast) => {
      day.push(dailyForecast.high);
      night.push(dailyForecast.low);
    });

    day = convert(day);
    night = convert(night);

    highs += `${getWeatherEmote(day[0].temp, true)} `;
    if (_.every(day, ['temp', day[0].temp])) {
      highs += `It's ${day[0].temp} the next three days!`;
    } else if (day[0].temp === day[1].temp) {
      highs += `It's ${day[0].temp} the next two days but ${day[2].temp} on the third!`;
    } else {
      highs += `It's ${day[0].temp} tomorrow but ${day[1].temp} the second day and ${day[2].temp} on the third!`;
    }

    lows += `${getWeatherEmote(day[0].temp)} `;
    if (_.every(night, ['temp', night[0].temp])) {
      lows += `${_.capitalize(night[0].temp)} the next three nights.`;
    } else if (night[0].temp === night[1].temp) {
      lows += `${_.capitalize(night[0].temp)} for the next two nights but ${night[2].temp} on the third.`;
    } else {
      lows += `${_.capitalize(night[0].temp)} tomorrow night but ${night[1].temp} the night after and ${night[2].temp} on the third.`;
    }

    message += `${highs} ${lows}`;
    return message;
  });
}

module.exports = forecast;
