var reload = require("live-reload");
var $ = require("jquery");

reload.dispose(function(){
	$("#app").append("<span id='disposed'>I was disposed when i shouldn't have been</span>");
});

reload(function(){
	$("#app").append("<span id='done'>Reload is complete!</span>");
});
