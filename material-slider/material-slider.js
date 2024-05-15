(function(root, factory) {
	const toolsPackageName = '@skolaris/knockout-tools',
		mdcToolsPackageName = '@knockout-mdc/mdc-tools',
		mdcSliderPackageName = '@material/slider';

	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define([toolsPackageName, mdcToolsPackageName, mdcSliderPackageName], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory(require(toolsPackageName), require(mdcToolsPackageName), require(mdcSliderPackageName));
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-slider'] = factory(root.knockoutTools, root.knockoutMdc.mdcTools, root.mdc.slider);
	}
}(typeof self !== 'undefined' ? self : this, function(tools, mdcTools, materialSlider) {

	const MaterialSlider = function(params) {
		this.min = ko.unwrap(params.min) || 0;
		this.max = ko.unwrap(params.max) || 100;
		this.step = ko.unwrap(params.step) || 1;
		this.discrete = !ko.unwrap(params.continuous);
		this.value = params.value;
		this.valueDesc = params.valueDesc; //optional function to return the description of the value
		this.enable = tools.isComponentEnabled(params);

		this.label = !params.label ? null : ko.pureComputed(() => {
			const value = ko.unwrap(this.value),
				valueDescription = typeof this.valueDesc === 'function' ? this.valueDesc(value) : value;

			return `${ko.unwrap(params.label)} (${valueDescription})`;
		});

		//component lifetime
		this.mdcSlider = null;
		this._valueSubscription = null;
		this._enableSubscription = null;
		this._intersectionObserver = null;
		this._resizeObserver = null;
	};
	MaterialSlider.prototype = {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			const el = node.querySelector('.mdc-slider');
			this._intersectionObserver = mdcTools.initOnVisible(el, this);
			this._resizeObserver = mdcTools.layoutOnResize(el);
		},
		'dispose': function() {
			this._resizeObserver?.disconnect();
			this._intersectionObserver?.disconnect();
			this._enableSubscription?.dispose();
			this._valueSubscription?.dispose();
			this.mdcSlider?.destroy();
		},

		'getSliderCss': function() {
			return {
				'mdc-slider--discrete': this.discrete
			};
		},
		'getInputAttrs': function() {
			return {
				'min': this.min,
				'max': this.max,
				'step': this.step,
				'value': ko.unwrap(this.value),
				'aria-label': this.label
			};
		},

		'onInput': function(vm, event) {
			setTimeout(() => {
				this.value(event.detail.value);
			});
		},

		'_init': function(el) {
			const slider = this.mdcSlider = new materialSlider.MDCSlider(el);
			mdcTools.setMdcComponent(el, slider);

			this._valueSubscription = this.value.subscribe(newVal => {
				slider.setValue(newVal);
			});

			slider.setDisabled(!ko.unwrap(this.enable));
			if (ko.isObservable(this.enable)) {
				this._enableSubscription = this.enable.subscribe(newVal => {
					slider.setDisabled(!newVal);
				});
			}
		}
	};

	return {
		'viewModel': MaterialSlider,
		'template':
`<!-- ko if: label -->
<span class="material-slider__label mdc-typography--caption" data-bind="html: label"></span>
<!-- /ko -->
<div class="mdc-slider" data-bind="css: getSliderCss(), event: {'MDCSlider:input': onInput}">
	<div class="mdc-slider__track">
		<div class="mdc-slider__track--inactive"></div>
		<div class="mdc-slider__track--active">
			<div class="mdc-slider__track--active_fill"></div>
		</div>
	</div>
	<div class="mdc-slider__thumb">
		<!-- ko if: discrete -->
		<div class="mdc-slider__value-indicator-container" aria-hidden="true">
			<div class="mdc-slider__value-indicator">
				<span class="mdc-slider__value-indicator-text">{{value}}</span>
			</div>
		</div>
		<!-- /ko -->
		<div class="mdc-slider__thumb-knob"></div>
		<input class="mdc-slider__input" type="range" data-bind="attr: getInputAttrs()">
	</div>
</div>`
	};
}));
