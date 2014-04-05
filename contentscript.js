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

function loadTabInfo(){
	if (document.getElementsByTagName('video').length > 0) {
		videoObj = document.getElementsByTagName('video')[0];

		videoObj.addEventListener('pause', function() { chrome.runtime.sendMessage({playerStateChange: true, state: 'paused'}, function(response){}); });
		videoObj.addEventListener('play', function() { chrome.runtime.sendMessage({playerStateChange: true, state: 'playing'}, function(response){}); });
		videoObj.addEventListener('ended', function() { chrome.runtime.sendMessage({playerStateChange: true, state: 'ended'}, function(response){}); });
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
	try {
		videoState = (videoObj.paused) ? 'paused' : 'playing';
	} catch (err) {
		isTabInfoUpdated = false;
		videoState = 'paused';
	}
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
	if(e.target.id == 'progress') {//video changed and the new one has finished loading
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
}

function updateTabInfo() {
	if (!isTabInfoUpdated) {
		loadTabInfo();
	} else {
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
				} catch(err) {
				}
				break;
			case 'pause':
				try {
					document.querySelector('div.ytp-button-pause').click();
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
