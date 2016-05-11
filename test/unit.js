var QUnit = require("steal-qunit");
var reload = require("live-reload");
var loader = require("@loader");

QUnit.module("Unit tests", {
	setup: function(){
		var fetch = this.oldFetch = loader.fetch;
		loader.fetch = function(load){
			if(load.name === "foo") {
				return Promise.resolve("exports.foo = 'bar'");
			} else if(load.name === "bar") {
				return Promise.resolve("exports.bar = 'bam'");
			}
		};
	},
	teardown: function(){
		loader.fetch = this.oldFetch;
	}
});

QUnit.test("Exports a function", function(assert){
	assert.equal(typeof reload, "function", "reload is a function");
});

QUnit.test("Can take a moduleName to teardown", function(assert){
	var done = assert.async();

	loader.set("foo", loader.newModule({default: {foo:'hah'}}));
	assert.equal(loader.get("foo").default.foo, 'hah', "initial value is right");

	reload("foo")
	.then(function(){
		assert.equal(loader.get("foo").default.foo, 'bar', "value has updated");
	})
	.then(done, done);
});

QUnit.test("Can take an array of moduleNames to teardown", function(assert){
	var done = assert.async();

	loader.set("foo", loader.newModule({default: {foo:'hah'}}));
	assert.equal(loader.get("foo").default.foo, 'hah', "initial value is right");

	loader.set("bar", loader.newModule({default: {bar: 'qux'}}));
	assert.equal(loader.get("bar").default.bar, "qux", "bar is right");

	var msg = JSON.stringify(["foo", "bar"]);
	reload(msg)
	.then(function(){
		assert.equal(loader.get("foo").default.foo, 'bar', "value has updated");
		assert.equal(loader.get("bar").default.bar, "bam", "bar value has updated");
	})
	.then(done, done);
});
