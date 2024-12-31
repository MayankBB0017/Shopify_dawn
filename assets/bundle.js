let _ = {
  isAdded : "is-added",
  isEmpty: "is-empty"
}
/**
 * Main Bundle
 */
class mainBundle extends HTMLElement {
  connectedCallback() {
    this.bundleSideCard = this.querySelector('bundle-side-card');
    console.log("connectedCallback")
  }
}
customElements.define("main-bundle", mainBundle);

/**
 * Bundle Item
 */
class bundleItem extends HTMLElement {

  connectedCallback() {
    this.mainBundle = this.closest('main-bundle');
    this.quantityInput = this.querySelector('.quantity__input');
    this.productData = JSON.parse(this.querySelector('[type="application/json"]').innerHTML);
    this.atcButton = this.querySelector('.js-btn-add_to_cart');
    this.atcButton ? this.atcButton.addEventListener('click',this._handleAddToCart.bind(this)) : false;
    this.addEventListener('change',this._handleChange.bind(this));
  }

  _handleAddToCart(){
    this.classList.add(_.isAdded);
    this.mainBundle.bundleSideCard.refresh();
  }

  _handleChange(){
    let value = parseInt(this.quantityInput.value);
    let cartItem = this.mainBundle.bundleSideCard.querySelector(`[data-variant-id="${this.dataset.variantId}"]`);
    if(value == 0){
      cartItem.removeBtn.click();
    }else{
      cartItem.quantityInput.value = this.quantityInput.value;
    }
  }

  _remove(){
    this.classList.remove(_.isAdded);
    this.quantityInput.value = 1;
    this.quantityInput.setAttribute('value',1);
    this.quantityInput.dispatchEvent(new Event('change'));
  }
}
customElements.define("bundle-item", bundleItem);

/**
 * Side Card
 */
class bundleSideCard extends HTMLElement {

  connectedCallback() {
    this.mainBundle = this.closest('main-bundle');
    this.itemsWrapper = this.querySelector('.js-items');
  }

  refresh(){
    let addedProducts = Array.from(this.mainBundle.querySelectorAll(`bundle-item.${_.isAdded}`));
    let data = addedProducts.map(bundleItem => {
      let variantId = parseInt(bundleItem.dataset.variantId);
      let variant = bundleItem.productData.product.variants.filter(varaint => varaint.id == variantId)[0];
      let returnJson = {
        price: variant.price,
        cartHtml: bundleItem.productData.sideCartItem,
        quantity: bundleItem.querySelector('.quantity__input').value
      };
      return returnJson;
    });
    let cartItems = data.map(item => {
      return item.cartHtml;
    });

    this.itemsWrapper.innerHTML = cartItems.reverse().join(' ');
    this.classList.toggle(_.isEmpty,cartItems.length == 0);
  }
}
customElements.define("bundle-side-card", bundleSideCard);

/**
 * Side Card Item
 */
class sideCardItem extends HTMLElement {

  connectedCallback() {
    this.bundleSideCard = this.closest('bundle-side-card');
    this.variantId = this.dataset.variantId;
    this.removeBtn = this.querySelector('.js-cart-item-remove');
    this.addEventListener('change',this._handleChange.bind(this));
    this.removeBtn.addEventListener('click',this._handleItemRemove.bind(this));
    this.quantityInput = this.querySelector('.quantity__input');
  }

  _handleChange(){
    let value = parseInt(this.quantityInput.value);
    let gridItem = this.bundleSideCard.mainBundle.querySelector(`[data-variant-id="${this.dataset.variantId}"]`);
    if(value == 0){
      this.removeBtn.click();
    }else{
      gridItem.quantityInput.value = this.quantityInput.value;
    }
  }

  _handleItemRemove(){
    let gridElement = this.bundleSideCard.mainBundle.querySelector(`[data-variant-id="${this.variantId}"]`);
    setTimeout(() => {
      gridElement._remove();
      this.remove();
      this.bundleSideCard.refresh();
    }, 100);
  }
}
customElements.define("side-card-item", sideCardItem);


