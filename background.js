
var ytbActiveTabs = [];
var dashboardInjectedTabs = [];
var lastDashboardTab = 0;

var stateIcons = {
	paused: 'y_play.png',
	ended: 'y_play.png',
	playing: 'y_pause.png'
};

var stateTitles = {
	paused: 'Play',
	ended: 'Replay',
	playing: 'Pause'
}

function togglePlayPause(tab) {
	if (ytbActiveTabs.length == 0) {
		return;
	}

	var lastTabIndex = ytbActiveTabs.length - 1;
	var ytbActiveTab = ytbActiveTabs[lastTabIndex];

	if (ytbActiveTab.getState() == 'paused' || ytbActiveTab.getState() == 'ended') {
		chrome.tabs.sendMessage(ytbActiveTab.id, {cmd: 'play'}, function(rsponse){});
		updateIcon();
		chrome.browserAction.setTitle({title: 'Pause'});
	} else {
		chrome.tabs.sendMessage(ytbActiveTab.id, {cmd: 'pause'}, function(rsponse){});
		updateIcon();
		chrome.browserAction.setTitle({title: 'Play'});
	}
}

function volumeUp() {
	if (ytbActiveTabs.length == 0) {
		return;
	}

	var lastTabIndex = ytbActiveTabs.length - 1;
	var ytbActiveTab = ytbActiveTabs[lastTabIndex];

	chrome.tabs.sendMessage(ytbActiveTab.id, {cmd: 'volumedown'}, function(rsponse){});
}

function volumeDown() {
	if (ytbActiveTabs.length == 0) {
		return;
	}

	var lastTabIndex = ytbActiveTabs.length - 1;
	var ytbActiveTab = ytbActiveTabs[lastTabIndex];

	chrome.tabs.sendMessage(ytbActiveTab.id, {cmd: 'volumedown'}, function(rsponse){});
}

function playNext() {
	if (ytbActiveTabs.length == 0) {
		return;
	}

	var lastTabIndex = ytbActiveTabs.length - 1;
	var ytbActiveTab = ytbActiveTabs[lastTabIndex];

	chrome.tabs.sendMessage(ytbActiveTab.id, {cmd: 'playlistnext'}, function(rsponse){});
}

function playPrevious() {
	if (ytbActiveTabs.length == 0) {
		return;
	}

	var lastTabIndex = ytbActiveTabs.length - 1;
	var ytbActiveTab = ytbActiveTabs[lastTabIndex];

	chrome.tabs.sendMessage(ytbActiveTab.id, {cmd: 'playlistprev'}, function(rsponse){});
}

function updateIcon() {
	if (ytbActiveTabs.length == 0) {
		chrome.browserAction.setIcon({path: 'y_inactive.png'}, function(){});
	} else {
		var lastTabIndex = ytbActiveTabs.length - 1;
		var ytbActiveTabState = ytbActiveTabs[lastTabIndex].getState();

		chrome.browserAction.setIcon({path: stateIcons[ytbActiveTabState]}, function(){});
	}
}

function updateTitle() {
	if (ytbActiveTabs.length == 0) {
		chrome.browserAction.setTitle({title: 'Not active'});
	} else {
		var lastTabIndex = ytbActiveTabs.length - 1;
		var ytbActiveTabState = ytbActiveTabs[lastTabIndex].getState();

		chrome.browserAction.setTitle({title: stateTitles[ytbActiveTabState]});
	}
}

function discardTab(tabId) {
	for (x in ytbActiveTabs) {
		if (ytbActiveTabs[x].id == tabId) {
			ytbActiveTabs.splice(x,1);
			return true;
		}
	}

	return false;
}

function updateYtbTabState(tabId, state) {
	for (x in ytbActiveTabs) {
		if (ytbActiveTabs[x].id == tabId) {
			ytbActiveTabs[x].setState(state);
		}
	}
}

function updateDashboard() {
	if (ytbActiveTabs.length > 0) {
		var activeTabsInJson = [];
		for (x in ytbActiveTabs) {
			/*chrome.tabs.sendMessage(ytbActiveTabs[x].tabId, {getDashboardInfo: true, tabId: ytbActiveTabs[x].tabId, state: ytbActiveTabs[x].state}, function(response){
				chrome.tabs.executeScript(lastDashboardTab, {code: 'addPopupItem(JSON.stringify(' + JSON.stringify(response) + '));'}, function(reponse){});
			});*/
			activeTabsInJson.push(ytbActiveTabs[x].toJson());
		}

		for (x in dashboardInjectedTabs) {
			//chrome.tabs.executeScript(lastDashboardTab, {code: 'populateDashboardDeck(' + JSON.stringify(activeTabsInJson) + ');'}, function(reponse){});
			chrome.tabs.executeScript(dashboardInjectedTabs[x], {code: 'updateDashboardDeck(' + JSON.stringify(activeTabsInJson) + ');'}, function(reponse){});
		}
	}
}

