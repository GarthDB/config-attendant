// when this is loaded into the browser,
// just use the defaults...

/**
 *  Public: when used in browser, it just returns the defaults and doesn't look for config files.
 *
 *  * `name` {String} the name of the app, not used in the browser.
 *  * `defaults` {Object} default config values.
 *
 *  ## Examples
 *
 *  In the browser using browserify:
 *
 *  ```js
 *  var config = require('config-attendant');
 *  config('foo',{options: true}); // {options: true}
 *  ```
 *
 *  Returns {Object} default config values.
 */
export default (name, defaults) => defaults;
