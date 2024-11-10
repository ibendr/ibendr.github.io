Six Star:

   8 7
   5 1
   7 4
   142857
571428
   285714
    5
    7
    1

Not really relevant to solving the puzzle (as
far as I can see),  but was to composing it:
each number is the same sequence of six digits,
which are those of the recurring decimal expansion
of 1/7 = 0. 14 28 57 14 28 57 14 28 57 ...
It is a popular observation that each of the other
expansions of n/7 are just rotations of this:
2/7 = 0.285714...
3/7 = 0.428571...
etc.

So note that 7x = 999999

( Far from being a coincidence,  this arises quite
naturally,  as you will observe if you calculate
the decimals using long division - each time you
add a particular digit to your answer it must be
getting the same remainder and therefore the same
successive sequence of digits (keeping in mind you
are always 'bringing down' another 0 to add to your
one digit remainder.  Hence e.g. if you write a 4
you must've just had 30 to divide 7 into (4x7=28),
and now your 2 left over will become 20 and you will
continue on the sequence 2 x7=14, remainder 6 -> 60,
8 x7=56 rem 4 -> 40, 5, (r5) 7, (r1) 1, 4, 2, ... )

So within the overlapping region,  stepping a cell
across or down advances you one digit through
the sequence -  composing the puzzle consisted of
finding an arrangement of the six numbers which
then allowed them to be at the 6 different spots in
the rotation.  (And then checking for uniqueness
of solution of course).
As to solving,  the unique answer is forced by
successive restrictions on the size of x,  and doesn't
hinge on any insights about recurring decimals whatever.
    
Easy Plus:

 91
3003
3003
 91
 
To do with 7x11x13=1001...

C,D down are equal,  and are a multiple of 11 because of C-> = E->

Then 11|E. Using the divisibility by 11 rule (alternate digits count +/- 1 mod 11), given that the first and last digits of E are equal,  so are the middle two digits.  Hence the four centre digits of the grid are all the same.

We can now represent the grid as:

 ab
cffc
cffc
 gh

Were a,b,c,f,g,h are single digits.

E = 1001c + 110f = 11(91c + 10f)

While also E = A-> x Cv = (10a+b).11c

Hence	(10a + b)c = 91c + 10f

So c|f.  Let f = ic.

	10a + b = 91 + 10i

So b=1, a=9+i forcing a=9, f=0

Now E = 1001c = 7.11.13c

So Av x Bv = E^2 = 7^2.11^2.13^2.c^2

For either A or B down to be divisible by 11 (or 13) requires the last digit to match the first,  making the number another multiple of 1001,  so in particular only contributiong one power of 11 (or 13) to the product.  Hence both need to be divisible by 11 (and 13) and both end with a repeat of their first digit...

 91
c00c
c00c
 91

Now Av x Cv is 1001.1001.9
While E^2   is 1001.1001.c^2

So c=3.





Medium Steps:

    62
   505
  4096
 20...1
159..62
666.505
   2809


Medium Block:

20979.5.21
20979.6.27
20979.7.37

111=3x37

Gun Hard:

25
48
.3
12
0..18
42..529
.1728.12167
.1728.13824
11..576
4..18
35
.8
93
12

1001=7x11x13
(x^3)^3 = x^9 ends in same digit as x so e0 = e3, e2 = e5
Other bits and pieces force e1=5, e4=5 so e5e4e3 = e2e1e0 = E'
Hence E = 1001 * E' = 7 * 11 * 13 * e2.5.e0
Also E = Md^2 * F
so each of 7,11,13 divides Md or F,
and any of them that divide Md also divide E' since their square divides E.

...to be continued


Twelve Star:

        6
      7 9
      6 2
    4 923076
   769230
    1.307692
846153.7
   538461
615384 9
   8 6
   4 1
   6 5

The Bat:

  27    29 8
  37    11 2
24..21    48
64...5   841
  6.60  121
  12306 9
     5.6395
      576.97
22  4096.52
82 78 1.729
  484 1369
6724   6

Jumble Sale:

   6      1
 6994     5
 2.9      1
8194  13208
 4        8
     4214
   1 2693
   3 3980
   2 4301 1
   0      17
15188   23.4
         40

Neat Stack:

956
946

121
572
330

242

The Bird:

2       3     6
8    47424    5
5             5
6     912     3
11119.722.11186
 9995.702.9999
  955.608.999
   78.456.99
    91.0.89

    
(X^5 = 239878270976024981274624)

Reasoning:

Introduction.

The key clue is X^5 = A * ... * G.

The fact that A * ... * G is a fifth power means that when we factorise these numbers into primes,  we will get multiples of five of every prime.  (Indeed,  the index for each prime will be five times that of the same prime in the factorisation of X.)  Also,  every prime dividing any of C,D,E,F,G must also divide X.  So if there are too many different ones,  X will be forced too large.

So as other factors restrict our choices of C,D,E,... we will keep an eye on what primes can end up in the sequence.  

The main restriction on values is the summing mechanism in the wings:  each of J1, J2 is a 5-digit sum of one 4-digit, one 3-digit and two 2-digit numbers.  These means
J1,J2 <= 9999 + 999 + 99 + 99 = 11196
Since each digit of J1,J2 starts a labelled spot (except the last of J2) we have
J1,J2 >= 11110
Hence there is little free play in the values.  In particular each of J1,J2 starts with three 1s,  and the K,L,M,N values must be in total no more than 85 (or 86) less than there maximal values.  In particular K1,K2 >= 9910 and L1,L2 >= 910 dictating 9s in 6 cells.
From the above,  we have both digits of P1 forced, and
 P1 = 19
 
This is a key,  since X = P1 * M1 * W.
Hence X**5 is dividible by 19^5 (=2476099).
So we need at least 5 powers of 19 amongst A * B * C * D * E * F * G.

Another notable feature is that A ends in a 1.  Hence A factorises into odd primes.

Consider right-wing.

(As above)
Maximum values of K2,L2,M2,N2 is 9999,999,99,99 totalling 11196.
Therefore J2 <= 11196.
Also every digit of J2 except last is start of a labelled spot,  therefore nonzero.
So J2 >= 11110.

Now consider T2 = S2 + R2 + Q2 + P2.
Each digit in each of the numbers S2,R2,Q2,P2 being summed has the same place value as it does in the across numbers J2,K2,L2,M2,N2. 
Thus S2+R2+Q2+P2 = J2+K2+L2+M2+N2 - 10*n21 - j20
where n21 is the first (tens) digit of N2 and j20 is the last (ones) digit of J2.
Hence T2 = J2 + J2 - 10*n21 - j20
so T2 <= 2*J2 - 10 <= 22382
and T2 >= 2*J2 - 99 >= 22121
Thus T2 starts with the digits 2, 2 followed by a 1,2 or 3.

Consider chest.

V = T1 + T2
So V <= 99999 + 22383 = 122382
Hence V starts with 1 followed by 0,1 or 2.
Since V >= 100000,
T1 = V - T2
   >= 100000 - 22382 = 77618

So T1 starts with 7,8 or 9.

Then C = 712, 812 or 912.

712 = 8 * 89
812 = 4 * 7 * 29
912 = 16 * 3 * 19

If C = 712,  then
  T1 <= 79999 so V <= 102381
  so V's second digit is 0.
  As T1 >= 77618,  T1's second digit is 7,8 or 9.
  Then D = 702,802 or 902.
  
  702 = 2 * 27 * 13
  802 = 2 * 401
  902 = 2 * 11 * 41
  
  Any of these choices would leave us still needing 5 powers of 19
  and another four powers of 89 
  AND four more powers of one of 13, 401 or both 11 and 41 amongst E,F,G,A,B.
  
  Also,  requires X >= 2 * 89 * 19 * (39,401 or 451)
                     = 3382 * (39,401,451)
		       >= 3382 * 39 = 131898  which is too big - X only 5 digit.
  So C is not 712.
  

If C = 812, then
  X has factors 19 and 2,7,29.
  The product of these primes is 7714 ... which can't be further
  multiplied by any integer more than 12 and stay within 5 digits,
  so X cannot be forced to have another prime factor above 12.)
  V's second digit is 0 or 1, but
        -can only be 1 if T1 >= 8619 so D starts with 6,7,8 or 9
	-can only be 0 if T1 <= 8879 so D doesn't start with 9
  so D must be one of:
    102 = 2 * 3 * 17
    202 = 2 * 101
    302 = 2 * 151
    402 = 2 * 3 * 67
    502 = 2 * 251
    602 = 2 * 7 * 43
    702 = 2 * 27 * 13
    802 = 2 * 401
    612 = 4 * 9 * 17
    712 = 8 * 89
    812 = 4 * 7 * 29
    912 = 16 * 3 * 19
  Every one of these commits X to being divisible by another prime > 12, 
  which we have ruled out,  except D = 812 = 4 * 7 * 29.
  
  Then T1 = 88xxx, T2 = 22yzz where y = 1,2,3
  V = T1 + T2 = 11wwww
  The third digit of V will therefore 0 or 1 strictly
     according to whether or not xxx + yzz >= 1000
  So E must be one of:
    101
    102=2*3*17
    103
    201=3*67
    202=2*101
    203=7*29      <---
    301=7*43
    302=2*151
    303=3*101
    401
    402=2*3*67
    403=13*31
    501=3*167
    502=2*251
    503
    601
    602=2*7*43
    603=9*67
    701
    702=2*351
    713=23*31
    801=9*89
    812=4*7*29    <---
    813=3*271
    911
    912=2*3*19
    913=11*83
  The only choices that don't violate our rule about bringing new large
  primes into play are 203=7*29 and 812=4*7*29
  
  (a) If E=203,
    T1 = 882xx ,  T2 = 223yy <= 22382
    so V = T1 + T2 = 1105zz or 1106zz depending on the carry of xx+yy.
  ...
  ...
  eventually we conclude C is not 812
  
