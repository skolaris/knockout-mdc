﻿(function(root, factory) {
	const toolsPackageName = '@skolaris/knockout-tools',
		mdcToolsPackageName = '@knockout-mdc/mdc-tools',
		mdcRipplePackageName = '@material/ripple';

	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define([toolsPackageName, mdcToolsPackageName, mdcRipplePackageName], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory(require(toolsPackageName), require(mdcToolsPackageName), require(mdcRipplePackageName));
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-icon-button'] = factory(root.knockoutTools, root.knockoutMdc.mdcTools, root.mdc.ripple);
	}
}(typeof self !== 'undefined' ? self : this, function(tools, mdcTools, materialRipple) {

	const MaterialIconButton = function(params) {
		this.click = params.click;
		this.icon = params.icon;
		this.enable = tools.isComponentEnabled(params);

		//component lifetime
		this.mdcRipple = null;
	};
	MaterialIconButton.prototype = {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			const el = node.querySelector('.mdc-icon-button');
			this.mdcRipple = new materialRipple.MDCRipple(el);
			mdcTools.setMdcComponent(el, this.mdcRipple);

			this.mdcRipple.unbounded = true;
		},
		'dispose': function() {
			this.mdcRipple?.destroy();
		}
	};

	return {
		'viewModel': MaterialIconButton,
		'template':
`<button class="mdc-icon-button material-icons" data-bind="enable: enable, click: click">
	<div class="mdc-icon-button__ripple"></div>
	<span class="mdc-icon-button__focus-ring"></span>
	<!-- ko if: icon -->{{icon}}<!-- /ko -->
	<!-- ko ifnot: icon -->
	<!-- ko template: {'nodes': $componentTemplateNodes, 'data': $parent} --><!-- /ko -->
	<!-- /ko -->
</button>`
	};
}));
