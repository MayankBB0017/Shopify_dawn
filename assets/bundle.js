/**
 * Main Bundle
 */
class mainBundle extends HTMLElement {
  constructor() {
    super();
    this.test = "mainBundle";
    console.log("Main Bundle: ",this.test)
  }

  connectedCallback() {
    console.log("connectedCallback")
  }
}
customElements.define("main-bundle", mainBundle);

/**
 * Bundle Item
 */
class bundleItem extends mainBundle {
  constructor() {
    super();
    this.test1 = "bundleItem";
    console.log("bundleItem : ",this.test, this.test1);
  }

  connectedCallback() {
  }
}
customElements.define("bundle-item", bundleItem);

/**
 * Side Card
 */
class bundleSideCard extends mainBundle {
  constructor() {
    super();
    this.test2 = "bundleSideCard";
    console.log("bundleSideCard : ",this.test,this.test2);
  }

  connectedCallback() {
  }
}
customElements.define("bundle-side-card", bundleSideCard);

/**
 * Side Card Item
 */
class sideCardItem extends bundleSideCard {
  constructor() {
    super();
    this.test3 = "sideCardItem";
    console.log("sideCardItem : ",this.test, this.test2,this.test3);
  }

  connectedCallback() {
  }
}
customElements.define("side-card-item", sideCardItem);


