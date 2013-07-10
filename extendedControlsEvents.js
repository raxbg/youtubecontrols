document.addEventListener('keyup', function(e){
	if (e.keyCode == 27) {
		document.getElementById('youtubecontrolsOverlay').remove();
	}
});

document.body.addEventListener('click', function(e){
	if (e.target == document.getElementById('youtubecontrolsOverlay')) {
		document.getElementById('youtubecontrolsOverlay').remove();
	} else if (e.target == document.getElementById('youtubecontrolsPopupBox')) {
		window.postMessage({click:true}, "*");
	}
});

function addPopupItem(item){
	item = JSON.parse(item);
	
	var ytTab = document.createElement('li');
	ytTab.innerHTML = '<span><h3 class="ytControlsPopupItemTitle">' + item.title + '</h3>';
	if (item.controls) {
	}
	ytTab.innerHTML += '</span>'

	document.getElementById('popupItemList').appendChild(ytTab);
}