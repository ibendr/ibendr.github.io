function wrt(s) { document.write(s) /*; alert(s)*/ }
function el(t,c) { return "<"+t+">"+c+"</"+t.split(" ")[0]+">" }
function wrtEl(t,c) { wrt(el(t,c||'')) }
function inc(n) { wrtEl ('script type="text/javascript" src="'+n+'.js"') }

inc("../parameters")	// short program to fetch URL-passed parameters
inc("slide-list")	// first include the local folder's list of slides
inc("../slide-show")	// then the code to write the html
