This directory contains js files for generating "placement puzzles",
a generalisation of the series-type (or "storyboard") puzzle to include
jigsaw type puzzles and other possibilities.

At its most general,  a placement puzzle consists of a set of frames
(internally denoted by the letters A,B,C,...) which must be dragged and
dropped onto a set of targets (numbered 0,1,2,... internally).  When calling the
PlacePuzzle constructor,  you provide (or choose) placement schemes
for both frames and targets,  and an "answer to key" scheme for
scoring.  This specifies how to turn an answer string (such as "BEFDAC"
specifying which frame is placed on each target) into a "key" array.
An actual score is obtained by comparing this array with the key array
produced by the correct answer.  By default the key is just a list of
target numbers where the frames were placed,  which corresponds to the
manner in which the original ladders question was scored.
A scale can also be specified (the default is 5).  The actual score which
if passed to the parent script (by parent.PutNeuroRespId(score)) will
be an integer ranging from 1 up to the specified number.

The two examples given here are in Example1.htm and Example2.htm,
which are based on the html served by the current PHP software.
They each have an added line (below the frame - you may have to scroll
down a little to see it) reporting the score as the question is tackled.
This can be used to get a feel for the different scoring schemes available.



Example1.htm frames story4.htm,  which is a rerun of the ladders question.

This example utilises the model element facility.  In order to create
a particular style of frame and/or target (by default they are have
no labels or borders) models may be provided as html in the file.
These should have class "model" with style "display:none" (specified in
the document's main style sheet in this case),  and id "<name>_frame"
or "<name>_target" where <name> is the name of the puzzle ("ladders").
Within the model,  any use of $A (in text content or attribute values)
will be converted to A,B,C,... and $1 to 1,2,3,... for individual frames
and targets.  Using this approach,  you must provide the <img> element
with appropriate src="...".

In this case, the arrangement of both frames and targets is default,
since the corresponding parameters to the constructor were null.

The scoring answer-to-key scheme has been specified as storyboardAnswer2key.
This scheme checks each pair of frames for which order they appear in.



Example2.htm frames jigsaw4.htm,  in which the respondent must arrange
the pieces of a map onto a 3x2 range of target spots.

In this case no model target and frame elements are provided,  so the
default of plain images is used.

On the other hand,  frame and target arrangement have been specified.
The targets need to be arranged on a grid,  with the right spacing
for the correctly assembled picture to work.  Hence the placeGrid scheme
is used.  The frames would normally be presented in a row (or column) with
the placeRow scheme,  but in this case the more artistic placeArc has
been used.
The placement schemes can be found in the file placement1.js.

This example uses the answer-2-key scheme returned by jigsawAns2key(3,3,2),
which is a function which in turn calls the jigsawAnswer2key3(answer,3,2).
This scheme checks which frame (or edge) is to each side of every frame
placed,  and is well suited to puzzles where edge-matching is salient.
It is one of four options adapted to the 2D arrangement of targets.
For puzzles where it is more important to get absolute positioning correct,
the scheme returned by jigsawAnswer2key3(0,3,2) would be better.

More information about the scoring schemes can be found in the comments
in the placePuzzle5.js file.
