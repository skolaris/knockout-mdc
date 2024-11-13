(function(root, factory) {
	const toolsPackageName = '@skolaris/knockout-tools',
		mdcToolsPackageName = '@knockout-mdc/mdc-tools',
		mdcTooltipPackageName = '@material/tooltip';

	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define([toolsPackageName, mdcToolsPackageName, mdcTooltipPackageName], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory(require(toolsPackageName), require(mdcToolsPackageName), require(mdcTooltipPackageName));
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-tooltip'] = factory(root.knockoutTools, root.knockoutMdc.mdcTools, root.mdc.tooltip);
	}
}(typeof self !== 'undefined' ? self : this, function(tools, mdcTools, materialTooltip) {

	const MaterialTooltip = function() {
		this.id = tools.getGuid();

		//component lifetime
		this.mdcTooltip = null;
	};
	MaterialTooltip.prototype = {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			const previousSibling = node.previousElementSibling;
			if (previousSibling)
				previousSibling.setAttribute('aria-describedby', this.id);

			//use the node directly as the tooltip root
			node.id = this.id;
			node.classList.add('mdc-tooltip');
			node.setAttribute('role', 'tooltip');
			node.setAttribute('aria-hidden', 'true');
			this.mdcTooltip = new materialTooltip.MDCTooltip(node);
			mdcTools.setMdcComponent(node, this.mdcTooltip);
		},
		'dispose': function() {
			this.mdcTooltip?.destroy();
		}
	};

	return {
		'viewModel': MaterialTooltip,
		'template':
`<div class="mdc-tooltip__surface mdc-tooltip__surface-animation">
	<div class="mdc-tooltip__label" data-bind="template: {'nodes': $componentTemplateNodes, 'data': $parent}"></div>
</div>`
	};
}));
