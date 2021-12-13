const cartBtn = document.querySelector(".cart-icon");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-item");
const cartQty = document.querySelector(".cart-icon-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// Cart Items
let cart = [];
let buttonsDOM = [];

//Getting Products
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();

      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// Display Products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result +=
        "<!-- Single Featured Products--> " +
        '<article class="product"><div class="img-container"><img src=' +
        product.image +
        ' alt="' +
        product.title +
        '" class="product-img"><button class="shopping-btn" data-id="' +
        product.id +
        '"><i class="fas fa-shopping-cart"></i>Add to Cart</button></div><h3>' +
        product.title +
        '</h3><div class="ratings">' +
        '<i class="fas fa-star"></i>' +
        '<i class="fas fa-star"></i>' +
        '<i class="fas fa-star"></i>' +
        '<i class="fas fa-star"></i>' +
        '<i class="fas fa-star"></i></div>' +
        "<h4>SEK " +
        product.price +
        "</h4></article>" +
        "<!-- End of Single Featured Products-->";
    });
    productsDOM.innerHTML = result;
  }

  getShoppingButton() {
    const cartButtons = [...document.querySelectorAll(".shopping-btn")];
    buttonsDOM = cartButtons;

    cartButtons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      } else {
        button.addEventListener("click", (event) => {
          event.target.innerText = "In Cart";
          event.target.disabled = true;

          // Get product from Products
          let cartItem = { ...Storage.getProducts(id), amount: 1 };

          // Add products to cart
          cart = [...cart, cartItem];

          // Save Cart in Local storage
          Storage.saveCart(cart);

          // Set Cart values
          this.setCartValues(cart);

          // Display Cart Items
          this.addCartItem(cartItem);

          // Show the cart
          this.showCart();
        });
      }
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemQty = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemQty += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartQty.innerText = itemQty;
    console.log("Item Total: " + tempTotal + " Item Count: " + itemQty);
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML =
      '<img src="' +
      item.image +
      '" alt="' +
      item.title +
      '" /><div class="col-2"> <h4>' +
      item.title +
      "</h4><h5>SEK " +
      item.price +
      '</h5><span class="remove-item" data-id="' +
      item.id +
      '">Remove</span></div><div><i class="fas fa-chevron-up" data-id="' +
      item.id +
      '"></i><p class="item-amount">' +
      item.amount +
      '</p><i class="fas fa-chevron-down" data-id="' +
      item.id +
      '"></i></div>';

    cartContent.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populate(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  populate(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  cartLogic() {
    // Clear Cart Button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    // Cart Functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;

        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount += 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let deductAmount = event.target;
        let id = deductAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount -= 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          deductAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(deductAmount.parentElement.parentElement);
          this.removeItem(id);
        }
        Storage.saveCart(cart);
        this.setCartValues(cart);
        deductAmount.nextElementSibling.innerText = tempItem.amount;
      }
    });
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-shopping-cart"></i>Add to Cart';
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

//Locl Storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    if (localStorage.getItem("cart")) {
      return JSON.parse(localStorage.getItem("cart"));
    } else {
      return [];
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  // Setup App
  ui.setupApp();

  //Get All Products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getShoppingButton();
      ui.cartLogic();
    });
});
