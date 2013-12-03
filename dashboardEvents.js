document.addEventListener('keyup', function(e){
	if (e.keyCode == 27 && typeof ytcDashboard != 'undefined') {
		ytcDashboard.close();
	}
});

document.body.addEventListener('click', function(e){
	if (e.target == ytcDashboard.getOverlay() || e.target == ytcDashboard.getCardDeck()) {
		ytcDashboard.close();
	} else {
		var action = e.target.getAttribute('data-action');
		if (action) {
			switch (action) {
				case 'playlistPrev':
					window.postMessage({action:'prev', tabId: parseInt(e.target.getAttribute('data-tabId'))}, "*");
				   	break;
				case 'pause':
					window.postMessage({action:'pause', tabId: parseInt(e.target.getAttribute('data-tabId'))}, "*");
					break;
				case 'play':
					window.postMessage({action:'play', tabId: parseInt(e.target.getAttribute('data-tabId'))}, "*");
					break;
				case 'playlistNext':
					window.postMessage({action:'next', tabId: parseInt(e.target.getAttribute('data-tabId'))}, "*");
					break;
				case 'focusTab':
					window.postMessage({action:'focus', tabId: parseInt(e.target.getAttribute('data-tabId'))}, "*");
					break;
			}
		}
	}
});

function placeTabCard(tab){
	var ytTab = ytcDashboard.getCardDeck().querySelector('li[data-tabid="'+tab.id+'"]');
	if (ytTab) {
		updateTabCard(tab, ytTab);
	} else {
		ytTab = document.createElement('li');
		ytTab.setAttribute('data-tabid', tab.id);
		ytTab.classList.add('shrinked');
		ytTab.innerHTML = '<span class="row ytcDashboardItemHeader" style="background: url(\'' + tab.image + '\')"><h3 class="ytcDashboardItemTitle">' + tab.title + '</h3></span>';
		ytTab.innerHTML += '<span class="row"><ul class="ytcControls"><li class="ytcPlaylistPrev" ><a data-tabid="' + tab.id + '" data-action="playlistPrev"></a></li><li class="ytcPause"><a data-tabid="' + tab.id+ '" data-action="pause"></a></li><li class="ytcPlay"><a data-tabid="' + tab.id + '" data-action="play"></a></li><li class="ytcPlaylistNext"><a data-tabid="' + tab.id + '" data-action="playlistNext"></a></li></ul></span>';
		ytTab.innerHTML += '<span class="row rowShareUrl">'+tab.share_url+'</span>';
		ytTab.innerHTML += '<span class="row"><a class="ytcDashboardItemFocusTabBtn" data-tabid="' + tab.id + '" data-action="focusTab"></a></span>';
		if (tab.controls) {

		}

		ytcDashboard.getCardDeck().appendChild(ytTab);
		ytcDashboard.addTabId(tab.id);
		if (tab.state == 'playing') {
			ytTab.getElementsByClassName('ytcPause')[0].style.display = 'inline-block';
			ytTab.getElementsByClassName('ytcPlay')[0].style.display = 'none';
		}
		setTimeout(function(){
			ytTab.classList.remove('shrinked');
		}, 300);
	}
}

function populateDashboardDeck(tabs) {
}

function updateDashboardDeck(tabs) {
	var currentTabList = [];
	var tabIndex = -1;
	var tab = null;

	for (x in tabs) {
		tab = JSON.parse(tabs[x]);
		placeTabCard(tab);
		currentTabList.push(tab.id);
	}

	var allTabIds = ytcDashboard.getTabIds();
	var closedTabs = allTabIds.filter(function(a){
		return (currentTabList.indexOf(a) == -1);
	});

	var tabCard = null;
	for (x in closedTabs) {
		tabCard = ytcDashboard.getCardDeck().querySelector('li[data-tabid="'+closedTabs[x]+'"]');
		if (tabCard) {
			(function(){
				tabCard.classList.add('shrinked');
				setTimeout(function(){
					tabCard.remove();
				}, 300);
			})();
		}
		ytcDashboard.removeTabId(closedTabs[x]);
	}
}

function updateTabCard(tab){
	var card = (typeof arguments[1] != 'undefined') ? arguments[1] : ytcDashboard.getCardDeck().querySelector('li[data-tabid="'+tab.id+'"]');
	card.querySelector('span.ytcDashboardItemHeader').style.background = 'url(\''+tab.image+'\')';
	card.querySelector('h3.ytcDashboardItemTitle').innerHTML = tab.title;
	card.querySelector('span.rowShareUrl').innerHTML = tab.share_url;
	if (tab.state == 'playing') {
		card.getElementsByClassName('ytcPause')[0].style.display = 'inline-block';
		card.getElementsByClassName('ytcPlay')[0].style.display = 'none';
	} else {
		card.getElementsByClassName('ytcPause')[0].style.display = 'none';
		card.getElementsByClassName('ytcPlay')[0].style.display = 'inline-block';
	}
}
