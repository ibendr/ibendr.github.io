// ARRAY

/* Some extra methods for arrays.

Note that UNLIKE builtin array methods,  these are visible
to the    for (x in A) {...}   construct,  which otherwise usually
only returns x="0","1",... for the elements of A.  (On the other
hand the boolean operation (x in A) DOES see builtin methods,
e.g. ("splice" in [1,2,3]) returns true.
Also be aware that the boolean test
	if ( A ) { ... }
usually gives false for an empty array,  but won't any more
with these extensions installed.  Instead you will need
	if ( A.length ) { ... }
We should have a separate model which only adds these extensions
to a subclass of array so that we don't break other scripts.

Changes since branching from version 1 (June 2015):
  - check for indexOf already existing (since it now does apparently),
  - updated my version of indexOf to use 2nd argument consistently with 
    new inbuilt version ( starting index of search ).
  - changed return value of .remove() from removed element to true
    (where element existed). Still false otherwise.
  - renamed iter1 to enum, and added iter2 and renamed it each
  - added safety checking to iter so the eval call is safer
    
Note that we are now spoiled for iterator options. As well as the three
flavours provided here, we now have the builtins -

L.forEach( fun )   calls fun( v , i , L )   for each  v == L[ i ]
L.every( fun )     same thing, but only continues loop if fun returns true

Both of these involve the slight marring of code readability, as
typical usage involves using an anonymous function -

    L.forEach( function( x ) {
      ...do some stuff with x...
    });
    
which requires the funny "});" block end.  Also, the context changes
with the calling of the inner function, so for instance "this"
disappears. Workaround: assign self=this before loop, use self within it.

Summary of usages of iterators defined here -

while ( x = L.each() ) { ...x is value from L... }		// easiest, but has weaknesses
while ( x = L.next   )  same 

while ( L.enum( h ) ) { ...h[0]==h.i==index , h[1]==h.v==value... }

while ( L.iter( "n,x" ) ) { ...n == index , x == value ...}	// uses reflection, but pretty & robust

*/

include( "object2" );

mergeIn ( Array.prototype , {
    indexOf : function( x , s ) {
	for ( var i=(s||0); i<this.length; i++ )
	  if ( this[i] == x ) return i; return -1 },
    remove : function( x ) { // removes first instance,
	    // returning true if there was one to remove
	    var i=this.indexOf( x ); return (i>-1) && ( this.splice(i,1) || true ); },
    has : function(x) { return (this.indexOf(x)>-1) },
    last : function() { return this[this.length-1] },
    map : function(f,P)  {  // [f(x) for x in this if P(x)]
	    var out=new Array;
	    for (var i=0; i<this.length; i++)
		    if ( (!P) || P(this[i]) ) out.push((f||funId)(this[i]))
	    return out },
    suchThat : function(P) { // subset by property
	    return this.map(funId,P) },

    // enum: enumerating Iterator:  allows following usage:

    //	h=[]; while ( L.enum( h ) ) { ... h.v holds value from L ... }

    //  where h is some array / object,  of length 0 before this point. 
    //  It will be resored to that state at the end of the iteration,
    //    but this will have to be done 'manually' if break used.
    //	will be left back at length 0 after reacing end of iteration. 
    //  causes the code block to be iterated for the items of the array L,
    //  with the indeces and items (values) available in the code as
    //  as h.i and h.v respectively,  or h[0], h[1].
    //
    // named for 'enumerate' function in python (gives (index , value) pairs)

    enum : function ( holder ) {
	var i = 0
	if ( holder.length || ( "i" in holder ) ) {
	    // existing iterator - increment counter
	    i = holder.i + 1
	    if ( i >= this.length ) {
		// past end - dismantle iterator (empty it)
		if ( holder.pop ) {	// Array - this way gets length to 0
		    holder.pop() ; holder.pop() ;
		}
		else {	// Object - just use delete
		    delete holder[ 0 ] ; delete holder[ 1 ] ;
		}
		delete holder.i ; delete holder.v ;
		return false;
	    }
	}
	holder.i = ( holder[ 0 ] = i );
	holder.v = ( holder[ 1 ] = this[ i ] );
	return true;
	
    },
    
    // Quick and dirty iterator - see shortcomings below
    //
    // n = 0 ; while ( s = L.each() ; ) alert( "word " + ( ++n ) + " is " + s )
    //
    // for ( L.eachReset() ; s = L.each() ; ) ...
    //
    // July 2015 : How far is this from just using:
    //
    //	n = 0 ; while ( s = L[ n ++ ] ) ...		???
    //
    // Note that the boolean test to continue the loop is the next item returned by the iterator
    //   so the iteration is broken by elements such as 0, "", null. This can be used to
    //   deliberate effect, but for more intuitive performance use   while ( ( s = L.each ) != undefined )
    // There was only one instance per array, so nested iterations of different variables over
    //   the same array could not be done. ("Use enum or iter for that sort of job.")
    // But now we can pass an identifier ( number is envisaged ) ...
    //     while ( x0 = L.each() ) {
    //       while ( x1 = L.each( 1 ) {
    //         ... } }
    // Also, the iterator is not always initialised - it's 'pointer' is to the first element if the
    // array is new, and goes back to there when an iteration runs its full course. If you break
    // from an iteration the next invocation will resume from where left off.
    // Should then use L.eachReset() (back to start) or L.eachBreak() (go to finish)

    _eachPointer : [],
    eachReset : function ( i ) { this._eachPointer[ i || 0 ] = 0 ; },
    eachBreak : function ( i ) { this._eachPointer[ i || 0 ] = this.length ; },
    each :      function ( i ) {
	i = i || 0; if ( ! i in this._eachPointer ) this._eachPointer[ i ] = 0;
	if ( this._eachPointer[ i ] < this.length ) return this[ this._eachPointer[ i ]++ ] ;
	this._eachPointer[ i ] = 0; // return nothing this time (end loop) but ready for start of next loop
    },
    
    // Fancy iterator to which one passes variable name(s) for value (and index)
    //
    // L=['apple','ball','cat'] ; while (L.iter("n,s")) alert( "word "+n+" is "+s )

    _newIter: function ( names ) {
	// names should be an identifier for value only
	// or a pair of identifiers separated by a comma
	// for index and value - this checks:
	if ( /[^\w,]/.test( names ) ) return false;
	names = names.split( "," );
	if ( names.length == 1 ) return { i: -1 , vName: names[ 0 ] } ;
	else return { i: -1 , iName: names[ 0 ] , vName: names[ 1 ] } ;
    },
    iter : function ( names ) {
	var it
	if ( ! ( "_iterators" in this ) ) this._iterators = { };
	if ( it = this._iterators[ names ] ||
		( this._iterators[ names ] = this._newIter( names ) ) ) {
	    if ( ++it.i >= this.length ) {
		// past end - dismantle iterator
		delete this._iterators[ names ];
		return false;
	    }
	    it.v = this[ it.i ];
	    if ( it.iName ) eval ( it.iName + "=it.i" );
	    if ( it.vName ) eval ( it.vName + "=it.v" );
	    return true;
	}
    }
});

// Another way to access the .each() iterator, using a getter and setter on a pseudo-property
//   getting  v = L.next  gets the next element, but
//   setting  L.next = i  sets the pointer position ( 0 = first, -1 = last, null = break )
var pseudo = {
    get: function ( )   { return this.each() ; },
    set: function ( i ) {
	this._eachPointer[ 0 ] = ( i == null ) ? this.length : mod( i , this.length );
    }
};
Object.defineProperty( Array.prototype, "next", pseudo );