Hence C=912
...and so forth!
  
      
The Mosquito:

 9   8
742 106
5.411.4
2400240
 0 1 0
80   73

Cascade:

26            1342
   87         1159
      6       1122
      148      969
            2   22
          209   19
  5
  113        7   4

      489777288
              4
              1

Zoo Gate: (aka The Wig)

    549
   14692
1836   7722
7346   6836

Pythagoras 555:

(If A,B,C determined...)
e=f+j forces j 1's to be 0
(as does h=g+i)

    47320
    7530
    357
    20
66922



Pythagoras 456:

(i)

7
5  100049
9
99760

(ii)

4
8  100079
7
99960

comment (2024) - I don't know if I had a line of reasoning to arrive at these solutions or if I only checked by computer, which I did again now, verifying that this is the only two. Logic gets as far as ...
A < 10^4, (C + B) > C > 10^5
A^2 = C^2 - B^2 = (C + B)(C - B) < 10^8
so from the inequalities above,
C - B < 10^3, so B > 99000, C < 101000.
This means (C + B) > 2x10^5 - 1000, so in fact (C - B) < 506
narrowing us to B > 99494, C < 100506
We also have last digit of A is 9, so A odd => B even, C odd (by mod 4 considerations)
and as A^2 ends in 1, either [ B ends in 2/8 and C in 5 ] or [ B ends in 0, C in 1/9 ]

