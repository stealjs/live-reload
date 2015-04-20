var loader = require("@loader");

loader._liveMap = {};

// Put a hook on `normalize` so we can keep a reverse map of modules to parents.
// We'll use this to recursively reload modules.
var normalize = loader.normalize;
loader.normalize = function(name, parentName){
	var loader = this;
	var done = Promise.resolve(normalize.apply(this, arguments));
	
	if(!parentName) {
		return done.then(function(name){
			loader._liveMap[name] = false;
			return name;
		});
	}
	
	return done.then(function(name){
		var parents = loader._liveMap[name];
		if(!parents) {
			parents = loader._liveMap[name] = {};
		}

		parents[parentName] = true;

		return name;
	});
};

// Teardown a module name by deleting it and all of its parent modules.
function teardown(moduleName) {
	var mod = loader.get(moduleName);
	if(mod) {
		var promise;
		if(mod.liveReloadTeardown) {
			promise = Promise.resolve(mod.liveReloadTeardown());
		} else {
			promise = Promise.resolve();
		}
		return promise.then(function(){
			loader.delete(moduleName);
			var parents = loader._liveMap[moduleName];
			if(!parents) return Promise.resolve(moduleName);

			var promises = [];
			for(var parentName in parents) {
				promises.push(teardown(parentName));
			}
			return Promise.all(promises);
		});
	}
	return Promise.resolve(moduleName);
}

function reload(moduleName) {
	teardown(moduleName).then(function(parents){
		var imports = topLevelParents(parents).map(function(parentName){
			return loader.import(parentName);
		});
		Promise.all(imports).then(function(){
			for(moduleName in loader._liveMap) {
				handleReload(moduleName);	
			}
		});
	});
}

function topLevelParents(parents){
	return parents.filter(function(parentName){
		return !loader._liveMap[parentName];
	});
}

function handleReload(moduleName){
	var mod = loader.get(moduleName);
	if(mod && mod.onLiveReload) {
		mod.onLiveReload();
	}
}

function setup(){
	var port = loader.liveReloadPort || 8012;
	

	// TODO Set up a web socket to listen for messages to do a reload.
}

if(typeof steal !== "undefined") {
	steal.done().then(setup);
} else {
	setTimeout(setup);
}

window.reload = reload;
