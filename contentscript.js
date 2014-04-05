var videoObj = null;
var playlist = false;
var tabRegistered = false;
var videoState = '';
var videoImage = '';
var videoTitle = '';
var videoShareUrl = '';
var videoDuration = 0;
var videoCurrentTime = 0;
var videoVolume = 0;
var isTabInfoUpdated = true;
var lastTimeupdate = 0;
var isPlayPauseBtnObserved = false;

function updateVideoState() {
	if (document.querySelector('div.ytp-button-pause')) {
		videoState = 'playing';
	} else if (document.querySelector('div.ytp-button-play')) {
		videoState = 'paused';
	} else if (document.querySelector('div.ytp-button-replay')) {
		videoState = 'ended';
	} else {
		isTabInfoUpdated = false;
		videoState = 'paused';
	}
}

function reportVideoState() {
	updateVideoState();
	chrome.runtime.sendMessage({playerStateChange: true, state: videoState}, function(response){});
}

function loadTabInfo(){
	if (document.getElementsByTagName('video').length > 0) {
		videoObj = document.getElementsByTagName('video')[0];

		videoObj.addEventListener('timeupdate', function(e) {
			if ((e.timeStamp - lastTimeupdate) >= 100) {
				videoDuration = parseInt(videoObj.duration);
				videoCurrentTime = parseInt(videoObj.currentTime);
				videoVolume = videoObj.volume;
				updateTabInfo();
				lastTimeupdate = e.timeStamp;
			}
		});
	}

	if (document.querySelector('a.next-playlist-list-item')) {
		playlist = true;
	}

	isTabInfoUpdated = true;
	updateVideoState();
	videoImage = '//img.youtube.com/vi/' + location.search.match(/v\=([^\&]*)/)[1] + '/0.jpg';
	try {
		videoTitle = document.getElementById('watch-headline-title').innerText;
	} catch (err) {
		isTabInfoUpdated = false;
		videoTitle = 'Unknown';
	}
	videoShareUrl = 'http://youtu.be/' + location.search.match(/v\=([^\&]*)/)[1];
	try {
		videoDuration = parseInt(videoObj.duration);
		videoCurrentTime = parseInt(videoObj.currentTime);
		videoVolume = videoObj.volume;
	} catch(err) {
		videoDuration = 0;
		videoCurrentTime = 0;
		videoVolume = 0;
	}
}

document.addEventListener('DOMNodeRemoved', function(e) {
	if(e.target.id == 'progress') {//some page finished loading
		initTab();
	}
});

function initTab() {
	loadTabInfo();
	chrome.runtime.sendMessage({
		registerTab: true,
		state: videoState,
		image: videoImage,
		title: videoTitle,
		isPlaylist: playlist,
		share_url: videoShareUrl,
		duration: videoDuration,
		currentTime: videoCurrentTime,
		volume: videoVolume
	}, function(response){});
	tabRegistered = true;
	observePlayPauseBtn();
}

function updateTabInfo() {
	if (!isTabInfoUpdated) {
		loadTabInfo();
	} else {
		updateVideoState();
		chrome.runtime.sendMessage({
			updateTabInfo: true,
			state: videoState,
			image: videoImage,
			title: videoTitle,
			isPlaylist: playlist,
			share_url: videoShareUrl,
			duration: videoDuration,
			currentTime: videoCurrentTime,
			volume: videoVolume
		}, function(response){});
		document.removeEventListener('DOMSubtreeModified', domModified);
	}
}

function domModified() {
	setTimeout(function() {
		updateTabInfo();
	}, 300);
}

function observePlayPauseBtn() {
	//Apparantly we cannot rely on the player's state change events, so we will use this ugly hack
	if (!isPlayPauseBtnObserved) {
		var target = document.querySelector('div.ytp-button-play,div.ytp-button-replay,div.ytp-button-pause');
		if (target) {
			var stateChangeObserver = new window.MutationObserver(function(mutation) {
				for (x in mutation) {
					if (mutation[x].attributeName == 'class') {
						reportVideoState();
						break;
					}
				}
			});
			stateChangeObserver.observe(target, {attributes: true});
			isPlayPauseBtnObserved = true;
		}
	} else {
		isPlayPauseBtnObserved = false;
	}
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
				try {
					document.querySelector('div.ytp-button-play,div.ytp-button-replay').click();
					updateVideoState();
				} catch(err) {
				}
				break;
			case 'pause':
				try {
					document.querySelector('div.ytp-button-pause').click();
					updateVideoState();
				} catch(err) {
				}
				break;
			case 'volumeup':
				try {
					videoObj.volume += 0.1;
				} catch(err) {
				}
				break;
			case 'volumedown':
				try {
					videoObj.volume -= 0.1;
				} catch(err) {
				}
				break;
			case 'playlistnext':
				if (playlist) {document.querySelector('a.next-playlist-list-item').click();}
				break;
			case 'playlistprev':
				if (playlist) {document.querySelector('a.prev-playlist-list-item').click();}
				break;
			case 'rewind':
				try {
					videoObj.currentTime = msg.toTime;
				} catch(err) {
				}
				break;
			case 'changeVolume':
				try {
					videoObj.volume = msg.toVolume;
				} catch(err) {
				}
				break;
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
