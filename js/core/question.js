IsRadioClick=false;
// BRENDAN MOD: NEXT LINE ADDED to check if neuro done
IsNeuroDone=false;
function GradNextClick() {
    if(document.QuestionForm.scale.value=="nil") {
	    alert("You did not click on the scale");
		return false;
	}
	return true;
}

function RadioNextClick() {
	if(IsRadioClick==false) {
	    alert("You did not click on an answer");
		return false;
	}
	return true;
}

// BRENDAN MOD: NEW FUNCTION
function TimeoutNextClickCheck(tot) {
	if(IsRadioClick==false) {
// BMOD: use confirm instead of alert
//		alert("You did not click on an answer");
//		return false;
		if(!confirm("Proceed without answer?")) {
			return false;
		}
	}
//	alert("new func");
	var checked = 0;
	for(nn = 0; nn < tot; nn++) {
		if(document.QuestionForm.pre_answer[nn].checked) {
			document.QuestionForm.answer.value = document.QuestionForm.pre_answer[nn].value;
			checked = 1;
		}
//		alert(checked + ":" + document.QuestionForm.pre_answer[nn].value);
	}
	if(checked == 0) {
		document.QuestionForm.answer.value = document.QuestionForm.timeout_answer.value;
	}
	return true;
}

// BRENDAN MOD: NEW FUNCTION
function TimeoutNextClick(tot) {
//	alert("new func");
	var checked = 0;
	for(nn = 0; nn < tot; nn++) {
		if(document.QuestionForm.pre_answer[nn].checked) {
			document.QuestionForm.answer.value = document.QuestionForm.pre_answer[nn].value;
			checked = 1;
		}
//		alert(checked + ":" + document.QuestionForm.pre_answer[nn].value);
	}
	if(checked == 0) {
		document.QuestionForm.answer.value = document.QuestionForm.timeout_answer.value;
	}
	return true;
}

function TimeoutSubmit(tot, time) {
// SET THE DEFAULT TIMEOUT on next line
	var secs = 32;

	// BMOD: Each Question can overide the default timeout (-1 means no overide timeout)
	if(time != -1) {
		secs = time;
	}

	var milli = secs * 1000;
	var command = "goTimeoutSubmit(" + tot + ")";
	setTimeout(command, milli);
}

function goTimeoutSubmit(tot) {
	if(TimeoutNextClick(tot)) {
//		alert(document.QuestionForm.answer.value);
		document.QuestionForm.submit();
	}
}

// BRENDAN MOD: NEW FUNCTION
function NeuroNextDone() {
	if(IsNeuroDone==false) {
	    alert("You have not completed this test question");
		return false;
	}
	return true;
}

function RadioClick() {
	IsRadioClick=true;
}

function NeuroDone() {
	IsNeuroDone=true;
}


function ImageMapClick(response) {	
	IsRadioClick=true;
	alert("Click OK to confirm your answer \n then click NEXT QUESTION \n to go on");
	document.QuestionForm.answer.value = response;
}


function GradClick(id) {
		 // Asign scale to hidden value		 
		 document.QuestionForm.scale.value=id;
}

function SetStartTime(h,m,s) {
		 hour=h;
		 min=m;
		 sec=s;
}

var ddt1, delai;
var min=0;
var sec=0;
var hour=0;

function debuteTemps1(delai1) {
	 
  hhmmss=hour;
  delai = delai1;
  if (min < 10) hhmmss += ":0" + min;
  else hhmmss += ":" + min;
  if (sec < 10) hhmmss += ":0" + sec;
  else hhmmss += ":" + sec;
  hhmmss = " " + hhmmss;
  document.QuestionForm.time.value = hhmmss;
  
  sec++;
  if(sec>60) {
      sec=0;
	  min++;
	  if(min>60) {
	      min=0;
		  hour++;
	  }
  }

  document.QuestionForm.h.value=hour;
  document.QuestionForm.m.value=min;
  document.QuestionForm.s.value=sec;

  ddt1 = setTimeout("debuteTemps1(delai)",delai1);
}
