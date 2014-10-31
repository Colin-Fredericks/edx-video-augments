$(document).ready(function(){

	// Declaring semi-global variables for later use.
	var video = $('.video');
	var state = video.data('video-player-state');	// Sometimes this fails and that's ok.
	var time;
	var augmentCounter = 0;
	var augmentWidth = 60;
	var skipEmAll = false;
	var problemsBeingShown = 0;
	var augmentTimer = [];
	var overkill = false;
	
	// Note that global variable AugmentOptions is defined on the HTML page.
	// Set default options here.
	if (typeof AugmentOptions == 'undefined'){
		var AugmentOptions = {
			'effect': 'fade',
			'hide': {'direction':'left'},
			'show': {'direction':'right'},
			'speed': 500
		}
	}
	
	console.log('working');
	
	var preferredLocation = $('.wrapper-downloads')
	
	preferredLocation.before('<div id="augmenttray"></div>');
	preferredLocation.before('<div id="augmenttext"></div>');

	// Put all the augments in the tray and make a timer for them.
	$('#augments').children().each(function(index){
	
		var currentAugment = $(this);
		var augmentTitle = currentAugment.find('.title');
		var augmentTime = currentAugment.attr('data-time');
		
		// This is sort of over-logging. Left in for debug.
		// Logger.log('harvardx.video_augments', {'display_augment': augmentTitle.text(),'time': augmentTime});
		// console.log('displaying augment: ' + augmentTitle.text() + ' at time ' + augmentTime);
		
		// Get the icon for the augment so I can use it in the tray.
		var augmentIcon = currentAugment.find('.augmenticon');
		// Give it an alt tag
		augmentIcon.attr('alt', 'Icon: ' + augmentTitle.text() + ', ' + augmentTime + ' seconds');
		// Put it in place
		$('#augmenttray').append(augmentIcon);
		// Put a div around it for styling purposes
		augmentIcon.wrap('<div class="augmenttab" '
			+ 'id="augment' 
			+ index 
			+ '" data-time="' 
			+ augmentTime 
			+ '"></div>');
		// Wrap a link around the image so screen readers can click it
		augmentIcon.wrap('<a href="" class="augmentlink"></a>');
		// Give it a title
		augmentIcon.parent().attr('title', augmentTitle.text() + ', ' + augmentTime + ' seconds');
		
		// Move the augment itself to the tray.
		$('#augmenttext').append(currentAugment);
		
		// Prep the augment for use:
		// Give it the augment class.
		currentAugment.addClass('augment');
		// Give it a unique ID
		currentAugment.attr('id', 'augmentdetail'+index);
		
		// Build the augment timer from the divs in the page.
		augmentTimer[index] = {};
		augmentTimer[index].time = Number($(this).attr('data-time'));
	});
	
	// Hide all the detail text until it's relevant.
	$('.augment').hide();
	
	
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
		
		// If someone clicks on one of the augment tabs, go to the appropriate time.
		$('.augmentlink').on('click tap', function(event){
			event.preventDefault();
			var thisTime = $(this).parent().attr('data-time');
			console.log(this);
			setAugmentCounter(thisTime);
			showAugment(thisTime, state);
			ISaidGoTo(thisTime);
		});

		// If the first augment has zero or negative time, make it visible right away.
		var firstTime = $('#augmentdetail0').attr('data-time')
		if(firstTime <= 0){
			showAugment(firstTime, state);
		}

		// Add listener for pop-up links.
		$('.popup').on('click tap', function(event){
			event.preventDefault();
			var linkTitle = $(this).attr('href');
			if(!state.videoPlayer.isPlaying()){
				overkill = true;  // Don't restart the video if it was paused.
			}
			popUpProblem(linkTitle, state);
		});

		// Add listener for outside links that should pause the video
		$('.pausevideo').on('click tap', function(event){
			console.log(event);
			state.videoPlayer.pause();
		});
		
		/*******************************************
		* NOTE
		* The jQuery on('focus', function) exists.
		* I should use that for when people are going through the augments via screen reader.
		*******************************************/
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
		
		/*******************************************
		* Can I have a nice small sound play when a video augment shows up?
		* /static/91926__corsica-s__ding.wav is uploaded. Use that for now.
		* reference: https://www.freesound.org/people/Corsica_S/sounds/91926/
		* http://www.w3schools.com/tags/tag_audio.asp
		* Alternatively: aria-live attributes:
		*  A value of polite will notify the user of the content change as soon as he/she is done with the current task. This might take the form of a beep or an audio indication of the update. The user can then choose to directly jump to the updated content. This value would be the most common for content updates, especially for things like status notification, weather or stock updates, chat messages, etc.
		*  An aria-live value of assertive will result in the user being alerted to the content change immediately or as soon as possible. Assertive would be used for important updates, such as error messages
		*******************************************/
		
		console.log('showAugment at time ' + augTime);
		
		// First move the icon bar to the right location.
		
		var currentIcon = $('[data-time="'+augTime+'"]');
		var tray = $('#augmenttray');
		var idnum = currentIcon.attr('id').replace('augment', '');
		var newlocation = Math.max(augmentWidth * idnum - 10, 0); // Subtracting 10 to show a little to the left.

		console.log('idnum: ' + idnum + ' newlocation: ' + newlocation);
		
		tray.animate({scrollLeft: newlocation}, 700);
		$('.augmenttab').addClass('greyout');
		currentIcon.removeClass('greyout');
		console.log('scrolled to ' + newlocation);
		
		// Next, replace the text below it.
		// Get the new text, hide the old one, and show the new one.
		var currentAugment = $('.augment:visible');
		currentAugment.hide(AugmentOptions.effect, AugmentOptions.hide, AugmentOptions.speed);
		
		setTimeout(function(){
			var newTextBlock = $('#augmentdetail' + idnum);
			newTextBlock.show(AugmentOptions.effect, AugmentOptions.show, AugmentOptions.speed);
			// Pause if it says to pause.
			if(newTextBlock.attr('data-pause')){ state.videoPlayer.pause(); }
		}, 500);
		
	}
	
	// Does the work of creating the dialogue.
	// It pulls a question from lower down in the page, and puts it back when we're done.
	function popUpProblem(title, state){
		
		// Find the div for the problem based on its title.
		augmentDiv = $('h2:contains(' + title + ')').parent().parent();

		var augmentID = $('h2:contains(' + title + ')').parent().attr('id');
		
		Logger.log('harvardx.video_augments', {'display_problem': title, 'problem_id': augmentID,'time': time});
		console.log('displaying item: ' + title + ' ' + augmentID);
		
		// Make a modal dialog out of the chosen problem.
		augmentDiv.dialog({
			modal: true,
			dialogClass: "no-close",
			resizable: true,
			width: 800,
			show: { 
				effect: 'fade', 
				duration: 200 
			},
			buttons: {
				'Skip': function() {
					dialogDestroyer('skip_problem');
					$( this ).dialog( 'destroy' );  // Put the problem back when we're done.
				},
				'Done': function() {
					dialogDestroyer('mark_done');
					$( this ).dialog( 'destroy' );  // Put the problem back when we're done.
				},
			},
			open: function() {
				// Highlight various controls.
				$('span.ui-button-text:contains("Done")').addClass('answeredButton');
				$('input.check.Check').attr('style', '	background: linear-gradient(to top, #9df 0%,#7bd 20%,#adf 100%); background-color:#ACF;	text-shadow: none;');
				state.videoPlayer.pause();
			},
			close: function(){ 
				if(!overkill){
					state.videoPlayer.play(); 
					overkill = false;
				}
				Logger.log('harvardx.video_augments', {'unusual_event': 'dialog_closed_unmarked'});
				console.log('dialog closed');  // Should be pretty rare. I took out the 'close' button.
			}
		});
	}


	// Log the destruction of the dialog and play the video if there are no more dialogs up.
	function dialogDestroyer(message){
		Logger.log('harvardx.video_augments', {'control_event': message});
		console.log(message);
		$('input.check.Check').removeAttr('style');  // un-blue the check button.
		if(!overkill){
			state.videoPlayer.play(); 
			overkill = false;
		}
	}
	

	// I blame multiple Javascript timing issues.
	function ISaidGoTo(thisTime){
		console.log('I said go to ' + thisTime);
		overkill = true; // We're about to seek. Don't trigger our seek listener twice.
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