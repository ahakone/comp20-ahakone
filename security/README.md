<h1> Geolocation Project Security Assessment </h1>
<p></p>

<h4> Description </h4>
<p>
	<a href="http://ahakone.github.io/comp20-ahakone/security/"> This page </a> includes my assessment of the <a href="https://github.com/ahakone/comp20-ahakone/tree/master/mmap"> client-side </a> and <a href="https://github.com/ahakone/comp20-ahakone/tree/master/whereintheworld"> server-side </a> security risks of the Marauder's Map API. The Marauder's Map consisted of using Google Maps' geolocation to display the user's current location on a map. Through black-box and white-box testing, there were at least 3 vulnerabilities: 
	<ul>
		<li> JavaScript injection </li>
		<li> Incorrect geolocation latitude and longitude </li> 
		<li> Successful querying that results in showing all (private and public) fields </li>
	</ul>
</p>