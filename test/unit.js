var QUnit = require("steal-qunit");
var reload = require("live-reload");
var reloader = require("live-reload");
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
		loader.delete("foo");
		loader.delete("bar");
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

QUnit.module("reload.dispose", {
	setup: function(assert){
		var done = assert.async();
		var test = this;

		var fetch = this.oldFetch = loader.fetch;
		loader.fetch = function(load){
			if(load.name === "foo") {
				var src = "requ" + "ire('bar');";
				return Promise.resolve(src);
			} else if(load.name === "bar") {
				return Promise.resolve("exports.bar = 'bam'");
			}
		};

		loader.import("live-reload", { name: "reload-foo-test" })
		.then(function(reload){
			// foo depends on bar


			reload.dispose("foo", function(){

			});

			reloader("foo");
		})
		.then(done, done);

	},
	teardown: function(){
		loader.fetch = this.oldFetch;
		loader.delete("foo");
		loader.delete("bar");
	}
});

QUnit.test("disposes only the modules that it should", function(assert){
	var done = assert.async();

	loader.set("foo", loader.newModule({}));

	loader.import("live-reload", { name: "reload-foo-test" })
	.then(function(reload){
		// foo depends on bar
		reload.dispose("bar", function(){
			assert.ok(false, "bar should not be disposed");
		});

		reload.dispose("foo", function(){
			assert.ok(true, "it worked");
		});

		reloader("foo");
	})
	.then(done, done);
});

QUnit.module("reload.disposeModule");

QUnit.test("Removes a module from the registry", function(assert){
	var done = assert.async();

	loader.set("dispose-foo", loader.newModule({}));

	loader.import("live-reload", { name: "dispose-foo-test" })
	.then(function(reload){
		assert.ok(loader.has("dispose-foo"), "in the registry");

		reload.disposeModule("dispose-foo");
		assert.ok(!loader.has("dispose-foo"), "not in the registry");
	})
	.then(done, done);
});

QUnit.test("Emits a dispose event for a module that is removed", function(assert){
	var done = assert.async();

	loader.set("dispose-foo", loader.newModule({}));

	loader.import("live-reload", { name: "dispose-foo-test" })
	.then(function(reload){
		reload.dispose("dispose-foo", function(){
			assert.ok(true, "notified of a module being disposed");
		});

		reload.disposeModule("dispose-foo");
	})
	.then(done, done);
});
