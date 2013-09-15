document.addEventListener('keyup', function(e){
	if (e.keyCode == 27) {
		document.getElementById('youtubecontrolsOverlay').remove();
	}
});

document.body.addEventListener('click', function(e){
	if (e.target.id == 'youtubecontrolsOverlay' || e.target.id == 'youtubecontrolsDashboardItemList') {
		document.getElementById('youtubecontrolsOverlay').remove();
	} else if (e.target.className.search('ytcDashboardItemFocusTabBtn') > -1) {
		window.postMessage({action:'focus', tabId: parseInt(e.target.getAttribute('data-tabId'))}, "*");
	} else if (e.target.className == '') {
		var parent = e.target.parentNode;
		if (parent.className.search('ytcPlaylistPrev') > -1) {
			window.postMessage({action:'prev', tabId: parseInt(e.target.getAttribute('data-tabId'))}, "*");
		} else if (parent.className.search('ytcPause') > -1) {
			window.postMessage({action:'pause', tabId: parseInt(e.target.getAttribute('data-tabId'))}, "*");
		} else if (parent.className.search('ytcPlay') > -1) {
			window.postMessage({action:'play', tabId: parseInt(e.target.getAttribute('data-tabId'))}, "*");
		} else if (parent.className.search('ytcPlaylistNext') > -1) {
			window.postMessage({action:'next', tabId: parseInt(e.target.getAttribute('data-tabId'))}, "*");
		}
	}
});

function addPopupItem(item){
	item = JSON.parse(item);
	
	var ytTab = document.createElement('li');
	ytTab.setAttribute('data-tabid', item.tabId);
	ytTab.innerHTML = '<span class="ytcDashboardItemHeader" style="background: url(\'' + item.image + '\')"><h3 class="ytcDashboardItemTitle">' + item.title + '</h3></span>';
	ytTab.innerHTML += '<ul class="ytcControls"><li class="ytcPlaylistPrev" ><a data-tabid="' + item.tabId + '"></a></li><li class="ytcPause"><a data-tabid="' + item.tabId + '"></a></li><li class="ytcPlay"><a data-tabid="' + item.tabId + '"></a></li><li class="ytcPlaylistNext"><a data-tabid="' + item.tabId + '"></a></li></ul>';
	ytTab.innerHTML += '<span><a class="ytcDashboardItemFocusTabBtn" data-tabid="' + item.tabId + '"></a></span>';
	if (item.controls) {
		
	}

	document.getElementById('youtubecontrolsDashboardItemList').appendChild(ytTab);
	if (item.state == 'playing') {
		ytTab.getElementsByClassName('ytcPause')[0].style.display = 'inline-block';
		ytTab.getElementsByClassName('ytcPlay')[0].style.display = 'none';
	}
}

function updatePopupItem(item, action){
	item = JSON.parse(item);

	switch(action) {
		case 'remove':
			document.querySelector('#youtubecontrolsDashboardItemList li[data-tabid="' + item.tabId + '"]');
			break;
	}
}