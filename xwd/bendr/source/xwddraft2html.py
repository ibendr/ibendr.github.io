#!/usr/bin/python

"""
Simple program to create html xwd files from 'draft'
text xwd files - where each clue is in format:
  <n>. <SOLUTION> (<LENGTH>) <CLUE>
and of course we want it as:
  <n>. <CLUE> (<LENGTH>)
We also move the solution (grid) to the end,
and add 3 intervening lines of html.
WARNING: This is a crude program, e.g. demands
exactly one blank line between lines of grid
and clues, only translates clue format if the
clue fits the test just right.
"""

import sys , subprocess , re
import random

# Global variables

html1 = '<html><body><pre class="xwd">'
html2 = '<![CDATA['
html3 = 'Author:by BenDR\n]]></pre></body>\n' + \
        '<script type="text/javascript" src="../js/xwdMaster4.js">\n' + \
        '</script></html>'
fpath = ''

if __name__ == "__main__":
    import sys
    for fname in list ( sys.argv[ 1 : ] ):
	print fname
	src = file( fname ).read( ).splitlines( )
	grid, clues = [ ] , [ ]
	i = 0
	# Up to first blank line is grid
	while i < len( src ) and src[ i ].strip( ):
	    grid.append( src[ i ].upper( ) )
	    i += 1
	# Then clues
	i += 1
	while i < len( src ) and src[ i ].strip( ):
	    l = src[ i ]
	    # To translate, must have  . ( ) in that order
	    if 0 < l.find( '.' ) < l.find( '(' ) < l.find( ')' ) < len( l ) - 2:
		l = l[ : l.find( '.' ) + 1 ] + l[ l.find( ')' ) + 1 : ] + \
		    l[ l.find( '(' ) - 1 : l.find( ')' ) + 1 ]
	    clues.append( l )
	    i += 1
	# We'll add a name tag if it's in the puzzle<n> series...
	if fname[ : 6 ] == 'puzzle':
	    grid.append( "Name: Puzzle " + fname[ 6 : ] )
	out = [ html1 ] + clues + [ html2 ] + grid + [ html3 ]
	# output
	file( fpath + fname + '.html' , 'w' ).write( '\n'.join( out ) )
	#file( '../' + fname + '.html' , 'w' ).write( '\n'.join( out ) )
	#file( '/home/ben/programming/ibendr.github.io/xwd/' + fname + '.html' , 'w' ).write( '\n'.join( out ) )

	
      
      
