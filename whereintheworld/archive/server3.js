// Initialization
var http = require('http');
var options = {
	host: 'developer.mbta.com',
	port: 80,
	path: '/lib/rthr/red.json'
}
var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator'); // See documentation at https://github.com/chriso/validator.js
var app = express();
// See https://stackoverflow.com/questions/5710358/how-to-get-post-query-in-express-node-js
app.use(bodyParser.json());
// See https://stackoverflow.com/questions/25471856/express-throws-error-as-body-parser-deprecated-undefined-extended
app.use(bodyParser.urlencoded({ extended: true }));

// Mongo initialization
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/a3';
var mongo = require('mongodb');
var db = mongo.Db.connect(mongoUri, function(error, databaseConnection) {
	db = databaseConnection;
});

app.post('/sendLocation', function(request, response) {
	response.header('Content-Type', 'application/json');
	response.header("Access-Control-Allow-Origin", "*");
  	response.header("Access-Control-Allow-Headers", "X-Requested-With");

	var login = request.body.login;
	var lat = request.body.lat;
	var lng = request.body.lng;
	var password = request.body.password;
	if (login == undefined || lat == undefined || lng == undefined) {
		response.send([]);
	}
	else {
		var toInsert = {
			"login": login,
			"lat": parseFloat(lat),
			"lng": parseFloat(lng),
			"created_at": (new Date()).toJSON(),
			"password":password
		};

		db.collection('locations', function(er, collection) {
			var id = collection.insert(toInsert, function(err, saved) {
				if (err) {
					response.send([]);	// something went wrong!
				}
				else {
					collection.find().sort({created_at:-1}).limit(100).toArray(function(err, docs) {
						response.send(JSON.stringify({"characters":[], "students":docs}));
					})
				}
			});
		});
	}
});

app.get('/locations.json', function(request, response) {
	response.header('Content-Type', 'application/json');
	response.header("Access-Control-Allow-Origin", "*");
  	response.header("Access-Control-Allow-Headers", "X-Requested-With");

	db.collection('locations', function(er, collection) {
		collection.find({login: request.query.login}).sort({created_at: -1}).toArray(function(err, docs) {
			if (err || request.query.login == undefined || request == undefined || request.query == undefined ||
					request.query.login == "" || !docs) {	
				response.send([]); // something went wrong!
			}	
			else {
				response.send(JSON.stringify({"characters":[], "students":docs}));
			}
		})
	})
});
// 
app.get('/', function(request, response) {
	response.set('Content-Type', 'text/html');
	var indexPage = '';
	db.collection('locations', function(er, collection) {
		collection.find().sort({created_at:-1}).toArray(function(err, cursor) {
			if (!err) {
				indexPage += "<!DOCTYPE HTML><html><head><title>Where In The World</title></head><body><h1>I'm watching you...</h1>";
				for (var count = 0; count < cursor.length; count++) {
					indexPage += "<p>Login: " + cursor[count].login + "<br>" +
									"Timestamp: " + cursor[count].created_at + "<br>" +
									"Latitude: " + cursor[count].lat + "<br>" +
									"Longitude: " + cursor[count].lng + "</p>";
				}
				indexPage += "</body></html>"
				response.send(indexPage);
			} else {
				response.send("<!DOCTYPE HTML><html><head><title>Where In The World</title></head><body><h1>Whoops, something went terribly wrong!</h1></body></html>");
			}
		});
	});
});

app.get('/redline.json', function (request, response) {
	response.header('Content-Type', 'application/json');
	response.header('Access-Control-Allow-Origin', '*');
  	response.header("Access-Control-Allow-Headers", "X-Requested-With");

	http.get(options, function(res) {
		var data = '';
		res.on('data', function(chunk) {
			data += chunk;
		});
		res.on('end', function() {
			response.send(data);
		});
	}).on('error', function(e) {
		response.send(500);
	});
});

app.listen(process.env.PORT || 3000);