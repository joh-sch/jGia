/**
 * Config for setting and changing global settings
 */

// ****************************************************************************** //
// ****************************************************************************** //

class Config {
  _options = {
    log: true,
    log_custom: false,
    logStyles: {
      default: "#808080",
      error: "#FF0000",
      action: "#BEBEBE",
    },
  };

  set(name, value) {
    this._options[name] = value;
  }

  get(name) {
    return this._options[name];
  }
}

// ****************************************************************************** //
// ****************************************************************************** //

export default new Config();
