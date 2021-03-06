var map;
var polyOptions = {strokeColor: '#000000', strokeOpacity: 1.0, strokeWeight: 3, geodesic: true};
var markersArray = [];
var linesArray = [];
var info = new google.maps.InfoWindow();
var ico = new google.maps.MarkerImage("s.png", new google.maps.Size(18,25), new google.maps.Point(302,306), new google.maps.Point(9,25));
var shd = new google.maps.MarkerImage("s.png", new google.maps.Size(19,20), new google.maps.Point(283,311), new google.maps.Point(0,19));
var icoa = new google.maps.MarkerImage("s.png", new google.maps.Size(19,35), new google.maps.Point(380,296), new google.maps.Point(10,35));
var shda = new google.maps.MarkerImage("s.png", new google.maps.Size(24,27), new google.maps.Point(356,304), new google.maps.Point(0,27));
var icos = new google.maps.MarkerImage("s.png", new google.maps.Size(18,25), new google.maps.Point(338,306), new google.maps.Point(9,25));
var icosa = new google.maps.MarkerImage("s.png", new google.maps.Size(19,35), new google.maps.Point(418,296), new google.maps.Point(10,35));
var icof = new google.maps.MarkerImage("s.png", new google.maps.Size(18,25), new google.maps.Point(320,306), new google.maps.Point(9,25));
var icofa = new google.maps.MarkerImage("s.png", new google.maps.Size(19,35), new google.maps.Point(399,296), new google.maps.Point(10,35));

var u = 0;
var unit = [];
const gi = document.getElementById.bind(document); // racourci syntaxique
const gn = document.getElementsByClassName.bind(document); // racourci syntaxique
unit[0] = {"dist": 1/1852, "volum": 1, "speed": 1/1.852}; // nautic miles, liter, knots
unit[1] = {"dist": 1/1605, "volum": 1/3.785411784, "speed": 1/1.605}; // miles, galon, mph
unit[2] = {"dist": 1/1000, "volum": 1, "speed": 1}; // km, liter, kph
var unit_lbl = [];
unit_lbl[0] = {"dist": "NM", "vol": "L", "speed": "kn"};
unit_lbl[1] = {"dist": "mi", "vol": "gal", "speed": "mph"};
unit_lbl[2] = {"dist": "km", "vol": "L", "speed": "kph"};
var listener1;
var tool_route = false;
var zoom = 3;

