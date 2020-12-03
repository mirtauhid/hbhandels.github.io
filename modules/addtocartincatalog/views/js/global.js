/*
* 2017 Singleton software
*
*  @author Singleton software <info@singleton-software.com>
*  @copyright 2017 Singleton software
*/

var addToCardProducts = [];

$(document).ready(function() {
	
	addToCartInCatalogConfigDataJson = JSON.parse(addToCartInCatalogConfigDataJson);
	displayAddToCartButtons(pageName, addToCartInCatalogConfigDataJson);
	
	prestashop.on('updateCart', function (event) {
		if (event.reason.linkAction == 'add-to-cart') {
			if ($("#product_page_product_id[value='" + event.reason.idProduct + "']").parents(".modal:eq(0)").length == 1) {
				// kontrola ci sa jedna o produkt z modalu detailu produktu
				productInfo = {'idProduct' : event.reason.idProduct, 'idProductAttribute' : event.reason.idProductAttribute, 'addedFromProductPage' : true, 'isModal' : true};
				addToCardProducts.push(productInfo);
				if (parseInt(addToCartInCatalogConfigDataJson.progress_wheel) == 1) {
					showProgressWheel(productInfo, (parseInt(addToCartInCatalogConfigDataJson.border_radius) == 1 && parseInt(addToCartInCatalogConfigDataJson.button_display_type) == 1));
				}
			} else {
				// kontrola ci sa jedna o produkt z detailu produktu
				productInfo = {'idProduct' : event.reason.idProduct, 'idProductAttribute' : event.reason.idProductAttribute, 'addedFromProductPage' : true, 'isModal' : false};
				addToCardProducts.push(productInfo);
				if (parseInt(addToCartInCatalogConfigDataJson.progress_wheel) == 1) {
					showProgressWheel(productInfo, (parseInt(addToCartInCatalogConfigDataJson.border_radius) == 1 && parseInt(addToCartInCatalogConfigDataJson.button_display_type) == 1));
				}
			}
		}
	});
	// po tom ako sa vlozi produkt do kosika sa zavola emit "updatedCart"
	prestashop.on('updatedCart', function (event) {
		if (typeof addToCardProducts[0] !== 'undefined') {
			if (parseInt(addToCartInCatalogConfigDataJson.progress_wheel) == 1) {
				$('.preLoading').remove();
			}
			addToCardProducts.splice(0,1);
		}
	});
	// vzdy po zbehnuti akehokolvek filtru v katalogu produktov (blocklayered, paginacia, zoradenie), sa cez tento emit vykreslia nanovo ceny prefiltrovanych produktov
	if (pageName == 'index' || pageName == "category" || pageName == "search" || pageName == 'product') {
		prestashop.on('updateProductList', function (data) {
			displayAddToCartButtons(pageName, addToCartInCatalogConfigDataJson);
		});
	}
	
});

function displayAddToCartButtons(pageName, addToCartInCatalogConfigDataJson) {
	if (pageName == 'index') {
		if ($(".products").length > 0 && $(".featured-products").length > 0 && parseInt(addToCartInCatalogConfigDataJson.show_in_popular) == 1) {
			generateAddToCartButton(".featured-products", addToCartInCatalogConfigDataJson);
		}
	}
	if (pageName == 'category') {
		if ($(".products").length > 0 && parseInt(addToCartInCatalogConfigDataJson.show_in_category) == 1) {
			generateAddToCartButton("", addToCartInCatalogConfigDataJson);
		}
	}
	if (pageName == 'search') {
		if ($(".products").length > 0 && parseInt(addToCartInCatalogConfigDataJson.show_in_search) == 1) {
			generateAddToCartButton("", addToCartInCatalogConfigDataJson);
		}
	}
	if (pageName == 'product') {
		if ($(".products").length > 0 && $(".product-accessories").length > 0 && parseInt(addToCartInCatalogConfigDataJson.show_in_related) == 1) {
			generateAddToCartButton(".product-accessories", addToCartInCatalogConfigDataJson);
		}
	}
}

function generateAddToCartButton(parentElement, addToCartInCatalogConfigDataJson) {
	if ($(parentElement + " .products").length > 0) {
		$(parentElement + " article.product-miniature").css("height","400px");
		$(parentElement + " article .thumbnail-container").css("height","350px");
		$(parentElement + " article .product-description").css("height","137px");
		$(parentElement + " article .highlighted-informations").css("height","7.125rem");
	}
	if ($(parentElement + " article.product-miniature").length > 0) {
		$(parentElement + " article.product-miniature").each(function() {
			if ($(this).find(".product-price-and-shipping").length > 0 && parseInt($(this).find(".addToCartInCatalogShowPrice").html()) == 1) {
				$addToCartForm = $(".addToCartButtonModel")
				.clone()
				.removeClass("addToCartButtonModel")
				.css("display","block")
				.appendTo($(this).find(".product-price-and-shipping"));
				
				$addToCartForm.prepend(generateInput("addToCartToken_" + $(this).attr("data-id-product"), "addToCartButtonToken", "token", staticToken, "hidden", "", ""));
				$addToCartForm.prepend(generateInput("addToCartIdProduct_" + $(this).attr("data-id-product"), "addToCartButtonIdProduct", "id_product", $(this).attr("data-id-product"), "hidden", "", ""));
				$addToCartForm.prepend(generateInput("addToCartIdCustomization_" + $(this).attr("data-id-product"), "addToCartButtonIdCustomization", "id_customization", 0, "hidden", "", ""));
				if (parseInt(addToCartInCatalogConfigDataJson.show_quantity) == 1) {
					$addToCartForm.prepend(generateInput("addToCartNumber_" + $(this).attr("data-id-product"), "input-group form-control addToCartButtonNumber", "qty", 1, "number", "", "min='1'"));
				}
			}
		});
	}
}

function showProgressWheel(callerElement, buttonHasRadius) {
	if (callerElement.addedFromProductPage) {
		if (callerElement.isModal) {
			$("article[data-id-product='" + callerElement.idProduct + "'] .add-to-cart[data-link-action='add-to-cart']").css('position', 'relative').append('<span class="preLoading' + (buttonHasRadius ? ' radius' : '') + '"></span>');
		} else {
			if ($('#product_page_product_id[value="' + callerElement.idProduct + '"]').parents("#main").length > 0) {
				// add to cart button v detaile produktu
				$('#product_page_product_id[value="' + callerElement.idProduct + '"]').parents("#main").find(".add-to-cart[data-button-action='add-to-cart']").css('position', 'relative').append('<span class="preLoading' + (buttonHasRadius ? ' radius' : '') + '"></span>');
			} else {
				// add to cart button v liste
				$('article[data-id-product="' + callerElement.idProduct + '"]').find("button[data-button-action='add-to-cart']").css('position', 'relative').append('<span class="preLoading' + (buttonHasRadius ? ' radius' : '') + '"></span>');
			}
		}
	}
}

function generateInput(id, inputClass, name, value, type, placeholder, otherAttributes) {
	$("#" + id).remove();
	return "<input id='" + id + "' class='" + inputClass + "' name='" + name + "' value='" + value + "' type='" + type + "' placeholder='" + placeholder + "' " + otherAttributes + " />";
}