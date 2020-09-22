<?
function sanitize_output($buffer) { // réduis le code HTML
	$search = array(
		'/\>[^\S ]+/s', //strip whitespaces after tags, except space
		'/[^\S ]+\</s', //strip whitespaces before tags, except space
		'/(\s)+/s',  // shorten multiple whitespace sequences
		'/<!--(.|\s)*?-->/'
		);
	$replace = array(
		'>',
		'<',
		'\\1',
		''
		);
	$buffer = preg_replace($search, $replace, $buffer);
	return $buffer;
}
ob_start("sanitize_output");
if (isset($_COOKIE['speed'])){$speed=(float)$_COOKIE['speed'];}else{$speed=12;}
if (isset($_COOKIE['conso'])){$conso=(float)$_COOKIE['conso'];}else{$conso=250;}
if (isset($_COOKIE['price'])){$price=(float)$_COOKIE['price'];}else{$price=1.2;}
if (isset($_COOKIE['unit'])){$unit=(float)$_COOKIE['unit'];}else{$unit=0;}
if (isset($_COOKIE['curen'])){$curen=$_COOKIE['curen'];}else{$curen='$';}
?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="viewport" content="initial-scale=1,minimum-scale=1,maximum-scale=1,target-densitydpi=medium-dpi,user-scalable=no" />
<link rel="apple-touch-startup-image" href="startup.png" />
<meta charset="utf-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link rel="apple-touch-icon" href="apple-touch-icon.png"/>
<title>Satsee - Route calculator</title>
<link rel="stylesheet" type="text/css"href="p.css" />
<link rel="icon" type="image/png" href="favicon.png" />
<meta property="og:title" content="Satsee - Route calculator" />
<meta property="og:url" content="http://www.satsee.com/" />
<meta property="og:image" content="http://www.satsee.com/logo.png" />
<meta property="og:description" content="Satsee offers route calculating software." />
</head>
<body>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js"></script>
<script src="./vincenty.js"></script>
<script src="http://maps.google.com/maps/api/js?sensor=false"></script>
<script src="./s.js"></script>
<script type="text/javascript">
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-27130384-1']);
  _gaq.push(['_setDomainName', '.satsee.com']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
// document.body.addEventListener('touchmove', function(event) {event.preventDefault();}, false);
</script>
<div>
	<div id="map_canvas"></div>
	<div id="calc">
		<div id="zp" class="zoom"><a href="#" title="+" onclick="if (zoom <21) map.setZoom(++zoom);return false;"></a></div>
		<div id="zm" class="zoom"><a href="#" title="-" onclick="if (zoom>3) map.setZoom(--zoom);return false;"></a></div>
		<input id="search" type="text" value="" onfocus="this.select();" onchange="address(this.value);" />&nbsp;
		<select id="map_type" onchange="change_map_type(this.value);">
			<option value="0">Satelite</option>
			<option value="1">Hybrid</option>
			<option value="2">Roadmap</option>
			<option value="3">Terrain</option>
			<option value="4" selected>Satsee</option>
		</select>
	</div>
</div>

<div id="logo" title="Satsee"></div>

<div id="confirm" style="position:absolute;width:100%;height:100%;top:0px;left:0px;z-index:99;background:rgb(0,0,0);background:rgba(0,0,0,0.8);display:none;">
	<div id="tbox" style="border:1px solid #fff;width:400px;height:200px;margin-left:-200px;margin-top:-100px;position:absolute;left:50%;top:50%;z-index:100;">
		<div id="cbar" style="background:#808080;height:24px;">
			<div id="box_ttl" style="float:left;color:#fff;padding:3px;">delete</div>
			<div id="cbtn" style="float:right;"><input type="button" value="X" title="close" onclick="$('#confirm').hide();" style="text-align:right;height:22px;" /></div>
			<div class="clear"></div>
		</div>
		<div id="cbody" style="position:absolute;background:#000;color:#fff;width:400px;height:176px;">
			<div style="margin:30px;"><span id="qm" style="display:inline-block;width:40px;height:38px;background:url(s.png) no-repeat -493px -332px;vertical-align:middle;" ></span> <span id="box_txt">which marker do you want to delete ?</span></div>
			<div id="box_btn" style="margin:30px;">
				<input type="button" value="All" title="All" onclick="$('#confirm').hide();reset_poly();" class="cbtn" />
				<input type="button" value="Last" title="Last" onclick="$('#confirm').hide();deleteLast();" class="cbtn" />
				<input type="button" value="None" title="Close" onclick="$('#confirm').hide();" class="cbtn" />
			</div>
		</div>
	</div>
</div>

<div id="stda" style="display:none;position:absolute;bottom:0px;background:#f00;width:100%;text-align:center;">
<span><a href="#" style="position:absolute;top:0px;right:0px;" onclick="$('#stda').hide();return false;">[&nbsp;X&nbsp;]</a></span><br />
this web application works better<br />
in standalone mode !<br />
click <img src="1.png" width="30" height="26" valign="middle" /> then<br />
"Add to Home Screen"<br />
|<br />
V
</div>
<script type="text/javascript">
if (!window.navigator.standalone && navigator.userAgent.match(/iPhone/i)){$("#stda").show();setTimeout("$('#stda').fadeOut('slow');", 5000);}
</script>
</body>
</html>
<?
ob_end_flush();
?>