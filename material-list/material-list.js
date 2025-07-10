(function(root, factory) {
	const mdcToolsPackageName = '@knockout-mdc/mdc-tools',
		mdcListPackageName = '@material/list',
		mdcRipplePackageName = '@material/ripple';

	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define([mdcToolsPackageName, mdcListPackageName, mdcRipplePackageName], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory(require(mdcToolsPackageName), require(mdcListPackageName), require(mdcRipplePackageName));
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-list'] = factory(root.knockoutMdc.mdcTools, root.mdc.list, root.mdc.ripple);
	}
}(typeof self !== 'undefined' ? self : this, function(mdcTools, materialList, materialRipple) {

	const MaterialList = function(params) {
		this.fast = params.fast; //prevent ripple effect
		this.avatars = params.avatars;
		this.icons = params.icons;
		this.twoLines = params.twoLines;

		//component lifetime
		this.mdcList = null;
		this.mdcRipples = [];
		this._mutationObserver = null;
	};
	MaterialList.prototype = {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			const el = node.querySelector('.mdc-deprecated-list');
			const list = this.mdcList = new materialList.MDCList(el);
			mdcTools.setMdcComponent(el, list);
			if (!this.fast)
				this.mdcRipples = list.listElements.map(listItemEl => new materialRipple.MDCRipple(listItemEl));

			this._mutationObserver = new MutationObserver(() => list.layout());
			this._mutationObserver.observe(list.root, { childList: true, subtree: true });
		},
		'dispose': function() {
			this._mutationObserver?.disconnect();
			this.mdcRipples.forEach(ripple => ripple.destroy());
			this.mdcList?.destroy();
		},

		'getCss': function() {
			return {
				'mdc-deprecated-list--textual-list': !this.avatars && !this.icons,
				'mdc-deprecated-list--avatar-list': this.avatars,
				'mdc-deprecated-list--icon-list': this.icons,
				'mdc-deprecated-list--two-line': this.twoLines
			};
		}
	};

	return {
		'viewModel': MaterialList,
		'template':
`<ul class="mdc-deprecated-list" data-bind="css: getCss(), template: {'nodes': $componentTemplateNodes, 'data': $parent}"></ul>`
	};
}));
