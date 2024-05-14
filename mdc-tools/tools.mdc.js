(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['knockout'], factory);
	} else if (typeof module === 'object' && module.exports) {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = factory(require('knockout'));
	} else {
		// Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc.mdcTools = factory(root.ko);
	}
}(typeof self !== 'undefined' ? self : this, function(ko) {

	//central registry for mdc components associated with their DOM nodes
	const componentRegistry = new WeakMap();

	return {
		//Converts integral values to string and back to work nicely with mdc-select.
		//If nullable is true, then null or undefined values are converted to '-1' and back to null.
		'makeMdcSelectAdaptorForInt': function(observable, nullable) {
			if (nullable) {
				return ko.computed({
					'read': function() {
						const actual = observable();
						return actual === undefined || actual === null ? '-1' : (actual + '');
					},
					'write': value => observable(value === '-1' ? null : parseInt(value))
				});
			}
			return ko.computed({
				'read': () => observable() + '',
				'write': value => observable(parseInt(value))
			});
		},

		//Converts numeric values to string and back to work nicely with mdc-select.
		'makeMdcSelectAdaptorForNumber': function(observable) {
			return ko.computed({
				'read': () => ko.unwrap(observable) + '',
				'write': value => observable(parseFloat(value))
			});
		},

		//Converts null values to -1 and back so that given nullable string observable.
		//Can be used as the selected value for material-select.
		'makeMdcSelectAdaptorForNullableString': function(observable) {
			return ko.computed({
				'read': function() {
					const actual = observable();
					return actual === undefined || actual === null ? '-1' : actual;
				},
				'write': value => observable(value === '-1' ? null : value)
			});
		},

		'getMdcComponent': function(node) {
			return componentRegistry.get(node);
		},

		'setMdcComponent': function(node, mdcComponent) {
			componentRegistry.set(node, mdcComponent);
		},

		//Calls _init member on given viewModel when given node becomes visible.
		//Should be used for mdc components that depend on client rectangle to calculate their inner layout.
		//The caller is responsible for disconnecting the observer when the component is disposed.
		'initOnVisible': function(node, componentViewModel) {
			const observer = new IntersectionObserver(entries => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						componentViewModel._init(entry.target);
						observer.disconnect();
					}
				}
			});
			observer.observe(node);
			return observer;
		},

		//Recalculates the layout of the mdc component when its size or surroundings change.
		//This is necessary for dynamic layouts with components that use graphical interactive elements such as mdc-slider.
		//The caller is responsible for disconnecting the observer when the component is disposed.
		'layoutOnResize': function(node) {
			const observer = new window.ResizeObserver(entries => { //window prefix necessary to keep lint happy
				for (const entry of entries) {
					const mdcComponent = this.getMdcComponent(entry.target);
					mdcComponent?.foundation.layout();
				}
			});
			observer.observe(node);
			return observer;
		},

		//Recalculates the layout of parentElement's child mdc components.
		//This is useful to call when a dialog finishes opening or the page layout changes,
		//e.g. by a side panel sliding in and moving all content sideways.
		'layoutMdcComponents': function(parentElement) {
			const mdcElements = parentElement.querySelectorAll('[class*="mdc-"]');
			mdcElements.forEach(el => {
				const mdcComponent = this.getMdcComponent(el);
				if (typeof mdcComponent?.layout === 'function')
					mdcComponent?.layout();
			});
		}
	};
}));
