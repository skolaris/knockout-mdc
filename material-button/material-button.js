(function(root, factory) {
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
		root.knockoutMdc['material-button'] = factory(root.knockoutTools, root.knockoutMdc.mdcTools, root.mdc.ripple);
	}
}(typeof self !== 'undefined' ? self : this, function(tools, mdcTools, materialRipple) {

	const MaterialButton = function(params) {
		//data binding
		this.click = params.click;
		this.enable = tools.isComponentEnabled(params);
		this.type = params.type;

		//css
		this.outlined = params.outlined;
		this.raised = params.raised;

		//attributes
		this.autofocus = params.autofocus;
		this.default = params.default;

		//component lifetime
		this.mdcRipple = null;
	};
	MaterialButton.prototype = {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			const el = node.querySelector('.mdc-button');
			this.mdcRipple = new materialRipple.MDCRipple(el);
			mdcTools.setMdcComponent(el, this.mdcRipple);

			if (this.autofocus)
				el.focus();
		},
		'dispose': function() {
			this.mdcRipple?.destroy();
		},

		'getAttrs': function() {
			return {
				'aria-disabled': !this.enable(),
				'autofocus': this.autofocus ? '' : undefined,
				'data-mdc-dialog-button-default': (this.autofocus || this.default) ? '' : undefined,
				'type': this.type
			};
		},
		'getCss': function() {
			return {
				'mdc-button--outlined': ko.unwrap(this.outlined),
				'mdc-button--raised': ko.unwrap(this.raised)
			};
		}
	};

	return {
		'viewModel': MaterialButton,
		'template':
`<button class="mdc-button" data-bind="click: click, enable: enable, attr: getAttrs(), css: getCss()">
	<span class="mdc-button__ripple"></span>
	<span class="mdc-button__focus-ring"></span>
	<!-- ko template: {'nodes': $componentTemplateNodes, data: $parent} --><!-- /ko -->
</button>`
	};
}));
