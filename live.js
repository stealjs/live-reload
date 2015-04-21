var loader = require("@loader");

/**
 * A map of modules names to parents like:
 * {
 *   "child": {
 *     "parentA": true,
 *     "parentB": true
 *   },
 *   "parentA": false
 * }
 *
 * This is used to recursively delete parent modules
 *
 */
loader._liveMap = {};

// Put a hook on `normalize` so we can keep a reverse map of modules to parents.
// We'll use this to recursively reload modules.
var normalize = loader.normalize;
loader.normalize = function(name, parentName){
	var loader = this;
	var done = Promise.resolve(normalize.apply(this, arguments));
	
	if(!parentName) {
		return done.then(function(name){
			// We need to keep modules without parents to so we can know
			// if they need to have their `onLiveReload` callbacks called.
			loader._liveMap[name] = false;
			return name;
		});
	}
	
	// Once we have the fully normalized module name mark who its parent is.
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
function teardown(moduleName, needsImport) {
	var mod = loader.get(moduleName);
	if(mod) {
		loader.delete(moduleName);

		var promise;
		// If this module has a `modLiveReloadTeardown` function call it.
		if(mod.liveReloadTeardown) {
			promise = Promise.resolve(mod.liveReloadTeardown());
		} else {
			promise = Promise.resolve();
		}
		return promise.then(function(){
			// Delete the module and call teardown on its parents as well.
			var parents = loader._liveMap[moduleName];
			if(!parents) {
				needsImport[moduleName] = true;
				return Promise.resolve();
			}

			var promises = [];
			for(var parentName in parents) {
				promises.push(teardown(parentName, needsImport));
			}
			return Promise.all(promises);
		});
	}
	return Promise.resolve();
}

function reload(moduleName) {
	// Call teardown to recursively delete all parents, then call `import` on the
	// top-level parents.
	var parents = {};
	teardown(moduleName, parents).then(function(){
		var imports = [];
		for(var parentName in parents) {
			imports.push(loader.import(parentName));
		}
		// Once everything is imported call the `onLiveReload` callback functions.
		Promise.all(imports).then(function(){
			for(moduleName in loader._liveMap) {
				handleReload(moduleName);	
			}
		});
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
	
	var host = window.document.location.host.replace(/:.*/, '');
	var ws = new WebSocket("ws://" + host + ":" + port);

	ws.onmessage = function(ev){
		var moduleName = ev.data;
		reload(moduleName);
	};
}

var isBrowser = typeof window !== "undefined";

if(isBrowser) {
	if(typeof steal !== "undefined") {
		steal.done().then(setup);
	} else {
		setTimeout(setup);
	}
}
