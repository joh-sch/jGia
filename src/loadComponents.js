import getComponentFromElement from "./getComponentFromElement";
import createInstance from "./createInstance";
import config from "./config";

// ********************************* UTILITIES ********************************** //
// ****************************************************************************** //

import { queryAll } from "./utils";
import log from "../../../../componentUtilities/log";

// ****************************************************************************** //
// ****************************************************************************** //

/**
 * Creates instances of components without creating duplicates on elements within the context
 * @param components: object of components to load
 * @param context   : DOM element
 */

export default function loadComponents(components = {}, context = document.documentElement, elementID) {
  // Setup...
  const initialisedComponents = [];
  const run_withLogs = config.get("log_custom");
  const logStyles = config.get("logStyles");

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
    if (run_withLogs) {
      log("Gia", ["loading single comp. by element ID", `ID: ${elementID}`], logStyles.action);
    }
    //////
    const element = document.getElementById(elementID);
    const instance = getComponentFromElement(element);
    //////
    if (instance) {
      console.warn("Error: instance exists: \n", instance);
      return true; // continue
    }
    //////
    const componentName = element.getAttribute("g-component");
    //////
    if (typeof components[componentName] === "function") {
      initialisedComponents.push(createInstance(element, componentName, components[componentName], null));
    } else {
      console.warn('Constructor for component "' + componentName + '" not found.');
    }
  } else {
    ////////////////////////////////////////////////////////////////////
    // ...otherwise, load components in specific || global context... //
    ////////////////////////////////////////////////////////////////////

    queryAll("[g-component]", context).forEach((element) => {
      const instance = getComponentFromElement(element);

      if (instance) {
        console.warn("Error: instance exists: \n", instance);
        return true; // continue
      }

      const componentName = element.getAttribute("g-component");

      if (typeof components[componentName] === "function") {
        initialisedComponents.push(createInstance(element, componentName, components[componentName], null));
      } else {
        console.warn(`Constructor for component "${componentName}" not found.`);
      }
    });
  }

  /////////////////////////////////
  // ...call _load/require/mount //
  /////////////////////////////////

  initialisedComponents.forEach((component) => {
    component._load();
  });
}
