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
		root.knockoutMdc['material-banner'] = factory(root.knockoutTools);
	}
}(typeof self !== 'undefined' ? self : this, function(tools) {

	const MaterialBanner = function(params) {
		this.icon = params.icon;
		this.text = params.text;
		this.buttons = params.buttons;
		this.show = params.show;
		this.dismissed = params.dismissed;
		this.id = tools.getGuid();

		const onButtonClick = index => {
			if (this.buttons[index].dismiss)
				this._hide();

			if (typeof this.buttons[index].click === 'function')
				this.buttons[index].click();
		};
		this.onButton0 = () => onButtonClick(0);
		this.onButton1 = () => onButtonClick(1);
	};
	MaterialBanner.prototype = {
		'_hide': function() {
			this.dismissed(true);
		}
	};

	return {
		'viewModel': MaterialBanner,
		'template':
`<material-collapse params="opened: show">
	<div class="material-banner__wrapper">
		<div class="material-banner__message">
			<!-- ko if: icon -->
			<div class="material-banner__illustration">
				<i class="material-icons">{{icon}}</i>
			</div>
			<!-- /ko -->
			<div class="material-banner__text">
				<span class="mdc-typography--body2" data-bind="html: text"></span>
			</div>
		</div>
		<div class="material-banner__buttons">
			<!-- ko using: buttons[0] -->
			<!-- ko if: $data.href -->
			<a data-bind="href: href" target="_blank" rel="noopener" tabindex="-1">
				<material-button>{{text}}</material-button>
			</a>
			<!-- /ko -->
			<!-- ko ifnot: $data.href -->
			<material-button data-bind="click: $parent.onButton0">{{text}}</material-button>
			<!-- /ko -->
			<!-- /ko -->
			<!-- ko with: buttons[1] -->
			<!-- ko if: $data.href -->
			<a data-bind="href: href" target="_blank" rel="noopener" tabindex="-1">
				<material-button>{{text}}</material-button>
			</a>
			<!-- /ko -->
			<!-- ko ifnot: $data.href -->
			<material-button data-bind="click: $parent.onButton1">{{text}}</material-button>
			<!-- /ko -->
			<!-- /ko -->
		</div>
	</div>
</material-collapse>`
	};
}));