function showDashboard() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		lastDashboardTab = tabs[0].id;

		if (dashboardInjectedTabs.indexOf(tabs[0].id) == -1) {
			chrome.tabs.insertCSS(tabs[0].id, {file: 'dashboard.css'}, function(res){});
			chrome.tabs.executeScript(tabs[0].id, {file: 'dashboardEvents.js'}, function(res){
				chrome.tabs.executeScript(lastDashboardTab, {file: 'dashboard.js'}, function(res){
					updateDashboard();
				});
			});
			dashboardInjectedTabs.push(tabs[0].id);
		} else {
			chrome.tabs.executeScript(lastDashboardTab, {file: 'dashboard.js'}, function(res){
				updateDashboard();
			});
		}
	});
}

chrome.browserAction.setTitle({title: 'Not active'});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.registerTab) {
		var newTab = (function(tabId, tabState, tabIsPlaylist, tabTitle, tabImage){
			var id = tabId,
				state = tabState,
				isPlaylist = tabIsPlaylist,
				title = tabTitle,
				image = tabImage;

			return {
				getState: function() { return state; },
				isPlaylist: function() { return isPlaylist; },
				getTitle: function() { return title; },
				getImage: function() { return image; },
				id: id,
				setState: function(newState) { state = newState; },
				setTitle: function(newTitle) { title = newTitle },
				setIsPlaylist: function(tabIsPlaylist) { isPlaylist = tabIsPlaylist },
				setImage: function(newImage) { image = newImage; },
				toJson: function() {
					return JSON.stringify({
						id: id,
						state: state,
						isPlaylist: isPlaylist,
						title: title,
						image: image
					});
				}
			};
		})(sender.tab.id, msg.state, msg.isPlaylist, msg.title, msg.image);
		ytbActiveTabs.push(newTab);
		updateDashboard();
	} else if (msg.playerStateChange) {
		/*if (msg.state == 'playing') {
			discardTab(sender.tab.id);
			updateIcon();
			ytbActiveTabs.push({tabId: sender.tab.id, state: 'playing'});
		}*/

		var lastTabIndex = ytbActiveTabs.length - 1;
		var ytbActiveTab = ytbActiveTabs[lastTabIndex];

		updateYtbTabState(sender.tab.id, msg.state);
		updateIcon();
		updateTitle();
		updateDashboard();
	} else if (msg.focusTab) {
		chrome.tabs.update(msg.tabId, {active: true}, function(){});
	} else if (msg.play) {
		chrome.tabs.sendMessage(msg.tabId, {cmd: 'play'}, function(rsponse){});
	} else if (msg.pause) {
		chrome.tabs.sendMessage(msg.tabId, {cmd: 'pause'}, function(rsponse){});
	} else if (msg.prev) {
		chrome.tabs.sendMessage(msg.tabId, {cmd: 'playlistprev'}, function(rsponse){});
	} else if (msg.next) {
		chrome.tabs.sendMessage(msg.tabId, {cmd: 'playlistnext'}, function(rsponse){});
	}

	sendResponse();
});

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
	if (typeof info.status != 'undefined' && info.status == 'loading') {
		if (discardTab(tabId)) {
			updateIcon();
			updateTitle();
			//updateDashboard(tabId, 'remove');
		}
	}

	var tabIndex = dashboardInjectedTabs.indexOf(tabId);
	if (tabIndex != -1) {
		dashboardInjectedTabs.splice(tabIndex, 1);
	}
	updateDashboard();
});

chrome.tabs.onRemoved.addListener(function(tabId, info) {
	if (discardTab(tabId)) {
		updateIcon();
		updateTitle();
		//updateDashboard(tabId, 'remove');
	}

	var tabIndex = dashboardInjectedTabs.indexOf(tabId);
	if (tabIndex != -1) {
		dashboardInjectedTabs.splice(tabIndex, 1);
	}
	updateDashboard();
});

chrome.browserAction.onClicked.addListener(function(tab) {
	togglePlayPause(tab);
});

chrome.commands.onCommand.addListener(function(command) {
	if (command == 'toggle-play-pause') {
		togglePlayPause(null);
	} else if (command == 'abc') {
		showDashboard();
	} else if (command == 'volumeUp') {
		volumeUp();
	} else if (command == 'volumeDown') {
		volumeDown();
	} else if (command == 'playlistNext') {
		playNext();
	} else if (command == 'playlistPrevious') {
		playPrevious();
	}
});
