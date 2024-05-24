(function(root, factory) {
	const toolsPackageName = '@skolaris/knockout-tools',
		mdcToolsPackageName = '@knockout-mdc/mdc-tools',
		mdcTextFieldPackageName = '@material/textfield';

	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define([toolsPackageName, mdcToolsPackageName, mdcTextFieldPackageName], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory(require(toolsPackageName), require(mdcToolsPackageName), require(mdcTextFieldPackageName));
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-textfield'] = factory(root.knockoutTools, root.knockoutMdc.mdcTools, root.mdc.textfield);
	}
}(typeof self !== 'undefined' ? self : this, function(tools, mdcTools, materialTextfield) {

	const MaterialTextFieldBase = function(params) {
		//attributes
		this.id = params.id;
		this.autofocus = params.autofocus;
		this.label = params.label;
		this.placeholder = params.placeholder;
		this.required = params.required;

		//css
		this.filled = ko.unwrap(params.filled);
		this.noLabel = ko.pureComputed(() => !ko.unwrap(params.label));

		//data binding
		this.value = params.textInput || ko.observable(ko.unwrap(params.initialValue));
		this.validate = params.validate;
		this.leadingIcon = ko.unwrap(params.leadingIcon);
		this.enable = tools.isComponentEnabled(params);
		this.labelId = tools.getGuid();

		if (this.validate)
			this.helperId = tools.getGuid();

		//component lifetime
		this.mdcTextField = null;
		this.mdcHelperText = null;
		this._valueSubscription = null;
		this._requiredSubscription = null;
	};
	MaterialTextFieldBase.prototype = {
		'_init': function(node) {
			const el = node.querySelector('.mdc-text-field');
			const textField = this.mdcTextField = new materialTextfield.MDCTextField(el);
			mdcTools.setMdcComponent(el, textField);

			if (this.validate)
				this.mdcHelperText = new materialTextfield.MDCTextFieldHelperText(node.querySelector('.mdc-text-field-helper-text'));

			this._valueSubscription = this.value.subscribe(() => {
				//necessary hack to update the label style when knockout changes the value
				const shouldFloat = textField.value.length > 0;
				const foundation = textField.foundation;
				foundation.notchOutline(shouldFloat);
				foundation.adapter.floatLabel(shouldFloat);
				foundation.styleFloating(shouldFloat);
				if (this.value.isValid) {
					textField.valid = this.value.isValid();
					//NOTE: this will not work if ko.option.deferUpdates is true, as the validation will not have run yet
				}
			});

			textField.required = ko.unwrap(this.required);
			if (ko.isObservable(this.required)) {
				this._requiredSubscription = this.required.subscribe(() => {
					textField.required = this.required();
				});
			}
		},
		'dispose': function() {
			this._requiredSubscription?.dispose();
			this._valueSubscription?.dispose();
			this.mdcHelperText?.destroy();
			this.mdcTextField?.destroy();
		},

		'getCss': function() {
			return {
				'mdc-text-field--filled': this.filled,
				'mdc-text-field--outlined': !this.filled,
				'mdc-text-field--disabled': !this.enable(),
				'mdc-text-field--no-label': this.noLabel(),
				'mdc-text-field--with-leading-icon': this.leadingIcon
			};
		}
	};

	const chromeAutofillTempValue = '__prevent_autofill__';

	const MaterialTextField = function(params) {
		MaterialTextFieldBase.call(this, params);

		//attributes
		this.step = params.step || (params.type == 'number' ? 1 : undefined);
		this.type = params.type;

		//data binding
		this.prefix = params.prefix;
		this.suffix = params.suffix;

		//chrome autofill workaround
		if (params.autofill == 'off' && !this.value())
			this.value(chromeAutofillTempValue);
	};
	MaterialTextField.prototype = Object.create(MaterialTextFieldBase.prototype);
	MaterialTextField.prototype.constructor = MaterialTextField;
	Object.assign(MaterialTextField.prototype, {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			this._init(node);

			if (this.value() == chromeAutofillTempValue) {
				//hack to overrule Chrome stupid autofill
				setTimeout(() => {
					this.value('');
					this.value.isModified(false);
					node.querySelector('.mdc-text-field--invalid')?.classList.remove('mdc-text-field--invalid');
					if (this.autofocus)
						node.querySelector('input').focus();
				}, 100);
			}
			else if (this.autofocus)
				node.querySelector('input').focus();
		},

		'getInputAttrs': function() {
			return {
				'type': this.type,
				'step': this.step,
				'aria-labelledby': this.labelId,
				'aria-controls': this.validate ? this.helperId : undefined,
				'autofocus': this.autofocus,
				'placeholder': this.placeholder
			};
		}
	});

	const outlineTemplate =
`<!-- ko ifnot: filled -->
<span class="mdc-notched-outline">
	<span class="mdc-notched-outline__leading"></span>
	<!-- ko ifnot: noLabel -->
	<span class="mdc-notched-outline__notch">
		<span class="mdc-floating-label" data-bind="id: labelId">{{label}}</span>
	</span>
	<!-- /ko -->
	<span class="mdc-notched-outline__trailing"></span>
</span>
<!-- /ko -->`;

	const validationTemplate =
`<!-- ko if: validate -->
<div class="mdc-text-field-helper-line">
	<div class="mdc-text-field-helper-text mdc-text-field-helper-text--validation-msg"
		data-bind="id: helperId, validationMessage: value" aria-hidden="true"></div>
</div>
<!-- /ko -->`;

	return {
		'MaterialTextFieldBase': MaterialTextFieldBase,
		'outlineTemplate': outlineTemplate,
		'validationTemplate': validationTemplate,

		'viewModel': MaterialTextField,
		'template':
`<label class="mdc-text-field" data-bind="id: id, css: getCss()">
	<!-- ko if: filled-->
	<span class="mdc-text-field__ripple"></span>
	<!-- ko ifnot: noLabel -->
	<span class="mdc-floating-label" data-bind="id: labelId">{{label}}</span>
	<!-- /ko -->
	<!-- /ko -->
	${outlineTemplate}
	<!-- ko if: leadingIcon -->
	<i class="material-icons mdc-text-field__icon mdc-text-field__icon--leading">{{leadingIcon}}</i>
	<!-- /ko -->
	<!-- ko if: prefix -->
	<span class="mdc-text-field__affix mdc-text-field__affix--prefix">{{prefix}}</span>
	<!-- /ko -->
	<input class="mdc-text-field__input" data-bind="textInput: value, enable: enable, attr: getInputAttrs()">
	<!-- ko if: suffix -->
	<span class="mdc-text-field__affix mdc-text-field__affix--suffix">{{suffix}}</span>
	<!-- /ko -->
	<!-- ko if: filled -->
	<span class="mdc-line-ripple"></span>
	<!-- /ko -->
</label>
${validationTemplate}`
	};
}));
