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
      "$live-reload"
	]
  }
}
```

Or your own config file:

```js
import from "$live-reload";

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

### Hooks

**live-reload** includes 2 hooks that you can use in your code that are called during the livecycle of a reload.

#### beforeDestroy

If you include a `beforeDestroy` function in your module's code, the function will be called before that module is unloaded. Use this if you need to do some cleanup because the module has side effects (such as setting a property on the `window`).

```js

export function beforeDestroy(){
	delete window.App; // Remove a property added to the window.
};

```

#### afterReload

If you include an `afterReload` function in your module, that function will be called after every reload. This is the place to do re-initialization, if you need it, such as rerendering:

```js
export function afterReload(){
	render();
};
```

### Options

#### liveReloadPort

You can specify which port to use for the WebSocket connection. By default `8012` will be used.

## License

MIT
