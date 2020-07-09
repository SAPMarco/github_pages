sap.ui.define(
	[
		"./Base",
		"sapmarco/projectpages/util/marked",
		"sap/m/ActionListItem",
		"sapmarco/projectpages/util/githubService",
	], (BaseController, Marked, ActionListItem, githubService) => {
		"use strict";

		return BaseController.extend("sapmarco.projectpages.controller.Wiki", {
			onInit() {
				//Init
				this.initializeViewTheme();
				this.getView().addStyleClass(
					this.getOwnerComponent().getContentDensityClass()
				);
				this.getRouter()
					.getRoute("RouteWiki")
					.attachMatched(this._onRouteMatched, this);
			},
			onThemeSwap(sTheme) {
				this.toggleTheme(sTheme);
			},
			onBackHome() {
				this.onNavBack();
				//Reset the header as we're not reloading the page when re-entering it
				this.byId("wikiPage").setTitle(
					this.getView().getModel("i18n").getResourceBundle().getText("wiki")
				);
			},
			async onSidebarSelection(sText) {
				//get markdown page and encode - to %20
				const response = await githubService.getSelectedContent(sText);

				this.byId("wikiPage").setTitle(sText);
				this.byId("markdownContainer").getDomRef().innerHTML = await Marked(
					response
				);
			},
			_onRouteMatched(oEvt) {
				this._initializeSidebar();
			},
			async _initializeSidebar() {
				//get sidebar from wiki
				const response = await githubService.getWikiIndex();
				//parse markdown to html
				const parsedMarkdown = await Marked(response);
				let matches = [...parsedMarkdown.matchAll(/\wiki\/(.*?)\"/g)];
				for (let i = 0; i < matches.length; i++) {
					this.byId("sidebar").addItem(
						new ActionListItem({
							text: `${matches[i][1]}`,
							press: this.onSidebarSelection.bind(this, matches[i][1]),
						})
					);
				}
			},
		});
	}
);
