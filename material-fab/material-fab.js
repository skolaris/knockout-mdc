(function(root, factory) {
	const toolsPackageName = '@skolaris/knockout-tools',
		mdcRipplePackageName = '@material/ripple';

	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define([toolsPackageName, mdcRipplePackageName], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory(require(toolsPackageName), require(mdcRipplePackageName));
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-fab'] = factory(root.knockoutTools, root.mdc.ripple);
	}
}(typeof self !== 'undefined' ? self : this, function(tools, materialRipple) {

	const MaterialFab = function(params) {
		this.click = params.click;
		this.enable = tools.isComponentEnabled(params);

		//component lifetime
		this.mdcRipple = null;
	};
	MaterialFab.prototype = {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			this.mdcRipple = new materialRipple.MDCRipple(node.querySelector('.mdc-fab'));
		},
		'dispose': function() {
			this.mdcRipple?.destroy();
		}
	};

	return {
		'viewModel': MaterialFab,
		'template':
`<button class="mdc-fab" data-bind="click: click, enable: enable">
	<div class="mdc-fab__ripple"></div>
	<span class="mdc-fab__icon material-icons" data-bind="template: {'nodes': $componentTemplateNodes, 'data': $parent}"></span>
</button>`
	};
}));
