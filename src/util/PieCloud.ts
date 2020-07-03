import isFunction from "lodash/isFunction";
import { getPackageWithoutVersion } from "./utils";
import debug from "debug";

const log = debug("pie-framework:pie-cloud");

const getEmptyConfigure = () =>
  class extends HTMLElement {
    set model(_) {}
  };

/**
 *
 * @param {Object<string,string>} elements elements to load from pie cloud service
 * @param {HTMLDocument} doc - the document to load the scripts
 * @param {string} baseUrl - default base url for cloud service
 */
export function loadCloudPies(
  elements,
  doc,
  baseUrl = "https://pits-dot-pie-dev-221718.appspot.com/bundles/"
) {
  log("[loadCloudPies] elements:", elements);

  const head = doc.getElementsByTagName("head")[0];
  const keys = Object.keys(elements);

  for (const key in keys) {
    const elementName = keys[key];
    const npmPackage: string = elements[elementName];
    const packageWithoutVersion = getPackageWithoutVersion(npmPackage);
    const script = doc.createElement("script");
    const onloadFn = (_package => {
      return () => {
        const packages = _package.split("+");
        const elementsName = elementName.split("+");

        packages.forEach((pack, index) => {
          const pie = window["pie"].default[pack];
          const initialEl = elementsName[index];
          const atSymbolPos = initialEl.indexOf("@");
          const elName =
            atSymbolPos >= 0 ? initialEl.slice(0, atSymbolPos) : initialEl;
          log("defining element:", elName);

          if (!customElements.get(elName)) {
            customElements.define(elName, pie.Element);

            pie.Configure = isFunction(pie.Configure)
              ? pie.Configure
              : getEmptyConfigure();

            customElements.define(elName + "-config", pie.Configure);
          }
        });
      };
    })(packageWithoutVersion);

    script.id = elementName;
    script.onload = onloadFn;
    script.src = baseUrl + npmPackage + "/editor.js";
    head.appendChild(script);
  }
}
