// shell,  for debugging in js pages

// Changed since shell3 : added dictionary of internal commands


var shell_internals = {
	q : function() { this.remove() }
	}

function _do_command(cmd) {
	// wrapper around _do_command_js which also processes internal commands
	if (cmd[0]=='?') cmd = "describe(" + cmd.slice(1) + ")"
/*	if (cmd in shell_internals) return shell_internals[cmd](cmd)
	else return _do_command_js(cmd)*/
	return (shell_internals[cmd] || _do_command_js).call(this,cmd)
	}

function _do_command_js(cmd) {
	try {out = eval(cmd)}
	catch (e) {out = "Error!\n" + e}
	return out
	}

var shell_res="js shell.  q = quit"
var shell_cmd="D=document"


// big shell
var shellKeys = { 38: -1, 40: 1, 13: 0 }
function Shell() {
	DragElement.call(this,["div",[{parent:document.body,"class":"shell",
		style:'position:absolute; top:180px; left:20px; border:thin black solid'}]])
	var welcomeText="Welcome to the javascript console."
	this.history = [""]
	this.historyPointer = 0
	this.output = ""
	this.prvEl = new Element("button",[{parent:this.it,"class":"mousehog","type":"push"},"prev"])
	this.prvEl.it._jsElObjPa = this
	this.prvEl.it.onclick=function(event) {this._jsElObjPa.goHist(-1)}
	this.nxtEl = new Element("button",[{parent:this.it,"class":"mousehog","type":"push"},"next"])
	this.nxtEl.it._jsElObjPa = this
	this.nxtEl.it.onclick=function(event) {this._jsElObjPa.goHist(1)}
	this.cmdEl = new Element("input",[{parent:this.it,type:"text","class":"mousehog",
	   name:"cmd",value:"",style:"width: 80%"}])
	this.cmdEl.it._jsElObjPa = this
	this.cmdEl.it.onkeyup=function(e) {
 		var ev = e || window.event
 		var k = ev.keyCode
		if (k in shellKeys) {
			var d = shellKeys[k]
			if (d) this._jsElObjPa.goHist(d)
			else this._jsElObjPa.doIt()
			return false
		  }
		else return true
	  }
	this.doItEl = new Element("button",[{parent:this.it,type:"push"},"Go!"])
	this.doItEl.it._jsElObjPa = this
	this.doItEl.it.onclick=function(event) {this._jsElObjPa.doIt()}
	this.outEl = new Element("pre",[{parent:this.it,"class":"mousehog",style:"margin:0px"},welcomeText])
	this.cmdEl.it.focus()
	}

Shell.prototype = new DragElement
mergeIn ( Shell.prototype, {
	doIt : function () {
		var cmd =  this.cmdEl.it.value // ; alert(cmd)
		//this.history[this.historyPointer]=cmd //changed: keep old version
		this.history[this.history.length-1]=cmd // sometimes the same
		this.history.push("")
		this.historyPointer=this.history.length-1
		this.cmdEl.it.value = ""
		res = _do_command.call(this,cmd)
		if (res!=undefined)
			this.output += ((this.output) ? "\n" : "") + res
		else { }  // alert with a beep?
		setNodeText(this.outEl.it,this.output)
		this.cmdEl.it.focus()
		},
	clear : function () { this.output=''
	  setNodeText(this.outEl.it,this.output)
		this.cmdEl.it.focus() },
	goHist : function (d) {
		var newPoint = this.historyPointer + d
		if (newPoint >= 0) if (newPoint < this.history.length) {
			this.history[this.historyPointer] = this.cmdEl.it.value
			this.historyPointer = newPoint
			this.cmdEl.it.value=this.history[newPoint]
			}
		this.cmdEl.it.focus()
		}
	}
    )
// Initially - put in a keyboard listener to activate shell if ctrl-shift-S pressed
// function shellKeyEvent(kc,state) {
// 	// activate a shell if ctrl-shift-S pressed
// 	if (state && key_state[16] && key_state[17]) s=new Shell()
// 	else return true
// 	}
// var shell_key_listener = { key_event : { 83: shellKeyEvent }, key_active : true }
// function shell5_init() { key_listeners.push(shell_key_listener)	; alert(hi2) }

function shell5_init() { key_listeners.push(	{
	key_event : { 83: function (kc,state) {
		if (state && key_state[16] && key_state[17]) s=new Shell()
		else return true } },
	key_active : true } )
	}
