// Should be 'included' via fancy-slide-show-inc.js
// depends on parameters, jobQueue, quMobile, big_slide_list

// This will be the fancier version of html based slideshow,
//	with animated effects to get from one slide to next

// Key differences to earlier version in structure -
//  not reloading html each time (drawback - can't use BACK button)
//  using dom methods instead of document.write

// Much more work is done by the script that lists the images (make-big-slide-list)
// which will be in a single file listing the contents of multiple subdirectories
// (not at this stage nested)

// The various html objects ( list of directories , image-frame etc. )
// will be created when the document is loaded,  and then shown and hidden as required.

var elPhotoFrame,elPhoto,elOtherPhoto,elDirectoryList,liArgs
var pathBase = ""
var photoXY = [30,50]
var relPhotoXY = [1,1]
var currentMN = [1,1]
var mainTitle = "Slide Show : "

function switchPhoto(fn,m,n) {
	// Called on completion of transition to next photo
	// copy otherPhoto src to Photo,  and hide other
	elPhoto.setAtts( {src:fn} )
	elPhoto.show()
	elOtherPhoto.hide()
	// Now the switch has been made, update global MN
	currentMN = [m,n]
	// also prepare probable next photo (pre-load image)
	var mn = nextPhotoMN()
	elOtherPhoto.setAtts(	{src:photoSrc(mn[0],mn[1])}  )
	}

function photoSrc(m,n) {
	var  dirName = big_slide_list[m][0]
	var fileName = big_slide_list[m][n][0]
	return pathBase + dirName + "/" + fileName
	}
function chooseNextPhoto() {
	var mn = nextPhotoMN()
	choosePhoto(mn[0],mn[1],1)
	}

function nextPhotoMN() {
	var m = currentMN[0]
	var n = currentMN[1]
	n++
	if (n>=big_slide_list[m].length) {
		m++
		if (m>=big_slide_list.length) m=1
		n=1
		}
	return [m,n]	
	}
function choosePhoto(m,n,side) {
	// change to photo #n in album (directory) m
	// side (optional) which side to slide in from:
	//   1=R (default), -1=L, 0 : no slide
	elPhotoFrame.show()
	if (side==undefined) side=1
	var  dirName = big_slide_list[m][0]
	var  imgName = big_slide_list[m][n][1]
	var fileName = photoSrc(m,n)
	var docWidth = document.width || 800	// OK in all browsers?
	if (elOtherPhoto.getAtt("src")!=fileName) {
/*		alert("needed to load")*/
		elOtherPhoto.setAtts(	{src:fileName}  )
		}
	elOtherPhoto.setXY_(side * docWidth,relPhotoXY[1])
	elOtherPhoto.show()
	slideTo(elOtherPhoto,relPhotoXY,(side ? 6 : 1))
 	jobQueue_addJobs([,,,,,,,,[ [ switchPhoto, [ fileName,m,n ] ]  ]])
	document.title = mainTitle + dirName.toLeadUpperCase() +
				" : " + imgName.toLeadUpperCase()
	}
function enterDirectory(m) {
	// jump into a particular directory of images - start on first image
	elDirectoryList.hide()
	choosePhoto(m,1,0)
	}

function listDirectories() {
	// List the subdirectories and the number of images in each,  as links
	elPhotoFrame.hide()
	elDirectoryList.show()
	}

function makeDirectoryList() {
	liArgs = new Array()
	liArgs[0] = {/*parent:document.body*/}
	for (var i=1;i<big_slide_list.length; i++) {
		liArgs[i]=["li",[ [ "a",[{href:"javascript:enterDirectory("+i+")"},
				big_slide_list[i][0]] ] ]]
		}
//  	elDirectoryList = new htmlElement("ul",liArgs)	
	var elList = new htmlElement("ul",liArgs)
	elDirectoryList = new htmlElement("div",[
		{ parent:document.body },
		[ "h3", [ "Please select from one of the albums..." ] ],
		[ "ul", 	liArgs 	]
// 		elList
						] )
	}

function makePhotoFrame() {
	elPhotoFrame = new DragElement( [ "div", [ {parent:document.body, style: "z-index: 1; width: 90%; height: 90%; border: thin solid black; overflow: hidden" } ] ],
			photoXY )
/*	elPhotoFrame = new htmlElement(  "div", 
		[ {parent:document.body, style:
			"z-index: 1; width: 80%; height: 80%; border: thin solid black" } ] )*/
	elPhotoFrame.addChild(
		elPhoto = new MobileElement( ["img",[
		{ src: "", width: "99%", "z-index": "2" } ]], [1,1] ) )
	elPhotoFrame.addChild(
		elOtherPhoto = new MobileElement( ["img",[
		{ src: "", width: "99%", "z-index": "3" } ]], [1,1] ) )
	elOtherPhoto.hide()
	}

function slideshow1_init() {
	makeDirectoryList()
	makePhotoFrame()
	elPhotoFrame.hide()
	}