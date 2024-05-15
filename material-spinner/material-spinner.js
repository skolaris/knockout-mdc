(function(root, factory) {
	const mdcToolsPackageName = '@knockout-mdc/mdc-tools',
		mdcCircularProgressPackageName = '@material/circular-progress';

	if (typeof define === 'function' && define.amd) {
		//AMD. Register as an anonymous module.
		define([mdcToolsPackageName, mdcCircularProgressPackageName], factory);
	}
	else if (typeof module === 'object' && module.exports) {
		//Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports like Node.
		module.exports = factory(require(mdcToolsPackageName), require(mdcCircularProgressPackageName));
	}
	else {
		//Browser globals (root is window)
		root.knockoutMdc = root.knockoutMdc || {};
		root.knockoutMdc['material-spinner'] = factory(root.knockoutMdc.mdcTools, root.mdc['circular-progress']);
	}
}(typeof self !== 'undefined' ? self : this, function(mdcTools, materialCircularProgress) {

	const MaterialSpinner = function(params) {
		this.size = ko.unwrap(params.size) || 'large';
		this.label = params.label;

		//component lifetime
		this.mdcProgress = null;
	};
	MaterialSpinner.prototype = {
		'koDescendantsComplete': function(node) {
			if (!node.isConnected)
				return;

			const el = node.querySelector('.mdc-circular-progress');
			this.mdcProgress = new materialCircularProgress.MDCCircularProgress(el);
			mdcTools.setMdcComponent(el, this.mdcProgress);
		},
		'dispose': function() {
			this.mdcProgress?.destroy();
		},

		'getAttrs': function() {
			return {
				'aria-label': this.label,
			};
		},
		'getCss': function() {
			return {
				'mdc-circular-progress--indeterminate': true,
				'mdc-circular-progress--large': this.size === 'large',
				'mdc-circular-progress--medium': this.size === 'medium',
				'mdc-circular-progress--small': this.size === 'small',
			};
		}
	};

	const xmlnsTag = 'xmlns="http://www.w3.org/2000/svg"';

	return {
		'viewModel': MaterialSpinner,
		'template':
`<div class="mdc-circular-progress" role="progressbar" aria-valuemin="0" aria-valuemax="1" data-bind="attr: getAttrs(), css: getCss()">
	<!-- ko if: size === 'large' -->
	<div class="mdc-circular-progress__determinate-container">
		<svg class="mdc-circular-progress__determinate-circle-graphic" viewBox="0 0 48 48" ${xmlnsTag}>
			<circle class="mdc-circular-progress__determinate-track" cx="24" cy="24" r="18" stroke-width="4" />
			<circle class="mdc-circular-progress__determinate-circle" cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="113.097" stroke-width="4" />
		</svg>
	</div>
	<div class="mdc-circular-progress__indeterminate-container">
		<div class="mdc-circular-progress__spinner-layer">
			<div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-left">
				<svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" ${xmlnsTag}>
					<circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="4" />
				</svg>
			</div>
			<div class="mdc-circular-progress__gap-patch">
				<svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" ${xmlnsTag}>
					<circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="3.2" />
				</svg>
			</div>
			<div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-right">
				<svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" ${xmlnsTag}>
					<circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="4" />
				</svg>
			</div>
		</div>
	</div>
	<!-- /ko -->
	<!-- ko if: size === 'medium' -->
	<div class="mdc-circular-progress__determinate-container">
		<svg class="mdc-circular-progress__determinate-circle-graphic" viewBox="0 0 32 32" ${xmlnsTag}>
			<circle class="mdc-circular-progress__determinate-track" cx="16" cy="16" r="12.5" stroke-width="3" />
			<circle class="mdc-circular-progress__determinate-circle" cx="16" cy="16" r="12.5" stroke-dasharray="78.54" stroke-dashoffset="78.54" stroke-width="3" />
		</svg>
	</div>
	<div class="mdc-circular-progress__indeterminate-container">
		<div class="mdc-circular-progress__spinner-layer">
			<div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-left">
				<svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 32 32" ${xmlnsTag}>
					<circle cx="16" cy="16" r="12.5" stroke-dasharray="78.54" stroke-dashoffset="39.27" stroke-width="3" />
				</svg>
			</div>
			<div class="mdc-circular-progress__gap-patch">
				<svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 32 32" ${xmlnsTag}>
					<circle cx="16" cy="16" r="12.5" stroke-dasharray="78.54" stroke-dashoffset="39.27" stroke-width="2.4" />
				</svg>
			</div>
			<div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-right">
				<svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 32 32" ${xmlnsTag}>
					<circle cx="16" cy="16" r="12.5" stroke-dasharray="78.54" stroke-dashoffset="39.27" stroke-width="3" />
				</svg>
			</div>
		</div>
	</div>
	<!-- /ko -->
	<!-- ko if: size === 'small' -->
	<div class="mdc-circular-progress__determinate-container">
		<svg class="mdc-circular-progress__determinate-circle-graphic" viewBox="0 0 24 24" ${xmlnsTag}>
			<circle class="mdc-circular-progress__determinate-track" cx="12" cy="12" r="8.75" stroke-width="2.5" />
			<circle class="mdc-circular-progress__determinate-circle" cx="12" cy="12" r="8.75" stroke-dasharray="54.978" stroke-dashoffset="54.978" stroke-width="2.5" />
		</svg>
	</div>
	<div class="mdc-circular-progress__indeterminate-container">
		<div class="mdc-circular-progress__spinner-layer">
			<div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-left">
				<svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 24 24" ${xmlnsTag}>
					<circle cx="12" cy="12" r="8.75" stroke-dasharray="54.978" stroke-dashoffset="27.489" stroke-width="2.5" />
				</svg>
			</div>
			<div class="mdc-circular-progress__gap-patch">
				<svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 24 24" ${xmlnsTag}>
					<circle cx="12" cy="12" r="8.75" stroke-dasharray="54.978" stroke-dashoffset="27.489" stroke-width="2" />
				</svg>
			</div>
			<div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-right">
				<svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 24 24" ${xmlnsTag}>
					<circle cx="12" cy="12" r="8.75" stroke-dasharray="54.978" stroke-dashoffset="27.489" stroke-width="2.5" />
				</svg>
			</div>
		</div>
	</div>
	<!-- /ko -->
</div>`
	};
}));
