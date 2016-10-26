// Should be 'included' via slide-show-inc.js
// depends on parameters

function convert_name(txt) {
	s = ""
	upper = out = false
	for (i=0; i<txt.length; i++) {
		c = txt[i]
		if (out) {
			if (upper) c = c.toUpperCase()
			if (upper = (c == "-" )) c = " "
			s += c
			}
		if (c==".") upper = out = !out
		}
	return s
	}

var w = parameters.width || '100%'
var l = slide_list.length - 1
var n = (parameters.n || 0) - 0
var n1 = (n + 1) % l
var n2 = (n + l - 1) % l
var slide = slide_list[n+1]
var slide1 = convert_name(slide_list[n1+1])
var slide2 = convert_name(slide_list[n2+1])
var album = slide_list[0]
var doc_title = parameters.title || (album + ' : ' + convert_name(slide))

wrt('<head><title>'+doc_title+'</title>')
wrt('<style type="text/css">img { width: '+w+' } a { font-weight: bold } </style>')
wrt('</head><body>')
wrt('<a href="slide-show.html?n='+n2+'" style="float: left">Previous : '+slide2+'</a>')
wrt('<a href="slide-show.html?n='+n1+'" style="float: right">Next : '+slide1+'</a>')
wrt('<img src="'+slide+'">')
wrt('</body>')
