// Make sure we're only running once.
// The "if" bracket closes at end of file.
if(typeof VideoLinksIsRunning == 'undefined'){
	var VideoLinksIsRunning = true;


$(document).ready(function(){

	// Declaring semi-global variables for later use.
	var video = $('.video');
	var vidControls = $('.video-controls');
	var time;
	var linkTimer = [];
	var linkBeingShown = [];
	
	// hideLinkAfter and linkOptions can be defined on the HTML page. Set defaults below.
	
	if (typeof hideLinkAfter == 'undefined'){
		var hideLinkAfter = 5;  // Seconds
	}
	
	if (typeof linkOptions == 'undefined'){
		var linkOptions = {
			'effect': 'slide',
			'hide': {'direction':'down'},
			'show': {'direction':'down'},
			'speed': 500
		};
	}
	
	console.log('working');


	// Mark each video and set of controls with a class that will let us
	//  handle each of them separately.
	// Numbering from 1 to make things easier for course creators.
	video.each(function(index){   $(this).addClass('for-video-' + (index + 1));   });
	vidControls.each(function(index){   $(this).addClass('for-video-' + (index + 1));   });
	
	// We're positioning links based on the video controls.
	vidControls.addClass('link-positioner');
	
	video.each(function(vidnumber){
		
		var thisVid = $(this);
		setUpLists(vidnumber);
	
		// Check to see whether the video is ready before continuing.
		var waitForVid = setInterval(function(){

			var state = thisVid.data('video-player-state');	// Sometimes this fails and that's ok.
			
			if(typeof state.videoPlayer != 'undefined'){
				if (state.videoPlayer.isCued()){
					console.log('video data loaded');
					mainLoop(state, vidnumber);
					clearInterval(waitForVid);
				}
			}
		}, 100);
	
	});
	
	// Take the simple list in our HTML and make it FABULOUS
	function setUpLists(vidnumber){
		
		// Let's copy the links to the video controls so we can position them there.
		var vidlinks = $('#vidlinks-static-' + (vidnumber+1))
			.clone()
			.prop('id', 'vidlinks-live-' + (vidnumber+1));
		vidlinks.appendTo('.video-controls.for-video-' + (vidnumber+1));
		
		linkTimer[vidnumber] = [];
		
		// Each link needs a little bit added to it, to keep the author view simple.
		// This preps the links that we're going to display on the video.
		$('#vidlinks-live-' + (vidnumber+1)).children().each(function(index){
			
			var thisLinkBox = $(this);
			var thisLink = $(this).find('a');
		
			// Give the link a class and a unique ID
			thisLinkBox.addClass('vidlink');
			thisLinkBox.attr('id','link-card-live-' + index);
		
			// Give the images a class for styling purporses.
			thisLink.find('img').addClass('vidlinkicon');
	
			// Make all the links open in new pages.
			thisLink.attr('target', '_blank');
			// Style all the links
			thisLink.addClass('link-text-live');
			
			// Screen readers should skip these links. Rarely (but not never) an issue.
			thisLinkBox.attr('aria-hidden','true');
		
			// Build the link timer from the divs.
			var tempTimer = {
				'time': hmsToTime(thisLinkBox.attr('data-time')),
				'shown': false
			};
			linkTimer[vidnumber].push(tempTimer);
		});
	
		// This preps the ones that are visible all the time.
		$('#vidlinks-static-' + (vidnumber+1)).children().each(function(index){
		
			var thisLinkBox = $(this);
			var thisLink = $(this).find('a');
		
			// Give the link a class and a unique ID
			thisLinkBox.addClass('vidlink-static');
			thisLinkBox.attr('id','link-card-static-' + index);
		
			// Remove the images.
			thisLink.find('img').remove();
		
		});
		
		
		// Finish making the unordered list.
		$('#vidlinks-static-' + (vidnumber+1) + ' .vidlink-static').wrapAll('<ul></ul>');
		
		// If they click on one of the live links, pause the video.
		$('.link-text-live').on('click tap', function(){
			state.videoPlayer.pause();
		});
		
		linkTimer[vidnumber].sort(timeCompare);	// Uses a custom function to sort by time.

		console.log(linkTimer[vidnumber]);
	
	}
	
	// Every 500 ms, check to see whether we're going to show a new link.
	function mainLoop(state, vidnumber){
		
		var timeChecker = setInterval(function(){
			
			state.videoPlayer.update();		// Forced update of time. Required for Safari.
			time = state.videoPlayer.currentTime;
			
			// If we should be showing a link:
			if(currentLink(time, vidnumber) != -1){

				// ...and there's something being shown,
				if(linkBeingShown[vidnumber]){
				
					// but it's not the one that should be shown,
					if(currentLink(time, vidnumber) != currentLinkShown(vidnumber)){
				
						// then hide it.
						hideLink(currentLinkShown(vidnumber), vidnumber);
						
					}
				}
				
				// ...and there's nothing being shown,
				else{
			
					// then show the one we should be showing.
					showLink(currentLink(time, vidnumber), vidnumber);
					
				}
			
			// If we should NOT be showing a link,
			}else{
				// ...and one is showing, hide it.
				if(currentLinkShown(vidnumber) != -1){
					hideLink(currentLinkShown(vidnumber), vidnumber);
				}
			}
						
		}, 500);
	
	}
	
	// Show the link on the video. While we're at it, bold the one in the list too.
	function showLink(n, vidnumber){
		console.log('showing link ' + n + ' for video ' + (vidnumber+1));
		$('#vidlinks-live-' + (vidnumber+1) +' #link-card-live-' + n )
			.show(linkOptions.effect, linkOptions.show, linkOptions.speed);
		$('#vidlinks-static-' + (vidnumber+1) +' #link-card-static-' + n )
			.children()
			.addClass('boldlink');
		linkTimer[vidnumber][n].shown = true;
		linkBeingShown[vidnumber] = true;
	}
	
	// Hide the link on the video and un-bold the one on the list.
	function hideLink(n, vidnumber){
		console.log('hiding link ' + n + ' for video ' + (vidnumber+1));
		$('#vidlinks-live-' + (vidnumber+1) +' #link-card-live-' + n )
			.hide(linkOptions.effect, linkOptions.show, linkOptions.speed);
		$('#vidlinks-static-' + (vidnumber+1) +' #link-card-static-' + n )
			.children()
			.removeClass('boldlink');
		linkTimer[vidnumber][n].shown = false;
		linkBeingShown[vidnumber] = false;
	}
	
	
	// Which link SHOULD we be showing right now? Return -1 if none.
	function currentLink(t, vidnumber){
		
		var linkNumber = -1;
		
		for(var i=0; i < linkTimer[vidnumber].length; i++){
			if(t >= linkTimer[vidnumber][i].time && t < (linkTimer[vidnumber][i].time + hideLinkAfter)){
				linkNumber = i;
				break;
			}
		}
		return linkNumber;
	}


	// Which link are we ACTUALLY showing right now? Return -1 if none.
	function currentLinkShown(vidnumber){
		
		var linkNumber = -1;
		
		for(var i=0; i < linkTimer[vidnumber].length; i++){
			if(linkTimer[vidnumber][i].shown){
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
	

	// Converts hh:mm:ss to a number of seconds for time-based problems.
	// If it's passed a number, it just spits that back out as seconds.
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

}