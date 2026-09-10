(function(root, factory) {
	const toolsPackageName = '@skolaris/knockout-tools',
		mdcToolsPackageName = '@knockout-mdc/mdc-tools',
		materialListPackageName = '@knockout-mdc/material-list',
		mdcMenuPackageName = '@material/menu',
		mdcRipplePackageName = '@material/ripple';

	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define([toolsPackageName, mdcToolsPackageName, materialListPackageName, mdcMenuPackageName, mdcRipplePackageName], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory(require(toolsPackageName), require(mdcToolsPackageName), require(materialListPackageName), require(mdcMenuPackageName), require(mdcRipplePackageName));
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-menu'] = factory(root.knockoutTools, root.knockoutMdc.mdcTools, root.knockoutMdc['material-list'], root.mdc.menu, root.mdc.ripple);
	}
}(typeof self !== 'undefined' ? self : this, function(tools, mdcTools, mdcList, materialMenu, materialRipple) {

	const MaterialMenu = function(params) {
		this.id = params.id || tools.getGuid();
		this.css = params.css;

		this.selectedIndex = params.selectedIndex;
		this.select = params.select;
		this.value = params.value;
		this.childList = new mdcList.viewModel(params);

		//component lifetime
		this.mdcMenu = null;
		this.mdcRipples = [];
		this._selectedIndexSubscription = null;
		this._valueSubscription = null;
		this._mutationObserver = null;
	};
	MaterialMenu.prototype = {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			const el = node.querySelector('.mdc-menu');
			const menu = this.mdcMenu = new materialMenu.MDCMenu(el);
			const list = menu.list;
			mdcTools.setMdcComponent(el, menu);

			if (!this.fast)
				this.mdcRipples = list.listElements.map(listItemEl => new materialRipple.MDCRipple(listItemEl));

			menu.setIsHoisted(true);
			if (this.selectedIndex || this.value) {
				list.singleSelection = true;
				list.hasTypeahead = true;
			}
			if (this.selectedIndex) {
				list.selectedIndex = this.selectedIndex();
				this._selectedIndexSubscription = this.selectedIndex.subscribe(newVal => {
					this._selectIndex(newVal);
				});
			}
			if (this.value) {
				list.selectedIndex = this._findListItemIndex(this.value());
				this._valueSubscription = this.value.subscribe(newVal => {
					this._selectIndex(this._findListItemIndex(newVal));
				});
			}

			list.listElements.forEach(listEl => listEl.setAttribute('role', 'menuitem'));

			//menu must be on top level to ensure proper function
			document.body.appendChild(menu.root);

			this._mutationObserver = new MutationObserver(() => list.layout());
			this._mutationObserver.observe(list.root, { childList: true, subtree: true });
		},
		'dispose': function() {
			this._mutationObserver?.disconnect();
			this._selectedIndexSubscription?.dispose();
			this._valueSubscription?.dispose();

			this.mdcRipples.forEach(ripple => ripple.destroy());
			if (this.mdcMenu) {
				const el = this.mdcMenu.root;
				this.mdcMenu.destroy();
				ko.removeNode(el);
			}
		},

		'onSelected': function(vm, event) {
			//the action could lead to menu items changing, so wait till mdc processing is done
			const value = event.detail.item.getAttribute('data-value');
			setTimeout(() => {
				if (this.selectedIndex)
					this.selectedIndex(event.detail.index);

				if (this.value)
					this.value(value);

				if (this.select)
					this.select(value, event.detail.index);
			});
		},
		'focusSelectedItem': function() {
			this.mdcMenu.foundation.adapter.focusItemAtIndex(this.mdcMenu.list.selectedIndex);
		},

		'_findListItemIndex': function(value) {
			return this.mdcMenu.list.listElements.findIndex(listItem => listItem.getAttribute('data-value') == value);
		},
		'_selectIndex': function(index) {
			const list = this.mdcMenu.list,
				focusedIndex = list.foundation.focusedItemIndex;

			list.selectedIndex = index;
			if (focusedIndex >= 0 && focusedIndex != index)
				list.foundation.focusedItemIndex = -1;
		}
	};

    const nodes = '$componentTemplateNodes';

	return {
		'viewModel': MaterialMenu,
		'template':
`<div class="mdc-menu mdc-menu-surface" data-bind="id: id, css: css, event: {'MDCMenu:selected': onSelected.bind($component)}">
	<ul class="mdc-deprecated-list" role="menu" aria-orientation="vertical"
		data-bind="css: childList.getCss(), template: {'nodes': ${nodes}.length > 0 ? ${nodes} : $parentContext.${nodes}, 'data': $parent}"></ul>
</div>`
	};
}));
