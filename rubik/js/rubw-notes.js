// Rubikword - notes

rubwNotes = `

Rubik Words

Each puzzle requires unscrambling of a crossword grid, so that all the entries are legitimate words.

The starting position is always no more than three "moves" from a valid grid (winning position), but you don't have to arrive at that specific position to win. You could win by getting to any position where all the grid entries are real words (according to the game's list). To save you having to guess which words are and aren't accepted, when you make a word that's allowed it will be highlighted in green. In practice, there will rarely be any other winning possibilities, other than the transpose of the original one, and generally it would take a lot more moves to arrive at a different winning position.

In the early levels, the only moves permitted are "rotations" of columns or rows with letters in them. Slide along a "line" (row or column) to move the letters. A letter pushed off the edge "wraps around" and appears at the other end of the line, hence calling the move a rotation. In later levels rotations are also permitted on lines with "blocks" in them (tiles without letters). We differentiate by referring to the blocks as immobile or mobile, and we should communicate this visually in how we draw the blocks.

Later on again, flips of lines will be available, and possibly other moves. [ For each new move we introduce, as well as coding the transformation we need to work out how it will be physically performed in the interface and code that. ]
Possibilities ... 
  - whole grid flips / rotations (by grabbing frame of grid, or another control button
  - including composite flip ('inversion'?) and diagonal flips (one of which is transpose which should be irrelevant but people might like seeing the different view)
  - local rotations - e.g. (best for classic 4-block grid) click on a block to rotate the 8 cells around it
      (if we only allow these in levels with immobile blocks, interface could be to rotate the block. Visually, show block to be rotatable.)
So far, we have only considered transformations of the grid ... rearranging of tiles. But what if we allow 'moves' that alter the letters on the tiles?
  - CRAZY !? shift ciphers - surely just +/- 1 ... ?
  - VOWEL rotate (like shift cipher on vowels only) A -> E -> I -> O -> U -> A
Grids

The original intention was to have all grids be the "classic" 5x5 with three words on each axis, and just four blocks, e.g.

START 4
P N E
LEVEL
A I L
TALES

However, we could mix it up. Once players are into levels with mobile blocks, it will be harder again with less certainty about where they go.
(Grid diagrams here are annotated with number of blocks.)
If we only allow 5 letter grid entries then really the only other options are the three sparser grids and one packed one...

 O O  8   OOOOO 6   O O O 6    OOOOO 0
OOOOO      O O      OOOOO      OOOOO
 O O      OOOOO     O O O      OOOOO
OOOOO      O O      OOOOO      OOOOO
 O O      OOOOO     O O O      OOOOO

UNLESS we choose to simply ignore shorter sequences, i.e. not require two- (and three-?) letter grid entries to be words (or ignore 2s, enforce 3s would work).
Note first two also have a transpose.

OOOOO 2   O O O 4   OOOOO 1
OOOOO     OOOOO     OOOOO
O O O     OOOOO     OO OO
OOOOO     OOOOO     OOOOO
OOOOO     O O O     OOOOO

Inclusion of four-letter words also allows four versions of each of -

OOOO  5   OOOOO 2   OOOO  3
 OOOO     OOOO      OOOOO
OOOO      OOOOO     OOOO
 OOOO     OOOO      OOOOO
OOOO      OOOOO     OOOO

In fact, if we have ways of dealing with any lengths (e.g. ignore 2-letter entries, require all longer ones to be words) then we could randomly place one to four blocks anywhere in the grid and go from there.

One-block grids could be used to capture an earlier idea for the game, where ONLY a line with a (the) block in it can be moved (a sort of reverse of the usual early setting of immobile blocks). With one block, always just 4 available moves.


Looking more and more like we want to embed xwd generator into the game. Even though we could just generate lots of premade grids. Thousands even. And change them regularly.

IDEAS FOR 'MESSAGE' GRIDS...

Lower case letters indicate changeable

START		START	<- with "esses"		START		START	<- better:
i N I		L r I	 for bottom row,	L R I		L S I	  only key
LEVEL		IdeaL	 can start with		IDEAL    or	IDAAL	  words in
l I E		D a E    all key words		D A E		D R E	  green :)
yeLlS		EsseS	 alread visible ->	ESESS		ESEES



SLIDE
e g n
TILES
u o u
probe


 F T		 F T
cLoUd 		cLoUd
 I R    <--	 I R
SPINS		SNIPS
 S S		 S S
 

 T F		 T F	Note TURPS is
cUrLs		cUrLs	a word, so only
 R I	<--	 R I	FLINS is illegal
SNIPS		SPINS	in this starting
 S S		 S S	position.

s b w
HELLO
a u r
WORLD
l t s


`
