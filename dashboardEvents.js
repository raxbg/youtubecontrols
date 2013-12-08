var inSelectMode = false;
var selectStartTime = 0;
var selectedCards = [];

document.addEventListener('keyup', function(e){
	if (e.keyCode == 27 && typeof ytcDashboard != 'undefined') {
		ytcDashboard.close();
	}
});

document.addEventListener('mousedown', function(e){
	if (!e.target.classList.contains('rowShareUrl')) {
		e.preventDefault();
		selectStartTime = e.timeStamp;
		inSelectMode = true;
	}
});

document.addEventListener('mouseup', function(e){
	if (inSelectMode) {
		inSelectMode = false;
		if ((e.timeStamp - selectStartTime) > 100 && selectedCards.length < 2) {
			clearSelectedTabCards();
		}
		selectStartTime = 0;
	}
});

document.addEventListener('mousemove', function(e){
	if (inSelectMode && (e.timeStamp - selectStartTime) > 100) {
		if (e.target.classList.contains('partOfTabCard')) {
			var tabId = e.target.getAttribute('data-tabId');
			if (selectedCards.indexOf(tabId) == -1) {
				selectedCards.push(tabId);
				markTabCardAsSelected(tabId);
			}
		}
	}
});

document.body.addEventListener('click', function(e){
	if (e.target == ytcDashboard.getOverlay() || e.target == ytcDashboard.getCardDeck()) {
		if (selectedCards.length) {
			clearSelectedTabCards();
		} else {
			ytcDashboard.close();
		}
	} else if(e.target == ytcDashboard.getCloseSelectedTabsBtn()){
		if (selectedCards.length) {
			for (x=0; x<selectedCards.length;x++) {
				window.postMessage({action:'close', tabId: parseInt(selectedCards[x])}, "*");
			}
		}
	} else {
		var action = e.target.getAttribute('data-action');
		var tabId = e.target.getAttribute('data-tabId');
		if (tabId && selectedCards.indexOf(tabId) != -1) {
			unmarkTabCardAsSelected(tabId);
		} else if (action) {
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
				case 'closeTab':
					window.postMessage({action:'close', tabId: parseInt(e.target.getAttribute('data-tabId'))}, "*");
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
		ytTab.classList.add('partOfTabCard');
		var contentHtml = '';
		contentHtml += '<a class="ytcDashboardItemCloseTabBtn" data-tabid="' + tab.id+ '" data-action="closeTab"></a>';
		contentHtml += '<span class="cardItemsRow ytcDashboardItemHeader partOfTabCard" data-tabid="' + tab.id+ '" style="background: url(\'' + tab.image + '\')"><h3 class="ytcDashboardItemTitle">' + tab.title + '</h3></span>';
		contentHtml += '<span class="cardItemsRow partOfTabCard" data-tabid="' + tab.id+ '"><ul class="ytcControls">';
		contentHtml += '<li class="ytcPlaylistPrev"><a class="partOfTabCard" data-tabid="' + tab.id + '" data-action="playlistPrev"></a></li>';
		contentHtml += '<li class="ytcPause"><a class="partOfTabCard" data-tabid="' + tab.id+ '" data-action="pause"></a></li>';
		contentHtml += '<li class="ytcPlay"><a class="partOfTabCard" data-tabid="' + tab.id + '" data-action="play"></a></li>';
		contentHtml += '<li class="ytcPlaylistNext"><a class="partOfTabCard" data-tabid="' + tab.id + '" data-action="playlistNext"></a></li></ul></span>';
		contentHtml += '<span class="cardItemsRow rowShareUrl partOfTabCard" data-tabid="' + tab.id+ '">'+tab.share_url+'</span>';
		contentHtml += '<span class="cardItemsRow"><a class="ytcDashboardItemFocusTabBtn" data-tabid="' + tab.id + '" data-action="focusTab"></a></span>';
		ytTab.innerHTML = contentHtml;
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

function getTabCard(tabId) {
	return ytcDashboard.getCardDeck().querySelector('li[data-tabid="'+tabId+'"]');
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

function markTabCardAsSelected(tabId) {
	var tabCard = getTabCard(tabId);
	if (!tabCard.querySelector('div.selectedOverlay')) {
		tabCard.innerHTML += '<div class="selectedOverlay" data-tabid="'+tabId+'"></div>';
	}
	toggleCloseSelectedTabsBtn();
}

function unmarkTabCardAsSelected(tabId) {
	var tabCard = getTabCard(tabId);
	var index = selectedCards.indexOf(tabId);
	if (index != -1) {
		selectedCards.splice(index, 1);
	}
	tabCard.querySelector('div.selectedOverlay').remove();
	toggleCloseSelectedTabsBtn();
}

function clearSelectedTabCards() {
	selectedCards = [];
	var selectionOverlays = ytcDashboard.getCardDeck().querySelectorAll('div.selectedOverlay');
	for (x=0; x<selectionOverlays.length; x++) {
		selectionOverlays[x].remove();
	}
	toggleCloseSelectedTabsBtn();
}

function toggleCloseSelectedTabsBtn() {
	if (selectedCards.length) {
		ytcDashboard.getCloseSelectedTabsBtn().style.display = 'block';
	} else {
		ytcDashboard.getCloseSelectedTabsBtn().style.display = 'none';
	}
}