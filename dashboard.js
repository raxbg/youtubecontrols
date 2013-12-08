ytcDashboard = (function(){
	if (typeof ytcDashboard != 'undefined') {
		return ytcDashboard;
	}

	console.log('Creating new dashboard');
	var ytcOverlay = document.createElement('div');
	var ytcDashboardItemList = document.createElement('ul');
	var ytcCloseSelectedTabsBtn = document.createElement('a');
	var state = 'closed';
	var tab_ids = [];

	ytcOverlay.id = 'youtubecontrolsOverlay';

	ytcDashboardItemList.id = 'youtubecontrolsDashboardDeck';
	
	ytcCloseSelectedTabsBtn.id = 'youtubecontrolsCloseSelectedTabsBtn';
	ytcCloseSelectedTabsBtn.innerHTML = 'Close selected tabs';

	ytcOverlay.appendChild(ytcDashboardItemList);
	ytcOverlay.appendChild(ytcCloseSelectedTabsBtn);

	return {
		open: function() {
			if (state != 'opened') {
				document.body.appendChild(ytcOverlay);
				state = 'opened';
			}
		},
		close: function() {
			if (state != 'closed') {
				ytcOverlay.remove();
				state = 'closed';
			}
		},
		getOverlay: function() { return ytcOverlay; },
		getCardDeck: function() { return ytcDashboardItemList; },
		getCloseSelectedTabsBtn: function() { return ytcCloseSelectedTabsBtn; },
		getTabIds: function() { return tab_ids; },
		addTabId: function(tabId) {
			if (tab_ids.indexOf(tabId) == -1) {
				tab_ids.push(tabId);
			}
		},
		removeTabId: function(tabId) {
			var tabIndex = tab_ids.indexOf(tabId);
			if (tabIndex != -1) {
				tab_ids.splice(tabIndex, 1);
			}
		}
	};
})();

ytcDashboard.open();