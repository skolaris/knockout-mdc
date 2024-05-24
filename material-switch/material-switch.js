(function(root, factory) {
	const toolsPackageName = '@skolaris/knockout-tools',
		mdcToolsPackageName = '@knockout-mdc/mdc-tools',
		mdcSwitchPackageName = '@material/switch';

	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define([toolsPackageName, mdcToolsPackageName, mdcSwitchPackageName], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory(require(toolsPackageName), require(mdcToolsPackageName), require(mdcSwitchPackageName));
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-switch'] = factory(root.knockoutTools, root.knockoutMdc.mdcTools, root.mdc.switch);
	}
}(typeof self !== 'undefined' ? self : this, function(tools, mdcTools, materialSwitch) {

	const MaterialSwitch = function(params) {
		this.label = params.label;
		this.enable = tools.isComponentEnabled(params);
		this.id = tools.getGuid();

		this.structuredLabel = this.label instanceof Array;
		this.singleLabel = this.label !== undefined && !this.structuredLabel;
		this.showLabel = this.structuredLabel || this.singleLabel;
		this.invert = ko.unwrap(params.invert);

		if (!this.invert)
			this.value = params.value;
		else {
			this.value = ko.computed({
				'read': () => !params.value(),
				'write': newValue => params.value(!newValue)
			});
		}

		//component lifetime
		this.mdcSwitch = null;
		this._valueSubscription = null;
		this._intersectionObserver = null;
	};
	MaterialSwitch.prototype = {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			const el = node.querySelector('.mdc-switch');
			this._intersectionObserver = mdcTools.initOnVisible(el, this);
		},
		'dispose': function() {
			this._intersectionObserver?.disconnect();
			this._valueSubscription?.dispose();
			if (this.invert)
				this.value.dispose();

			this.mdcSwitch?.destroy();
		},

		'getLabelCss': function() {
			return {
				'material-switch__label--structured': this.structuredLabel
			};
		},

		'toggle': function() {
			//the switch doesn't emit an event, so we need to manually update the value
			//but we must do it after the internal value of the switch has been updated
			setTimeout(() => {
				this.value(!this.value());
			});
		},

		'_init': function(el) {
			const switcher = this.mdcSwitch = new materialSwitch.MDCSwitch(el);
			mdcTools.setMdcComponent(el, switcher);

			switcher.selected = this.value();
			this._valueSubscription = this.value.subscribe(newVal => {
				switcher.selected = newVal;
			});
		}
	};

	return {
		'viewModel': MaterialSwitch,
		'template':
`<!-- ko if: showLabel -->
<label class="mdc-typography--body2 material-switch__label" data-bind="attr: {'for': id}, css: getLabelCss()">
<!-- ko if: singleLabel -->{{label}}<!-- /ko -->
<!-- ko if: structuredLabel -->
	<span>{{label[0]}}</span>
	<span class="material-switch__label-help" data-bind="html: value() ? label[1] : label[2]"></span>
<!-- /ko -->
</label>
<!-- /ko -->
<button class="mdc-switch" type="button" role="switch" data-bind="id: id, click: toggle, enable: enable">
	<div class="mdc-switch__track"></div>
	<div class="mdc-switch__handle-track">
		<div class="mdc-switch__handle">
			<div class="mdc-switch__shadow">
				<div class="mdc-elevation-overlay"></div>
			</div>
			<div class="mdc-switch__ripple"></div>
			<div class="mdc-switch__icons">
				<svg class="mdc-switch__icon mdc-switch__icon--on" viewBox="0 0 24 24">
					<path d="M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z" />
				</svg>
				<svg class="mdc-switch__icon mdc-switch__icon--off" viewBox="0 0 24 24">
					<path d="M20 13H4v-2h16v2z" />
				</svg>
			</div>
		</div>
	</div>
	<div class="mdc-switch__focus-ring-wrapper">
		<div class="mdc-switch__focus-ring"></div>
	</div>
</button>`
	};
}));
