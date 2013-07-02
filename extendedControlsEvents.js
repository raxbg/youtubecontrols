document.addEventListener('keyup', function(e){
	if (e.keyCode == 27) {
		document.getElementById('youtubecontrolsOverlay').remove();
	}
});

document.body.addEventListener('click', function(e){
	if (e.target == document.getElementById('youtubecontrolsOverlay')) {
		document.getElementById('youtubecontrolsOverlay').remove();
	}
});