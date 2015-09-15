var reload = require("live-reload");
var $ = require("jquery");

$("#app").append($("<div id='orphan'>im an orphan module</div>"));

reload.dispose(function(){
	$("#orphan").remove();
});
