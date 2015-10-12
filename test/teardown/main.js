var reload = require("live-reload");
var loader = require("@loader");
var $ = require("jquery");
require("./child");

if(loader.has("foo")) {
	throw new Error("foo module exist");
}

loader.set("foo", loader.newModule({}));

reload.dispose(function(){
	// Teardown the virtual module
	reload.disposeModule("foo");
});

reload(function(){
	$("#app").html("<span id='done'>Reload complete!</span>");
});