I also note, listing all 30 possibilities for A^2 + B^2 = C^2 with lengths 4,5 and 6, that 
6448 99840 100048 is the only one where the second last digits of B and C match, so maybe
we should have gone for a grid that shows that (loses A,B looking like legs of right triangle)

A rt B in this connected grid with only 1 solution: (there are 7 without C's connection)

99660
5
100113	<- could try to draw C angling up
3

Also unique:

.99981
.1
100395
.8

Newgate


  ?? ??
  ?????
 ??? ???
???   ???
??     ??


Little Wing

   ????
    ???
    ???
?  ???  ?
?????  ??
???? ???
???  ?
    ??
   ??



Skeleton Key

             2
             1
             9
   1         7
109891098910989
   0   0     0
       0     2
             1
  8          9
             7
             8


May '11 Monster

   685
  68 21
 41   33
79     73

   23
   55

  2 7 3
  75658
  50005

   11
  9009
 832238
 550055

53    34
19    72
   11
 673889
 437156

 755 755
 755 755

512   729
512   729

  686868
  414141

  262144
  531441


Return of the Mosquito



Moquito III

 5   1
404 101
0 192 6
8446428
 6 0 0
20   23

(i)
Key point: X = pV^3 + qV^2

where V = 101 so V^3 = 1030301 and V^2 = 10201 






Mosquito IV

 1   1
224 168
9 616 3
7529536
 9 6 8
14   56

(i)
The key to this one is that G = Y ^ 2 and X = Y ^ 6

Proof:
	Y = (A + B) / 2
	
	Let A = Y-d, B=Y+d   (we don't assume d>0)
	
	Z = (A-Y)Y(Y-B) = Y x d^2
	
	so YZ = Y^2 x d^2
	
	Then U = Y(Y + d),  V = Y(Y - d)
	
	G = (U + V)/2 = Y[ (Y+d) + (Y-d) ]/2 = Y^2
	
	UV = Y^2(Y^2 - d^2)
	
	so X = G(UV + YZ) = Y^2[ Y^2(Y^2 - d^2) + Y^2.d^2 ] = Y^2[ Y^2 ( Y^2 ) ] = Y^6

(ii)
Now the only 6th powers that are 7 digits long are (along with their squares):
	10: 1000000, 100
	11: 1771561, 121
	12: 2985984, 144
	13: 4826809, 169
	14: 7529536, 196
The only ones with the middle digit of the square and sixth power shared are Y=13, Y=14.
But Y = 13 we rule out (like Y = 10) because its value for X forces I to start with 0.

Hence Y = 14, G = 196, X = 7529536

(iii)
A,B >= 10 so |d| < 5.
We need d such that the second digit of 14 +- d is the same as the second digit of Y(Y-+d) = 14(14-+d) = 196 -+ 14d
The values of   d,  14 +- d and 196 -+ d are:
		0	14,14	196,196
		1	15,13	182,210
		2	16,12	168,224
		3	17,11	154,238
		4	18,10	140,252
By inspection,  only d=+-2 satisfies the requirement.

Hence (A,B,U,V) is (12,16,224,168) or (16,12,168,224),  Z = 56

(iv)
Finishing off requires considering the common factor of the vertical clues C,D,E,F,H,I.
By the last digits that we have,  some are odd,  and some not divisible by 5,  so neither
2 nor 5 can be a factor of the common factor.

Consider the two entries E,I which we now know to both end in 5.

I is 3_5, so I's factors are:
	305: 5 61
	315: 3 3 5 7
	325: 5 5 13
	335: 5 67
	345: 3 5 23
	355: 5 71
	365: 5 73
	375: 3 5 5 5
	385: 5 7 11
	395: 5 79

E is 1_5 or 2_5 depending on which way around we assign A,B,U,V.  Factors:
	105: 3 5 7
	115: 5 23
	125: 5 5 5
	135: 3 3 3 5
	145: 5 29
	155: 5 31
	165: 3 5 11
	175: 5 5 7
	185: 5 37
	195: 3 5 13

	205: 5 41
	215: 5 43
	225: 3 3 5 5
	235: 5 47
	245: 5 7 7
	255: 3 5 17
	265: 5 53
	275: 5 5 11
	285: 3 5 19
	295: 5 59

Thus the only two-digit factors that can be shared by E,I and by B,C,F,H (hence no 2 or 5 factor) are -
	11 ( 385, 165,275 )
	13 ( 325, 195 )
	21 ( 315, 105 )
	23 ( 345, 115 )

In the cases other than 11,  we have E starting with 1 and so V=168,B=16,  U=224,A=12.
Then
	H = 5_4 cannot be divisible by 13 (38x13 = 494, 48x13 = 624) 
	A = 2_7 cannot be divisible by 21 (7x21 = 147, 17x21 = 357)
	B = 4_2 cannot be divisible by 23 (14x23 = 322, 24x23 = 552)

Thus the common factor is 11.

If we assign V=224,  we get F = 4_6 which can't be divisible by 11.  (36*11 = 396, 46*11=506)

Hence A = 12, B = 16, U = 224, V = 168

(v)
All that is left is to fix the middle digits of various vertical clues.  In each case,
the range of ten numberws available can only contain one multiple of 11,  so the solution is unique:

C = 297, D = 462, E = 165, F = 836, H = 594, I = 385

Done.	



Mosquito V

 1   4
995 199
3 518 9
1200059
 9 1 2
10   30

(i) C,H,F < 1000 so C(H+F)<2000000 hence X starts with 1 and C cannot be too low

(ii) C ends in 1,  so mod 10:  X ~= H+F
	but X,F end with same digit so X ~= F,  hence H ~= 0,  ie last digit of H is 0.

(iii)
Let C=1000-c,F=1000-f,H=100h+y where 9<=c<900,0<f<900 0<h<10, 0<=y<100

By (ii) above, 10|H so y=10y' with y'<10

then X = (1000 - c)(1000 + 100h + y-f)
	= 10^6  +  h10^5  +  (y-f-c)10^3  -  hc.100  -  c(y-f)

We need X's first two digits to be 1 h so we need
	(y-f-c)10^3 - hc.100 - c(y-f) > 0

Clearly this requires f+c < y and y <= 90 so f,c each < 90 hence C,F > 910

(iv)
Now C=911,921,931,...,991. Here are the factors of those numbers:
	911: 911
	921: 3 307
	931: 7 7 19
	941: 941
	951: 3 317
	961: 31 31
	971: 971
	981: 3 3 109
	991: 991
But C=AB,  with A,B < 100.  This is only possible with:
	931 = 19.49
	961 = 31.31
But the second possibility is ruled out by B = A + Z requiring that B > A

Hence C = 931, A = 19, B = 49, Z = 30

(v)
Now c=69, so f,h are quite limited

1000000 = 931.1074 + 106
100000  = 931.107  + 383

X = 931 x ( 1000 + 100h + 10y' - f ) > 10^6 + h10^5 = ( 931 x 1074 + 106 ) + h x ( 931 x 107 + 383 )
	931 x ( 10y' - 74 - 7h - f ) > 106 + 383h
	        10y' - 74 - 7h - f > 106/931 +383h/931 > 0
		       74 + 7h + f < 10y' <= 90
			    7h + f < 16
Hence h = 1,2

(vi)
From F>910 (iii) and B = 49 (iv) we have V ending in 99 so V >= 199
Also,  since H ends in 0 so does Y and 10|Y.

Then H + Y = G + V

means	H = V + G - Y >= 199 + 100 - 90 = 209

Thus h = 2, V = 199

(vii)
Now X > 1200000 = 931.1288 + 872

Hence H + F > 1288

But H = 100h + y with h = 2 and y = 10y' <= 90 so H <= 290,  while F <= 999

Thus the only possibility is F = 999, H = 290 

(viii)
X = C x (H + F) = 931 x ( 999 + 290 ) = 931 x 1289 so    X = 1200059


(ix)
H + Y = G + V now gives us G - Y = H - V = 290 - 199 = 91

Since 10|Y this gives G's last digit as 1.

Since Y < 100,  G = Y + 91 < 200 so G's first digit is 1.
X's value gives us G's middle digit as 0.

Hence G = 101, Y = 10

(x)
From U = V x ( I - W ) and V = 199,  U = 99_,  we easily get U = 995, I - W = 5

We have W = _1_ and I = 5_3 so W = 518, I = 523

Done.




