// allow keyboard listening at global (document) level.
// adapted from old keyboard3.js (see jsgm/old) to fit in
// with event framework in event1.js

// only global variables are updated,  but any object with
// active key events will have those events triggered

// Note that key states are monitored,  so the state of a modifier key (shift/ctrl/alt)
//  can be tested that way,  instead of relying on event properties.

var key_state = new Array(256);	// to record continuous key states (up/down)
var key_logging = false;	// whether to keep log of key events
var key_log_len = 256;	// length of log,  which is circular (so this is also modulus)
var key_log_last;	//
var key_events_log = new Array(key_log_len);	// list of time-stamped key events
key_block_auto_repeat = true;

var init_time = new Date();

// We don't have a function to register new keyboard listeners.
// All we need to do is add them to the array.

var key_listeners = new Array();	// objects with key events. To be listed here
	// an object should have properties key_event[] ( int keycode, boolean down )
	// being array/dictionary of methods to call for particular key-codes
	// (although the key-code is also passed as first argument to method),
	// and key_active = true when wanting to catch these events (enabling
	// listener to be switched on and off easily).

	
function do_key_events(dn,k) {
	var obj,rtn = true,now = new Date();
	for (var i=0; i<key_listeners.length; i++) {
		obj = key_listeners[i];
		if (obj.key_active) if (obj.key_event[k])
			rtn = rtn && (obj.key_event[k](k,dn))
		}
	key_events_log[ key_log_last = (key_log_last + 1) % key_log_len ]
		 = { k: k, dn: dn, t: now }
	return rtn
	}

// Codes to convert Konquerer's virtKeyVal to normal keyCode values
// Note however that Konqerer gets the events first,  and will not
// pass on events that it uses 
keyKDEvirts = { 0:8, 1:18, 3:17, 5:16, 10:46, 11:35, 12:13, 13:27, 
	14:36, 15:45, 16:0, 20:37, 21:39, 22:38, 23:40,
	26:112, 27:113, 28:114, 29:115, 30:116, 31:117,
	32:118, 33:119, 34:120, 35:121, 36:122, 37:123 }

function key_event(e,t,n) {
	var kc = e.keyCode // fine for IE, Mozilla, Firefox but KDE gives 0 for arrows etc.
	if (e.virtKeyVal) kc = keyKDEvirts[e.virtKeyVal]  // for KDE (and others?)
	var new_state = (n == 'keydown');
	// only does key events where key state actually changes
	//   (unless key_block_auto_repeat is turned off).
	// If NOT doing,  return false to bubble event.
	return ( (key_state[kc] == new_state ) && key_block_auto_repeat )
		|| do_key_events(key_state[kc] = new_state,kc,e);	}

function keyboard4_init() {
	initHandler('keydown')
	initHandler('keyup')
	addEventHandler('keydown',key_event)
	addEventHandler('keyup',key_event)
	}

// stuff specific to mobile objects - should really be in separate module.

// Assumes calling object has attributes :
//	

function a_0() { this.a = [0,0,0]; }	// use as other_a if keyboard is only acc'n

// Assign acceleration keys and acceleration level (same in all directions)
//	as well as an initial acceleration function to an inertial object.
function give_thing_accel_keys(it,acc,keys,other_a) {
		// other_a is another function to compute acceleration,
		// to whose result keyboard-controled action is added
	it.key_a = acc;
	if ((typeof keys)=="number") keys=standard_keys[keys]
	it.a_keys = keys || standard_keys[0];
	it.do_other_a = other_a || it.do_a || a_0;
	it.do_a = do_a_keys;
	}

// Compute object's acceleration (inital function plus effect of keys)
function do_a_keys() {
	do_other_a();
	for (var i=0; i<4; i++)
		if (key_state[this.a_keys[i]])
			this.a[i&1] += (1-(i&2)) * this.key_a;
	}
// Usual directional keys : arrows,  DSAW,  LKJI
standard_keys = [ [39,40,37,38] , [68,83,65,87] , [76,75,74,73] ];

// Shorthand for assigning a standard set of keys (resuses existind it.do_a)
function add_std_a_keys(it,a,k) { give_thing_accel_keys(it,a,standard_keys[k],it.do_a); }
