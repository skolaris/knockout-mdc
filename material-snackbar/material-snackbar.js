(function(root, factory) {
	const mdcToolsPackageName = '@knockout-mdc/mdc-tools',
		mdcSnackbarPackageName = '@material/snackbar';

	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define([mdcToolsPackageName, mdcSnackbarPackageName], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory(require(mdcToolsPackageName), require(mdcSnackbarPackageName));
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-snackbar'] = factory(root.knockoutMdc.mdcTools, root.mdc.snackbar);
	}
}(typeof self !== 'undefined' ? self : this, function(mdcTools, materialSnackbar) {

	const MaterialSnackbar = function(params) {
		this.label = params.label;
		this.button = params.button;
		this.timeoutMs = params.timeoutMs;

		//component lifetime
		this.mdcSnackbar = null;
	};
	MaterialSnackbar.prototype = {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			node.classList.add('mdc-snackbar', 'mdc-snackbar--leading');
			const snackbar = this.mdcSnackbar = new materialSnackbar.MDCSnackbar(node);
			mdcTools.setMdcComponent(node, snackbar);

			if (this.timeoutMs)
				snackbar.timeoutMs = this.timeoutMs;
			else if (this.button)
				snackbar.timeoutMs = -1;
			else
				snackbar.timeoutMs = 4000; //default paper-toast timeout was 3000, but that's below the range
		},
		'dispose': function() {
			this.mdcSnackbar?.destroy();
		}
	};

	return {
		'viewModel': MaterialSnackbar,
		'template':
`<div class="mdc-snackbar__surface" role="status" aria-relevant="additions">
	<div class="mdc-snackbar__label" aria-atomic="false" data-bind="template: {'nodes': $componentTemplateNodes, 'data': $parent}"></div>
	<!-- ko if: button -->
	<div class="mdc-snackbar__actions" aria-atomic="true">
		<button type="button" class="mdc-button mdc-snackbar__action" data-bind="click: button().click">
			<div class="mdc-button__ripple"></div>
			<span class="mdc-button__label">{{button().text}}</span>
		</button>
	</div>
	<!-- /ko -->
</div>`
	};
}));
