var QUnit = require("steal-qunit");
var liveReloadTest = require("live-reload-testing");
var F = require("funcunit");

F.attach(QUnit);

QUnit.module("basics", {
	setup: function(assert){
		var done = assert.async();
		F.open("//basics/index.html", function(){
			done();
		});
	},
	teardown: function(assert){
		var done = assert.async();
		liveReloadTest.reset().then(function(){
			done();
		});
	}
});

QUnit.test("reloads the module when the file changes", function(){
	F(".main").size(1, "There is one main span");

	F(function(){
		var address = "test/basics/main.js";
		var content = "var $ = require('jquery');\nvar span = $('<span class=\"main\">loaded</span>');\n$('#app').append(span);";

		liveReloadTest.put(address, content).then(null, function(){
			QUnit.ok(false, "Reload was not successful");
			QUnit.start();
		});
	});

	F(".main").size(2, "Reloaded so now there is a second span");
});
