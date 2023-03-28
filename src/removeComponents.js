import { queryAll } from "./utils";
import destroyInstance from "./destroyInstance";

/**
 * Removes instances of components on elements within the context
 * @param context: DOM element
 */

export default function removeComponents(context = document.documentElement, elementID) {
  ////////////////////////////////////////////////////////////////////////
  // Check if specific element ID was passed and hence single comp.     //
  // is intended to be unloaded (i.o. all comp. inside some context)... //
  ////////////////////////////////////////////////////////////////////////

  if (elementID) {
    const element = document.getElementById(elementID);
    destroyInstance(element);
  }

  ///////////////////////////////////////////////////////////////////
  // ...otherwise, unload components in specific || global context //
  ///////////////////////////////////////////////////////////////////
  else {
    queryAll("[g-component]", context).forEach((element) => {
      destroyInstance(element);
    });
  }
}
