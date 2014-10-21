Video Augments for edX
====================

This script will make a set of little doodads underneath your video on edX. You can click on them to move the video or get more detail. I'm still working on it; this is a preliminary draft at the moment.

If you're an edX student, this script isn't useful for you. It's something that course designers use, not something that students can use.


How Do I Implement This?
--------

Haven't finished it yet. I'll let you know when it's done.

How Does It Work?
--------

Pretty sketchily at the moment.

Files
--------

* **VideoAugment.css** provides a few things to help this blend in with edX. Put it in your "Files and Uploads" section.
* **VideoAugment.html** is what you cut-and-paste into a Raw HTML component to make this work. You can put the component anywhere on the page; the augments will appear right below the first video on the page.
* **VideoAugment.js** does the actual work of moving the problems around and displaying them. Put it in your "Files and Uploads" section.

Dependencies and Fragility
--------------

This script depends on jQuery and jQuery UI. Both of those are included in edX normally, so you should not need to worry about it.

This script also depends on the particular structure of the web pages served by edX, which means that their later updates can potentially break the script. As long as I'm working at HarvardX I'll do my best to keep this script updated in a way that keeps it working.

Status
------

Not ready for prime time. Does not have full functionality.


To Do list
-----------

* Add click-for-popup and click-for-link functionality
* Add Aria attributes (and do other stuff) for accessibility
* lots more

Wish List
---------

* Would be totally sweet if the icon positions were more representative of where they are in the video, but I'm not sure that's gonna happen.