// ————————————————————————————————————————————— DOC. ————————————————————————————————————————————— //
// ———————————————————————————————————————————————————————————————————————————————————————————————— //

/**
 * Component without code splitting support
 */

// ———————————————————————————————————————————— UTIL. ————————————————————————————————————————————— //
// ———————————————————————————————————————————————————————————————————————————————————————————————— //

import { queryAll } from "./utils";

// ———————————————————————————————————————————————————————————————————————————————————————————————— //
// ———————————————————————————————————————————————————————————————————————————————————————————————— //

export default class Component {
  constructor(element, options) {
    this.element = element;
    this.element["__gia_component__"] = this;
    this._ref = {};
    this._options = options || {};
    this._state = {};
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  get ref() {
    return this._ref;
  }

  set ref(items) {
    const componentID = this.element.id;
    const internalRefs = queryAll("[g-ref]", this.element);
    const externalRefs = componentID ? queryAll(`[g-ref][g-parent-id="${componentID}"]`) : [];

    if (Object.keys(items).length === 0) {
      internalRefs.forEach((el) => {
        let refName = el.getAttribute("g-ref");
        if (refName.indexOf(":") !== -1) {
          let refNameArray = refName.split(":");
          if (refNameArray[0] == this._name) {
            if (!this._ref[refNameArray[1]]) {
              this._ref[refNameArray[1]] = internalRefs.filter((item) => item.getAttribute("g-ref") === refName);
            }
          } else return;
        } else {
          if (!this._ref[refName]) {
            this._ref[refName] = internalRefs.filter((item) => item.getAttribute("g-ref") === refName);
          }
        }
      });
    } else {
      this._ref = Object.keys(items)
        .map((key) => {
          // Check, if ref. refers to multiple DOM elements
          // (value assigned to ref. name is an array)...
          const isArray = Array.isArray(items[key]);

          // non-empty refs
          if (items[key] !== null && isArray && items[key].length > 0) {
            return { name: key, value: items[key] };
          }

          // Get internal refs. with matching ref. name
          // (prefixed or unprefixed)...
          const name = key;
          const prefixedName = `${this._name}:${name}`;
          let refs = internalRefs.filter((el) => el.getAttribute("g-ref") === prefixedName);
          if (refs.length === 0) refs = internalRefs.filter((el) => el.getAttribute("g-ref") === name);

          // Get external refs. with matching ref. name...
          const refs_external = externalRefs.filter((el) => el.getAttribute("g-ref") === prefixedName);
          refs.push(...refs_external);

          // If ref. does not refer to multiple DOM elements,
          // return first of matching elements...
          if (!isArray) refs = refs.length ? refs[0] : null;

          return { name: key, value: refs };
        })
        .reduce((acc, ref) => {
          acc[ref.name] = ref.value;
          return acc;
        }, {});
    }

    return this._ref;
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  get options() {
    return this._options;
  }

  set options(defaults) {
    let options = {};
    let optionsFromAttribute = this.element.getAttribute("g-options");

    ////////////////////////////////////////////////////////////////
    // Options from 'options' attribute rendered on comp. element //
    ////////////////////////////////////////////////////////////////

    if (optionsFromAttribute) {
      options = JSON.parse(optionsFromAttribute);

      /////////////////////////////////////////////
      // Convert option values to intended types //
      /////////////////////////////////////////////

      for (let key in options) {
        if (options.hasOwnProperty(key)) {
          // Stop, if option is intended to be of type string (+ remove type declaration)...
          // (i.e. if option value ends with '<string>', no conversion is needed as all option values are strings by default)
          if (typeof options[key] === "string" && options[key].substr(options[key].length - 8) === "<string>") {
            options[key] = options[key].substr(0, options[key].length - 8);
          }

          // Convert number strings to actual numbers...
          else if (typeof options[key] === "string" && options[key].substr(options[key].length - 5) === "<int>") {
            // console.warn("jGIA: string <int> found in comp. options => converting it to actual integer");
            options[key] = parseInt(options[key].substr(0, options[key].length - 5));
          }

          // Convert 'true'/'false' & '1'/'0' strings to actual booleans...
          else if (["true", "false", "1", "0"].includes(options[key])) {
            // console.warn("jGIA: string boolean found in comp. options => converting it to actual boolean");
            options[key] = options[key] === "true" || options[key] === "1" ? true : false;
          }
        }
      }
    }

    ///////////////////////////////////////////////////////
    // Convert options w/ 'defaultValue' string to false //
    ///////////////////////////////////////////////////////

    for (let key in this._options) {
      if (this._options.hasOwnProperty(key)) {
        if (this._options[key] === "defaultValue") {
          // console.warn("jGIA: 'defaultValue' string value found in comp. options => converting it to false boolean");
          this._options[key] = false;
        }
      }
    }

    /////////////////////////////////////////////////////////////////////////////
    // Convert options added from comp. config. object provided by app config. //
    /////////////////////////////////////////////////////////////////////////////

    for (let key in defaults) {
      if (defaults.hasOwnProperty(key)) {
        // Convert 'true'/'false' & '1'/'0' strings to actual booleans...
        if (["true", "false", "1", "0"].includes(defaults[key])) {
          // console.warn("jGIA: string boolean found in comp. options => converting it to actual boolean");
          defaults[key] = defaults[key] === "true" || defaults[key] === "1" ? true : false;
        }
      }
    }

    // Merge options...
    this._options = {
      ...this._options,
      ...defaults,
      ...options,
    };

    return this._options;
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  get state() {
    return this._state;
  }

  set state(state) {
    console.warn("You should not change state manually. Use setState instead.");
    this._state = state;
  }

  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  _load() {
    this.mount();
  }

  mount() {
    console.warn(`Component ${this._name} does not have "mount" method.`);
  }

  unmount() {
    // this is here only to be rewritten
  }

  getRef(ref, prefixed = false) {
    return `[g-ref="${prefixed ? `${this._name}:` : ""}${ref}"]`;
  }

  setState(changes, CONFIG = { run_withLogs: false }) {
    // Setup...
    const { run_withLogs } = CONFIG;
    if (run_withLogs) console.log("setState", changes);
    let stateChanges = {};

    Object.keys(changes).forEach((key) => {
      if (Array.isArray(changes[key])) {
        if (this._state[key] != null && Array.isArray(this._state[key])) {
          if (this._state[key].length === changes[key].length) {
            changes[key].some((item, index) => {
              if (this._state[key][index] !== item) {
                stateChanges[key] = changes[key];
                this._state[key] = stateChanges[key];
                return true;
              }
              return false;
            });
          } else {
            stateChanges[key] = changes[key];
            this._state[key] = stateChanges[key];
          }
        } else {
          stateChanges[key] = changes[key];
          this._state[key] = stateChanges[key];
        }
      } else if (typeof changes[key] === "object") {
        if (this._state[key] != null && typeof this._state[key] === "object") {
          stateChanges[key] = {};
          Object.keys(changes[key]).forEach((subkey) => {
            if (this._state[key][subkey] !== changes[key][subkey]) {
              stateChanges[key][subkey] = changes[key][subkey];
            }
          });
        } else {
          stateChanges[key] = changes[key];
        }

        this._state[key] = {
          ...this._state[key],
          ...stateChanges[key],
        };
      } else {
        if (this._state[key] !== changes[key]) {
          stateChanges[key] = changes[key];

          this._state[key] = changes[key];
        }
      }
    });

    Object.keys(stateChanges).forEach((key) => {
      if (Array.isArray(changes[key])) {
        if (stateChanges[key].length === 0) {
          delete stateChanges[key];
        }
      } else if (typeof changes[key] === "object") {
        if (Object.keys(stateChanges[key]).length === 0) {
          delete stateChanges[key];
        }
      }
    });

    if (run_withLogs) console.log("stateChanges", stateChanges);
    this.stateChange(stateChanges);
  }

  stateChange(stateChanges) {
    // this is here only to be rewritten
  }
}
