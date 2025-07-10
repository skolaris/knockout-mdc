(function(root, factory) {
	const toolsPackageName = '@skolaris/knockout-tools',
		mdcToolsPackageName = '@knockout-mdc/mdc-tools',
		mdcSelectPackageName = '@material/select';

	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define([toolsPackageName, mdcToolsPackageName, mdcSelectPackageName], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory(require(toolsPackageName), require(mdcToolsPackageName), require(mdcSelectPackageName));
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-select'] = factory(root.knockoutTools, root.knockoutMdc.mdcTools, root.mdc.select);
	}
}(typeof self !== 'undefined' ? self : this, function(tools, mdcTools, materialSelect) {

	const MaterialSelect = function(params) {
		this.items = params.items;
		this.label = params.label;
		this.selectedIndex = params.selectedIndex;
		this.select = params.select;
		this.valueIsNumeric = params.numeric;
		this.value = !this.valueIsNumeric ? params.value : mdcTools.makeMdcSelectAdaptorForNumber(params.value);
		this.validate = params.validationValue !== undefined;
		this.validationValue = params.validationValue;
		
		this.enable = tools.isComponentEnabled(params);
		this.noLabel = ko.pureComputed(() => !ko.unwrap(params.label));
		this.filled = ko.unwrap(params.filled);
		this.required = ko.unwrap(params.required);

		//data binding
		this.labelId = tools.getGuid();
		this.selectedTextId = tools.getGuid();
		if (this.validate)
			this.helperTextId = tools.getGuid();

		//component lifecycle
		this.mdcSelect = null;
		this._itemsSubscription = null;
		this._enableSubscription = null;
		this._selectedIndexSubscription = null;
		this._validationSubscription = null;
		this._valueSubscription = null;

		this._itemsTimestamp = 0;
		this._changeTimestamp = 0;
	};
	MaterialSelect.prototype = {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			var el = node.querySelector('.mdc-select');
			const select = this.mdcSelect = new materialSelect.MDCSelect(el);
			mdcTools.setMdcComponent(el, select);

			select.menu.setIsHoisted(true);
			select.disabled = !this.enable();
			select.required = !!this.required;
			this._enableSubscription = this.enable.subscribe(newVal => select.disabled = !newVal);
			if (this.selectedIndex) {
				select.selectedIndex = this.selectedIndex();
				this._selectedIndexSubscription = this.selectedIndex.subscribe(newVal => {
					if (this.mdcSelect && this.mdcSelect.selectedIndex != newVal)
						this.mdcSelect.selectedIndex = newVal;
				});
			}
			if (this.value) {
				select.value = this.value();
				//setup change of selected value when the observable is changed
				this._valueSubscription = this.value.subscribe(newVal => this._selectValue(newVal));
			}
			if (this.validate) {
				select.valid = this.validationValue.isValid();
				this._validationSubscription = this.validationValue.isValid.subscribe(newVal => select.valid = newVal);
			}

			//when the items for selection change, we need to update the layout
			this._itemsSubscription = !ko.isObservable(this.items) ? null : this.items.subscribe(() => {
				const value = this.mdcSelect.value;
				setTimeout(() => this.mdcSelect?.layoutOptions());
				//must restore selected value which might be in a different position now
				const timestamp = ++this._itemsTimestamp;
				setTimeout(() => {
					if (!this.mdcSelect || timestamp != this._itemsTimestamp) //ignore if the value changed again
						return;

					if (this.mdcSelect.menuItemValues.includes(value)) //ignore if the original value is no longer there
						this._selectValue(value);
				});
			});

			//menu must be on top level to ensure proper function
			document.body.appendChild(select.menu.root);
		},
		'dispose': function() {
			this._itemsSubscription?.dispose();
			this._validationSubscription?.dispose();
			this._selectedIndexSubscription?.dispose();
			this._valueSubscription?.dispose();
			this._enableSubscription?.dispose();
			if (this.mdcSelect) {
				const el = this.mdcSelect.menu.root;
				this.mdcSelect.destroy();
				this.mdcSelect = null; //because we're using it inside a timeout
				ko.removeNode(el);
			}
			if (this.valueIsNumeric)
				this.value.dispose();
		},

		'getCss': function() {
			return {
				'mdc-select--filled': this.filled,
				'mdc-select--outlined': !this.filled,
				'mdc-select--no-label': this.noLabel
			};
		},
		'getAnchorAttrs': function() {
			return {
				'aria-controls': this.validate ? this.helperTextId : undefined,
				'aria-describedby': this.validate ? this.helperTextId : undefined,
				'aria-labelledby': this.labelId + ' ' + this.selectedTextId
			};
		},

		'onChanged': function(vm, event) {
			//the changes to the observables could lead to menu items changing, so must wait till mdc processing is done
			const timestamp = ++this._changeTimestamp;
			setTimeout(() => {
				if (timestamp != this._changeTimestamp) //ignore if the value changed again in the meantime
					return;

				if (this.selectedIndex)
					this.selectedIndex(event.detail.index);

				if (this.value)
					this.value(event.detail.value);

				if (this.select)
					this.select(event.detail.value, event.detail.index);
			});
		},

		'_selectValue': function(newVal) {
			if (this.mdcSelect && this.mdcSelect.value != newVal)
				this.mdcSelect.value = newVal;
		}
	};

	return {
		'viewModel': MaterialSelect,
		'template':
`<div class="mdc-select" data-bind="css: getCss(), event: {'MDCSelect:change': onChanged}">
	<div class="mdc-select__anchor" role="button" aria-haspopup="listbox" aria-expanded="false" data-bind="attr: getAnchorAttrs()">
		<!-- ko if: filled -->
		<span class="mdc-select__ripple"></span>
		<!-- ko ifnot: noLabel -->
		<span class="mdc-floating-label" data-bind="id: labelId">{{label}}</span>
		<!-- /ko -->
		<!-- /ko -->
		<!-- ko ifnot: filled -->
		<span class="mdc-notched-outline">
			<span class="mdc-notched-outline__leading"></span>
			<!-- ko ifnot: noLabel -->
			<span class="mdc-notched-outline__notch">
				<span class="mdc-floating-label" data-bind="id: labelId">{{label}}</span>
			</span>
			<!-- /ko -->
			<span class="mdc-notched-outline__trailing"></span>
		</span>
		<!-- /ko -->
		<span class="mdc-select__selected-text-container">
			<span class="mdc-select__selected-text" data-bind="id: selectedTextId"></span>
		</span>
		<span class="mdc-select__dropdown-icon">
			<svg class="mdc-select__dropdown-icon-graphic" viewBox="7 10 10 5" focusable="false">
				<polygon class="mdc-select__dropdown-icon-inactive" stroke="none" fill-rule="evenodd" points="7 10 12 15 17 10"></polygon>
				<polygon class="mdc-select__dropdown-icon-active" stroke="none" fill-rule="evenodd" points="7 15 12 10 17 15"></polygon>
			</svg>
		</span>
		<!-- ko if: filled -->
		<span class="mdc-line-ripple"></span>
		<!-- /ko -->
	</div>
	<div class="mdc-select__menu mdc-menu mdc-menu-surface">
		<ul class="mdc-deprecated-list"
			data-bind="template: {'nodes': $componentTemplateNodes.length > 0 ? $componentTemplateNodes : $parentContext.$componentTemplateNodes, 'data': $parent}"></ul>
		<!-- this special binding allows one level of nesting, hence custom components can be created wrapping the material-select -->
	</div>
</div>
<!-- ko if: validate -->
<p class="mdc-select-helper-text mdc-select-helper-text--validation-msg" aria-hidden="true"
	data-bind="id: helperTextId, validationMessage: validationValue"></p>
<!-- /ko -->`
	};
}));
