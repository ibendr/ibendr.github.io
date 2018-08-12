# load length-specific word lists
wl = [ [ ] ] + [ file( "words-len-%d" % i ).read().split() for i in range( 1, 20 ) ]
# full single list - shortest words first
ws = reduce( list.__add__ , wl )
# alphabetic
ws1 = sorted( ws )
wcl = lambda c,l:[w for w in wl[l] if w[0].upper()==c.upper()]

# test if in list - much quicker than ( w in ws ) because only looks in length-specific list
def inWs( w ):
    return w in wl[ len( w ) ]
# sub-anagram test
def subAn( w , x ):
    # short version, which may be just as quick
    for c in set( w ):
        if w.count( c ) > x.count( c ):
            return False
    return True
def subLetters( w , x ):
    # return letters of x minus letters of w
    l , m = list( w ) , list( x )
    for c in l:
        # could put in try-except block, but the exception
        # raised when c not in m is perfectly appropriate.
        m.remove( c )
    return ''.join( sorted( m ) )

def supAns( w ):
    # return all super-anagrams of w and the remaining letters
    return [ ( w1 , subLetters( w , w1 ) ) for w1 in ws \
                  if len( w1 ) > len( w ) and subAn( w , w1 ) ]

def supAnsA( w ):
    # return all super-anagrams of w where remainder can be one word
    pass

def compWords( w ):
    # return list of words consisting of w plus another word
    # although w itself needn't be a word
    l = len( w )
    return [ w1 for w1 in ws if w1[ : l ] == w and inWs( w1[ l : ] ) ]

#wc = dict( [ ( c , dict( [ ( l , wcl(c,l) ) for l in 4,6,8,10 ] ) ) for c in 'xzj' ] )
#out = '\n'.join( [ '----%s----\n' % c.upper() + \
      #'\n'.join( [ '%d:\n'        % l         + \
      #'\n'.join( wcl(c,l) ) for l in 5,7,9,11 ] ) \
		             #for c in 'xzj' ] )

#f=file('wlc-xzj-579b.txt','w')
#f.write( out )
#f.close()
