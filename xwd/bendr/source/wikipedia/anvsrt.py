#!/usr/bin/python

#anniversary sorter

fnam = "2020-anniversaries"

months = [ "Unknown" ,
	"January",	"February",	"March",
	"April",	"May",		"June",
	"July",		"August",	"September",
	"October",	"November",	"December" ,
	]


def parseInt( s ):
	"""
	Read integer from string, ignore leading and trailing spaces
	returns ( int value , bool clean )
	clean is True if there is only space before & after the (at least one) digits
	"""
	tot = 0
	started = False
	for i,c in enumerate( s ):
		if c.isdigit( ):
			tot = tot * 10 + int( c )
			started = True
		else:
			if started:
				# if after digits - done reading number
				return ( tot , s[ i : ].isspace( ) )
			else:
				if not c.isspace( ):
					return ( 0 , False )
	return ( tot , started )
def readDate( s ):
	"""read string: (space)Month(space)Day(space)"""
	for n,mon in enumerate( months ):
		if mon in s:
			mi = s.index( mon )
			mj = mi + len( mon )
			if s[ : mi ].isspace( ) or ( mi == 0 ):
				d , ok = parseInt( s[ mj : ] )
				if ok:
					# finally - date is valid
					return ( n , d )
				if s[ mj : ].isspace( ) or not s[ mj : ]:
					return ( n , 0 )
	return ( -1 , 0 )

def stripLeadSpace( s , i = 0 ):
	"""Strip lead space (if any) from string.
	if i specified, take that many characters away at start
	whether or not they are spaces"""
	l = len( s )
	while i < len( s ) and s[ i ].isspace( ):
		i += 1
	if i:
		return s[ i : ]
	return s

def processLines( lins , verb = 3 ):
	events = { }	# years (string) will be keys and then array by month number
			# and then dictionary with days (int) as keys
			# actual elements will be prefixed by "b:" or "d:" for births and deaths
	ongMonDay = None # (day,month) for ongoing entries
	year = 'xxxx'
	eType = ""   # prefix - 'b:' or 'd:' for births & deaths
	eTypes = { "Events" : "" , "Births" : "b:" , "Deaths" : "d:" }
		   
	for l,lin in enumerate( lins ):
		if not len(lin):
			if verb > 4:
				print "--- %4d : > > > < < <" % l
			continue
		if verb > 3:
			print "---  %4d : >>%s<<" % ( l , lin )
		if lin[ : 3 ] == "---" and lin[ -3 : ] == "---":
			year = lin[ 3 : -3 ]
			if verb:
				print "YEAR: %4s" % year
			if not year in events:
				events[ year ] = [ { } for mon in months ]
			ongMonDay = None
			continue
		if lin in eTypes:
			eType = eTypes[ lin ]
			if verb:
				print "TYPE: %s" % lin
			ongMonDay = None
			continue
		else:
			sp = lin.find( ':-' )
			if ( sp > -1 ):
				dat = lin[ : sp ]
				ev = eType + stripLeadSpace( lin , sp + 2 )
				n, day = readDate( dat )
				if n > -1:
					events[ year ][ n ].setdefault( day , [] ).append( ev )
					if verb > 2:
						print "%4s-%2d-%2d : %s" % ( year , n , day , ev )
					ongMonDay = None
					continue
				else:
					if verb:
						print "UNPARSED %4d : %s" % ( l , lin )
			else:
				n, day = readDate( lin )
				if n > -1:
					ongMonDay = n , day
					continue
				if ongMonDay:
					n , day = ongMonDay
					ev = eType + stripLeadSpace( lin )
					events[ year ][ n ].setdefault( day , [] ).append( ev )
					if verb > 2:
						print "%4s-%2d-%2d : %s" % ( year , n , day , ev )
				else:
					if verb:
						print "UNPARSED %4d : %s" % ( l , lin )
	print "DONE!"
	print events['2000'][12][23]
	return events

# sorted by months - for each months simlpy an array of tuples: ( day , year , event )
def monthlyLists( events ):
	outp = [ [ ] for m in months ]
	for ( year , evY ) in events.items( ):
		for ( m , evYM ) in enumerate( evY ):
			for day in evYM:
				for ev in evYM[ day ]:
					outp[ m ].append( ( m , day , year , ev ) )
	# We ordered the tuples so within month first ordered by day, then year
	for mL in outp:
		mL.sort( )
	return outp
##L = None
#global L

#def go():
	#L = processLines( lins )

lins = file( fnam ).read( ).splitlines( )
L = processLines( lins , 0 )
M = monthlyLists( L )
for ( m , mL ) in enumerate( M ):
	print months[ m ].upper()
	print
	for x in mL:
		print "%2d %2d %4s %s" % x
