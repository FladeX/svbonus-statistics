'use strict';

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var config = require('./config');

// DB Url
var url = config.databaseUrl;

var findDocuments = function(db, callback) {
	// Get the document collection
	var collection = db.collection(config.databaseCollection);
	// Find some documents
	collection.find({}).toArray(function(err, data) {
		assert.equal(err, null);
		var period = {
			start	: 0,
			end		: 0
		};
		var bonus = {
			total		: 0,
			previous: 0,
			time		: 0
		};
		console.log('Found the following records');
		data.forEach(function(element) {
			if (!period.start) {
				period.start = element.date;
			}
			period.end = element.date;
			var lastCount = parseInt(element.lastCount);
			if (bonus.previous !== lastCount || bonus.time !== element.lastTime) {
				bonus.total += lastCount;
			}
			bonus.previous = lastCount;
			bonus.time = element.lastTime;
		});
		console.log('Total bonuses: ' + bonus.total);
		console.log('Period: ' + (period.end - period.start));
		callback(data);
	});
};

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
	assert.equal(null, err);
	console.log('Connected successfully to server');

	findDocuments(db, function() {
		db.close();
	});
});
