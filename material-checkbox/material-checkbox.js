(function(root, factory) {
	const toolsPackageName = '@skolaris/knockout-tools',
		mdcCheckboxPackageName = '@material/checkbox',
		mdcFormFieldPackageName = '@material/form-field';

	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define([toolsPackageName, mdcCheckboxPackageName, mdcFormFieldPackageName], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory(require(toolsPackageName), require(mdcCheckboxPackageName), require(mdcFormFieldPackageName));
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-checkbox'] = factory(root.knockoutTools, root.mdc['checkbox'], root.mdc['form-field']);
	}
}(typeof self !== 'undefined' ? self : this, function(tools, materialCheckbox, materialFormField) {

	const MaterialCheckbox = function(params) {
		this.checked = params.checked;
		this.clicked = params.clicked;
		this.label = params.label;
		this.hasLabel = params.label !== undefined;
		this.enable = tools.isComponentEnabled(params);
		this.id = tools.getGuid();

		//component lifetime
		this.mdcCheckbox = null;
		this.mdcFormField = null;
	};
	MaterialCheckbox.prototype = {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			this.mdcCheckbox = new materialCheckbox.MDCCheckbox(node.querySelector('.mdc-checkbox'));
			this.mdcFormField = new materialFormField.MDCFormField(node.querySelector('.mdc-form-field'));
			this.mdcFormField.input = this.mdcCheckbox;
		},
		'dispose': function() {
			this.mdcFormField?.destroy();
			this.mdcCheckbox?.destroy();
		},

		'onClicked': function(vm, event) {
			setTimeout(() => {
				if (this.clicked)
					this.clicked(this.checked, event);
			});
			return true;
		}
	};

	return {
		'viewModel': MaterialCheckbox,
		'template':
`<div class="mdc-form-field">
	<div class="mdc-checkbox">
		<input type="checkbox" class="mdc-checkbox__native-control" data-bind="id: id, checked: checked, enable: enable, click: onClicked" />
		<div class="mdc-checkbox__background">
			<svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
				<path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" />
			</svg>
			<div class="mdc-checkbox__mixedmark"></div>
		</div>
		<div class="mdc-checkbox__ripple"></div>
		<div class="mdc-checkbox__focus-ring"></div>
	</div>
	<!-- ko if: hasLabel -->
	<label data-bind="attr: {'for': id}, html: label"></label>
	<!-- /ko -->
</div>`
	};
}));
