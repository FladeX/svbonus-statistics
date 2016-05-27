'use strict';

var request = require('request');
var htmlparser = require('htmlparser2');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var source = 'http://svbon.us/';

// DB Url
var url = 'mongodb://localhost:27017/svbonus';

var insertStat = function(db, data, callback) {
	// Get the statistics collection
	var collection = db.collection('statistics');
	// Insert new stats
	collection.insertMany([
		{
			total: data.total
		}
	], function(err, result) {
		assert.equal(err, null);
		assert.equal(1, result.result.n);
		assert.equal(1, result.ops.length);
		console.log('Inserted 1 entry into the collection');
		callback(result);
	});
};

var findDocuments = function(db, callback) {
	// Get the document collection
	var collection = db.collection('statistics');
	// Find some documents
	collection.find({}).toArray(function(err, data) {
		assert.equal(err, null);
		console.log('Found the following records');
		console.log(data);
		callback(data);
	});
};

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
	assert.equal(null, err);
	console.log('Connected successfully to server');

	var statistics = {};

	request(source, function(error, response, html) {
		if (!error && response.statusCode === 200) {
			var isSectionFound = false;
			var isTotalBlockFound = false;
			var isTotalTextFound = false;
			var parser = new htmlparser.Parser({
				onopentag: function(name, attributes) {
					if (name === 'div' && attributes.id === 'infa') {
						isSectionFound = true;
					}
					if (name === 'div' && attributes.class === 'well') {
						if (isSectionFound) {
							isTotalBlockFound = true;
						}
					}
					if (name === 'div' && isTotalBlockFound) {
						isTotalTextFound = true;
					}
				},
				ontext: function(text) {
					if (isTotalTextFound) {
						if (text.match('Доступно: ')) {
							var total = text.match(/\d+/)[0] || 0;
							console.log('Доступно: ' + total);
							statistics.total = total;
							isTotalBlockFound = false;
							isTotalTextFound = false;
						}
					}
				}
			});
			parser.write(html);
			insertStat(db, statistics, function() {
				findDocuments(db, function() {
					db.close();
				});
			});
			parser.end();
		}
	});
});
