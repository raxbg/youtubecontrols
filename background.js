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

function updateYtbTabInfo(tabId, info) {
	for (x in ytbActiveTabs) {
		if (ytbActiveTabs[x].id == tabId) {
			ytbActiveTabs[x].setState(info.state);
			ytbActiveTabs[x].setTitle(info.title);
			ytbActiveTabs[x].setIsPlaylist(info.isPlaylist);
			ytbActiveTabs[x].setImage(info.image);
			ytbActiveTabs[x].setShareUrl(info.share_url);
			ytbActiveTabs[x].setDuration(info.duration);
			ytbActiveTabs[x].setCurrentTime(info.currentTime);
			ytbActiveTabs[x].setVolume(info.volume);
		}
	}
	updateDashboard();
}

function updateDashboard() {
	var activeTabsInJson = [];
	for (x in ytbActiveTabs) {
		activeTabsInJson.push(ytbActiveTabs[x].toJson());
	}

	for (x in dashboardInjectedTabs) {
		chrome.tabs.executeScript(dashboardInjectedTabs[x], {code: 'updateDashboardDeck(' + JSON.stringify(activeTabsInJson) + ');'}, function(reponse){});
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
		var newTab = (function(tabId, tabState, tabIsPlaylist, tabTitle, tabImage, tabShareUrl, tabDuration, tabCurrentTime, tabVolume){
			var id = tabId,
				state = tabState,
				isPlaylist = tabIsPlaylist,
				title = tabTitle,
				image = tabImage,
				share_url = tabShareUrl,
				duration = tabDuration,
				currentTime = tabCurrentTime,
				volume = tabVolume;

			return {
				getState: function() { return state; },
				isPlaylist: function() { return isPlaylist; },
				getTitle: function() { return title; },
				getImage: function() { return image; },
				getShareUrl: function() { return share_url; },
				getDuration: function() { return duration; },
				getCurrentTime: function() { return currentTime; },
				getVolume: function() { return volume; },
				id: id,
				setState: function(newState) { state = newState; },
				setTitle: function(newTitle) { title = newTitle },
				setIsPlaylist: function(tabIsPlaylist) { isPlaylist = tabIsPlaylist },
				setImage: function(newImage) { image = newImage; },
				setShareUrl: function(newShareUrl) { share_url = newShareUrl; },
				setDuration: function(newDuration) { duration = newDuration; },
				setCurrentTime: function(newCurrentTime) { currentTime = newCurrentTime; },
				setVolume: function(newVolume) { volume = newVolume; },
				toJson: function() {
					return JSON.stringify({
						id: id,
						state: state,
						isPlaylist: isPlaylist,
						title: title,
						image: image,
						share_url: share_url,
						duration: duration,
						currentTime: currentTime,
						volume: volume
					});
				}
			};
		})(sender.tab.id, msg.state, msg.isPlaylist, msg.title, msg.image, msg.share_url, msg.duration, msg.currentTime, msg.volume);
		for (x in ytbActiveTabs) {
			if (ytbActiveTabs[x].id == tabId) {
				ytbActiveTabs.splice(x, 1);
				break;
			}
		}
		ytbActiveTabs.push(newTab);
		updateDashboard();
	} else if (msg.playerStateChange) {
		var lastTabIndex = ytbActiveTabs.length - 1;
		var ytbActiveTab = ytbActiveTabs[lastTabIndex];

		updateYtbTabState(sender.tab.id, msg.state);
		updateIcon();
		updateTitle();
		updateDashboard();
	} else if (msg.updateTabInfo) {
		updateYtbTabInfo(sender.tab.id, msg);
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
	} else if (msg.closeTab) {
		chrome.tabs.remove(msg.tabId, function(){});
	} else if (msg.rewind) {
		chrome.tabs.sendMessage(msg.tabId, {cmd: 'rewind', toTime: msg.toTime}, function(rsponse){});
	} else if (msg.changeVolume) {
		chrome.tabs.sendMessage(msg.tabId, {cmd: 'changeVolume', toVolume: msg.toVolume}, function(rsponse){});
	}

	sendResponse();
});

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
	if (typeof info.status != 'undefined' && info.status == 'loading') {
		if (typeof info.url == 'undefined') {
			discardTab(tabId);
			var tabIndex = dashboardInjectedTabs.indexOf(tabId);
			if (tabIndex != -1) {
				dashboardInjectedTabs.splice(tabIndex, 1);
			}
			updateDashboard();
		} else {
			chrome.tabs.sendMessage(tabId, {updateTabInfo: true}, function(response){});
		}
	}
});

chrome.tabs.onRemoved.addListener(function(tabId, info) {
	if (discardTab(tabId)) {
		updateIcon();
		updateTitle();
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
