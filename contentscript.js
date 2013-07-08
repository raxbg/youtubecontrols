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
		eval(msg.cmd);
	}

	sendResponse();
});

window.addEventListener('message', function(e){
	console.log('click');
});