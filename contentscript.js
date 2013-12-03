var videoObj = null;
var playlist = false;
var tabRegistered = false;
var videoState = '';
var videoImage = '';
var videoTitle = '';
var videoShareUrl = '';
var isTabInfoUpdated = true;

function loadTabInfo(){
	if (document.getElementsByTagName('video').length > 0) {
		videoObj = document.getElementsByTagName('video')[0];

		videoObj.addEventListener('pause', function() { chrome.runtime.sendMessage({playerStateChange: true, state: 'paused'}, function(response){}); });
		videoObj.addEventListener('play', function() { chrome.runtime.sendMessage({playerStateChange: true, state: 'playing'}, function(response){}); });
		videoObj.addEventListener('ended', function() { chrome.runtime.sendMessage({playerStateChange: true, state: 'ended'}, function(response){}); });
	}

	if (document.getElementById('playlist').innerHTML.replace(/\s*/g, '').length > 0) {
		playlist = true;
	}

	isTabInfoUpdated = true;
	try {
		videoState = (videoObj.paused) ? 'paused' : 'playing';
	} catch (err) {
		isTabInfoUpdated = false;
		videoState = 'paused';
	}
	videoImage = 'http://img.youtube.com/vi/' + location.search.match(/v\=([^\&]*)/)[1] + '/0.jpg';
	try {
		videoTitle = document.getElementById('watch-headline-title').innerText;
	} catch (err) {
		isTabInfoUpdated = false;
		videoTitle = 'Unknown';
	}
	videoShareUrl = 'http://youtu.be/' + location.search.match(/v\=([^\&]*)/)[1];
}

function initTab() {
	loadTabInfo();
	chrome.runtime.sendMessage({registerTab: true, state: videoState, image: videoImage, title: videoTitle, isPlaylist: playlist, share_url: videoShareUrl}, function(response){});
	tabRegistered = true;
}

function updateTabInfo() {
	if (!isTabInfoUpdated) {
		loadTabInfo();
	} else {
		chrome.runtime.sendMessage({updateTabInfo: true, state: videoState, image: videoImage, title: videoTitle, isPlaylist: playlist, share_url: videoShareUrl}, function(response){});
		document.removeEventListener('DOMSubtreeModified', domModified);
	}
}

function domModified() {
	setTimeout(function() {
		updateTabInfo();
	}, 300);
}

if (document.readyState == 'complete') {
	initTab();
} else {
	window.addEventListener('load', function(){
		initTab();
	});
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
	if(typeof msg.cmd != 'undefined' && (videoObj != null || playlist)) {
		switch (msg.cmd) {
			case 'play':
				videoObj.play();
				break;
			case 'pause':
				videoObj.pause();
				break;
			case 'volumeup':
				videoObj.volume += 0.1;
				break;
			case 'volumedown':
				videoObj.volume -= 0.1;
				break;
			case 'playlistnext':
				if (playlist) {document.getElementById('watch7-playlist-bar-next-button').click();}
				break;
			case 'playlistprev':
				if (playlist) {document.getElementById('watch7-playlist-bar-prev-button').click();}
				break
		}
		sendResponse({});
	} else if (msg.getDashboardInfo) {
		var info = {};
		info['title'] = document.getElementById('watch-headline-title').innerText;
		info['image'] = 'http://img.youtube.com/vi/' + location.search.match(/v\=([^\&]*)/)[1] + '/0.jpg';
		info['tabId'] = msg.tabId;
		info['state'] = msg.state;
		sendResponse(info);
	} else if (msg.updateTabInfo) {
		isTabInfoUpdated = false;
		document.addEventListener('DOMSubtreeModified', domModified);
	}
});
