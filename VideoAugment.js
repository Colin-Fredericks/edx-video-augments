$(document).ready(function(){

	// Declaring semi-global variables for later use.
	var video = $('.video');
	var state = video.data('video-player-state');	// Sometimes this fails and that's ok.
	var time;
	var augmentCounter = 0;
	var augmentWidth = 120;
	var skipEmAll = false;
	var problemsBeingShown = 0;
	var augmentTimer = [];
	var overkill = false;
	
	console.log('working');

	// Put all the augments in the tray and make a timer for them.
	$('#augments').children().each(function(index){
	
		var currentAugment = $(this);
	
		// Get the title for logging purposes
		var augmentTitle = currentAugment.find('.title');
		var augmentTime = currentAugment.attr('data-time');
		
		Logger.log('harvardx.video_augments', {'display_augment': augmentTitle.text(),'time': augmentTime});
		console.log('displaying augment: ' + augmentTitle.text() + ' at time ' + augmentTime);
		
		// Move the augment to the tray.
		currentAugment.detach;
		$('#augmenttray').append($(this));
		
		// Prep the augment for use:
		// Give it the augment class.
		currentAugment.addClass('augment');
		// Give it a unique ID
		currentAugment.attr('id', 'augment'+index);
		// If there's an image, set the title text over it.
		currentAugment.find('img').addClass('overlapOK');
		// Should perhaps add a little magnifying glass icon for zoom-in, 
		// but it's better to wait and figure out UI stuff first.
		

		// Build the augment timer from the divs in the page.
		augmentTimer[index] = {};
		augmentTimer[index].time = Number($(this).attr('data-time'));
	});
	
	augmentTimer.sort(timeCompare); // Uses a custom function to sort by time.
									// I could have just done an array of times, but this will be more flexible later.
	console.log(augmentTimer);
	


	// Log play/pause events from the player.
	video.on('pause', function () {
		Logger.log("harvardx.video_augments", {"video_event": "pause"});
		console.log('pause');
	});

	video.on('play', function () {
		Logger.log("harvardx.video_augments", {"video_event": "play"});
		console.log('play');
	});


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
				
		// If we start at a later time, set the counter appropriately.
		setAugmentCounter(time);
		
		// Reset the counter properly if we seek.
		// Don't double-count for our own ISaidGoTo function.
		video.on('seek', function(event, ui) {
			if(!overkill){
				setAugmentCounter(ui);
			}else{
				overkill = false;
			}
		});
		
		// If someone clicks on one of the augments, go to the appropriate time.
		$('.augment').on('click tap', function(event){
			var thisTime = $(this).attr('data-time')
			console.log(this);
			setAugmentCounter(thisTime);
			showAugment(thisTime, state);
			ISaidGoTo(thisTime);
		});

	}
	
	// Every 500 ms, check to see whether we're going to add a new augment.
	function mainLoop(){
		
		var timeChecker = setInterval(function(){
			
			state.videoPlayer.update();		// Forced update of time. Required for Safari.
			time = state.videoPlayer.currentTime;
			
			// Don't run off the end of the counter.
			if(augmentCounter < augmentTimer.length){
				
				// If we pass a new augment, display it and update the counter.
				if(time > augmentTimer[augmentCounter].time){
				
					if(!skipEmAll){
						console.log('passed an augment, number ' + augmentCounter);
						showAugment(augmentTimer[augmentCounter].time, state);
						updateAugmentCounter(augmentCounter+1);
					}else{
						// We're still incrementing and tracking even if we skip items.
						updateAugmentCounter(augmentCounter+1);
					}
				}
			}
		}, 500);
	
	}

	// This resets the augment counter to match the time.
	function setAugmentCounter(soughtTime){
		Logger.log('harvardx.video_embedded_problems', {'control_event': 'seek_to_' + soughtTime});
		console.log('setAugmentCounter for time ' + soughtTime);
		
		// Count up the augment timer until we're above the sought time.
		for(var i = 0; i < augmentTimer.length; i++){
			if(augmentTimer[i].time > soughtTime){
				updateAugmentCounter(i);
				break;
			}
		}
		
		console.log('Augment counter is now ' + augmentCounter);
	}
	
	// This will have more in it if we go back to using local storage
	function updateAugmentCounter(number){
		augmentCounter = number;
		console.log('updateAugmentCounter: ' + augmentCounter);
	}

	// Move to the current augment and highlight it.
	function showAugment(augTime, state){
		
		console.log('showAugment at time ' + augTime);
	
		var current = $('[data-time="'+augTime+'"]');
		var tray = $('#augmenttray');
		var idnum = current.attr('id').replace('augment', '');
		var currentlocation = current.offset().left - tray.offset().left;
		var newlocation = augmentWidth * idnum;

		console.log('idnum: ' + idnum + ' newlocation: ' + newlocation);
		
		tray.animate({scrollLeft: newlocation}, 500);
		$('.augment').addClass('greyout');
		current.removeClass('greyout');
		
		console.log('scrolled to ' + newlocation);
	}
	
	// I blame multiple Javascript timing issues.
	function ISaidGoTo(thisTime){
		console.log('I said go to ' + thisTime);
		overkill = true;
		time = Math.max(+thisTime, 0);  // Using + to cast as number.
		state.videoPlayer.seekTo(time);
	}

	function timeCompare(a,b){
		if (a.time < b.time)
			return -1;
		if (a.time > b.time)
			return 1;
		return 0;
	}

});