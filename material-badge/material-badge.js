(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define(factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory();
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-badge'] = factory();
	}
}(typeof self !== 'undefined' ? self : this, function() {
	return {
		'template': `<div class="material-badge__content" data-bind="template: {'nodes': $componentTemplateNodes, data: $parent}"></div>`
	};
}));
