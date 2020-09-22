<?
$xmlstring = <<<XML
<?xml version="1.0" encoding="utf-8"?>
<gpx xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd" version="1.1" creator="Satsee" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3">
  <metadata>
    <name>Route</name>
    <desc> </desc>
    <author>
      <name>Daniel MIHALCEA</name>
    </author>
    <link href="www.satsee.com">
      <text>Satsee</text>
    </link>
  </metadata>
  <trk>
    <trkseg>
    </trkseg>
  </trk>
</gpx>
XML;

$gpx = new SimpleXMLElement($xmlstring);
$path = $_COOKIE['path'];
$time = $_COOKIE['time'];

$path = str_replace(array('[[',']]','],['), array('','',';'), $path);
$points = explode(';', $path);
$tim = explode(',', $time);

$df = 'Y-m-d\TH:i:s';
$d = time();
$d0 = date($df,$d);
$i = 0;
date_default_timezone_set('UTC');

// include('vincenty.php');

foreach ($points as $p) {
	if ($i > 0) {
		$d += (float) $tim[$i-1];
	}
	$d1 = date($df,$d);;
	$c = explode(',', $p);
	$t = $gpx->trk->trkseg->addChild('trkpt');
	$t['lat'] = $c[0];
	$t['lon'] = $c[1];
	$t->addChild('ele', '0');
	$t->addChild('time', $d1);
	$i++;
}

$file = $gpx->asXML();
$filename = 'route.gpx';
$filesize = strlen($file);

// header('Content-Type: text/plain');echo "$d0\n";echo $file;print_r($tim);exit;

header('Content-Type: application/octet-stream');      
header('Content-Transfer-Encoding: text/xml');
header('Content-Length: '.$filesize);
header('Content-Disposition: attachment; filename="'.$filename.'"');
header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0, public');
header('Pragma: no-cache');
header('Expires: 0');
echo $file;
?>