function createCookie(name,value,days) {
    var expires="";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*86400000)); // 86400000 = 24*60*60*1000 = nombre de milisecondes dans 24h (1 jour ne fait pas toujours 24h mais ici ça ne pose pas de problème)
        expires = "; expires="+date.toUTCString();
    }
    document.cookie = name+"="+value+expires+"; path=/";
}
function getCookie(sName) {
        var oRegex = new RegExp("(?:; )?" + sName + "=([^;]*);?");
        if (oRegex.test(document.cookie)) {
                return decodeURIComponent(RegExp["$1"]);
        } else {
                return null;
        }
}
function coo(){
    createCookie("speed",parseFloat(gi("inp_speed").value),30);
    createCookie("conso",parseFloat(gi("inp_conso").value),30);
    createCookie("price",parseFloat(gi("inp_rate").value.replace(",", ".")),30);
    createCookie("unit",u,30);
    createCookie("curen",gi("inp_mo").value,30);
    createCookie("zoom",zoom,30);
    createCookie("lat",map.getCenter().lat(),30);
    createCookie("lng",map.getCenter().lng(),30);
}
function lat_dec2deg(v) {
    var deg = Math.floor(v);
    var min = (v - deg)*60;
    var sec = Math.floor((min-Math.floor(min))*60);
    var o=(v<0)?"S":"N";
    return Math.abs(deg).toString()+"° "+Math.floor(min).toString()+"'"+sec.toString()+"\""+o;
}
function lng_dec2deg(v) {
    var deg = Math.floor(v);
    var min = (v - deg)*60;
    var sec = Math.floor((min-Math.floor(min))*60);
    var o=(v<0)?"W":"E";
    return Math.abs(deg).toString()+"° "+Math.floor(min).toString()+"'"+sec.toString()+"\""+o;
}
function hour(t) {
    var day = 0;
    var hrs = Math.floor(t);
    if (hrs >= 24) {
        day = Math.floor(t/24);
        hrs -= day*24;
    }
    var min = Math.ceil(((t-day*24) - hrs)*60);
    if (min > 59) {
        hrs++;
        min-=60;
    }
    /* var sec = Math.floor((min-Math.floor(min))*60);*/
    return ((day>0)?(day.toString()+" day "):(""))+hrs.toString()+" hrs "+min.toString()+" min";
}
function change_unit(a) {
    var u0 = u;
    u = a;
    gi("inp_speed").value = parseFloat(gi("inp_speed").value) / unit[u0].speed * unit[u].speed;
    gi("inp_conso").value = parseFloat(gi("inp_conso").value) / unit[u0].volum * unit[u].volum;
}
function update_class(c, h) {
    var n = gn(c);
    for (let i = 0; i< n.length; i++) {
        n[i].innerHTML = h;
    }
}
function update_unit() {
    update_class("lbl_dist", unit_lbl[u].dist);
    update_class("lbl_vol", unit_lbl[u].vol);
    update_class("lbl_speed", unit_lbl[u].speed);
    update_class("lbl_mo", gi("inp_mo").value);
}
function round(x,d) {
    var t = Math.pow(10,d);
    return ~~(x*t+.5)/t; // Math.round(x*t)/t;
}
function zf(i){return i<10?("0"+i):i;}
function m2s(){
    var i,l,p,s;
    l = markersArray.length;
    p = markersArray[0].getPosition();
    s = "[["+p.lat()+","+p.lng()+"]";
    for(i=1;i<l;i++){
        p = markersArray[i].getPosition();
        s += ",["+p.lat()+","+p.lng()+"]"
    }
    s+="]";
    return s;
}
function s2m(s){
    var a,i,l;
    a = eval(s);
    l = a.length;
    reset_poly();
    console.log(l);
    let p = 1;
    if (l > 100) p = 5;
    // if (l > 1000) p = 50;
    for (i=0;i<l;i+=p) {
        // console.log(i);
        addLatLng(new google.maps.LatLng(a[i][0],a[i][1]));
    }
    update_poly(true);
}
function add2seg(n,c){
    var i,l,p,a,b;
    l = markersArray.length;
    a = [];
    for(i=0;i<n;i++){
        p = markersArray[i].getPosition();
        b = [p.lat(),p.lng()];
        a.push(b);
    }
    b = [c.lat(),c.lng()];
    a.push(b);
    for(;i<l;i++){
        p = markersArray[i].getPosition();
        b = [p.lat(),p.lng()];
        a.push(b);
    }
    reset_poly();
    for (i=0;i<=l;i++) {
        addLatLng(new google.maps.LatLng(a[i][0],a[i][1]));
    }
    update_poly(true);
}
function uMark(){
    var i;
    i=0;
    markersArray[i].setIcon(icos);
    for(i=1;i<markersArray.length-1;i++) {
        markersArray[i].setIcon(ico);
    }
    if(markersArray.length>1) {
        markersArray[i].setIcon(icof);
    }
}
function printRt(){
    var nWin;
    nWin = window.open("","","width=600,height=800");
    nWin.document.write('<!DOCTYPE html><html><head><title>Satsee - Route calculator</title><link rel="stylesheet" type="text/css"href="default.css" /></head><body>');
    nWin.document.write("<h1>Satsee route calculator</h1>");
    nWin.document.write("<p>Navigation summary :</p>");
    nWin.document.write("<p>Distance : "+gi("res_dist").innerHTML+" "+gn("lbl_dist")[0].innerHTML+"<br>Duration : "+gi("res_time").innerHTML+"<br>Fuel consumption : "+gi("res_vol").innerHTML+" "+gn("lbl_vol")[0].innerHTML+"<br>Cruise fuel rate : "+gi("res_price").innerHTML+" "+gn("lbl_mo")[0].innerHTML+"</p>");
    nWin.document.write("<p>Route details :</p>");
    nWin.document.write(gi("tbc1_3_path").innerHTML);
    nWin.document.write('</body></html>');
    nWin.focus();
    nWin.print();
 
}
function update_calc() {
    var dist = 0;
    var size = markersArray.length;
    var pdet = "no data";
    var speed = parseFloat(gi("inp_speed").value);
    var th = "";
    update_unit();
    if(size>0) {
        createCookie("path",m2s(),30);
    } else {
        createCookie("path","",-30);
    }
    if (size>1) {
        pdet = "";
        var i=1;
        for (;i<size; i++) {
            var lat1, lat2, lng1, lng2, p1, p2, v, h, ht;
            p1 = markersArray[i-1].getPosition();
            p2 = markersArray[i].getPosition();
            lat1 = p1.lat();
            lng1 = p1.lng();
            lat2 = p2.lat();
            lng2 = p2.lng();
            v = distVincenty(lat1, lng1, lat2, lng2);
            var cls = "";
            if (i/2 === Math.round(i/2)) {
                cls = "pdetp";
            } else {
                cls = "pdeti";
            }
            var head = round(v.initialBearing,1);
            if (head<0) {head+=360;}
            h = v.distance*unit[u].dist/speed;
            ht = Math.round(h*360000)/100;
            if (i === 1) {
                th += ht.toString();
            } else {
                th += ","+ht.toString();
            }
            var j = i.toString();
            pdet += '<div id="pdet'+j+'" class="pdet '+cls+'" onmouseover="hline('+j+');" onmouseout="uline('+j+');">&nbsp;<span class="c1">'+zf(j)+'</span> - <span class="c2">heading : '+head.toString()+'°</span> - <span class="c3">distance : '+round(v.distance*unit[u].dist,1).toString()+unit_lbl[u].dist+'</span> - <span class="c4">time : '+hour(h)+'</span></div>\n';
            dist += parseFloat(v.distance);
        }
        createCookie("time",th,30);
    }
    gi("tbc1_3_path").innerHTML = pdet;
    gi("res_dist").innerHTML = round(dist*unit[u].dist,3);
    var time = 0;
    if (speed !== 0) {
        time = dist*unit[u].dist/speed;
    }
    gi("res_time").innerHTML = hour(time);
    var conso = parseFloat(gi("inp_conso").value);
    gi("res_vol").innerHTML = round(time*conso,1);
    var price = parseFloat(gi("inp_rate").value.replace(",", "."));
    gi("res_price").innerHTML = round(time*conso*price,2);
    if (markersArray.length>1) {gi("pdet"+(markersArray.length-1)).scrollIntoView();}
    if (size > 0) uMark();
}
function hide_poly() {
    if (linesArray) {
        for (let i in linesArray) {
            if (Object.prototype.hasOwnProperty.call(linesArray, i)) {
                linesArray[i].getPath().clear();
            }
        }
        linesArray.length = 0;
    }
}
function hline(i){
    linesArray[i].setOptions({strokeColor:"#ff9933",strokeWeight:5});
}
function uline(i){
    linesArray[i].setOptions({strokeColor:"#000000",strokeWeight:3});
}
function update_poly(c) {
    if (c){
        hide_poly();
        var size = markersArray.length;
        if (size>1) {
            var i=1;
            for (;i<size; i++) {
                linesArray[i] = new google.maps.Polyline(polyOptions);
                linesArray[i].setMap(map);
                linesArray[i].dsbid=i.toString();
                linesArray[i].getPath().push(markersArray[i-1].position);
                linesArray[i].getPath().push(markersArray[i].position);
                google.maps.event.addListener(linesArray[i], 'mouseover', function(){this.setOptions({strokeColor:"#ff9933",strokeWeight:5});gi("pdet"+this.dsbid).classList.add("pdeta");gi("pdet"+this.dsbid).scrollIntoView();});
                google.maps.event.addListener(linesArray[i], 'mouseout', function(){this.setOptions({strokeColor:"#000000",strokeWeight:3});gi("pdet"+this.dsbid).classList.remove("pdeta");});
                google.maps.event.addListener(linesArray[i], 'click', function(event){add2seg(this.dsbid,event.latLng);});
            }
        }
    }
    update_calc();
}
function reset_poly() {
    var i;
    if (markersArray) {
        for (i in markersArray) {
            if (Object.prototype.hasOwnProperty.call(markersArray, i)) {
                markersArray[i].setMap(null);
            }
        }
        markersArray.length = 0;
    }
    hide_poly();
    update_calc();
}
function deleteMarker(n){
    markersArray[n].setMap(null);markersArray.splice(n,1);s2m(m2s());
}
function deleteLast(){
    deleteMarker(markersArray.length-1);
}
function myConfirm(a,b,c){
    var i,s;
    gi("box_ttl").innerHTML = a;
    gi("box_txt").innerHTML = b;
    s = "";
    for (i in c){
        var f = c[i];
        s += '<input type="button" value="'+i+'" title="'+i+'" onclick="'+f+'" class="cbtn">';
    }
    gi("box_btn").innerHTML = s;
    gi("confirm").style.display = "block";
}
function cHide(){gi("confirm").style.display = "none";} // hide myConform
function showDel(){
    myConfirm("delete", "Which marker do you want to delete ?",{All:"cHide();reset_poly();",Last:"cHide();deleteLast();", None:"cHide();"});
}
function showImp(){
    gi("box_ttl").innerHTML = "import GPX";
    gi("box_txt").innerHTML = "Select GPX file";
    gi("box_btn").innerHTML = '<input type="file" id="input" onchange="loadGPX(this.files[0])">';
    gi("confirm").style.display = "block";
}
var file = new FileReader();
var xml;
function loadGPX(f) {
    cHide();
    file.readAsText(f);
    file.onload = function(e) {
        let parser = new DOMParser();
        xml = parser.parseFromString(file.result,"text/xml");
        trkpt = xml.getElementsByTagName("trkpt");
        let s = "[";
        for (let i=0; i<trkpt.length; i++){
            s += "[" + trkpt[i].getAttribute('lat') + "," + trkpt[i].getAttribute('lon') + "],";
        }
        s+="]";
        s2m(s);
    }
}
function rClick(n){
    myConfirm("delete marker", "Are you sure you want to delete marker #"+(n+1).toString()+" ?",{Yes:"deleteMarker("+n.toString()+");cHide();",No:"cHide();"});
    // if(confirm("Delete marker ?"+(n+1))){deleteMarker(n);}
}
function infocont(m) {
    var n = m.dsbid;
    return '<h3>Marker #'+(n+1)+'</h3>'+
    '<p>Latitude : '+lat_dec2deg(m.position.lat())+'<br />Longitude : '+lng_dec2deg(m.position.lng())+'</p>'+
    '<p><input type="button" value="delete" onClick="setTimeout(\'info.close();rClick('+n+');\',100);" class="wbtn" /></p>';
}
function infow(m) {
    info.setContent(infocont(m));
    info.open(map,m);
}
function addLatLng(latLng) {
    // console.time("addLatLng");
    var marker = new google.maps.Marker({
     position:latLng,
     draggable:true,
     cursor:"move",
     icon:ico,
     shadow:shd,
     title:"#"+(markersArray.length+1),
     map:map
    });
    marker.dsbid = markersArray.length;
    
    google.maps.event.addListener(marker, 'mouseup', function(){update_poly(true);});
    google.maps.event.addListener(marker, 'rightclick', function(){rClick(this.dsbid);});
    google.maps.event.addListener(marker, 'mouseover', function(){if(this.dsbid===0){this.setIcon(icosa);}else if(this.dsbid===(markersArray.length-1)){this.setIcon(icofa);}else{this.setIcon(icoa);} this.setShadow(shda);});
    google.maps.event.addListener(marker, 'mouseout', function(){if(this.dsbid===0){this.setIcon(icos);}else if(this.dsbid===(markersArray.length-1)){this.setIcon(icof);}else{this.setIcon(ico);} this.setShadow(shd);});
    google.maps.event.addListener(marker, 'drag', function(){info.setContent(infocont(this));update_poly(false);});
    google.maps.event.addListener(marker, 'click', function(){infow(this);});
    markersArray.push(marker);
    // update_poly(true);
    // if (markersArray.length>1) {gi("pdet"+(markersArray.length-1)).scrollIntoView();}
    // update_calc();
    // uMark();
    // console.timeEnd("addLatLng");
}
var ctm,cl,cs;
ctm = 0;
cs = false;
function addl() {
    addLatLng(cl);
    update_poly(true);
    cs = false;
}
function manageClick(l){
    if (cs){
        clearTimeout(ctm);
        cs = false;
        return;
    }
    cs = true;
    cl = l;
    ctm = setTimeout("addl()",100);
}
function route(s) {
    if(tool_route===s){return;}
    if (s) {
        listener1 = google.maps.event.addListener(map, "click", function(event){manageClick(event.latLng)});
        listener2 = google.maps.event.addListener(map, "dblclick", function(event){cs = true;manageClick(event.latLng)});
        update_poly(true);
    } else {
        google.maps.event.removeListener(listener1);
        google.maps.event.removeListener(listener2);
        hide_poly();
    }
    if (markersArray) {
        var i;
        for (i in markersArray) {
            if (Object.prototype.hasOwnProperty.call(markersArray, i)) {
                markersArray[i].setVisible(s);
            }
        }
    }
    tool_route = s;
}
function update_zoom() {
    zoom = map.getZoom();
    coo();
}
function update_center() {
    var z = new google.maps.MaxZoomService();
    z.getMaxZoomAtLatLng(map.getCenter(), function(mz){
        map.setOptions({maxZoom:mz.zoom});
    });
    update_zoom();
}
function init_map() {
    var latitude = parseFloat(getCookie("lat"));if (isNaN(latitude)){latitude=30;}
    var longitude = parseFloat(getCookie("lng"));if (isNaN(longitude)){longitude=0;}
    zoom = parseInt(getCookie("zoom"));if (isNaN(zoom)){zoom=3;}
    var latlng = new google.maps.LatLng(latitude,longitude);
    var myOptions = {zoom:zoom, center:latlng, mapTypeId:"satsee", disableDefaultUI:true, scaleControl:true, minZoom:3};
    map = new google.maps.Map(gi("map_canvas"), myOptions);
    
    var styless = [
        {"featureType":"road","elementType":"all","stylers":[{"visibility":"off"}]},
        {"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"}]},
        {"featureType": "administrative","elementType": "geometry","stylers": [{"visibility":"off" }]},
        {"featureType": "administrative.country","elementType":"all","stylers":[{"visibility":"on"}]},
        {"featureType": "poi","elementType":"all","stylers":[{"visibility":"off"}]},
        {"featureType": "transit","elementType":"all","stylers":[{"visibility":"off"}]},
        {"featureType": "transit.line.ferry","elementType":"geometry.fill","stylers":[{"color":"#613586"},{"visibility":"on"}]},
        {"featureType": "landscape","elementType":"all","stylers":[{"hue":"#ffffff"},{"lightness":0}]},
        {"featureType": "water","elementType":"all","stylers":[{"color":"#aad5ff"},{"visibility":"on"}]}
    ];
    var styledMapOptions = {name: "Satsee"};
    var ssMapType = new google.maps.StyledMapType(styless, styledMapOptions);
    map.mapTypes.set('satsee', ssMapType);

    google.maps.event.addListener(map, "mousemove", function(event) {
     gi("coords").innerHTML = "Lat: <span class=\"coord\">"+lat_dec2deg(event.latLng.lat().toString())+"</span> Lon: <span class=\"coord\">"+lng_dec2deg(event.latLng.lng().toString())+"</span>";
    });
    google.maps.event.addListener(map, "zoom_changed", update_zoom);
    google.maps.event.addListener(map, "center_changed", update_center);
    update_zoom();
    var path = getCookie("path");
    if (path !== null){
        s2m(path);
    }
}
function address(s) {new google.maps.Geocoder().geocode({address:s}, function(r){map.fitBounds(r[0].geometry.viewport);});}
function select_menu(n) {
    var i;
    route(true);
    for (i=1; i<=3; i++) {
        gi("m"+i).classList.add("mi"+i);
        gi("m"+i).classList.remove("ma"+i);
        gi("tbc"+i).style.display = "none";
    }
    if (n===0) {return;}
    gi("m"+n).classList.remove("mi"+n);
    gi("m"+n).classList.add("ma"+n);
    gi("tbc"+n).style.display = "block";
}
function change_map_type(s) {
    switch (s) {
        case "0": map.setMapTypeId(google.maps.MapTypeId.SATELLITE); break;
        case "1": map.setMapTypeId(google.maps.MapTypeId.HYBRID); break;
        case "2": map.setMapTypeId(google.maps.MapTypeId.ROADMAP); break;
        case "3": map.setMapTypeId(google.maps.MapTypeId.TERRAIN); break;
        case "4": map.setMapTypeId("satsee"); break;
        default: map.setMapTypeId(google.maps.MapTypeId.SATELLITE); break;
    }
    update_zoom();
}

function GetDomOffset(o,p) {
    var i = 0;
    while (o && o.tagName != 'BODY') {
        eval('i += o.' + p + ';');
        o = o.offsetParent;
    }
    return i;
}

// $(document).ready(function(){
document.addEventListener("DOMContentLoaded", function() {
    init_map();
    select_menu(2);
    gi("search").onmousedown = function(){
        var e=arguments[0]||event;
        if(e.clientX-GetDomOffset(gi("search"),"offsetLeft")<17){
            address(gi("search").value);
        }
    }
});
