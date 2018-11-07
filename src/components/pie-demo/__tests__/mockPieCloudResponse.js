/*
 *  This mocks the code structure that would be returned from pie cloud service
 */

class MockElement extends HTMLElement {
  constructor() {
    super();
    console.log('constructing mock el');
    const shadow = this.attachShadow({ mode: 'open' });
    const name = this.getAttribute('name');
    const helloEl = document.createElement('div');
    helloEl.textContent = "hello element" + name;
    shadow.appendChild(helloEl);
  }
}

class MockConfig extends HTMLElement {
  constructor() {
    super();
    console.log('constructing mock config');
    const shadow = this.attachShadow({ mode: 'open' });
    const name = this.getAttribute('name');
    const helloEl = document.createElement('div');
    helloEl.textContent = "hello pie" + name;
    shadow.appendChild(helloEl);
  }
}

window['pie'] = {
  default: {
    '@pie-elements/multiple-choice': {
      Element: MockElement,
      Config: MockConfig
    }
  }
};

