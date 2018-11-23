/**
 *
 * @param {Object<string,string>} elements elements to load from pie cloud service
 * @param {HTMLDocument} doc - the document to load the scripts
 * @param {string} base_url - default base url for cloud service
 */
export function loadCloudPies(elements, doc, base_url = 'https://pits-dot-kds-production-216220.appspot.com/bundles/') {
    const head = doc.getElementsByTagName('head')[0];
    const keys = Object.keys(elements);
    for (const key in keys) {
        const elementName = keys[key];
        const npmPackage = elements[elementName];
        const packageWithoutVersion = npmPackage.replace(/(?<=[a-z])\@(?:.(?!\@))+/g, '');
        const script = doc.createElement('script');
        const onloadFn = (_package => {
            return () => {
                const packages = _package.split('+');
                const elementsName = elementName.split('+');
                packages.forEach((pack, index) => {
                    const pie = window['pie'].default[pack];
                    const elName = elementsName[index];
                    console.log('defining elements');
                    if (!customElements.get(elName)) {
                        customElements.define(elName, pie.Element);
                        customElements.define(elName + '-config', pie.Configure);
                    }
                });
            };
        })(packageWithoutVersion);
        script.id = elementName;
        script.onload = onloadFn;
        script.src = base_url + npmPackage + '/editor.js';
        head.appendChild(script);
    }
}
