// Express initialization
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// See https://stackoverflow.com/questions/5710358/how-to-get-post-query-in-express-node-js
app.use(bodyParser.json());
// See https://stackoverflow.com/questions/25471856/express-throws-error-as-body-parser-deprecated-undefined-extended
app.use(bodyParser.urlencoded({ extended: true }));

// Mongo initialization, setting up a connection to a MongoDB  (on Heroku or localhost)
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/where-in-the-world'; // comp20 is the name of the database we are using in MongoDB
var mongo = require('mongodb');
var db = mongo.Db.connect(mongoUri, function (error, databaseConnection) {
  	db = databaseConnection;
});

app.use(function (req, res, next) {
  	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  	next();
});

app.post('/sendLocation', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.setHeader('Content-Type', 'application/json');

	var login = req.body.login;
	var lat = req.body.lat;
	var lng = req.body.lng;
	var date = Date.now();
	var password = req.body.password;

	if (login==undefined || lat==undefined || lng==undefined) {
		res.send(500);
	}

	var toInsert = {
		"login": login, 
		"lat": parseFloat(lat), 
		"lng": parseFloat(lng), 
		"created_at": date,
		"password":password
	};

	db.collection('locations', function (er, collection) {
		var id = collection.insert(toInsert, function (err, saved) {
			if (err) {
				res.send(500);
			}
			else {
				var data = '';
				collection.find().toArray(function (erro, cursor) {
					if (!erro) {
						data += "{\"characters\":[],\"students\":[";

						var amnt;

						if (cursor.length - 100 >= 0) {
							var tmp = cursor.length - 100;
							amnt = cursor.length - tmp;
						} else {
							amnt = cursor.length;
						}

						for (var count = amnt - 1; count >= 0; count--) {
							data += JSON.stringify(cursor[count]);

							if (count > 0) {
								data += ", ";
							}
						}
						data += "]}";

						res.send(data);
					}
				});
			}
		});
	});
});

app.get('/locations.json', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  	res.set('Content-Type', 'application/json');

  	var login = req.query.login;
  	var data = '';

  	db.collection('locations', function (er, collection) {
		collection.find( { "login":login } ).toArray(function (err, cursor) {
			if (!err) {
				data += "[";

				var amnt;

				if (cursor.length - 100 >= 0) {
					var tmp = cursor.length - 100;
					amnt = cursor.length - tmp;
				} else {
					amnt = cursor.length;
				}

				for (var count = amnt - 1; count >= 0; count--) {
					data += JSON.stringify(cursor[count]);

					if (count > 0) {
						data += ", ";
					}
				}

				data += "]";
				res.send(data);
			}
		});
	});
});


app.get('/', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
 	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.set('Content-Type', 'text/html');

	var content = '';

	var dataJson = '';

  	db.collection('locations', function (er, collection) {
		collection.find().toArray(function (err, data) {
			if (!err) {
				var len = data.length;

				if (len > 0) {
					content = "<!DOCTYPE HTML><html><head><title>People</title><body>";
					for (i = len - 1; i >= 0; i--) {
     					content += "<p>Login: " + data[i]['login'] + 
     					" Latitude: " + data[i]['lat'] + 
     					" Longitude: " + data[i]['lng'] + 
     					" Timestamp: " + data[i]['created_at'] +
     					"</p>";
          			}
          			content += "</body></html>";
          			res.send(content);

  				} else {
  					content += "<!DOCTYPE HTML><html><head><title>People</title><body><p>No one</p></body></html>";
  					res.send(content);
  				}
			}
		});
	});
});

app.get('/redline.json', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  	res.setHeader('Content-Type', 'application/json');

	var http = require('http');
	var options = {
  		host: 'developer.mbta.com',
  		port: 80,
  		path: '/lib/rthr/red.json'
	};

	var data = '';
	http.get(options, function (response) {
  		response.on('data', function (chunk) {
			data += chunk;
		});
		response.on('end', function() {
			res.send(data);
		});
	}).on('error', function (error) {
		response.send(500);
	});
});
// Oh joy! http://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of
app.listen(process.env.PORT || 3000);