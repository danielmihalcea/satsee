<?
if (preg_match("/iPhone/i", $_SERVER["HTTP_USER_AGENT"])) {
	// header ("Location: phone.php"); 
}
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
<html>
<head>
<meta name="viewport" content="user-scalable=no, width=700">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Satsee - Route calculator</title>
<link rel="stylesheet" type="text/css"href="s.css">
<link rel="icon" type="image/png" href="favicon.png">
<meta property="og:title" content="Satsee - Route calculator">
<meta property="og:url" content="http://satsee.mihalcea.fr/">
<meta property="og:image" content="http://satsee.mihalcea.fr/logo.png">
<meta property="og:description" content="Satsee offers route calculating software.">
</head>
<body>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js"></script>
<script src="./vincenty.js"></script>
<script src="https://maps.google.com/maps/api/js?key=ABC"></script>
<script src="./s.js"></script>
<script>
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-27130384-1']);
  _gaq.push(['_setDomainName', '.satsee.com']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
</script>
<div id="map_canvas"></div>

<div id="logo" title="Satsee"></div>

<div id="topmenu">
	<div id="tbb" class="wrap">
		<div id="zp" class="zoom"><a href="" title="+" onclick="if (zoom <21) map.setZoom(++zoom);return false;"></a></div>
		<div id="zm" class="zoom"><a href="" title="-" onclick="if (zoom>3) map.setZoom(--zoom);return false;"></a></div>
		<div id="tbbmenu">
			<a href="" id="mhlp" class="mbtn" title="Help" style="cursor:help;" onclick="$('#help').show('slow');return false;">Help</a>
			<a href="" id="mprn" class="mbtn" title="print route" onclick="printRt();return false;">Print</a>
			<a href="gpx.php" id="mexp" class="mbtn" title="export to GPX">Export</a>
			<a href="" id="mdel" class="mbtn" title="delete marker" onclick="showDel();return false;">Delete</a>
		</div>
		<div id="rdv"></div>
		<span id="coords">Lat: <span class="coord">43° 42'32"N</span> Lon: <span class="coord">7° 20'13"E</span></span>
		<input id="search" type="text" value="" onfocus="this.select();" onchange="address(this.value);">&nbsp;
		<select id="map_type" onchange="change_map_type(this.value);">
			<option value="0">Satelite</option>
			<option value="1">Hybrid</option>
			<option value="2">Roadmap</option>
			<option value="3">Terrain</option>
			<option value="4" selected>Satsee</option>
		</select>
	</div>
</div>


<div id="toolbox">
	<div id="tooltop">
		<div id="menu" class="wrap">
			<div id="m1" class="menu mi1"><a href="" title="Setup" onclick="select_menu(1);return false;">&nbsp;</a></div>
			<div id="m2" class="menu mi2"><a href="" title="Route calculator" onclick="select_menu(2);return false;">&nbsp;</a></div>
			<div id="m3" class="menu mi3"><a href="" title="Path details" onclick="select_menu(3);return false;">&nbsp;</a></div>
		</div>
	</div>

	<div id="toolmid">
		<!-- Setup -->
		<div id="tbc1" class="wrap">
				<form>
				<div id="tbc1_1">
					<span class="stplbl">Cruise speed :</span> <input type="text" id="inp_speed" value="<?=$speed?>" onchange="coo();update_calc();" onkeyup="coo();update_calc();" size="6"> <span class="lbl_speed">kn</span><br>
					<span class="stplbl">Fuel consumption :</span> <input type="text" id="inp_conso" value="<?=$conso?>" onchange="coo();update_calc();" onkeyup="coo();update_calc();" size="6"> <span class="lbl_vol">L</span>/h<br>
				</div>
				<div id="tbc1_2">
					<span class="stplbl">Fuel rate :</span> <input type="text" id="inp_rate" value="<?=$price?>" onchange="coo();update_calc();" onkeyup="coo();update_calc();" size="6">
					<select id="inp_mo" title="currency" onchange="coo();update_calc();">
					<option value="€">€ EUR</option>
					<option value="$">$ USD</option>
					<option value="£">£ GBP</option>
					<option value="¥">¥ YEN</option>
					<option value="-">other</option>
					</select><br>
					<div style="float:left;margin-right:80px;">Units :</span>&nbsp;</div>
					<div class="unit"><label for="r3">nautic</label><br><input <?if ($unit==0){echo 'checked';}?> type="radio" name="unit" value="nautic" id="r3" onclick="change_unit(0);coo();update_calc();"></div>
					<div class="unit"><hr class="vr"></div>
					<div class="unit"><label for="r1">imperial</label><br><input <?if ($unit==1){echo 'checked';}?> type="radio" name="unit" value="imperial" id="r1" onclick="change_unit(1);coo();update_calc();"></div>
					<div class="unit"><hr class="vr"></div>
					<div class="unit"><label for="r2">metric</label><br><input <?if ($unit==2){echo 'checked';}?> type="radio" name="unit" value="metric" id="r2" onclick="change_unit(2);coo();update_calc();"></div>
					<div class="clear"></div>
					<script type="text/javascript">
					u = <?=$unit?>;
					$("#inp_mo").val("<?=$curen?>");
					</script>
				</div>
				<div class="clear"></div>
				</form>
		</div>
		<!-- Route calculator -->
		<div id="tbc2" class="wrap">
			<div id="tbc2_1">
				<div>Distance : <span class="result"><span id="res_dist">0</span> <span class="lbl_dist">NM</span></span></div>
				<div>Duration : <span class="result"><span id="res_time">0 hrs</span></span></div>
				<div>Fuel consumption : <span class="result"><span id="res_vol">0</span> <span class="lbl_vol">L</span></span></div>
				<div>Cruise fuel rate : <span class="result"><span id="res_price">0</span> <span class="lbl_mo">€</span></span></div>
			</div>

		</div>
		<!-- Path details -->
		<div id="tbc3" class="wrap">
				<div id="tbc1_3_path">no path</div>
		</div>
	</div>
</div>

<div id="confirm" style="position:absolute;width:100%;height:100%;top:0px;left:0px;z-index:99;background:rgb(0,0,0);background:rgba(0,0,0,0.8);display:none;">
	<div id="tbox" style="border:1px solid #fff;width:400px;height:200px;margin-left:-200px;margin-top:-100px;position:absolute;left:50%;top:50%;z-index:100;">
		<div id="cbar" style="background:#808080;height:24px;">
			<div id="box_ttl" style="float:left;color:#fff;padding:3px;">delete</div>
			<div id="cbtn" style="float:right;"><input type="button" value="X" title="close" onclick="$('#confirm').hide();" style="text-align:right;height:22px;"></div>
			<div class="clear"></div>
		</div>
		<div id="cbody" style="position:absolute;background:#000;color:#fff;width:400px;height:176px;">
			<div style="margin:30px;"><span id="qm" style="display:inline-block;width:40px;height:38px;background:url(s.png) no-repeat -493px -332px;vertical-align:middle;" ></span> <span id="box_txt">which marker do you want to delete ?</span></div>
			<div id="box_btn" style="margin:30px;">
				<input type="button" value="All" title="All" onclick="$('#confirm').hide();reset_poly();" class="cbtn">
				<input type="button" value="Last" title="Last" onclick="$('#confirm').hide();deleteLast();" class="cbtn">
				<input type="button" value="None" title="Close" onclick="$('#confirm').hide();" class="cbtn">
			</div>
		</div>
	</div>
</div>

<div id="help" style="display:none">
	<div id="helpx">
	<a href="" title="Close" onclick="$('#help').hide('slow');return false;">&nbsp;</a>
	</div>
	<div id="helpc">
		<h1>- Help -</h1>
		<p>This service helps you plan routes with you vessel by assessing the duration, fuel consumption and cost of your trip.</p>
		<p>You have to setup the characteristics of your vessel in the [Setup] menu according on yours.</p>
		<p>Your data is stored on your computer in a cookie for a 30-day period. Nothing is stored on the server, this service is totally anonymous.</p>
		<p>You can draw a path by clicking on the map with your mouse. the pas is editable : you can drag the plots and delete them by right clicking on it. You can also add a plot in the middle of the path by clicking a segment.</p>
		<p>contact : <a href="mailto:contact@satsee.com">contact@satsee.com</a></p>
		<iframe width="640" height="480" src="http://www.youtube.com/embed/yBBgKAPlFLo?rel=0" frameborder="0" allowfullscreen></iframe>
	</div>
</div>

<span title="WebDesign &copy; by Daniel Mihalcea" style="position:absolute;bottom:19px;right:0px;">Webdesign<a href="http://mihalcea.fr/" target="_blank"><img src="mi.png" alt="Daniel Mihalcea" width="16" height="14" style="border:0;vertical-align:middle;"></a></span>
</body>
</html>
<?
ob_end_flush();
?>
