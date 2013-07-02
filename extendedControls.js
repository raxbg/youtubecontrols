if (document.getElementById('youtubecontrolsOverlay') != null) {
	document.getElementById('youtubecontrolsOverlay').remove();
}

var overlay = document.createElement('div');
var popupBox = document.createElement('div');

overlay.id = 'youtubecontrolsOverlay';

popupBox.id = 'youtubecontrolsPopupBox';

overlay.appendChild(popupBox);

document.body.appendChild(overlay);