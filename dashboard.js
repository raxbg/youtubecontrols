if (document.getElementById('youtubecontrolsOverlay') != null) {
	document.getElementById('youtubecontrolsOverlay').remove();
}

var overlay = document.createElement('div');
var popupBox = document.createElement('div');
var popupItemList = document.createElement('ul');

overlay.id = 'youtubecontrolsOverlay';

popupBox.id = 'youtubecontrolsPopupBox';

popupItemList.id = 'popupItemList';

overlay.appendChild(popupBox);
popupBox.appendChild(popupItemList);

document.body.appendChild(overlay);