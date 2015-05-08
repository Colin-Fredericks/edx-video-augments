Video Links and Augments for edX
====================

There are two scripts in here.

One (VideoLinks.js) pops up links on your edX video. It's a little like the cards that appear on YouTube videos, but you can link wherever you want with them. The list of links also shows up normally on the page.

**Warning:** This only works for one video on a page at a time right now. Working on it.

The other (VideoAugment.js) will make a set of little doodads underneath your video on edX. You can click on them to move the video or get more detail. I'm still working on it; this is a preliminary draft at the moment.

If you're an edX student, this script isn't useful for you. It's something that course designers use, not something that students can use.


How Do I Implement This?
--------

**The Links part:**

Upload the VideoLinks.css and VideoLinks.js files to your Files & Uploads section (or, if you use the old XML interface, put them in your "static" directory).

Copy-and-paste the VideoLinks.html file into a Raw HTML component somewhere on the page. I recommend directly underneath your video, but it should work anywhere.

**The Augments part:**

Haven't finished it yet. I'll let you know when it's done.


How Does It Work?
--------

Both scripts hook into a hidden data structure that edX puts into their default video player. The Links files create a bunch of divs and attaches them to the custom edX controls for the video, and then shows and hides them at the appropriate time.

Not sure how well it works on the fallback video player yet.


Files
--------

* **Video Links**
 * **VideoLinks.css** provides necessary styling for the links to appear above the video. Put it in your "Files and Uploads" section.
 * **VideoLinks.html** is what you cut-and-paste into a Raw HTML component to make this work. You can put the component anywhere on the page; the augments will appear right below the first video on the page.
 * **VideoLinks.js** does the actual work of displaying the links at the right times. Put it in your "Files and Uploads" section.

* **Video Augments**
 * **VideoAugment.css** provides a few things to help this blend in with edX. Put it in your "Files and Uploads" section.
 * **VideoAugment.html** is what you cut-and-paste into a Raw HTML component to make this work. You can put the component anywhere on the page; the augments will appear right below the first video on the page.
 * **VideoAugment.js** does the actual work of moving things around and displaying them. Put it in your "Files and Uploads" section.


Dependencies and Fragility
--------------

This script depends on jQuery and jQuery UI. Both of those are included in edX normally, so you should not need to worry about it.

This script also depends on the particular structure of the web pages served by edX, which means that their later updates can potentially break the script (either intentionally or forgetfully). As long as I'm working at HarvardX I'll do my best to keep this script updated in a way that keeps it working.


Status
------

Links: Nearly ready. Needs testing with the fallback video player.

Augments: Not ready for prime time. Does not have full functionality.


To Do list
-----------

* Make the links work properly if you have multiple sets of them on a page at once.
* Add click-for-popup and click-for-link functionality
* Add Aria attributes (and do other stuff) to Augments for accessibility
* lots more

Wish List
---------

* Would be totally sweet if the icon positions were more representative of where they are in the video, but I'm not sure that's gonna happen.