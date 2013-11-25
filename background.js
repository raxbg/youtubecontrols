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
	var ytbActiveTabState = ytbActiveTabs[lastTabIndex].state;
	var ytbActiveTab = ytbActiveTabs[lastTabIndex].tabId;

	if (ytbActiveTabState == 'paused' || ytbActiveTabState == 'ended') {
		chrome.tabs.sendMessage(ytbActiveTab, {cmd: 'play'}, function(rsponse){});
		updateIcon();
		chrome.browserAction.setTitle({title: 'Pause'});
	} else {
		chrome.tabs.sendMessage(ytbActiveTab, {cmd: 'pause'}, function(rsponse){});
		updateIcon();
		chrome.browserAction.setTitle({title: 'Play'});
	}
}

function volumeUp() {
	if (ytbActiveTabs.length == 0) {
		return;
	}

	var lastTabIndex = ytbActiveTabs.length - 1;
	var ytbActiveTab = ytbActiveTabs[lastTabIndex].tabId;

	chrome.tabs.sendMessage(ytbActiveTab, {cmd: 'volumedown'}, function(rsponse){});
}

function volumeDown() {
	if (ytbActiveTabs.length == 0) {
		return;
	}

	var lastTabIndex = ytbActiveTabs.length - 1;
	var ytbActiveTab = ytbActiveTabs[lastTabIndex].tabId;

	chrome.tabs.sendMessage(ytbActiveTab, {cmd: 'volumedown'}, function(rsponse){});
}

function playNext() {
	if (ytbActiveTabs.length == 0) {
		return;
	}

	var lastTabIndex = ytbActiveTabs.length - 1;
	var ytbActiveTab = ytbActiveTabs[lastTabIndex].tabId;

	chrome.tabs.sendMessage(ytbActiveTab, {cmd: 'playlistnext'}, function(rsponse){});
}

function playPrevious() {
	if (ytbActiveTabs.length == 0) {
		return;
	}

	var lastTabIndex = ytbActiveTabs.length - 1;
	var ytbActiveTab = ytbActiveTabs[lastTabIndex].tabId;

	chrome.tabs.sendMessage(ytbActiveTab, {cmd: 'playlistprev'}, function(rsponse){});
}

function updateIcon() {
	if (ytbActiveTabs.length == 0) {
		chrome.browserAction.setIcon({path: 'y_inactive.png'}, function(){});
	} else {
		var lastTabIndex = ytbActiveTabs.length - 1;
		var ytbActiveTabState = ytbActiveTabs[lastTabIndex].state;

		chrome.browserAction.setIcon({path: stateIcons[ytbActiveTabState]}, function(){});
	}
}

function updateTitle() {
	if (ytbActiveTabs.length == 0) {
		chrome.browserAction.setTitle({title: 'Not active'});
	} else {
		var lastTabIndex = ytbActiveTabs.length - 1;
		var ytbActiveTabState = ytbActiveTabs[lastTabIndex].state;

		chrome.browserAction.setTitle({title: stateTitles[ytbActiveTabState]});
	}
}

function discardTab(tabId) {
	for (x in ytbActiveTabs) {
		if (ytbActiveTabs[x].tabId == tabId) {
			ytbActiveTabs.splice(x,1);
			return true;
		}
	}

	return false;
}

function updateYtbTabState(tabId, state) {
	for (x in ytbActiveTabs) {
		if (ytbActiveTabs[x].tabId == tabId) {
			ytbActiveTabs[x].state = state;
		}
	}
}

function populateDashboard() {
	if (ytbActiveTabs.length > 0) {
		for (x in ytbActiveTabs) {
			chrome.tabs.sendMessage(ytbActiveTabs[x].tabId, {getDashboardInfo: true, tabId: ytbActiveTabs[x].tabId, state: ytbActiveTabs[x].state}, function(response){
				chrome.tabs.executeScript(lastDashboardTab, {code: 'addPopupItem(JSON.stringify(' + JSON.stringify(response) + '));'}, function(reponse){});
			});
		}
	}
}

function updateDashboard(tabId, action) {
	if (lastDashboardTab != 0) {
		if (action != 'remove') {
			for (x in ytbActiveTabs) {
				if (ytbActiveTabs[x].tabId == tabId) {
					chrome.tabs.sendMessage(ytbActiveTabs[x].tabId, {getDashboardInfo: true, tabId: ytbActiveTabs[x].tabId, state: ytbActiveTabs[x].state}, function(response){
						for (x in dashboardInjectedTabs) {
							chrome.tabs.executeScript(dashboardInjectedTabs[x], {code: 'updatePopupItem("' + JSON.stringify(response) + '", "'+action+'"");'}, function(reponse){});
						}
					});
				}
			}
		} else {
			chrome.tabs.executeScript(lastDashboardTab, {code: 'updatePopupItem("{}", "'+action+'");'}, function(reponse){});
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
					populateDashboard();
				});
			});
			dashboardInjectedTabs.push(tabs[0].id);
		} else {
			chrome.tabs.executeScript(lastDashboardTab, {file: 'dashboard.js'}, function(res){
				populateDashboard();
			});
		}
	});
}

chrome.browserAction.setTitle({title: 'Not active'});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.playerStateChange) {
		if (msg.state == 'playing') {
			discardTab(sender.tab.id);
			updateIcon();
			ytbActiveTabs.push({tabId: sender.tab.id, state: 'playing'});
		}

		var lastTabIndex = ytbActiveTabs.length - 1;
		var ytbActiveTab = ytbActiveTabs[lastTabIndex].tabId;

		updateYtbTabState(sender.tab.id, msg.state);
		updateIcon();
		updateTitle();
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
	if (typeof info.url != 'undefined') {
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
