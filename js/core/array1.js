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
*/


Array.prototype.indexOf = function(x) {
	for (var i=0; i<this.length; i++) if (this[i]==x) return i; return -1 }
Array.prototype.remove = function(x) { // removes first instance
	var i=this.indexOf(x);	return (i>-1) && this.splice(i,1) }
Array.prototype.has = function(x) { return (this.indexOf(x)>-1) }
Array.prototype.last = function() { return this[this.length-1] }

function id(x) { return x } // should also be in object

Array.prototype.map = function(f,P)  {  // [f(x) for x in this if P(x)]
	var out=new Array;
	for (var i=0; i<this.length; i++)
		if ( (!P) || P(this[i]) ) out.push((f||id)(this[i]))
	return out }
Array.prototype.suchThat = function(P) { // subset by property
	return this.map(id,P) }	

// Iterator:  allows following usage:

//	while ( L.iter( h ) ) { .... }

//  ( where h is some array,  of length 0 before this point - it
//	will be left back at length 0 after execution. )
//  causes the code block to be iterated for the items of the array L,
//  with the indeces and items (values) available in the code as
//  as h.i and h.v respectively,  or h[0], h[1].

function arrayIterator1( holder ) {
	var i = 0
	if ( holder.length ) {
		// existing iterator - increment counter
		i = holder.i + 1
		if ( i >= this.length ) {
			// past end - dismantle iterator (empty it)
			holder.pop() ; holder.pop()
			return false
			}
		}
	holder.i = ( holder[0] = i )
	holder.v = ( holder[1] = this[ i ] )
	return true
	}

// sample usage:
// L=['apple','ball','cat'] ; while (L.iter("n,s")) alert( "word "+n+" is "+s )

function arrayIterator( names ) {
	// names should be an identifier for value only
	// or a pair of identifiers separated by a comma
	// for index and value
	// DANGER - use of eval - should check that name is identifier only
	var it
	if ( ! ( "iterators" in this ) ) this.iterators = { }
	if ( names in this.iterators ) {
		// existing iterator
		it = this.iterators[ names ]
		i = it.i + 1
		if ( i >= this.length ) {
			// past end - dismantle iterator
			delete this.iterators[ names ]
			return false
			}
		it.v = this[ ( it.i = i ) ]
		}
	else {
		if ( this.length == 0 ) return false
		// new iterator
		it = ( this.iterators[ names ] = { i: 0 , v: this[ 0 ] } )
		it.iName = ''
		it.vName = names
		comma = names.indexOf( ',' )
		if ( comma > -1 ) {
			it.iName = names.slice( 0 , comma )
			it.vName - names.slice( comma + 1 )
			}
		}
	if ( it.iName ) eval ( it.iName + "=it.i" )
	if ( it.vName ) eval ( it.vName + "=it.v" )
	return true
	}

Array.prototype.iter  = arrayIterator
Array.prototype.iter1 = arrayIterator1
