var videoObj = null;
var playlist = false;
var tabRegistered = false;

if (document.getElementsByTagName('video').length > 0) {
	videoObj = document.getElementsByTagName('video')[0];

	videoObj.addEventListener('pause', function() { chrome.runtime.sendMessage({playerStateChange: true, state: 'paused'}, function(response){}); });
	videoObj.addEventListener('play', function() { chrome.runtime.sendMessage({playerStateChange: true, state: 'playing'}, function(response){}); });
	videoObj.addEventListener('ended', function() { chrome.runtime.sendMessage({playerStateChange: true, state: 'ended'}, function(response){}); });

	chrome.runtime.sendMessage({registerTab: true, state: 'paused'}, function(response){});
	tabRegistered = true;
}

if (document.getElementById('playlist').innerHTML.replace(/\s*/g, '').length > 0) {
	playlist = true;

	if (!tabRegistered) {
		chrome.runtime.sendMessage({playerStateChange: true, state: 'playing'}, function(response){});
	}
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
	}

	sendResponse();
});