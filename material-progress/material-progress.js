(function(root, factory) {
	const mdcToolsPackageName = '@knockout-mdc/mdc-tools',
		mdcLinearProgressPackageName = '@material/linear-progress';

	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define([mdcToolsPackageName, mdcLinearProgressPackageName], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory(require(mdcToolsPackageName), require(mdcLinearProgressPackageName));
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-progress'] = factory(root.knockoutMdc.mdcTools, root.mdc['linear-progress']);
	}
}(typeof self !== 'undefined' ? self : this, function(mdcTools, materialLinearProgress) {

	const MaterialProgress = function(params) {
		this.label = params.label;
		this.value = params.value;
		this.indeterminate = params.indeterminate;

		//component lifetime
		this.mdcLinearProgress = null;
		this._valueSubscription = null;
	};
	MaterialProgress.prototype = {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			const el = node.querySelector('.mdc-linear-progress');
			const linearProgress = this.mdcLinearProgress = new materialLinearProgress.MDCLinearProgress(el);
			mdcTools.setMdcComponent(el, linearProgress);

			if (this.value) {
				linearProgress.progress = this.value();
				this._valueSubscription = this.value.subscribe(newVal => {
					linearProgress.progress = newVal;
				});
			}
		},
		'dispose': function() {
			this._valueSubscription?.dispose();
			this.mdcLinearProgress?.destroy();
		},

		'getAttrs': function() {
			return {
				'aria-label': this.label
			};
		},
		'getCss': function() {
			return {
				'mdc-linear-progress--indeterminate': this.indeterminate,
			};
		}
	};

	return {
		'viewModel': MaterialProgress,
		'template':
`<div role="progressbar" class="mdc-linear-progress" aria-valuemin="0" aria-valuemax="1" data-bind="attr: getAttrs(), css: getCss()">
	<div class="mdc-linear-progress__buffer">
		<div class="mdc-linear-progress__buffer-bar"></div>
		<div class="mdc-linear-progress__buffer-dots"></div>
	</div>
	<div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
		<span class="mdc-linear-progress__bar-inner"></span>
	</div>
	<div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
		<span class="mdc-linear-progress__bar-inner"></span>
	</div>
</div>`
	};
}));
