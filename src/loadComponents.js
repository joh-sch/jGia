import { queryAll } from "./utils";
import getComponentFromElement from "./getComponentFromElement";
import createInstance from "./createInstance";

/**
 * Creates instances of components without creating duplicates on elements within the context
 * @param components: object of components to load
 * @param context: DOM element
 */

export default function loadComponents(components = {}, context = document.documentElement, elementID, eventbus) {
  const initialisedComponents = [];

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
      initialisedComponents.push(createInstance(element, componentName, components[componentName], eventbus));
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
        initialisedComponents.push(createInstance(element, componentName, components[componentName], eventbus));
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
