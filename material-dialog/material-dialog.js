(function(root, factory) {
	const toolsPackageName = '@skolaris/knockout-tools',
		mdcToolsPackageName = '@knockout-mdc/mdc-tools',
		mdcDialogPackageName = '@material/dialog';

	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define([toolsPackageName, mdcToolsPackageName, mdcDialogPackageName], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory(require(toolsPackageName), require(mdcToolsPackageName), require(mdcDialogPackageName));
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-dialog'] = factory(root.knockoutTools, root.knockoutMdc.mdcTools, root.mdc.dialog);
	}
}(typeof self !== 'undefined' ? self : this, function(tools, mdcTools, materialDialog) {

	const MaterialDialog = function(params) {
		this.id = params.id;
		this.title = params.title;
		this.modal = params.modal;
		this.opened = params.opened;
		this.closed = params.closed;
		this.containerId = tools.getGuid();
		this.titleId = tools.getGuid();

		this._contentId = tools.getGuid();
		this._defaultBtnSelector = `#${CSS.escape(this.containerId)} > .mdc-dialog__surface > .mdc-dialog__actions button[data-mdc-dialog-button-default]`;

		//component lifetime
		this.mdcDialog = null;
	};
	MaterialDialog.prototype = {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			const el = node.querySelector('.mdc-dialog');
			el.querySelector('.mdc-dialog__content').id = this._contentId;

			const dialog = this.mdcDialog = new materialDialog.MDCDialog(el);
			mdcTools.setMdcComponent(el, dialog);

			if (this.modal) {
				dialog.scrimClickAction = '';
				dialog.escapeKeyAction = '';
			}
		},
		'dispose': function() {
			this.mdcDialog?.destroy();
		},

		'onOpened': function(vm, event) {
			const dialogEl = document.getElementById(this.id);
			const defaultBtn = dialogEl.querySelector(this._defaultBtnSelector);
			if (defaultBtn)
				defaultBtn.focus();
			else {
				const autofocusEl = dialogEl.querySelector('[autofocus]');
				autofocusEl?.focus();
			}
			if (typeof this.opened === 'function')
				this.opened(vm, event);
		},
		'onClosed': function(vm, event) {
			if (typeof this.closed === 'function')
				this.closed(vm, event);
		},
		'getSurfaceAttrs': function() {
			return {
				'aria-labelledby': this.titleId,
				'aria-describedby': this._contentId
			};
		}
	};

	return {
		'viewModel': MaterialDialog,
		'template':
`<div class="mdc-dialog" data-bind="id: id, event: {'MDCDialog:opened': onOpened, 'MDCDialog:closed': onClosed}">
	<div class="mdc-dialog__container" data-bind="id: containerId">
		<div class="mdc-dialog__surface" role="alertdialog" aria-modal="true" tabindex="-1" data-bind="attr: getSurfaceAttrs()">
			<!-- ko if: title -->
			<h2 class="mdc-dialog__title" data-bind="id: titleId, html: title"></h2>
			<!-- /ko -->
			<!-- ko template: {'nodes': $componentTemplateNodes, 'data': $parent} --><!-- /ko -->
		</div>
	</div>
	<div class="mdc-dialog__scrim"></div>
</div>`
	};
}));
