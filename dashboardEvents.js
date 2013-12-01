document.addEventListener('keyup', function(e){
	if (e.keyCode == 27 && typeof ytcDashboard != 'undefined') {
		ytcDashboard.close();
	}
});

document.body.addEventListener('click', function(e){
	if (e.target == ytcDashboard.getOverlay() || e.target == ytcDashboard.getCardDeck()) {
		ytcDashboard.close();
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

function placeTabCard(tab){
	var ytTab = ytcDashboard.getCardDeck().querySelector('li[data-tabid="'+tab.id+'"]');
	if (ytTab) {
		updateTabCard(tab, ytTab);
	} else {
		ytTab = document.createElement('li');
		ytTab.setAttribute('data-tabid', tab.id);
		ytTab.innerHTML = '<span class="ytcDashboardItemHeader" style="background: url(\'' + tab.image + '\')"><h3 class="ytcDashboardItemTitle">' + tab.title + '</h3></span>';
		ytTab.innerHTML += '<ul class="ytcControls"><li class="ytcPlaylistPrev" ><a data-tabid="' + tab.id + '"></a></li><li class="ytcPause"><a data-tabid="' + tab.id+ '"></a></li><li class="ytcPlay"><a data-tabid="' + tab.id + '"></a></li><li class="ytcPlaylistNext"><a data-tabid="' + tab.id + '"></a></li></ul>';
		ytTab.innerHTML += '<span><a class="ytcDashboardItemFocusTabBtn" data-tabid="' + tab.id + '"></a></span>';
		if (tab.controls) {

		}

		ytcDashboard.getCardDeck().appendChild(ytTab);
		ytcDashboard.addTabId(tab.id);
		if (tab.state == 'playing') {
			ytTab.getElementsByClassName('ytcPause')[0].style.display = 'inline-block';
			ytTab.getElementsByClassName('ytcPlay')[0].style.display = 'none';
		}
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
			tabCard.remove();
		}
		ytcDashboard.removeTabId(closedTabs[x]);
	}
}

function updateTabCard(tab){
	var card = (typeof arguments[1] != 'undefined') ? arguments[1] : ytcDashboard.getCardDeck().querySelector('li[data-tabid="'+tab.id+'"]');
	card.querySelector('span.ytcDashboardItemHeader').style.background = 'url(\''+tab.image+'\')';
	card.querySelector('h3.ytcDashboardItemTitle').innerHTML = tab.title;
	if (tab.state == 'playing') {
		card.getElementsByClassName('ytcPause')[0].style.display = 'inline-block';
		card.getElementsByClassName('ytcPlay')[0].style.display = 'none';
	} else {
		card.getElementsByClassName('ytcPause')[0].style.display = 'none';
		card.getElementsByClassName('ytcPlay')[0].style.display = 'inline-block';
	}
}
