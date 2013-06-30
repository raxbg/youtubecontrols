var ytbActiveTabs = [];
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
		chrome.tabs.sendMessage(ytbActiveTab, {cmd: 'videoObj.play();'}, function(rsponse){});
		updateIcon();
		chrome.browserAction.setTitle({title: 'Pause'});
	} else {
		chrome.tabs.sendMessage(ytbActiveTab, {cmd: 'videoObj.pause();'}, function(rsponse){});
		updateIcon();
		chrome.browserAction.setTitle({title: 'Play'});
	}
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
	}

	sendResponse();
});

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
	if (typeof info.url != 'undefined') {
		if (discardTab(tabId)) {
			updateIcon();
			updateTitle();
		}
	}
});

chrome.tabs.onRemoved.addListener(function(tabId, info) {
	if (discardTab(tabId)) {
		updateIcon();
		updateTitle();
	}
});

chrome.browserAction.onClicked.addListener(function(tab) {
	togglePlayPause(tab);
});

chrome.commands.onCommand.addListener(function(command) {
	if (command == 'toggle-play-pause') {
		togglePlayPause(null);
	}
});