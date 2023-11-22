// ————————————————————————————————————————————— DOC. ————————————————————————————————————————————— //
// ———————————————————————————————————————————————————————————————————————————————————————————————— //

/**
 * Creates instances of components without creating duplicates on elements within the context
 * @param components: object of components to load
 * @param context   : DOM element
 */

// ————————————————————————————————————————————— LIB. ————————————————————————————————————————————— //
// ———————————————————————————————————————————————————————————————————————————————————————————————— //

import getComponentFromElement from "./getComponentFromElement";
import createInstance from "./createInstance";
import config from "./config";

// ———————————————————————————————————————————— UTIL. ————————————————————————————————————————————— //
// ———————————————————————————————————————————————————————————————————————————————————————————————— //

import { queryAll } from "./utils";
import logger from "../../../../baseUtilities/logger";

// ———————————————————————————————————————————————————————————————————————————————————————————————— //
// ———————————————————————————————————————————————————————————————————————————————————————————————— //

export default function loadComponents(
  components = {},
  context = document.documentElement,
  elementID,
  componentConfig,
  localComponentConfigs = {}
) {
  // Setup...
  const initialisedComponents = [];
  const run_withLogs = config.get("log_custom");
  const logStyles = config.get("logStyles");
  const logOptions = { name: "jGia", run_withLogs, logStyles };

  ///////////////////////////////////
  // Exit, if no comp. provided... //
  ///////////////////////////////////

  if (!components || Object.keys(components).length === 0) {
    console.warn("App has no components");
    return;
  }

  //////////////////////////////////////////////////////////////////////////////////
  // ...otherwise, check if specific element ID was passed and hence single comp. //
  // is intended to be loaded (i.o. all comp. inside some context)...             //
  //////////////////////////////////////////////////////////////////////////////////

  if (elementID) {
    logger("info", ["loading single comp. by element ID", `ID: ${elementID}`], "action", { ...logOptions, inline: true });
    //////
    const el = document.getElementById(elementID);
    const doNotInit = el.getAttribute("g-do-not-init") === "true";
    if (doNotInit) {
      console.warn("Not initialising component: do-not-init attr. set to true.");
      return true; // continue
    }
    //////
    const instance = getComponentFromElement(el);
    if (instance) {
      console.warn("Error: instance exists: \n", instance);
      return true; // continue
    }
    //////
    const componentName = el.getAttribute("g-component");
    //////
    if (typeof components[componentName] === "function") {
      initialisedComponents.push(createInstance(el, componentName, components[componentName], componentConfig));
    } else console.warn('Constructor for component "' + componentName + '" not found.');
  } else {
    ////////////////////////////////////////////////////////////////////
    // ...otherwise, load components in specific || global context... //
    ////////////////////////////////////////////////////////////////////

    queryAll("[g-component]", context).forEach((el) => {
      // Check do-not-init attr. on el. before proceeding...
      const doNotInit = el.getAttribute("g-do-not-init") === "true";
      if (doNotInit) {
        console.warn("Not initialising componen: do-not-init attr. set to true.");
        return true; // continue
      }

      // Check if component instance already exists, skip if so...
      const instance = getComponentFromElement(el);
      if (instance) {
        console.warn("Error: instance exists: \n", instance);
        return true; // continue
      }

      // Get component ID & name...
      const componentInstanceID = el.id;
      const componentName = el.getAttribute("g-component");

      // Supply component config. from app config. if available...
      const componentConfig_fromAppConfig = localComponentConfigs[componentInstanceID];
      const componentConfig_toUse = componentConfig_fromAppConfig || componentConfig;

      // Instantiate component...
      if (typeof components[componentName] === "function") {
        initialisedComponents.push(createInstance(el, componentName, components[componentName], componentConfig_toUse));
      } else console.warn(`Constructor for component "${componentName}" not found.`);
    });
  }

  /////////////////////////////////
  // ...call _load/require/mount //
  /////////////////////////////////

  initialisedComponents.forEach((component) => component._load());
}
