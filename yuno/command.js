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
					status= ' :cloud::star2::cloud:';
				}
				var message = 'It\'s ' + data.temp + '\u2109 in ' + location + '. ' + data.text + '!' + status;
				send(room, message);
				}).catch(function(err){
				console.log(err);
			});
		},
		forecast: function(name, room, arr){
			var location = _.capitalize(arr[2]);
			if (arr[3]) location += " " + _.capitalize(arr[3]);		
			request.getAsync({
				url:"https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='" + location + "')&format=json"
			}).then(function(res){
				var highs = 'The next three day highs are:';
				var lows = 'The next three day lows are:';
				var message = '';
				var data = JSON.parse(res.body);

				data = data.query.results.channel.item.forecast.slice(0, 3);
				_.forEach(data, function(forecast, key){
					console.log(key)
					if (key < 2){
					  highs += ' ' + forecast.high + '\u2109,';
					  lows += ' ' + forecast.low + '\u2109,';
				  }
				  else{
				  	highs += ' and ' + forecast.high + '\u2109!';
				  	lows += ' and ' + forecast.low + '\u2109.';
				  }
				});
				message += highs + " " +lows;
				send(room, message);
				}).catch(function(err){
				console.log(err);
			});	
		}
	};
};