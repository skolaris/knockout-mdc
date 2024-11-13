(function(root, factory) {
	const toolsPackageName = '@skolaris/knockout-tools';
	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define([toolsPackageName], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory(require(toolsPackageName));
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-list-item'] = factory(root.knockoutTools);
	}
}(typeof self !== 'undefined' ? self : this, function(tools) {

	const MaterialListItem = function(params) {
		this.icon = params.icon;
		this.text = params.text;
		this.value = params.value;
		this.enable = tools.isComponentEnabled(params);

		this.click = typeof params.click !== 'function' ? params.click : function(vm, event) {
			//the timeout means the parent list's selection handler will execute
			//even if the clicked item gets disabled as a result of click processing
			setTimeout(() => params.click(vm, event));
		};
	};
	MaterialListItem.prototype = {
		'getCss': function() {
			return {
				'mdc-deprecated-list-item--disabled': !this.enable()
			};
		},
		'getAttrs': function() {
			return {
				'data-value': this.value
			};
		}
	};

	return {
		'viewModel': MaterialListItem,
		'template':
`<li class="mdc-deprecated-list-item" role="option" data-bind="click: click, css: getCss(), attr: getAttrs()">
	<span class="mdc-deprecated-list-item__ripple"></span>
	<!-- ko if: icon -->
	<span class="mdc-deprecated-list-item__graphic material-icons">{{icon}}</span>
	<!-- /ko -->
	<!-- ko if: text -->
	<span class="mdc-deprecated-list-item__text">{{text}}</span>
	<!-- /ko -->
	<!-- ko ifnot: text -->
	<span class="mdc-deprecated-list-item__text" data-bind="template: {'nodes': $componentTemplateNodes, 'data': $parent}"></span>
	<!-- /ko -->
</li>`
	};
}));
