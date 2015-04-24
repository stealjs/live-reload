# live-reload

An extension for [SystemJS](https://github.com/systemjs/systemjs) and 
[StealJS](http://stealjs.com/) that reloads your code as you develop. Pair with a websocket server such as [StealTools](https://github.com/stealjs/steal-tools) to develop without ever having to manually refresh the page.

# Install

If you're using StealJS, live-reload is included by default. Skip to the **Use** section.

If you're using SystemJS install with NPM:

```shell
npm install system-live-reload --save-dev
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

Using with SystemJS takes a little extra configuration.  Probably you want to do this in the script tag following your use of SystemJS:

```html
<script src="path/to/system.js"></script>
<script>
  System.paths["live-reload"] = "node_modules/system-live-reload/live.js";
  System.liveReloadPort = 9999; // This is optional, defaults to 8012

  System.import("live-reload").then(function(){
  
    System.import("my/app");

  });

</script>
```

## API

### onReloadCycle

Any module that contains an `onReloadCycle` exported function will have this function called at the beginning of each reload cycle. It contains this signature: `onReloadCycle(reload(moduleName, moduleValue))`.

#### reload

onReloadCycle is called with a function `reload`. This function can be called to observe the reloading cycle:

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
