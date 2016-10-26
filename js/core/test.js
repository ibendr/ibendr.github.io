function go() {
	d=new DragElement(["img",[{src:"t.jpg",style:"width:20%"}]])
	s.addChild(d)
	f=function(o,i) {o.it.style.width=""+i+"%"}
	l = []; for (i=0; i<20; i++) l.push([[f,[d,20+i*2]]])
	jobQueue_addJobs(l)
	}

test_init = go