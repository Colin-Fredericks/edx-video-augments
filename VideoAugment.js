$(document).ready(function(){

	// Declaring semi-global variables for later use.
	var video = $('.video');
	var state = video.data('video-player-state');	// Sometimes this fails and that's ok.
	var time;
	var augmentCounter = 0;
	var augmentWidth = 120;
	var skipEmAll;
	var protectedTime = false;
	var problemsBeingShown = 0;
	var augmentTimer = [];
	
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
		augmentTimer[index].time = $(this).attr('data-time');
	});
	augmentTimer.sort();


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
				

		// Storing a separate augment counter for each video.
		// Create the counter if it doesn't exist.
		if(!localStorage[state.id + '-augment-counter']){
			localStorage[state.id + '-augment-counter'] = '0';
			localStorage[state.id + '-augment-skip'] = 'false';
			
			// If the counter didn't exist, we're on a new browser.
			// Clear the questions from before the current time.
			clearOlderPopUps(time);
		}
			
		// If we start at a later time, set the counter appropriately.
		setAugmentCounter(time);
		
		// Reset the counter properly if we seek.
		video.on('seek', function(event, ui) {
			setAugmentCounter(ui);
		});
		
		// If someone clicks on one of the augments, go to the appropriate time.
		$('.augment').on('click tap', function(event){
			var thisTime = $(this).attr('data-time')
			ISaidGoTo(thisTime);
		});

	}
	
	// Every 500 ms, check to see whether we're going to add a new augment.
	function mainLoop(){
		
		var timeChecker = setInterval(function(){
			
			state.videoPlayer.update();		// Forced update of time. Required for Safari.
			time = state.videoPlayer.currentTime;

			if(augmentCounter < augmentTimer.length){
			
				if(time > augmentTimer[augmentCounter].time){
				
					if(!skipEmAll && !protectedTime){
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
		console.log('sought to time ' + soughtTime);
		updateAugmentCounter(0);  // Resetting fresh.
		for(var i = 0; i < augmentTimer.length; i++){
			if(soughtTime > augmentTimer[i].time){
				updateAugmentCounter(i+1);
				console.log('new augment counter: ' + augmentCounter);
			}else{
				break;
			}
		}
		showAugment(augmentTimer[augmentCounter].time, state);
	}
	
	// Move to the current augment and highlight it.
	function showAugment(augTime, state){
		var current = $('[data-time="'+augTime+'"]');
		var tray = $('#augmenttray');
		var location = current.offset().left - tray.offset().left;
		
		var idnum = current.attr('id').replace('augment', '');
		var newlocation = augmentWidth * idnum;
		
		tray.animate({scrollLeft: newlocation}, 500);
		$('.augment').addClass('greyout');
		current.removeClass('greyout');
		
		console.log('scrolled to ' + newlocation);
	}
	
	// Keep the counter and the local storage in sync.
	function updateAugmentCounter(number){
		augmentCounter = number;
		localStorage[state.id + '-augment-counter'] = number.toString();
		console.log('counter set to ' + augmentCounter);
	}

	// I blame multiple Javascript timing issues.
	function ISaidGoTo(thisTime){
		time = Math.max(+thisTime - 1, 0);  // Using + to cast as number.
		state.videoPlayer.seekTo(time);
		setAugmentCounter(time)
		console.log('I said go to ' + time);
	}
});