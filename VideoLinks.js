$(document).ready(function(){

	// Declaring semi-global variables for later use.
	var video = $('.video');
	var state = video.data('video-player-state');	// Sometimes this fails and that's ok.
	var time;
	var linkCounter = 0;
	var linkTimer = [];
	var linkBeingShown = false;
	var hideLinkAfter = 5;  // Seconds
	
	var linkOptions = {
		'effect': 'slide',
		'hide': {'direction':'down'},
		'show': {'direction':'down'},
		'speed': 500
	}
	
	console.log('working');
	
	// We also need to make sure we can position things on the video.
	// Let's base it off the position of the controls.
	var vidlinks = $('#vidlinks-static').clone().prop('id', 'vidlinks-live')
	vidlinks.appendTo('.video-controls');
	$('.video-controls').addClass('link-positioner');
	
	
	// Each link needs a little bit added to it, so we can simplify the author view.
	// First, prep the links that we're going to display on the video.
	$('#vidlinks-live').children().each(function(index){
		
		thisLinkBox = $(this);
		thisLink = $(this).find('a');
		
		// Give the link a class and a unique ID
		thisLinkBox.addClass('vidlink');
		thisLinkBox.attr('id','linkdetail' + index);
		
		// Give the images a class for styling purporses.
		thisLink.find('img').addClass('vidlinkicon');
	
		// Make all the links open in new pages.
		thisLink.attr('target', '_blank');
		// Style all the links
		thisLink.addClass('linktext-live');
		
		// Build the link timer from the divs.
		linkTimer[index] = {};
		linkTimer[index].time = hmsToTime(thisLinkBox.attr('data-time'));
		linkTimer[index].shown = false;
	});
	
	// Now, prep the ones that go in as text
	$('#vidlinks-static').children().each(function(index){
		
		thisLinkBox = $(this);
		thisLink = $(this).find('a');
		
		// Give the link a class and a unique ID
		thisLinkBox.addClass('vidlink-static');
		thisLinkBox.attr('id','linkdetailstatic' + index);
		
		// Remove the images.
		thisLink.find('img').remove();
		
	});
	
	// Finish making the unordered list.
	$('.vidlink-static').wrapAll('<ul></ul>');
	
	
	// If they click on one of the live links, pause the video.
	$('.linktext-live').on('click tap', function(){
		state.videoPlayer.pause();
	});
	
	linkTimer.sort(timeCompare);	// Uses a custom function to sort by time.
									// I could have just done an array of times, but this will be more flexible later.
	console.log(linkTimer);
	

	// Check to see whether the video is ready before continuing.
	var waitForVid = setInterval(function(){

		state = video.data('video-player-state');	// Sometimes this fails and that's ok.

		if (state.videoPlayer.isCued()){
			console.log('video data loaded');
			clearInterval(waitForVid);
			var pause = setTimeout(function(){
				console.log('done waiting');
				setUpData();
				mainLoop();
			}, 0);
			

		}
	}, 100);
	

	// Checks local storage and gets data from the video.
	// Also sets up a few listeners.
	function setUpData(){
	
		console.log('setting up data');
	
		// Get the video data.
		video =  $('.video');
		state = video.data('video-player-state');
		time = state.videoPlayer.currentTime;
				
		// If the first link has zero or negative time, make it visible right away.
		var firstTime = $('#linkdetail0').attr('data-time')
		if(firstTime <= 0){
			showLink(0);
		}

	}
	
	// Every 500 ms, check to see whether we're going to show a new link.
	function mainLoop(){
		
		var timeChecker = setInterval(function(){
			
			state.videoPlayer.update();		// Forced update of time. Required for Safari.
			time = state.videoPlayer.currentTime;
			
			// If we should be showing a link:
			if(currentLink(time) != -1){

				// ...and there's something being shown,
				if(linkBeingShown){
				
					// but it's not the one that should be shown,
					if(currentLink(time) != currentLinkShown()){
				
						// then hide it.
						hideLink(currentLinkShown());
					
					}
				}
				
				// ...and there's nothing being shown,
				else{
			
					// then show the one we should be showing.
					showLink(currentLink(time));
					
				}
			
			// If we should NOT be showing a link,
			}else{
				// ...and one is showing, hide it.
				if(currentLinkShown() != -1){
					hideLink(currentLinkShown());
				}
			}
						
		}, 500);
	
	}
	
	// Show the link on the video. While we're at it, bold the one in the list too.
	function showLink(n){
		console.log('showing link ' + n);
		$('#linkdetail' + n ).show(linkOptions.effect, linkOptions.show, linkOptions.speed);
		$('#linkdetailstatic' + n ).children().addClass('boldlink');
		linkTimer[n].shown = true;
		linkBeingShown = true;
	}
	
	// Hide the link on the video and un-bold the one on the list.
	function hideLink(n){
		console.log('hiding link ' + n);
		$('#linkdetail' + n ).hide(linkOptions.effect, linkOptions.show, linkOptions.speed);
		$('#linkdetailstatic' + n ).children().removeClass('boldlink');
		linkTimer[n].shown = false;
		linkBeingShown = false;
	}
	
	
	// Which link should we be showing right now? Return -1 if none.
	function currentLink(t){
		
		var linkNumber = -1;
		
		for(var i=0; i < linkTimer.length; i++){
			if(t >= linkTimer[i].time && t < (linkTimer[i].time + hideLinkAfter)){
				linkNumber = i;
				break;
			}
		}
		return linkNumber;
	}


	// Which link are we actually showing right now? Return -1 if none.
	function currentLinkShown(){
		
		var linkNumber = -1;
		
		for(var i=0; i < linkTimer.length; i++){
			if(linkTimer[i].shown){
				linkNumber = i;
				break;
			}
		}
		return linkNumber;
	}


	// This is a sorting function for my timer.
	function timeCompare(a,b){
		if (a.time < b.time)
			return -1;
		if (a.time > b.time)
			return 1;
		return 0;
	}

	// Converts hh:mm:ss to a number of seconds for time-based problems
	function hmsToTime(hms){

		hms = hms.toString();

		var hmsArray = hms.split(':');
		var time = 0;
	
		if(hmsArray.length == 3){
			time = 3600*parseInt(hmsArray[0]) + 60*parseInt(hmsArray[1]) + Number(hmsArray[2]);
		}
		else if(hmsArray.length == 2){
			time = 60*parseInt(hmsArray[0]) + Number(hmsArray[1]);
		}
	
		else if(hmsArray.length == 1){
			time = Number(hmsArray[0]);
		}
	
		return time;
	}

});