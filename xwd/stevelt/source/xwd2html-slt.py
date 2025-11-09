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

import os , sys , subprocess , re
import random

# Global variables

keepXtra = True
keepAnno = True
html1 = '<!doctype html><html><body><pre class="xwd">'
html2 = 'Solution:'
html3 = 'Author: by Steve Townsend\n</pre></body><script type="text/javascript" src="../js/xwdMaster5.js"></script></html>\n'
fpath = '../'

def doEntities( s ):
#     make a string safe(r) to put into html or XML
    entities = ( ('&','amp'),('<','lt'),('>','gt'),('"','quot') )
    for ent in entities:
	s = s.replace( ent[ 0 ] , '&' + ent[ 1 ] + ';' )
    return s

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
            else:
                # display unparsed lines amongst clues
                print l
	    clues.append( l )
	    i += 1
	# We'll add a name tag if it's in the puzzle<n> series...
	if fname[ 3 : 6 ] == 'slt':
	    grid.append( "Name: Puzzle " + fname[ : 3 ] )
	out = [ html1 ] + clues + [ html2 ] + grid + [ html3 ]
	# output
	fout =  '../slt07-' + fname[ : 3 ] + '.html'
	file( fout , 'w' ).write( '\n'.join( out ) )
	os.system( 'git add ' + fname + ' ' + fout  )


	
      
      
