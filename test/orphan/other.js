require("./main");
require("./orphan");

var reload = require("live-reload");

$("#app").append($("<div id='other'>im other</div>"));

reload.dispose(function(){
	$("#other").remove();
});
