var reload = require("live-reload");
var $ = require("jquery");

reload(function(){
	$("#app").append("<span id='done'>Reload is complete!</span>");
});
