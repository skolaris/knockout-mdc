(function(root, factory) {
	const toolsPackageName = '@skolaris/knockout-tools',
		mdcIconButtonPackageName = '@material/icon-button';

	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define([toolsPackageName, mdcIconButtonPackageName], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory(require(toolsPackageName), require(mdcIconButtonPackageName));
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-icon-button-toggle'] = factory(root.knockoutTools, root.mdc['icon-button']);
	}
}(typeof self !== 'undefined' ? self : this, function(tools, materialIconButton) {

	const MaterialIconButtonToggle = function(params) {
		this.value = params.value;
		this.icons = params.icons;
		this.enable = tools.isComponentEnabled(params);

		//component lifetime
		this.mdcIconButtonToggle = null;
		this._valueSubscription = null;
	};
	MaterialIconButtonToggle.prototype = {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			this.mdcIconButtonToggle = new materialIconButton.MDCIconButtonToggle(node.querySelector('.mdc-icon-button'));
			this.mdcIconButtonToggle.on = this.value();
			this._valueSubscription = this.value.subscribe(newVal => {
				this.mdcIconButtonToggle.on = newVal;
			});
		},
		'dispose': function() {
			this._valueSubscription?.dispose();
			this.mdcIconButtonToggle?.destroy();
		},

		'onChange': function(vm, event) {
			this.value(event.detail.isOn);
		}
	};

	return {
		'viewModel': MaterialIconButtonToggle,
		'template':
`<button class="mdc-icon-button" data-bind="enable: enable, event: {'MDCIconButtonToggle:change': onChange}">
	<div class="mdc-icon-button__ripple"></div>
	<span class="mdc-icon-button__focus-ring"></span>
	<!-- ko if: icons -->
	<i class="material-icons mdc-icon-button__icon mdc-icon-button__icon--on">{{icons[0]}}</i>
	<i class="material-icons mdc-icon-button__icon">{{icons[1]}}</i>
	<!-- /ko -->
	<!-- ko ifnot: icons -->
	<!-- ko template: {'nodes': $componentTemplateNodes} --><!-- /ko -->
	<!-- /ko -->
</button>`
	};
}));
