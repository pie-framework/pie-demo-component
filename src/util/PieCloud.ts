/**
 * 
 * @param {Object<string,string>} elements elements to load from pie cloud service
 * @param {HTMLDocument} doc - the document to load the scripts 
 * @param {string} base_url - default base url for cloud service
 */
export function loadCloudPies(
  elements, 
  doc,
  base_url = 'https://pits-dot-kds-production-216220.appspot.com/bundles/') {
    const head = doc.getElementsByTagName('head')[0];
    const keys = Object.keys(elements);
    for (const key in keys) {
      const elementName = keys[key];
      const npmPackage = elements[elementName];
      const script = doc.createElement('script');
      const onloadFn = (_package => {
        return () => {
          const pie = window['pie'].default[_package];
          console.log('defining elements');
          customElements.define(elementName, pie.Element);
          customElements.define(elementName + '-config', pie.Configure);
        };
      })(npmPackage);
      script.id = elementName;
      script.onload = onloadFn;
      script.src = base_url + npmPackage + '/editor.js';
      head.appendChild(script);
  }
}