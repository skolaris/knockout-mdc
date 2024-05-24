(function(root, factory) {
	const materialTextfieldPackageName = '@knockout-mdc/material-textfield';

	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define([materialTextfieldPackageName], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory(require(materialTextfieldPackageName));
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-textarea'] = factory(root.knockoutMdc['material-textfield']);
	}
}(typeof self !== 'undefined' ? self : this, function(materialTextfield) {

	const MaterialTextFieldBase = materialTextfield.MaterialTextFieldBase;

	const MaterialTextArea = function(params) {
		MaterialTextFieldBase.call(this, params);

		//attributes
		this.rows = params.rows;
		this.cols = params.cols;
	};
	MaterialTextArea.prototype = Object.create(MaterialTextFieldBase.prototype);
	MaterialTextArea.prototype.constructor = MaterialTextArea;
	Object.assign(MaterialTextArea.prototype, {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			this._init(node);
			if (this.autofocus)
				node.querySelector('textarea').focus();
		},
		'getInputAttrs': function() {
			return {
				'rows': this.rows,
				'cols': this.cols,
				'aria-labelledby': this.labelId,
				'aria-controls': this.validate ? this.helperId : undefined,
				'autofocus': this.autofocus,
				'placeholder': this.placeholder
			};
		}
	});

	return {
		'viewModel': MaterialTextArea,
		'template':
`<label class="mdc-text-field mdc-text-field--textarea" data-bind="id: id, css: getCss()">
	<!-- ko if: filled-->
	<span class="mdc-text-field__ripple"></span>
	<!-- ko ifnot: noLabel -->
	<span class="mdc-floating-label" data-bind="id: labelId">{{label}}</span>
	<!-- /ko -->
	<!-- /ko -->
	${materialTextfield.outlineTemplate}
	<textarea class="mdc-text-field__input" data-bind="textInput: value, enable: enable, attr: getInputAttrs()"></textarea>
	<!-- ko if: filled -->
	<span class="mdc-line-ripple"></span>
	<!-- /ko -->
</label>
${materialTextfield.validationTemplate}`
	};
}));
