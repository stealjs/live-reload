var QUnit = require("steal-qunit");
var liveReloadTest = require("live-reload-testing");
var F = require("funcunit");

F.attach(QUnit);

var makeIframe = function(src){
	var iframe = document.createElement("iframe");
	window.removeMyself = function(){
		delete window.removeMyself;
		//document.body.removeChild(iframe);
	};
	document.body.appendChild(iframe);
	iframe.src = src;
};

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
		var content = "var $ = req" + "uire('jquery');req" + "uire('./dep');\nvar span = $('<span class=\"main\">loaded</span>');\n$('#app').append(span);";

		liveReloadTest.put(address, content).then(null, function(){
			QUnit.ok(false, "Reload was not successful");
			QUnit.start();
		});
	});

	F(".main").size(2, "Reloaded so now there is a second span");
});

QUnit.test("reloads when a dependency reloads", function(){
	F(".main").size(1, "There is one main span");

	F(function(){
		var address = "test/basics/dep.js";
		var content = "module.exports={}";

		liveReloadTest.put(address, content).then(null, function(){
			QUnit.ok(false, "Reload was not successful");
			QUnit.start();
		});
	});

	F(".main").size(2, "Reloaded so now there is a second span");
});

QUnit.module("orphan modules", {
	setup: function(assert){
		var done = assert.async();
		F.open("//orphan/index.html", function(){
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

QUnit.test("get disposed during the reload process", function(){
	F("#orphan").exists("The orphaned module is loaded");

	F(function(){
		var address = "test/orphan/main.js";
		var content = "module.exports={};";

		liveReloadTest.put(address, content).then(null, function(){
			QUnit.ok(false, "Reload was not successful");
			QUnit.start();
		});
	});

	F("#orphan").missing("The orphaned module was torn down");
});

QUnit.test("are not orphans if they have another parent", function(){
	F.open("//orphan/other.html");

	F("#orphan").exists("The orphaned module is loaded");

	F(function(){
		var address = "test/orphan/other.js";
		var content = "requ" + "ire('./main'); requ" +
			"ire('live-reload');";

		liveReloadTest.put(address, content).then(null, function(){
			QUnit.ok(false, "Reload was not successful");
			QUnit.start();
		});
	});

	F("#other").missing("other module was torn down");
	F("#orphan").exists("But the orphan module still exists");
});

QUnit.module("retries");

QUnit.asyncTest("work", function(){
	makeIframe("retry/index.html");
});
