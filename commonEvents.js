window.addEventListener('message', function(e){
	switch (e.data.action) {
		case 'focus':
			chrome.runtime.sendMessage({focusTab: true, tabId: e.data.tabId}, function(response){});
			break;
		case 'play':
			chrome.runtime.sendMessage({play: true, tabId: e.data.tabId}, function(response){});
			break;
		case 'pause':
			chrome.runtime.sendMessage({pause: true, tabId: e.data.tabId}, function(response){});
			break;
		case 'prev':
			chrome.runtime.sendMessage({prev: true, tabId: e.data.tabId}, function(response){});
			break;
		case 'next':
			chrome.runtime.sendMessage({next: true, tabId: e.data.tabId}, function(response){});
			break;
		case 'close':
			chrome.runtime.sendMessage({closeTab: true, tabId: e.data.tabId}, function(response){});
			break;
	}
});
