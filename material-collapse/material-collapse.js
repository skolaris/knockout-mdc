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
		root.knockoutMdc['material-collapse'] = factory();
	}
}(typeof self !== 'undefined' ? self : this, function() {

	const transitionDuration = 175, //ms
		collapsedClass = 'material-collapse--collapsed',
		expandedClass = 'material-collapse--expanded';

	var MaterialCollapse = function(params) {
		this.opened = params.opened;
		this.node = null;
		this.content = null;
		this._openedSubscription = null;
		this._resizeObserver = null;
	};
	MaterialCollapse.prototype = {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			node.classList.add(collapsedClass);
			this.node = node;
			this.content = node.querySelector('.material-collapse__content');
			this._resizeObserver = new window.ResizeObserver(entries => {
				for (const entry of entries) {
					const height = entry.borderBoxSize[0].blockSize;
					this._setMaxHeight(height);
				}
			});

			this._layout();
			if (ko.isObservable(this.opened))
				this._openedSubscription = this.opened.subscribe(() => this._layout());
		},
		'dispose': function() {
			this._openedSubscription?.dispose();
			this._resizeObserver?.disconnect();
		},

		'_layout': function() {
			if (ko.unwrap(this.opened)) {
				this.node.classList.remove(collapsedClass);
				setTimeout(() => {
					this._resizeObserver.observe(this.content);
					setTimeout(() => this.node.classList.add(expandedClass), transitionDuration);
				});
			}
			else {
				this.node.classList.remove(expandedClass);
				this._resizeObserver.unobserve(this.content);
				this._setMaxHeight(null);
				setTimeout(() => this.node.classList.add(collapsedClass), transitionDuration);
			}
		},
		'_setMaxHeight': function(height) {
			this.node.style.maxHeight = height === null ? height : `${height}px`;
		}
	};

	const nodes = '$componentTemplateNodes';

	return {
		'viewModel': MaterialCollapse,
		'template':
`<div class="material-collapse__content"
data-bind="template: {'nodes': ${nodes}.length > 0 ? ${nodes} : $parentContext.${nodes}, data: ${nodes}.length > 0 ? $parent : $parents[1]}"></div>`
	};
}));
