import { queryAll } from "./utils";

/**
 * Component without code splitting support
 */

// ****************************************************************************** //
// ****************************************************************************** //

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
    const allRefs = queryAll("[g-ref]", this.element);

    if (Object.keys(items).length === 0) {
      allRefs.forEach((element) => {
        let refName = element.getAttribute("g-ref");
        if (refName.indexOf(":") !== -1) {
          let refNameArray = refName.split(":");
          if (refNameArray[0] == this._name) {
            if (!this._ref[refNameArray[1]]) {
              this._ref[refNameArray[1]] = allRefs.filter((item) => {
                return item.getAttribute("g-ref") === refName;
              });
            }
          } else {
            return;
          }
        } else {
          if (!this._ref[refName]) {
            this._ref[refName] = allRefs.filter((item) => {
              return item.getAttribute("g-ref") === refName;
            });
          }
        }
      });
    } else {
      this._ref = Object.keys(items)
        .map((key) => {
          const isArray = Array.isArray(items[key]);

          // non-empty refs
          if (items[key] !== null && isArray && items[key].length > 0) {
            return {
              name: key,
              value: items[key],
            };
          }

          const name = key;
          const prefixedName = `${this._name}:${name}`;

          let refs = allRefs.filter((element) => element.getAttribute("g-ref") === prefixedName);

          if (refs.length === 0) {
            refs = allRefs.filter((element) => element.getAttribute("g-ref") === name);
          }

          if (!isArray) {
            refs = refs.length ? refs[0] : null;
          }

          return {
            name: key,
            value: refs,
          };
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
          if (typeof options[key] === "string" && options[key].substr(options[key].length - 5) === "<int>") {
            options[key] = parseInt(options[key].substr(0, options[key].length - 5));
          }

          // Convert 'true'/'false' & '1'/'0' strings to actual booleans...
          else if (["true", "false", "1", "0"].includes(options[key])) {
            console.warn("jGIA: string boolean found in comp. options => converting it to actual boolean");
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
          console.warn("jGIA: 'defaultValue' string value found in comp. options => converting it to false boolean");
          this._options[key] = false;
        }
      }
    }

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

  setState(changes) {
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

    this.stateChange(stateChanges);
  }

  stateChange(stateChanges) {
    // this is here only to be rewritten
  }
}
