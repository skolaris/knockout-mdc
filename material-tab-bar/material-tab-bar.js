(function(root, factory) {
	const mdcToolsPackageName = '@knockout-mdc/mdc-tools',
		mdcTabBarPackageName = '@material/tab-bar';

	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define([mdcToolsPackageName, mdcTabBarPackageName], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory(require(mdcToolsPackageName), require(mdcTabBarPackageName));
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-tab-bar'] = factory(root.knockoutMdc.mdcTools, root.mdc['tab-bar']);
	}
}(typeof self !== 'undefined' ? self : this, function(mdcTools, materialTabBar) {

	const MaterialTabBar = function(params) {
		this.tabs = params.tabs;
		this.selected = params.selected;

		//component lifetime
		this.mdcTabBar = null;
		this._selectionSubscription = null;
	};
	MaterialTabBar.prototype = {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			const el = node.querySelector('.mdc-tab-bar');
			const tabBar = this.mdcTabBar = new materialTabBar.MDCTabBar(el);
			mdcTools.setMdcComponent(el, tabBar);
			tabBar.activateTab(this.selected());
			this._selectionSubscription = this.selected.subscribe(newVal => {
				tabBar.activateTab(newVal);
			});
		},
		'dispose': function() {
			this._selectionSubscription?.dispose();
			this.mdcTabBar?.destroy();
		},

		'onActivated': function(vm, event) {
			this.selected(event.detail.index);
		}
	};

	return {
		'viewModel': MaterialTabBar,
		'template':
`<div class="mdc-tab-bar" role="tablist" data-bind="event: {'MDCTabBar:activated': onActivated}">
	<div class="mdc-tab-scroller">
		<div class="mdc-tab-scroller__scroll-area">
			<div class="mdc-tab-scroller__scroll-content" data-bind="foreach: tabs">
				<button class="mdc-tab" role="tab" data-bind="enable: enabled">
					<span class="mdc-tab__content">
						<span class="mdc-tab__text-label">{{title}}</span>
					</span>
					<span class="mdc-tab-indicator">
						<span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
					</span>
					<span class="mdc-tab__ripple"></span>
					<div class="mdc-tab__focus-ring"></div>
				</button>
			</div>
		</div>
	</div>
</div>`
	};
}));
