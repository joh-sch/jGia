import { queryAll } from "./utils";
import getComponentFromElement from "./getComponentFromElement";
import createInstance from "./createInstance";

/**
 * Creates instances of components without creating duplicates on elements within the context
 * @param components: object of components to load
 * @param context: DOM element
 */

export default function loadComponents(components = {}, context = document.documentElement) {
  ///////////////////////////////////
  // Exit, if no comp. provided... //
  ///////////////////////////////////

  if (!components || Object.keys(components).length === 0) {
    console.warn("App has no components");
    return;
  }

  ///////////////////////////////////
  // ...otherwise, load components //
  ///////////////////////////////////

  let initialisedComponents = [];

  queryAll("[g-component]", context).forEach((element) => {
    const instance = getComponentFromElement(element);

    if (instance) {
      console.warn("Error: instance exists: \n", instance);
      return true; // continue
    }

    let componentName = element.getAttribute("g-component");

    if (typeof components[componentName] === "function") {
      initialisedComponents.push(createInstance(element, componentName, components[componentName]));
    } else {
      console.warn(`Constructor for component "${componentName}" not found.`);
    }
  });

  // call _load/require/mount
  initialisedComponents.forEach((component) => {
    component._load();
  });
}
