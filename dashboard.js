if (document.getElementById('youtubecontrolsOverlay') != null) {
	document.getElementById('youtubecontrolsOverlay').remove();
}

var ytcOverlay = document.createElement('div');
var ytcDashboardItemList = document.createElement('ul');

ytcOverlay.id = 'youtubecontrolsOverlay';

ytcDashboardItemList.id = 'youtubecontrolsDashboardItemList';

ytcOverlay.appendChild(ytcDashboardItemList);

document.body.appendChild(ytcOverlay);