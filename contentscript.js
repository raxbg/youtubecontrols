var videoObj = null;
var playlist = false;

if (document.getElementsByTagName('video').length > 0) {
	videoObj = document.getElementsByTagName('video')[0];
	
	if (document.getElementById('playlist').innerHTML.replace(/\s*/g, '').length > 0) {
		playlist = true;
	}

	videoObj.addEventListener('pause', function() { chrome.runtime.sendMessage({playerStateChange: true, state: 'paused'}, function(response){}); });
	videoObj.addEventListener('play', function() { chrome.runtime.sendMessage({playerStateChange: true, state: 'playing'}, function(response){}); });
	videoObj.addEventListener('ended', function() { chrome.runtime.sendMessage({playerStateChange: true, state: 'ended'}, function(response){}); });

	chrome.runtime.sendMessage({registerTab: true, state: 'paused'}, function(response){});

	chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
		if(typeof msg.cmd != 'undefined' && videoObj != null) {
			eval(msg.cmd);
		}

		sendResponse();
	});
}