module.exports = function(localData, send){
	'use strict';
	var _ = require('lodash');
	var Promise = require('bluebird');
	var request = Promise.promisifyAll(Promise.promisify(require('request')));
	
	return {
		find: function(name, room, arr){
			var search = arr.slice(2).join(' ');
			request.getAsync({
				url: 'https://discordapp.com/api/channels/' + room + '/messages?limit=100',
				headers: {Authorization: localData.token}
			}).then(function(res){
				var body = JSON.parse(res.body);
				body = body.filter(function(message){
					return message.author.username !== 'yunobot' && message.content.toLowerCase().slice(0, 4) !== 'yuno';
				});
				var found = body.filter(function(message){
					return message.content.toLowerCase().indexOf(search) !== -1;
				});
				var message;
				if(found.length > 0){
					message = 'i found it for you! "' + search + '" was mentioned in ' + found.length + 
					' of the last ' + body.length + ' messages and the last was by ' + found[0].author.username + ' who said: "' + found[0].content + '" on ' + Date(found.timestamp) + '.';
				}else{
					message = 'i couldn\'t find it for you, i\'ll look harder next time. :anguished:';
				}
				send(room, message);
			}).catch(function(err){
				console.log(err);
			});
		},
		good: function(name, room, arr){
			var message = name + ' praised me! :smile:';
			send(room, message);
		},
		protect: function(name, room, arr){
			name = arr[2] === 'me' || arr[2] === undefined ? name : arr[2];
			var message = 'don\'t worry ' + name + ', yuno will protect you. :revolving_hearts:';
			send(room, message);
		},
		roomid: function(name, room, arr){
			var message = 'i checked for you and the room id is ' + room + '.';
			send(room, message);
		},
		weather: function(name, room, arr){
			var location = _.capitalize(arr[2]);
			if (arr[3]) location += " " + _.capitalize(arr[3]);
			request.getAsync({
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
				send(room, message);
				}).catch(function(err){
				console.log(err);
			});
		},
		forecast: function(name, room, arr){
			var location = _.capitalize(arr[2]);
			if (arr[4]) location += " " + _.capitalize(arr[4]);	
			if (arr[3]) location += " " + _.capitalize(arr[3]);		
			request.getAsync({
				url:"https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='" + location + "')&format=json"
			}).then(function(res){
				var highs = '';
				var lows = '';
				var message = '';
				var data = JSON.parse(res.body);
				var day = [];
				var night = [];

				data = data.query.results.channel.item.forecast.slice(0, 3);
				_.forEach(data, function(forecast, key){
					day.push(forecast.high);
					night.push(forecast.low);
				});
				var convert = function(forecast){
					var temps = [];
					_.forEach(forecast, function(value, key){
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
				if (_.every(day, ['temp', day[0].temp])){
					// if (day[0].temp === 'scorching' || day[0].temp === 'hot' ){
					// 	highs += ':sunny::sweat_drops: ';
					// }
					// else if(day[0].temp === 'warm'){
					// 	highs += ':gift_heart: ';
					// }
					// else if(day[0].temp === 'cool' || day[0].temp === 'cold'){
					// 	highs += ':dash::wind_chime:';
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
					// 	lows += ':crescent_moon::sweat_drops: ';
					// }
					// else if(night[0].temp === 'warm'){
					// 	lows += ':gift_heart: ';
					// }
					// else if(night[0].temp === 'cool' || night[0].temp === 'cold'){
					// 	lows += ':milky_way::wind_chime:';
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
				send(room, message);
				}).catch(function(err){
				console.log(err);
			});	
		},
		choose: function(name, room, arr){
			arr = arr.slice(2).join(' ').split(', ');
			var chosen = arr[Math.floor(Math.random() * arr.length)];
			var message = "I choose " + chosen + "!";
			send(room, message);
		}
	};
};