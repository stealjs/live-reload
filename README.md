[![Build Status](https://travis-ci.org/stealjs/live-reload.svg?branch=master)](https://travis-ci.org/stealjs/live-reload)

# live-reload

An extension for [SystemJS](https://github.com/systemjs/systemjs) and 
[StealJS](http://stealjs.com/) that reloads your code as you develop. Pair with a websocket server such as [StealTools](https://github.com/stealjs/steal-tools) to develop without ever having to manually refresh the page.

# Install

If you're using StealJS, live-reload is included by default. Skip to the **Use** section.

If you're using SystemJS install with NPM:

```shell
npm install system-live-reload --save-dev
```

live-reload requires the `system-trace` extension so install that as well:

```shell
npm install system-trace --save-dev
```

# Use

## StealJS

Add the extension as a config dependency. Either via `package.json`:

```json
{
  "system": {
    "configDependencies": [
      "live-reload"
	]
  }
}
```

Or your own config file:

```js
import from "live-reload";

System.config({
  ...
});
```

In your `steal.js` script tag you can specify a port, otherwise `8012` will be used by default:

```html
<script src="node_modules/steal/steal.js" live-reload-port="9999"></script>
```

## SystemJS

Using with SystemJS takes a little extra configuration. Probably you want to do this in the script tag following your use of SystemJS:

```html
<script src="path/to/system.js"></script>
<script src="node_modules/system-trace/trace.js"></script>
<script>
  System.set("@loader", System.newModule({ default: System, __useDefault: true }));
  System.paths["live-reload"] = "node_modules/system-live-reload/live.js";
  System.liveReloadPort = 9999; // This is optional, defaults to 8012

  System.import("live-reload").then(function(){
  
    System.import("my/app");

  });

</script>
```

Note that a script tag for [system-trace](https://github.com/stealjs/system-trace) is included as well, this is because live-reload depends on that extension.

## API

**live-reload** can be imported into your application. The export is a function that can be called to tap into the reload process:

```js
import reload from "live-reload";

// Called after every reload cycle, re-renders the app.
reload(function(){
	$("#main").html(render());
});

// Called when this module is being unloaded, used to do cleanup.
reload.dispose(function(){
	$("footer").remove();
});
```

#### reload

This function can be called to observe the reloading cycle:

##### reload(callback)

Provide a single callback to `reload` to have the callback called after the cycle is complete. In the following example we are re-rendering the main application after reloads:

```js
reload(function(){
	$("#app").html(renderApp());
});
```

##### reload(moduleName, callback)

Provide a moduleName to observe a specific module being reloaded. Use this when you need to reinit some behavior only when a specific module reloads:

```js
reload("app/router", function(router){
	window.router = router;
	router.start();
});
```

##### reload("*", callback)

This is a special form that calls the callback for each module that is reloaded. The first parameter is the `moduleName` and the second is the `moduleValue`.

#### reload.dispose

`reload.dispose(callback)` can be used to do cleanup when the module being defined is unloaded. If the module creates side effects, this is where you can remove those. In this example we are removing the footer because it will be re-appended when the module gets executed.

```js
reload.dispose(function(){
	$("footer").remove();
});
```

### Options

#### liveReloadPort

You can specify which port to use for the WebSocket connection. By default `8012` will be used.

## License

MIT
