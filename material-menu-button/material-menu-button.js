(function(root, factory) {
	const toolsPackageName = '@skolaris/knockout-tools',
		materialMenuPackageName = '@knockout-mdc/material-menu';

	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define([toolsPackageName, materialMenuPackageName], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory(require(toolsPackageName), require(materialMenuPackageName));
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-menu-button'] = factory(root.knockoutTools, root.knockoutMdc['material-menu']);
	}
}(typeof self !== 'undefined' ? self : this, function(tools, materialMenu) {

	const MaterialMenuButton = function(params) {
		this.icon = params.icon || 'more_vert';
		this.caption = params.caption;
		this.enable = params.enable;
		this.disable = params.disable;
		this.customMenuClass = params.customMenuClass;

		this.menuId = tools.getGuid();
		this.childMenu = new materialMenu.viewModel(params);
		this.bindMenu = ko.observable(false);
	};
	MaterialMenuButton.prototype = {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			node.classList.add('mdc-menu-surface--anchor');
			node.setAttribute('data-menu', this.menuId);
		},
		'dispose': function() {
			this.childMenu?.dispose();
		},

		'onButtonClick': function() {
			if (!this.bindMenu())
				this.bindMenu(true);
			else
				this.childMenu.mdcMenu.open = true;
		},
		'onMenuRendered': function(node) {
			this.childMenu.koDescendantsComplete(node.parentElement);
			this.childMenu.mdcMenu.open = true;
		}
	};

    const buttonParams = "click: onButtonClick.bind($component), enable: enable, disable: disable";

	return {
		'viewModel': MaterialMenuButton,
		'template':
`<!-- ko ifnot: caption -->
<material-icon-button params="${buttonParams}">{{icon}}</material-icon-button>
<!-- /ko -->
<!-- ko if: caption -->
<material-button params="${buttonParams}">
	<span class="material-button__caption">{{caption}}</span>
	<i class="material-icons">{{icon}}</i>
</material-button>
<!-- /ko -->
<!-- ko if: bindMenu, descendantsComplete: onMenuRendered.bind($component) -->
<div class="mdc-menu mdc-menu-surface" data-bind="id: menuId, css: customMenuClass, event: {'MDCMenu:selected': childMenu.onSelected.bind(childMenu)}">
	<ul class="mdc-deprecated-list" role="menu" aria-orientation="vertical"
		data-bind="css: childMenu.childList.getCss(), template: {'nodes': $componentTemplateNodes, 'data': $parent}"></ul>
</div>
<!-- /ko -->`
	};
}));
