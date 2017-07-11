

var myApp = angular.module('smartInventory', ['ngAnimate', 'ngRoute', 'ngMaterial']);

myApp.config(function($routeProvider) {
    $routeProvider.when("/", {
        templateUrl : "home.html"
    }).when("/categories", {
        templateUrl : "categories.html"
    }).when("/products", {
        templateUrl : "products.html"
    }).when("/add_category", {
        templateUrl : "add_category.html"
    }).when("/add_product", {
        templateUrl : "add_product.html"
    }).when("/orders", {
        templateUrl : "orders.html"
    });
});

myApp.config(function ($mdThemingProvider) {
  $mdThemingProvider.theme('altTheme').primaryPalette('green');
  $mdThemingProvider.setDefaultTheme('altTheme');
  console.log("Themeing");
});



myApp.controller("myCtrl", function($scope, $http, $route, $routeParams, $location, $window) {
	
	$scope.sortType  = 'name';
	$scope.editProductFlag = false;
	$scope.editableProduct = new Product();

	if(getItem('products') == null){
		$scope.products = [];
		setItem('products', JSON.stringify($scope.products));
	}else{
		$scope.products = JSON.parse(getItem('products'));
	}

	if(getItem('orders') == null){
		$scope.orders = [];
		setItem('orders', JSON.stringify($scope.orders));
	}else{
		$scope.orders = JSON.parse(getItem('orders'));
	}

	if(getItem('cart') == null){
		$scope.cart = [];
		setItem('cart', JSON.stringify($scope.cart));
	}else{
		$scope.cart = JSON.parse(getItem('cart'));
	}

	if(getItem('categories') == null){
		$scope.categories = [];
		setItem('categories', JSON.stringify($scope.categories));
	}else{
		$scope.categories = JSON.parse(getItem('categories'));
	}

	if(getItem('low_stock') == null){
		$scope.low_stock = 5;
		setItem('low_stock', $scope.low_stock);
	}else{
		$scope.low_stock = getItem('low_stock');
	}

	consoleLog($scope.categories);

	$scope.setPath = function(path){
		$location.path(path);
	}

	$scope.addProduct = function(){
		var product = new Product();
		product.name = document.getElementById('name').value;
		product.sku = document.getElementById('sku').value;
		product.quantity = document.getElementById('quantity').value;
		product.price = document.getElementById('price').value;
		product.category = document.getElementById('category').value;
		consoleLog(product);
		$scope.products.push(product);
		setItem('products', JSON.stringify($scope.products));
		document.getElementById('name').value = '';
		document.getElementById('sku').value = '';
		document.getElementById('quantity').value = '';
		document.getElementById('price').value = '';
		document.getElementById('category').value = '';
		$scope.showToast('Product Added Successfully.');
	}

	$scope.removeProduct = function(index){
		$scope.products.splice(index, 1);
		setItem('products', JSON.stringify($scope.products));
		$scope.showToast('Product Removed Successfully.');
	}

	$scope.editProduct = function(index){
		var tempProduct = $scope.products[index];
		tempProduct.quantity = parseInt(tempProduct.quantity);
		tempProduct.price = parseInt(tempProduct.price);
		$scope.editableProduct = tempProduct;
		consoleLog($scope.editableProduct);
		$scope.editProductFlag = true;
		$scope.editProductIndex = index;
		consoleLog($scope.editProductIndex);
	}

	$scope.saveProduct = function(){
		var index = $scope.editProductIndex;
		var product = new Product();
		product.name = document.getElementById('name').value;
		product.sku = document.getElementById('sku').value;
		product.quantity = parseInt(document.getElementById('quantity').value);
		product.price = parseInt(document.getElementById('price').value);
		product.category = document.getElementById('category').value;
		$scope.products[index] = product;
		setItem('products', JSON.stringify($scope.products));
		$scope.editableProduct = new Product();
		document.getElementById('name').value = '';
		document.getElementById('sku').value = '';
		document.getElementById('quantity').value = '';
		document.getElementById('price').value = '';
		document.getElementById('category').value = '';
		$scope.editProductFlag = false;
		$scope.showToast('Product Saved Successfully.');
	}
	$scope.cancel = function(){
		$window.location.reload();
	}

	$scope.addCategory = function(){
		var category = document.getElementById('category').value;
		$scope.categories.push(category);
		setItem('categories', JSON.stringify($scope.categories));
		$scope.showToast('Category Added Successfully.');
	}

	$scope.removeCategory = function(index){
		$scope.categories.splice(index, 1);
		setItem('categories', JSON.stringify($scope.categories));
		$scope.showToast('Category Removed Successfully.');
	}


	$scope.cartTotal = function(){
	    var total = 0;
	    for(var i = 0; i < $scope.cart.length; i++){
	        var cartItem = $scope.cart[i];
	        total += (cartItem.chargedPrice * cartItem.itemQuantity);
	    }
	    return total;
	}

	$scope.addToCart = function(product){
		var tempCartItem = new Cart(product);
		$scope.cart.push(tempCartItem);
		setItem('cart', JSON.stringify($scope.cart));
		$scope.showToast(product.name+' added to cart.');
	}

	$scope.removeFromCart = function(index){
		$scope.cart.splice(index, 1);
		setItem('cart', JSON.stringify($scope.cart));
		$scope.showToast('Item Removed From Cart.');
	}

	$scope.emptyCart = function(){
		$scope.cart = [];
		setItem('cart', JSON.stringify($scope.cart));
		$scope.showToast('Cart has been cleared.');
	}

	

	$scope.checkOut = function(name, contact){
		var tempOrder = new Order($scope.cart, name, contact, $scope.cartTotal());
		consoleLog(tempOrder);
		$scope.orders.push(tempOrder);
		$scope.cart = [];
		setItem('cart', JSON.stringify($scope.cart));
		setItem('orders', JSON.stringify($scope.orders));
		$scope.showToast('Checkout Complete.');
		$scope.customerName = '';
		$scope.customerContact = '';
		document.getElementById('customerName').value = '';
		document.getElementById('customerContact').value = '';
	}

	$scope.sendToCart = function(order, index){
		$scope.cart = order.order;
		$scope.customerName = order.name;
		$scope.customerContact = order.contact;
		$scope.orders.splice(index, 1);
		setItem('cart', JSON.stringify($scope.cart));
		setItem('orders', JSON.stringify($scope.orders));
		$scope.setPath('/');
		$scope.showToast('Sent back to cart.');
	}

	$scope.removeOrder = function(index){
		$scope.orders.splice(index, 1);
		setItem('orders', JSON.stringify($scope.orders));
		$scope.showToast('Order Removed Successfully.');
	}

	$scope.showToast = function(message){
		'use strict';
		var snackbarContainer = document.querySelector('#toast');
	    var data = {
	      message: message,
	      timeout: 2000,
	      actionHandler: null,
	      actionText: ''
	    };
	    snackbarContainer.MaterialSnackbar.showSnackbar(data);
	}

});


function Product() {
    this.name = "";
    this.sku = "";
    this.quantity = 0;
    this.price = 0;
    this.category = "";
}

function Cart(product){
	this.name = product.name;
    this.sku = product.sku;
    this.price = parseInt(product.price);
    this.category = product.category;
    this.chargedPrice = parseInt(product.price);
    this.itemQuantity = 1;
}

function Order(cart, customerName, customerContact, total){
	this.order = cart;

	var date = new Date();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;

    var strDate = date.getFullYear() + "-" + month + "-" + day;
    var strTime = hour + ":" + min + ":" + sec;

	this.date = strDate;
	this.time = strTime;
	this.name = customerName;
	this.contact = customerContact;
	this.total = total;
}

function validateCategory(category){
	if(category){
		return true;
	}
	return false;
}

function validateProduct(product){
	if(product.name){
		if(product.sku){
			if(product.quantity){
				if(product.price){
					if(product.category){
						return true;
					}
				}
			}
		}
	}

	return false;
}