/**************************************************************************
 * svgavatars.core.js - jQuery script for creating vector avatars
 * @version: 1.3 (20.01.2014)
 * @requires jQuery v1.8.2 or later
 * @URL http://svgavatars.com
 * @author DeeThemes (http://codecanyon.net/user/DeeThemes)
**************************************************************************/
;
var randomAvatarFunc = 1;
jQuery(document).ready(function($){
"use strict";

window.addEventListener('load', function() {

  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } 
});

//Global options
var path_to_folder = '/svgavatars/',//the path to main SVG Avatars folder from root dir of your site. The slashes "/" are important!
	delta_sat = 0.1, //the step of saturation color change in HSV (HSB) mode (10% by default)
	delta_val = 0.06, //the step of value (brightness) color change in HSV (HSB) mode (6% by default)
	color_theme = 'dark'; //must be exactly 'light' or 'dark'

var body_zone_titles = {
	backs:'basic',
	faceshape:'shape',
	chinshadow:'',//not displayed, just for compatibility
	facehighlight:'',//not displayed, just for compatibility
	humanbody:'',//not displayed, just for compatibility
	clothes:'basic',
	hair:'on head',
	ears:'ears',
	eyebrows:'eyebrows',
	eyesback:'',//not displayed, just for compatibility
	eyesiris:'iris',
	eyesfront:'eye shape',
	mouth:'mouth',
	nose:'nose',
	glasses:'glasses',
	mustache:'mustache',
	beard:'beard'
};


var postingInProgress = false;
var positions = {};
var resetAvatar;

//Extend SVGJS lib with special methods for controls
SVG.extend(SVG.Element, {
	svgaUp: function(times, step) {
		var times = times ? times : 3,
				step = step ? step : ud_step,
				leftright = this.data('leftright'),
				updown = this.data('updown');
		if ( updown > -(times*step) ) {
			this.move(leftright, updown-step);
			this.data('updown', updown-step-0.0000001);
			return true;
		};

		return false;
	},
	svgaDown: function(times, step) {
		var times = times ? times : 3,
				step = step ? step : ud_step,
				leftright = this.data('leftright'),
				updown = this.data('updown');
		if ( updown < times*step ) {
			this.move(leftright, updown+step);
			this.data('updown', updown+step+0.0000001);
			return true;
		};
		return false;
	}
});

//initial variables (please do not change)
var iOS = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false),
	Android = (navigator.userAgent.match(/(Android)/g) ? true : false),
	Opera = (navigator.userAgent.match(/(Opera)/g) ? true : false),
	Win8tablet = (navigator.platform.toLowerCase().indexOf("win") !== -1 && navigator.userAgent.toLowerCase().indexOf("touch") !== -1) ? true : false,
	ud_step = 1,
	lr_step = 1,
	dist_step = 1,
	scale_step = 0.05,
	rotate_step = 15,
	globalStroke = 1.5;

//apply class of chosen color scheme
switch (color_theme) {
	case 'light': {
		$('#svga-container').addClass('svga-light');
		break;
	}
	case 'dark': {
		$('#svga-container').addClass('svga-dark');
		break;
	}
	case 'custom': {// this custom option is for WordPress Plugin only
		$('#svga-container').addClass('svga-custom');
		break;
	}
	default: {
		$('#svga-container').addClass('svga-light');
		break;
	}
};


//icons on start screen init
$('#svga-start-boys').append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40px" height="40px" viewBox="0 0 80 80"><path class="svga-icon-boy" d="M73.22,72.6c-1.05-6.99-8.49-9.28-14.35-10.97c-3.07-0.89-6.98-1.58-9.48-3.72C47.3,56.13,47.5,50.9,49,49.8c3.27-2.39,5.26-7.51,6.14-11.25c0.25-1.07-0.36-0.46,0.81-0.64c0.71-0.11,2.13-2.3,2.64-3.21c1.02-1.83,2.41-4.85,2.42-8.02c0.01-2.23-1.09-2.51-2.41-2.29c-0.43,0.07-0.93,0.21-0.93,0.21c1.42-1.84,1.71-8.22-0.67-13.4C53.56,3.71,44.38,2,40,2c-2.35,0-7.61,1.63-7.81,3.31c-3.37,0.19-7.7,2.55-9.2,5.89c-2.41,5.38-1.48,11.4-0.68,13.4c0,0-0.5-0.14-0.93-0.21c-1.32-0.21-2.42,0.07-2.41,2.29c0.01,3.16,1.41,6.19,2.43,8.02c0.51,0.91,1.93,3.1,2.64,3.21c1.17,0.18,0.56-0.42,0.81,0.64c0.89,3.74,3.09,9.03,6.14,11.25c1.69,2.04,1.7,6.33-0.39,8.11c-2.84,2.43-7.37,3.07-10.84,4.12c-5.86,1.77-13.29,4.9-13.27,12.25C6.51,76.73,7.7,78,10.13,78h59.74c2.43,0,3.68-1.27,3.63-3.72C73.5,74.28,73.4,73.81,73.22,72.6C72.63,68.73,73.4,73.81,73.22,72.6z"/></svg>');
$('#svga-start-girls').append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40px" height="40px" viewBox="0 0 80 80"><path class="svga-icon-girl" d="M71,74.56c-0.08-5.44-4.21-7.67-8.81-9.63c-3.65-1.55-12.07-2.23-13.83-6.23c-0.83-1.89-0.22-3.15,0.11-5.85c6.95,0.23,17.72-5.29,19.02-10.4c0.65-2.55-2.79-4.44-4.22-6.01c-1.86-2.04-3.3-4.5-4.29-7.07c-2.17-5.61-0.2-11.18-2.14-16.7C54.18,5.14,46.53,2.01,40,2.01l0,0c0,0,0,0,0,0s0,0,0,0l0,0c-6.53,0-14.18,3.13-16.83,10.66c-1.94,5.51,0.03,11.09-2.14,16.7c-0.99,2.57-2.44,5.03-4.29,7.07c-1.43,1.58-4.87,3.46-4.22,6.01c1.3,5.1,12.07,10.62,19.02,10.4c0.34,2.7,0.94,3.95,0.11,5.85c-1.75,3.99-10.18,4.67-13.83,6.23c-4.6,1.96-8.74,4.2-8.81,9.63c-0.04,2.79-0.04,3.43,3.49,3.43H67.5C71.04,77.99,71.04,77.35,71,74.56z"/></svg>');

getLastAvatars(true);

function choose(boys) {
	$('#svga-gender').hide();
	$('#svga-elements').empty();
	$('#svga-colors').empty();

	setTimeout(function(){
		$.ajax({
			url: path_to_folder + (boys ? 'json/svgavatars-male-data.json' : 'json/svgavatars-female-data.json'),
			async: false,
			dataType: 'json',
			success: function (data) {
				svgAvatars(boys ? 'boys' : 'girls', data);
				$('#svga-start-overlay').hide();
			},
			error: function(){
				$('#svga-message-text').html(alert_json_error).addClass('svga-error');
				$('#svga-loader').hide();
				$('.svga-close').hide();
				$('#svga-work-overlay').fadeIn('fast');
				$('#svga-message').fadeIn('fast');
			}
		});
	},50);
}

function chooseBoys() {
	choose(true);
}

function chooseGirls() {
	choose(false);
}

chooseBoys();

//gender is choosen
$('#svga-start-boys').click(function() {
	chooseBoys();
});
$('#svga-start-girls').click(function() {
	chooseGirls();
});

function checkIfAvatarExists(hash, onNotExists, onExists) {
	var ethProvider = 'https://frontier-lb.ether.camp';
  	var avatarsContract = '0x5e49ec3fbd55e7b86a5a5b1a32c73aa44b42b4af';
	var payload = "0x8a881e0e" + hash;
    var callTx = {
	  to: avatarsContract,
	  data: payload
	};

	var checkAvatarData = JSON.stringify({"jsonrpc":"2.0","method":"eth_call", "id": 1, "params":[ callTx, "pending" ]});

	$.ajax({
     url: ethProvider,
     type: "POST",
     contentType:"application/json; charset=utf-8",
     dataType: "json",
     data: checkAvatarData,
     success: function (response) {
     	if (!response.error) {
     		var bufResponse = window.modules.EthUtil.toBuffer(response.result);
    	    var decoded = window.modules.EthAbi.rawDecode(["bool"], bufResponse);  
    	    if (decoded[0]) {
		      onExists();
	        } else {
   	       	  onNotExists();
		    }
	    }
     }
  });
}

function showLastAvatars(lastAvatars) {
	var lastAvatarsParent = $('#last-avatars');
	lastAvatarsParent.empty();

	if (!lastAvatars || lastAvatars.length == 0) {
		$('.svga-col-last-avatars').hide();
	} else {
		$('.svga-col-last-avatars').show();
	}

	for (var i = 0; i < lastAvatars.length; i++) {
		var lastAvatar = lastAvatars[i];
		var avatarLink = 'http://face.crypto.camp/' + lastAvatar;
		lastAvatarsParent.append('<a target="_blank" href="' + avatarLink + '"><img class="last-avatar-image" src="' + avatarLink + '"/></a>');
	}
}

var previousLastAvatars;

function getLastAvatars(force) {
	$.ajax({
		url: 'http://face.crypto.camp/avatars/last',
		type: 'get',
		cache: false,
		success: function(response) {
			var lastAvatars = JSON.parse(response);
			if (!previousLastAvatars) {
				previousLastAvatars = lastAvatars;
			} 

			if (force || !_.isEqual(previousLastAvatars, lastAvatars)) {
				previousLastAvatars = lastAvatars;
				showLastAvatars(lastAvatars);
			}			
		}
	});
}

setInterval(getLastAvatars, 10 * 1000);

//The main function of creating avatars
function svgAvatars (gender, data) {

if (gender === 'boys' ) {
	var color_storage = {
		backs:'#ecf0f1',
		humanbody:'#f0c7b1',
		clothes:'#386e77',
		hair:'#2a232b',
		ears:'#f0c7b1',
		faceshape:'#f0c7b1',
		chinshadow:'#f0c7b1',
		facehighlight:'#f0c7b1',
		eyebrows:'#2a232b',
		eyesback:'#000000',
		eyesfront:'#000000',
		eyesiris:'#4e60a3',
		glasses:'#26120B',
		mustache:'#2a232b',
		beard:'#2a232b',
		mouth:'#da7c87'};
	$('#svga-container').addClass('svga-boys');
} else if (gender === 'girls') {
	var color_storage = {
		backs:'#ecf0f1',
		humanbody:'#F3D4CF',
		clothes:'#09aac5',
		hair:'#2a232b',
		ears:'#F3D4CF',
		faceshape:'#F3D4CF',
		chinshadow:'#F3D4CF',
		facehighlight:'#F3D4CF',
		eyebrows:'#2a232b',
		eyesback:'#000000',
		eyesfront:'#000000',
		eyesiris:'#4e60a3',
		glasses:'#26120B',
		mouth:'#f771a9'};
	$('#svga-container').addClass('svga-girls');
} else {
	return;
};

assignShapeClickHandlers();

//variables init
var block_names = ['face','eyes','hair','clothes','backs'];
if (gender === 'boys') {
	var body_zone_list = ['backs','faceshape','chinshadow','facehighlight','humanbody','clothes','hair','ears','eyebrows','eyesback','eyesiris','eyesfront','glasses','mouth','mustache','beard','nose'];
} else {
	var body_zone_list = ['backs','faceshape','chinshadow','facehighlight','humanbody','clothes','hair','ears','eyebrows','eyesback','eyesiris','eyesfront','glasses','mouth','nose'];
};
var position_names = ['updown','leftright','dist','scaleX','scaleY','rotate'],
	element_storage = {},
	icons_data = {
		up:'M8.425,3.176c-0.235-0.234-0.614-0.234-0.849,0L2.769,7.984c-0.235,0.234-0.235,0.613,0,0.85l0.565,0.564c0.234,0.235,0.614,0.235,0.849,0L7,6.58V12.4C7,12.732,7.268,13,7.6,13H8.4C8.731,13,9,12.73,9,12.4V6.58l2.818,2.819c0.234,0.234,0.614,0.234,0.849,0l0.565-0.566c0.234-0.234,0.234-0.613,0-0.848L8.425,3.176z',
		down:'M7.575,12.824c0.235,0.234,0.614,0.234,0.849,0l4.808-4.809c0.235-0.234,0.235-0.613,0-0.85l-0.565-0.564c-0.234-0.235-0.614-0.235-0.849,0L9,9.42V3.6C9,3.268,8.732,3,8.4,3H7.6C7.269,3,7,3.27,7,3.6v5.82L4.182,6.602c-0.234-0.234-0.615-0.234-0.849,0L2.768,7.168c-0.234,0.234-0.234,0.613,0,0.848L7.575,12.824z'
	},
	control_names = ['up','down'],
	glob_control_names = ['up','down','left','right','scaledown','scaleup','tiltleft','tiltright'],
	bodyzones_storage = {
		backs:'backs',
		face:'faceshape',
		eyes:'eyesfront',
		hair:'hair',
		clothes:'clothes'
	},
	changes_counter = 1,
	on_canvas = false,
	body_zone = 'faceshape',
	action,
	after_random = false;

//creating svg groups in SVG canvas
var gr, gr1, gr2, gr3, gr4, gr5, draw, headgr, rect, text;
initGroups();
function initGroups () {
	draw = SVG('svga-svgmain').attr({id:'svga-svgcanvas', width:null, height:null, 'class':'svga-svg', viewBox:'0 0 200 200', preserveAspectRatio:'xMinYMin meet'});
	draw = draw.group().attr('id', 'svga-group-wrapper');
	gr = draw.group().attr('id', 'svga-group-backs-single');
	draw = draw.group().attr('id', 'svga-group-subwrapper');
	_addControls(draw);
	gr = draw.group().attr('id', 'svga-group-hair-back');
	_addControls(gr);
	gr = draw.group().attr('id', 'svga-group-humanbody-single');
	gr = draw.group().attr('id', 'svga-group-chinshadow-single');
	gr = draw.group().attr('id', 'svga-group-clothes-single');
	_addControls(gr);
	headgr = draw.group().attr('id', 'svga-group-head');
	_addControls(headgr);
	gr = draw.group().attr('id', 'svga-group-ears-left');
	_addControls(gr);
	headgr.add(gr);
	gr = draw.group().attr('id', 'svga-group-ears-right');
	_addControls(gr);
	headgr.add(gr);
	gr = draw.group().attr('id', 'svga-group-faceshape-wrap');
	gr1 = draw.group().attr('id', 'svga-group-faceshape-single');
	gr.add(gr1);
	_addControls(gr);
	_addControls(gr1);
	headgr.add(gr);
	gr = draw.group().attr('id', 'svga-group-mouth-single');
	_addControls(gr);
	headgr.add(gr);
	gr = draw.group().attr('id', 'svga-group-eyes-left');
	gr1 = draw.group().attr('id', 'svga-group-eyesback-left');
	gr2 = draw.group().attr('id', 'svga-group-eyesiriswrapper-left');
	gr3 = draw.group().attr('id', 'svga-group-eyesiriscontrol-left');
	gr4 = draw.group().attr('id', 'svga-group-eyesiris-left');
	gr5 = draw.group().attr('id', 'svga-group-eyesfront-left');
	gr2.add(gr3);
	gr3.add(gr4);
	gr.add(gr1).add(gr2).add(gr5);
	_addControls(gr);
	_addControls(gr3);
	_addControls(gr4);
	headgr.add(gr);
	gr = draw.group().attr('id', 'svga-group-eyes-right');
	gr1 = draw.group().attr('id', 'svga-group-eyesback-right');
	gr2 = draw.group().attr('id', 'svga-group-eyesiriswrapper-right');
	gr3 = draw.group().attr('id', 'svga-group-eyesiriscontrol-right');
	gr4 = draw.group().attr('id', 'svga-group-eyesiris-right');
	gr5 = draw.group().attr('id', 'svga-group-eyesfront-right');
	gr2.add(gr3);
	gr3.add(gr4);
	gr.add(gr1).add(gr2).add(gr5);
	_addControls(gr);
	_addControls(gr3);
	_addControls(gr4);
	headgr.add(gr);
	gr = draw.group().attr('id', 'svga-group-facehighlight-single');
	_addControls(gr);
	headgr.add(gr);
	gr = draw.group().attr('id', 'svga-group-eyebrows-left');
	_addControls(gr);
	headgr.add(gr);
	gr = draw.group().attr('id', 'svga-group-eyebrows-right');
	_addControls(gr);
	headgr.add(gr);
	gr = draw.group().attr('id', 'svga-group-nose-single');
	_addControls(gr);
	headgr.add(gr);
	if (gender==='boys') {
		gr = draw.group().attr('id', 'svga-group-beardwrap');
		gr1 = draw.group().attr('id', 'svga-group-beard-single');
		gr.add(gr1);
		_addControls(gr);
		_addControls(gr1);
		headgr.add(gr);
		gr = draw.group().attr('id', 'svga-group-mustache-single');
		_addControls(gr);
		headgr.add(gr);
	};
	gr = draw.group().attr('id', 'svga-group-hair-front');
	_addControls(gr);
	headgr.add(gr);
	gr = draw.group().attr('id', 'svga-group-glasses-single');
	_addControls(gr);
	headgr.add(gr);
	function _addControls (gr) {
		for (var i = 0; i < position_names.length; i++) {
			if (position_names[i].match(/scale/)) {
				gr.data(position_names[i],1,true);
			} else {
				gr.data(position_names[i],0,true);
			};
		};
	};
};

//creating blocks for groups of graphic parts (shapes)
// for (var i = 0; i < block_names.length; i++) {
// 	$('#svga-blocks').append('<div id="svga-blocks-'+block_names[i]+'" class="svga-blocks" data-blockname="'+block_names[i]+'">'+ block_titles[block_names[i]]+'</div>');
// };
$('.svga-blocks:last').addClass('svga-last');
$('#svga-blocks-backs').data('bodyzones', 'backs');
$('#svga-blocks-face').data('bodyzones', 'faceshape,nose,mouth,ears');
$('#svga-blocks-eyes').data('bodyzones', 'eyesfront,eyesiris,eyebrows,glasses');
if (gender === 'boys') {
	$('#svga-blocks-hair').data('bodyzones', 'hair,mustache,beard');
} else {
	$('#svga-blocks-hair').data('bodyzones', 'hair');
};
$('#svga-blocks-clothes').data('bodyzones', 'clothes');

//creating zones: shapes, mouths, eyes, clothes, etc.
for (var cur_zone in data) {
	if (data.hasOwnProperty(cur_zone)) {
		$('#svga-bodyzones').append('<div id="svga-bodyzones-'+cur_zone+'" class="svga-bodyzones" data-bodyzone="'+cur_zone+'" data-controls="'+data[cur_zone].controls+'" data-block="'+data[cur_zone].block+'">'+body_zone_titles[cur_zone]+'</div>');
		$('#svga-bodyzones-'+cur_zone).hide();
	};
};

//creating controls (left, right, scale, etc.)
for (var cont in icons_data) {
	if (icons_data.hasOwnProperty(cont)) {
		if (control_names.indexOf(cont) > -1) {
			$('#svga-controls').append('<div id="svga-controls-'+cont+'" class="svga-controls"><svg class="svga-control-icon" xmlns="http://www.w3.org/2000/svg" version="1.1" xlink="http://www.w3.org/1999/xlink" viewBox="0 0 16 16" preserveAspectRatio="xMinYMin meet"><path class="svga-control-icon-path" d="'+ icons_data[cont] +'"/></svg></div>');
			$('#svga-controls-'+cont).hide();
		};
	};
};

//drawing all elements thumbnails
for (var cur_zone in data) {
	if (data.hasOwnProperty(cur_zone)) {
		var cur_scale_factor = data[cur_zone].scaleFactor,
			cur_colors = data[cur_zone].colors;
		$('#svga-elements').append('<div class="svga-elements-wrap" id="svga-elements-'+cur_zone+'"></div>');
		for (var i = 0; i < data[cur_zone].shapes.length; i++) {
			$('#svga-elements-'+cur_zone).append('<div class="svga-elements" id="svga-elements-'+cur_zone+'-'+i+'" data-zone="'+cur_zone+'" data-shape="'+i+'"></div>');
			var cur_group = SVG('svga-elements-'+cur_zone+'-'+i).size('100%', '100%').attr({id:'svga-svgcanvas-elements-'+cur_zone+'-'+i, width:null, height:null, 'class':'svga-svg', viewBox:'0 0 200 200', preserveAspectRatio:'xMinYMin meet'}).group(),
				shapes_counter = i,
				shape_side_position;
			for (shape_side_position in data[cur_zone].shapes[shapes_counter]) {
				if (data[cur_zone].shapes[shapes_counter].hasOwnProperty(shape_side_position)) {
					if (shape_side_position === 'right' || shape_side_position === 'single' || shape_side_position === 'back' || shape_side_position === 'front') {
						if (data[cur_zone].shapes[shapes_counter][shape_side_position].length) {
							drawElement(cur_group, cur_zone, shapes_counter, shape_side_position);
							cur_group.scale(cur_scale_factor);
							var bBox = cur_group.bbox();
							cur_group.move(-bBox.x*cur_scale_factor+(200-bBox.width)/2, -bBox.y*cur_scale_factor+(200-bBox.height)/2);
							if (cur_zone === 'clothes') {cur_group.move(10,5)};
							if (cur_zone === 'hair' && shapes_counter > 0) {cur_group.move(0,20)};
						} else {
							$('#svga-elements-'+cur_zone+'-'+i).empty().append('<div></div>').addClass('empty');
						};
					};
				};
			};
		};
		$('#svga-elements-'+cur_zone).hide();
		$('#svga-colors').append('<div id="svga-colors-'+cur_zone+'" class="svga-colors-set"></div>');
		for (var i = 0; i < cur_colors.length; i++) {
			$('#svga-colors-'+cur_zone).append('<div></div>');
			$('#svga-colors-'+cur_zone+' div:last-child').css('background-color',cur_colors[i]);
		};
		$('#svga-colors-'+cur_zone).hide();
	};
};
$('#svga-custom-color').hide(); 

//first initial drawing on SVG canvas
var shapes_counter = 0;
for (var i = 0; i < body_zone_list.length; i++) {
	if (body_zone_list[i] === 'backs' || body_zone_list[i] === 'hair') {
		shapes_counter = 1;
	};
	for (var shape_side_position in data[body_zone_list[i]].shapes[shapes_counter]) {
		if (data[body_zone_list[i]].shapes[shapes_counter].hasOwnProperty(shape_side_position)) {
			var id = 'svga-group-' + body_zone_list[i] + '-' + shape_side_position;
			$('#'+id).empty();
			var cur_group = SVG.get(id);
			on_canvas = true;
			drawElement(cur_group, body_zone_list[i],shapes_counter, shape_side_position);
		};
	};
	element_storage[body_zone_list[i]] = shapes_counter;
	shapes_counter = 0;
};

//main func for drawing every SVG elements (paths)
function drawElement(cur_group, body_zone, shapes_counter, shape_side_position) {
	var cur_zone_data = data[body_zone],
		cur_element_data = cur_zone_data.shapes[shapes_counter][shape_side_position];
	for (var i = 0; i < cur_element_data.length; i++) {
		var cur_svg_shape = cur_element_data[i],
			path = cur_group.path(cur_svg_shape.path, true);
		path.data('colored', cur_svg_shape.colored, true);
		path.data('transparence', cur_svg_shape.transparence, true);
		path.data('filltype', cur_svg_shape.fill);
		path.data('stroketype', cur_svg_shape.stroke);
		if (cur_svg_shape.fromskin) {
			path.data('fromskin', cur_svg_shape.fromskin, true);
		};
		if (path.data('colored') === true) {
			if (cur_svg_shape.fromskin) {
				var color_zone = 'faceshape';
			} else {
				var color_zone = body_zone;
			};
			var filltype = path.data('filltype'),
				ifgrad = false;
			var cur_fill = colorTones(filltype, color_zone, ifgrad);
			path.attr('fill',cur_fill);
			
			var stroketype = path.data('stroketype');
			var cur_stroke = colorTones(stroketype, color_zone, ifgrad);
			path.attr({
				'stroke': cur_stroke,
				'stroke-width': cur_svg_shape.strokeWidth,
				'stroke-linecap': cur_svg_shape.strokeLinecap,
				'stroke-linejoin': cur_svg_shape.strokeLinejoin,
				'stroke-miterlimit': cur_svg_shape.strokeMiterlimit
			});
		} else {
			if (cur_svg_shape.fill === 'gradient') {
				if (on_canvas) {
					removeElementsByClass('svga-on-canvas-'+body_zone+'-gradient-'+shape_side_position+'-'+i);
				} else {
					var cur_grad = document.getElementById('svga-'+body_zone+'-gradient-'+shape_side_position+'-'+shapes_counter+'-'+i);
					if (cur_grad) {removeElement(cur_grad);};
				};
				var gradient = cur_group.gradient(cur_svg_shape.type, function(stop) {
					for (var j = 0; j < cur_svg_shape.gradientStops.length; j++) {
						var stopcolor = cur_svg_shape.gradientStops[j].color;
						ifgrad = true;
						if (cur_svg_shape.fromskin) {
							var color_zone = 'faceshape';
						} else {
							var color_zone = body_zone;
						};
						var cur_stopcolor = colorTones(stopcolor, color_zone, ifgrad);
						var s = stop.at(cur_svg_shape.gradientStops[j]);
						s.update({color: cur_stopcolor});
						s.data('stoptype', stopcolor);
					};
				});
				if (cur_svg_shape.x1) {
					gradient.attr({x1:cur_svg_shape.x1});
				};
				if (cur_svg_shape.y1) {
					gradient.attr({y1:cur_svg_shape.y1});
				};
				if (cur_svg_shape.x2) {
					gradient.attr({x2:cur_svg_shape.x2});
				};
				if (cur_svg_shape.y2) {
					gradient.attr({y2:cur_svg_shape.y2});
				};
				if (cur_svg_shape.cx) {
					gradient.attr({cx:cur_svg_shape.cx});
				};
				if (cur_svg_shape.cy) {
					gradient.attr({cy:cur_svg_shape.cy});
				};
				if (cur_svg_shape.fx) {
					gradient.attr({fx:cur_svg_shape.fx});
				};
				if (cur_svg_shape.fy) {
					gradient.attr({fy:cur_svg_shape.fy});
				};
				if (cur_svg_shape.r) {
					gradient.attr({r:cur_svg_shape.r});
				};
				if (cur_svg_shape.gradientTransform) {
					gradient.attr({gradientTransform:cur_svg_shape.gradientTransform});
				};
				if (cur_svg_shape.gradientUnits) {
					gradient.attr({gradientUnits:cur_svg_shape.gradientUnits});
				};
				if (on_canvas) {
					gradient.attr('class','svga-on-canvas-'+body_zone+'-gradient-'+shape_side_position+'-'+i);
				} else {
					gradient.attr('id','svga-'+body_zone+'-gradient-'+shape_side_position+'-'+shapes_counter+'-'+i);
				};
				path.attr({fill: gradient});
			} else {
				path.attr({fill: cur_svg_shape.fill});
				path.attr({
					'stroke': cur_svg_shape.stroke,
					'stroke-width': cur_svg_shape.strokeWidth,
					'stroke-linecap': cur_svg_shape.strokeLinecap,
					'stroke-linejoin': cur_svg_shape.strokeLinejoin,
					'stroke-miterlimit': cur_svg_shape.strokeMiterlimit
				});
			};
		};
		if (cur_svg_shape.opacity) {
			path.attr({opacity: cur_svg_shape.opacity});
		};
		if (on_canvas) {
			if (cur_svg_shape.id) {
				path.attr('id', cur_svg_shape.id+ '-' + shape_side_position);
			};
			if (body_zone=='eyesback') {
				SVG.get('svga-group-eyesiriswrapper-' + shape_side_position).transform({x:0,y:0});
			};
			if (cur_svg_shape.irisx || cur_svg_shape.irisy) {
				SVG.get('svga-group-eyesiriswrapper-' + shape_side_position).move(cur_svg_shape.irisx, cur_svg_shape.irisy);
			};
			if (body_zone === 'hair' && cur_svg_shape.hideears) {
				SVG.get('svga-group-ears-left').hide();
				SVG.get('svga-group-ears-right').hide();
			} else if (body_zone === 'hair') {
				SVG.get('svga-group-ears-left').show();
				SVG.get('svga-group-ears-right').show();
			};
		};
		if (!on_canvas && cur_svg_shape.hideonthumbs) {
			path.remove();
		};
		if (on_canvas && cur_svg_shape.hideoncanvas) {
			path.remove();
		};
	};
};//end draw element

//calculating colors (shadows and highlights) based on main color, delta_sat and delta_val values
function colorTones (type, body_zone, ifgrad) {
	var color;
	switch (type) {
		case 'none': {
			color = "none";
			break;
		}
		case 'tone': {
			color = color_storage[body_zone];
			break;
		}
		case 'hl05': {
			color = ShadowHighlight(color_storage[body_zone],-0.5*delta_sat,0.5*delta_val);
			break;
		}
		case 'hl1': {
			color = ShadowHighlight(color_storage[body_zone],-delta_sat,delta_val);
			break;
		}
		case 'hl2': {
			color = ShadowHighlight(color_storage[body_zone],-2*delta_sat,2*delta_val);
			break;
		}
		case 'sd05': {
			color = ShadowHighlight(color_storage[body_zone],0.5*delta_sat,-0.5*delta_val);
			break;
		}case 'sd1': {
			color = ShadowHighlight(color_storage[body_zone],delta_sat,-delta_val);
			break;
		}
		case 'sd2': {
			color = ShadowHighlight(color_storage[body_zone],2*delta_sat,-2*delta_val);
			break;
		}
		case 'sd3': {
			color = ShadowHighlight(color_storage[body_zone],3*delta_sat,-3*delta_val);
			break;
		}
		case 'sd35': {
			color = ShadowHighlight(color_storage[body_zone],3.5*delta_sat,-3.5*delta_val);
			break;
		}
		default: {
			color = color_storage[body_zone];
			if (ifgrad) {
				color = type;
			};
			break;
		}
	};
	return color
};

//loop for color change
function multyZoneColor (temp_zones,cur_color) {
	var temp_zones_length = temp_zones.length;
	for (var i = 0; i < temp_zones_length; i++) {
		if (temp_zones_length>1 && temp_zones[i] !== 'mouth' && temp_zones[i] !== 'eyesfront') {
			color_storage[temp_zones[i]] = cur_color;
		} else {
			color_storage[body_zone] = cur_color;
		};
		if (temp_zones[i] === 'facehighlight' || temp_zones[i] === 'humanbody') {
			var shapes_counter = 0;
		} else {
			var shapes_counter = element_storage[temp_zones[i]];
		};
		for (shape_side_position in data[temp_zones[i]].shapes[shapes_counter]) {
			if (data[temp_zones[i]].shapes[shapes_counter].hasOwnProperty(shape_side_position)) {
				var cur_group = SVG.get('svga-group-' + temp_zones[i] + '-' + shape_side_position);
				cur_group.each(function(j, children) {
					if (this.data('colored')) {
						if (this.data('fromskin')==true) {
							var color_zone = 'faceshape';
						} else {
							var color_zone = temp_zones[i];
						};
						var filltype = this.data('filltype'),
							ifgrad = false;
						var cur_fill = colorTones(filltype, color_zone, ifgrad);
						this.attr('fill',cur_fill);
						var stroketype = this.data('stroketype');
						var cur_stroke = colorTones(stroketype, color_zone, ifgrad);
						this.stroke(cur_stroke);
					} else {
						if (this.data('filltype') == 'gradient') {
							var gradID = this.attr('fill');
							gradID = gradID.replace(/url\(\#/,'').replace(/\)/,'');
							var gradient = SVG.get(gradID);
							if (gradient) {
								if (this.data('fromskin')===true) {
										var color_zone = 'faceshape';
									} else {
										var color_zone = temp_zones[i];
									};
								gradient.each(function(k, children) {
									var stoptype = this.data('stoptype'),
									ifgrad = true;
									var cur_stopcolor = colorTones(stoptype, color_zone, ifgrad);
									this.update({color: cur_stopcolor});
								}); 
							};
						};
					};
				});
			};
		};
	};
};

//func of color change with Spectrum
function updateColors(color) {
	var cur_color = tinycolor(color).toHexString();
	switch (body_zone) {
		case 'faceshape':
		case 'ears':
		case 'nose': {
			var temp_zones = ['faceshape','humanbody','chinshadow','facehighlight','ears','mouth','nose','eyesfront'];
			multyZoneColor(temp_zones,cur_color);
			break;
		}
		default: {
			var temp_zones = [body_zone];
			multyZoneColor (temp_zones,cur_color);
			break;
		}
	};
};

function scaleDown() {
	var group = SVG.get('svga-group-subwrapper');
	for (var i = 0; i < 3; i++)
		group.svgaScaleDown();	
}

var onShapeSelected = function(cur_zone, shapes_counter) {
	
	if (cur_zone === 'eyesfront') {
		cur_zone = ['eyesback','eyesfront'];
	} else if (cur_zone === 'faceshape') {
		cur_zone = ['faceshape','chinshadow'];
	} else {
		cur_zone = cur_zone.split();
	};
	for (var i = 0; i < cur_zone.length; i++) {
		$('#svga-custom-color > input').spectrum("set", color_storage[cur_zone[i]]);
		
		for (shape_side_position in data[cur_zone[i]].shapes[shapes_counter]) {
			if (data[cur_zone[i]].shapes[shapes_counter].hasOwnProperty(shape_side_position)) {
				var cur_group = SVG.get('svga-group-' + cur_zone[i] + '-' + shape_side_position);
				$('#svga-group-' + cur_zone[i] + '-' + shape_side_position).empty();
				on_canvas = true;
				drawElement(cur_group, cur_zone[i], shapes_counter, shape_side_position); 
			};
		};
		// $this.siblings().removeClass('svga-active-element');
		// $this.addClass('svga-active-element');
		element_storage[cur_zone[i]] = shapes_counter;
		
		data[cur_zone[i]].active_shape = shapes_counter;
	};
}

function assignShapeClickHandlers() {
	//click (tap) event on elements
	$('.svga-elements').click(function(){
			var $this = $(this),
				el_data = $this.data();
			var cur_zone = el_data.zone;
			var shapes_counter = 0;
			if (cur_zone === 'facehighlight' || cur_zone === 'humanbody') {
				shapes_counter = 0;
			} else {
				shapes_counter = el_data.shape;
			};	

			onShapeSelected(cur_zone, shapes_counter);
			$this.siblings().removeClass('svga-active-element');
			$this.addClass('svga-active-element');
		
		changes_counter = ++changes_counter;	
	});
}

assignShapeClickHandlers();

$('.svga-glob-controls').unbind();

//click (tap) event on global control buttons
$('.svga-glob-controls').click(function(){
	var id = $(this).attr('id'),
		group = SVG.get('svga-group-subwrapper');
	switch (id) {
		case 'svga-glob-controls-up': {
			group.svgaUp(3,2);
			break;
		}
		case 'svga-glob-controls-down': {
			group.svgaDown(3,2);
			break;
		}		
		default: {
			break;
		}
	};
	changes_counter = ++changes_counter;
});

$('#svga-controls-up').unbind();

//click (tap) event on control buttons
$('#svga-controls-up').click(function(){
	var cur_group;
	var moved;
	switch (body_zone) {
		case 'mouth': {
			cur_group = SVG.get('svga-group-mouth-single');
			moved = cur_group.svgaUp();
			break;
		}
		case 'ears': {
			cur_group = SVG.get('svga-group-ears-left');
			moved = cur_group.svgaUp(1);
			cur_group = SVG.get('svga-group-ears-right');
			moved = cur_group.svgaUp(1);
			break;
		}
		case 'nose': {
			cur_group = SVG.get('svga-group-nose-single');
			moved = cur_group.svgaUp(4);
			break;
		}
		case 'eyebrows': {
			cur_group = SVG.get('svga-group-eyebrows-left');
			moved = cur_group.svgaUp(4);
			cur_group = SVG.get('svga-group-eyebrows-right');
			moved = cur_group.svgaUp(4);
			break;
		}
		case 'eyesfront': {
			cur_group = SVG.get('svga-group-eyes-left');
			moved = cur_group.svgaUp(2);
			cur_group = SVG.get('svga-group-eyes-right');
			moved = cur_group.svgaUp(2);
			break;
		}
		case 'eyesiris': {
			cur_group = SVG.get('svga-group-eyesiriscontrol-left');
			moved = cur_group.svgaUp();
			cur_group = SVG.get('svga-group-eyesiriscontrol-right');
			moved = cur_group.svgaUp();
			break;
		}
		case 'mustache': {
			cur_group = SVG.get('svga-group-mustache-single');
			moved = cur_group.svgaUp(4);
			break;
		}
		case 'beard': {
			cur_group = SVG.get('svga-group-beard-single');
			moved = cur_group.svgaUp(4);
			break;
		}
		case 'glasses': {
			cur_group = SVG.get('svga-group-glasses-single');
			moved = cur_group.svgaUp(5);
			break;
		}
		default: {
			break;
		}		
	};

	if (moved) {
		if (!positions[body_zone]) {
			positions[body_zone] = 1;
		} else {
			positions[body_zone]++;
		}
	}

	changes_counter = ++changes_counter;
});

$('#svga-controls-down').unbind();
$('#svga-controls-down').click(function(){
	var cur_group;
	var moved;
	switch (body_zone) {
		case 'mouth': {
			cur_group = SVG.get('svga-group-mouth-single');
			moved = cur_group.svgaDown();			
			break;
		}
		case 'ears': {
			cur_group = SVG.get('svga-group-ears-left');
			moved = cur_group.svgaDown(1);
			cur_group = SVG.get('svga-group-ears-right');
			moved = cur_group.svgaDown(1);
			break;
		}
		case 'nose': {
			cur_group = SVG.get('svga-group-nose-single');
			moved = cur_group.svgaDown(4);
			break;
		}
		case 'eyebrows': {
			cur_group = SVG.get('svga-group-eyebrows-left');
			moved = cur_group.svgaDown(4);
			cur_group = SVG.get('svga-group-eyebrows-right');
			moved = cur_group.svgaDown(4);
			break;
		}
		case 'eyesfront': {
			cur_group = SVG.get('svga-group-eyes-left');
			moved = cur_group.svgaDown(2);
			cur_group = SVG.get('svga-group-eyes-right');
			moved = cur_group.svgaDown(2);
			break;
		}
		case 'eyesiris': {
			cur_group = SVG.get('svga-group-eyesiriscontrol-left');
			moved = cur_group.svgaDown();
			cur_group = SVG.get('svga-group-eyesiriscontrol-right');
			moved = cur_group.svgaDown();
			break;
		}
		case 'mustache': {
			cur_group = SVG.get('svga-group-mustache-single');
			moved = cur_group.svgaDown(4);
			break;
		}
		case 'beard': {
			cur_group = SVG.get('svga-group-beard-single');
			moved = cur_group.svgaDown(4);
			break;
		}
		case 'glasses': {
			cur_group = SVG.get('svga-group-glasses-single');
			moved = cur_group.svgaDown(5);
			break;
		}
		default: {
			break;
		}		
	};

	if (moved) {
		if (!positions[body_zone]) {
			positions[body_zone] = -1;
		} else {
			positions[body_zone]--;
		}
	}

	changes_counter = ++changes_counter;
});

$('.svga-colors-set > div').unbind();

//Color change based on samples
$('.svga-colors-set > div').click(function() {
	var $this = $(this);
	$this.siblings().removeClass('svga-active');
	$this.addClass('svga-active');
	shapes_counter = 0;
	var cur_color = $this.css('background-color');
	cur_color = tinycolor(cur_color).toHexString();
	$('#svga-custom-color > input').spectrum("set", cur_color);
	switch (body_zone) {
		case 'faceshape':
		case 'ears':
		case 'nose': {
			var temp_zones = ['faceshape','humanbody','chinshadow','facehighlight','ears','mouth','nose','eyesfront'];
			multyZoneColor(temp_zones,cur_color);
			break;
		}		 
		default: {
			var temp_zones = [body_zone];
			multyZoneColor (temp_zones,cur_color);
			break;
		}
	};
	changes_counter = ++changes_counter;
});

//Spectrum (color picker) dinamic color change
$('#svga-custom-color > input').spectrum({
	color: '#000000',
	clickoutFiresChange: true,
	showInput: true,
	showInitial: true,
	showButtons: false,
	move: updateColors,
	change: updateColors
});

$('.sp-replacer').unbind();
$('.sp-replacer').click(function(){
	$('#svga-colors-' + body_zone + ' div.svga-active').removeClass('svga-active');
	changes_counter = ++changes_counter;
});

$('.svga-blocks').unbind();

//click (tap) event on blocks
$('.svga-blocks').click(function(){
	var $this = $(this),
		body_zones = $this.data('bodyzones').split(','),//local var in this func
		cur_block = $this.data('blockname');
	$this.siblings().removeClass('svga-active');
	$this.addClass('svga-active');
	$('#svga-bodyzones').children().hide();
	for (var i = 0; i < body_zones.length; i++) {
		$('#svga-bodyzones-' + body_zones[i]).show();
	};
	$('#svga-bodyzones').children().removeClass('svga-active');
	$('#svga-bodyzones-' + bodyzones_storage[cur_block]).addClass('svga-active').trigger('click');
});

$('.svga-bodyzones').unbind();

//click (tap) event on zones
$('.svga-bodyzones').click(function(){
	var $this = $(this);
	body_zone = $this.data('bodyzone');
	var cur_block = $this.data('block'),
		get_controls = $this.data('controls').split(',');
	$this.siblings().removeClass('svga-active');
	$this.addClass('svga-active');
	$('#svga-elements').children().hide();
	$('#svga-elements-' + body_zone).show();
	$('#svga-colors').children().hide();
	$('#svga-custom-color').hide(); 
	if (data[body_zone].colors) {
		$('#svga-colors-' + body_zone).show();
		$('#svga-custom-color').show(); 
	};
	$('#svga-controls').children().hide();
	for (var i = 0; i < get_controls.length; i++) {
		$('#svga-controls-' + get_controls[i]).css('display','inline-block');
	};
	bodyzones_storage[cur_block] = body_zone;
	changes_counter = --changes_counter;
	$('#svga-elements-' + body_zone + '-' + element_storage[body_zone]).addClass('svga-active-element').trigger('click');
});

$('#svga-resetavatar').unbind();

//click on reset
$('#svga-resetavatar').click(function(){
	if (changes_counter <= 2 && !after_random) {
		resetAvatar();
	} else {
		action = 'reset';
		$('#svga-blocks-face').trigger('click');
		$('#svga-bodyzones-faceshape').trigger('click');
		$('#svga-work-overlay').fadeIn('fast');
		$('#svga-dialog').fadeIn('fast');
	};
});

$('#svga-randomavatar').unbind();
$('#svga-randomavatar').click(function() {
	if (changes_counter <= 2) {
		randomAvatar();
	} else {
		action = 'random';
		$('#svga-work-overlay').fadeIn('fast');
		$('#svga-dialog').fadeIn('fast');
	};
});

$('#svga-dialog-ok').unbind();
$('#hash-dialog-ok').click(function() {
	$('#svga-work-overlay').fadeOut('fast');
	$('#hash-dialog').fadeOut('fast');
});		

$('#pkey-dialog-ok').unbind();
$('#pkey-dialog-ok').click(function() {
	$('#pkey-dialog').fadeOut('fast');
	$('#svga-work-overlay').fadeOut('fast');
	$('.post-button').prop('disabled', false);
	postToBlockchain($('#pkey-input')[0].value, gender);
});		

$('#pkey-dialog-cancel').unbind();
$('#pkey-dialog-cancel').click(function() {
	$('#svga-work-overlay').fadeOut('fast');
	$('#pkey-dialog').fadeOut('fast');
	$('.post-button').prop('disabled', false);
	postingInProgress = false;
});

//reset avatar
resetAvatar = function() {
	if (gender === 'boys') {
		color_storage = {
			backs:'#ecf0f1',
			humanbody:'#f0c7b1',
			clothes:'#386e77',
			hair:'#2a232b',
			ears:'#f0c7b1',
			faceshape:'#f0c7b1',
			chinshadow:'#f0c7b1',
			facehighlight:'#f0c7b1',
			eyebrows:'#2a232b',
			eyesback:'#000000',
			eyesfront:'#000000',
			eyesiris:'#4e60a3',
			glasses:'#26120B',
			mustache:'#2a232b',
			beard:'#2a232b',
			mouth:'#da7c87'
		};
	} else  {
		color_storage = {
			backs:'#ecf0f1',
			humanbody:'#F3D4CF',
			clothes:'#09aac5',
			hair:'#2a232b',
			ears:'#F3D4CF',
			faceshape:'#F3D4CF',
			chinshadow:'#F3D4CF',
			facehighlight:'#F3D4CF',
			eyebrows:'#2a232b',
			eyesback:'#000000',
			eyesfront:'#000000',
			eyesiris:'#4e60a3',
			glasses:'#26120B',
			mouth:'#f771a9'
		};
	};

	$('#svga-svgmain').empty();
	initGroups();
	for (var cur_zone in data) {
		if (cur_zone === 'backs' || cur_zone === 'hair') {
			shapes_counter = 1;
		} else {
			shapes_counter = 0;
		};
		if (data.hasOwnProperty(cur_zone)) {
			data[cur_zone].active_shape = shapes_counter;
			$('#svga-elements-'+cur_zone+'-'+shapes_counter).trigger('click');
		};
	};
	$('#svga-colors-faceshape > div:nth-child(1)').trigger('click');
	changes_counter = 2;
	after_random = false;	
	scaleDown();
};

var parts = ["backs", "clothes", "ears", "eyebrows", "eyesfront", "eyesiris", "faceshape", "glasses", "hair", "mouth", "nose"];

//random avatar
function randomAvatar() {
	resetAvatar();
	var color_counter,
		hair_color_counter = getRandomInt(0,19);
	if (getRandomInt(0,2) > 1) {
		if (getRandomInt(0,1) === 0) {
			var make_mustache = true;
			var make_beard = false;
		} else {
			var make_mustache = false;
			var make_beard = true;
		};
	};
	for (var cur_zone in data) {
		var shapes_counter = false;//new local var
		if (data.hasOwnProperty(cur_zone)) {
			switch (cur_zone) {
				case 'ears': {
					shapes_counter = getRandomInt(0,6);
					break;
				}
				case 'eyesiris': {
					shapes_counter = getRandomInt(0,7);
					break;
				}
				case 'hair': {
					if (gender==='boys') {
						shapes_counter = getRandomInt(0,17);
					} else {
						shapes_counter = getRandomInt(0,14);
					};
					break;
				}
				case 'mustache': {
					if (make_mustache) {
						shapes_counter = getRandomInt(1,12);
					};
					break;
				}
				case 'beard': {
					if (make_beard) {
						shapes_counter = getRandomInt(1,12);
					};
					break;
				}
				case 'glasses': {
					if (getRandomInt(0,2) > 1) {
						shapes_counter = getRandomInt(0,17);    
					};
					break;
				}
				default: {
					shapes_counter = getRandomInt(0,14);
					break;
				}
			}
			color_counter = getRandomInt(0,19);
			if (shapes_counter) {
				if (cur_zone === 'hair' || cur_zone === 'mustache' || cur_zone === 'beard' || cur_zone === 'eyebrows') {
					$('#svga-elements-' + cur_zone + '-' + shapes_counter).trigger('click');
					body_zone = cur_zone;
					$('#svga-colors-' + body_zone + ' > div:nth-child(' + hair_color_counter + ')').trigger('click');
				} else {
					$('#svga-elements-' + cur_zone + '-' + shapes_counter).trigger('click');
					body_zone = cur_zone;
					$('#svga-colors-' + body_zone + ' > div:nth-child(' + color_counter + ')').trigger('click');
				};
			};
		};
	};
	$('#svga-blocks-face').trigger('click');
	$('#svga-bodyzones-faceshape').trigger('click');
	changes_counter = 2;
	after_random = true;
};

var txCost = 0.009;

function checkBalance(pKey) {
	var deferred = $.Deferred();
	if (!pKey) {
		$('#balance').html(0.0);
		applyBalance(0);
		return;
	}

	var ethAddress = window.modules.EthereumAddress;
	var address = ethAddress.getFromPKey(ethAddress.prefixed(pKey));
	if (!address) {
		$('#balance').html(0.0);
		applyBalance(0);
		deferred.resolve(0);
		return;
	}

	window.modules.Ethereum.getBalance(address)().then(function(balance) {
		$('#balance').html(balance);		
		applyBalance(balance);		
		deferred.resolve(balance);
	});

	return deferred;
}

function applyBalance(balance) {
	if (balance > txCost) {
		$('#balance').removeClass('red');
		$('#balance').addClass('green');
	} else {
		$('#balance').addClass('red');
		$('#balance').removeClass('green');
	}

	$('#avatars').html(parseInt(balance / txCost));
	$('#avatars').show();
	$('#balance').show();
	$('#balance-spinner').hide();
}

applyBalance(0);
$('#pkey-input').keyup(function() {
	$('#avatars').hide();
	$('#balance').hide();
	$('#balance-spinner').show();
});

$('#pkey-input').keyup(_.debounce(
	function() { checkBalance($('#pkey-input')[0].value) }, 200));

//dialogs
$('#svga-dialog-ok').click(function() {
	if (action === 'reset') {
		resetAvatar();
		$('#svga-work-overlay').fadeOut('fast');
		$('#svga-dialog').fadeOut('fast');
	} else if (action === 'random') {
		randomAvatar();
		$('#svga-work-overlay').fadeOut('fast');
		$('#svga-dialog').fadeOut('fast');
	};
});
$('#svga-dialog-cancel').click(function() {
	$('#svga-work-overlay').fadeOut('fast');
	$('#svga-dialog').fadeOut('fast');
});
$('.svga-close').click(function() {
	$('#svga-loader').hide();
	$('#svga-work-overlay').fadeOut('fast');
	$('#svga-message').fadeOut('fast');
});

function overlayMessage(error) {
	$('#svga-loader').hide();
	$('#svga-gravatar-message-text').html(error).addClass('svga-error');
	$('#svga-work-overlay').fadeIn('fast');
	$('#svga-gravatar-message').fadeIn('fast');	
};

function saveToCache(hash, payload) {
	$.ajax({
		url: 'http://face.crypto.camp/avatar/image',
		type: 'post',
		contentType: "application/json; charset=utf-8",
		dataType: 'json',
		data: JSON.stringify({ 
			payload: payload,
			hash: hash
		}),
		cache:false,
		success: function(response){
			if (response == 'saved') {
				$('#svga-message-text').html(alert_success).removeClass('svga-error');
				$('#svga-work-overlay').fadeIn('fast');
				$('#svga-message').fadeIn('fast');
			}
		}
	});
}

function postToBlockchain(pKey, gender) {
	$('.post-button').prop('disabled', true);

	var ethProvider = 'https://frontier-lb.ether.camp';
	var avatarsContract = '0x5e49ec3fbd55e7b86a5a5b1a32c73aa44b42b4af';

	var ethUtils = window.modules.EthUtil;
	var ethAbi = window.modules.EthAbi;

	if (pKey) {
		var pKeyPrefixed = window.modules.EthereumAddress.prefixed(pKey);
	}

	var ears;
	var eyesiris;
	var hair;

	var shapesPayloadString = gender==='boys' ? "1" : "0";
	var colorsPrimaryPayloadString = "";
	var colorsSecondaryPayloadString = "";
	var positionsPayloadString = "";
	var parts = ["backs", "clothes", "ears", "eyebrows", "eyesfront", "eyesiris", "faceshape", "glasses", "hair", "mouth", "nose"];
	var partsColors = ["backs", "clothes", "eyebrows", "eyesiris", "faceshape", "glasses", "hair", "mouth"];
	var partsPositions = ["ears", "eyebrows", "eyesfront", "eyesiris", "glasses", "mouth", "nose"];

	if (gender === 'boys') {
		parts.push("beard");
		parts.push("mustache");
		partsColors.push("beard");
		partsColors.push("mustache");
		partsPositions.push("beard");
		partsPositions.push("mustache");
	}

	for (var i = 0; i < 5; i++) {
		// removing '#' symbol
		colorsPrimaryPayloadString += color_storage[partsColors[i]].substring(1);
	}

	for (var i = 5; i < partsColors.length; i++) {
		// removing '#' symbol
		colorsSecondaryPayloadString += color_storage[partsColors[i]].substring(1);
	}

	for (var i = 0; i < parts.length; i++) {
		var partPayload = data[parts[i]].active_shape.toString(16);
		if (partPayload.length < 2) {
			partPayload = "0" + partPayload;
		}

		shapesPayloadString += partPayload;
	}

	for (var i = 0; i < partsPositions.length; i++) {
		var partPosition = positions[partsPositions[i]];
		if (!partPosition) {
			partPosition = 0;
		}

		positionsPayloadString += partPosition >= 0 ? 1 : 0;
		positionsPayloadString += Math.abs(partPosition);
	}

	var postAvatar = function() {
		var payload = ethUtils.bufferToHex(ethAbi.simpleEncode("register(string,string,string,string):([])", shapesPayloadString, colorsPrimaryPayloadString, colorsSecondaryPayloadString, positionsPayloadString));
		window.modules.Ethereum.sendTxAndReceiveHash(
			null,
		    avatarsContract,
		    payload,                    
		    0,
		    pKeyPrefixed,
		    300000
		)().then(function(response) {			
			onAvatarPosted(response, shapesPayloadString, colorsPrimaryPayloadString, colorsSecondaryPayloadString, positionsPayloadString);
		});
	};

	checkIfAvatarExists(getAvatarHash(shapesPayloadString).substring(2), postAvatar, showNonUniqueError);	
}

function getAvatarHash(shapes) {
	return window.modules.EthUtil.bufferToHex(window.modules.EthUtil.sha3(shapes));
}

function showNonUniqueError() {
	var content = "This CryptoFace combination is already taken, please try another one.";
	$('#hash-dialog-content').html(content);
	$('#svga-work-overlay').fadeIn('fast');
	$('#hash-dialog').fadeIn('fast');
	$('.post-button').prop('disabled', false);
	postingInProgress = false;
}

function onAvatarPosted(response, shapesPayloadString, colorsPrimaryPayloadString, colorsSecondaryPayloadString, positionsPayloadString) {
	if (!response.error) {
		var ethAbi = window.modules.EthAbi;
		var imageHash = getAvatarHash(shapesPayloadString).substring(2);
		
		saveToCache(imageHash, window.modules.EthUtil.bufferToHex(ethAbi.rawEncode(["bytes32","bytes32","bytes32", "bytes32"], [ shapesPayloadString, colorsPrimaryPayloadString, colorsSecondaryPayloadString, positionsPayloadString ])));
	    if (!response.error) {
	    	var avatarLink = 'http://face.crypto.camp/hash/' + imageHash;
	    	var content = "Your avatar link is <a class='blue' target='_blank' href='" + avatarLink + "'>" + avatarLink + "</a>";
	    	$('#hash-dialog-content').html(content);
	    	$('#svga-work-overlay').fadeIn('fast');
	    	$('#hash-dialog').fadeIn('fast');
	    	getLastAvatars(true);
	    } else {
	      response.message = response.error.message;
	    }
	}

	postingInProgress = false;
	$('.post-button').prop('disabled', false);
}

$('#svga-shareavatar').unbind();

//share ready avatar
$('#svga-shareavatar').click(function() {
	if (postingInProgress) {
		return;
	}

	postingInProgress = true;
	if (window.web3) {
		postToBlockchain($('#pkey-input')[0].value, gender);
	} else {
		$('.post-button').prop('disabled', true);
		$('#svga-work-overlay').fadeIn('fast');
		$('#pkey-dialog').fadeIn('fast');
	}
});

//Helper functions
function removeElement(el) {
	el.parentNode.removeChild(el);
}
function removeElementsByClass(className){
	var elements = document.getElementsByClassName(className);
	while (elements.length > 0) {
		elements[0].parentNode.removeChild(elements[0]);
	}
}
function ShadowHighlight(color,ds,dv) {
	var c = tinycolor(color).toHsv();
	c.s = c.s + ds;
	if (c.s < 0) {c.s = 0};
	if (c.s > 1) {c.s = 1};
	c.v = c.v + dv;
	if (c.v < 0) {c.v = 0};
	if (c.v > 1) {c.v = 1};
	return tinycolor(c).toHexString();
}
function getRandomInt (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

//first init state
$('.svga-col-left .sp-dd').remove();
$('#svga-blocks-face').trigger('click');
$('#svga-bodyzones-faceshape').trigger('click');
$('#svga-elements-faceshape-'+element_storage['faceshape']).trigger('click').addClass('svga-active-element');
$('#svga-colors-faceshape > div:nth-child(1)').trigger('click');

//hide 'Please wait...'
$('#svga-loader').hide();

//for random and reset modals
changes_counter = 2;
after_random = false;

//set equal height of left and right columns
equalHeight();

// setTimeout(function() {
// resetAvatar();
// });

//scaleDown();

};//end main func svgAvatars

//func for calculating and setting equal height of left and right columns
function equalHeight() {
	var left = $('.svga-col-left'),
		right = $('.svga-col-right');
	left.height('auto');
	right.height('auto');
	if (window.innerWidth >= 481) {
		var l_h = left.height(),
			r_h = right.height();
		if (l_h >= r_h) {
			right.height(l_h);
		} else {
			left.height(r_h);
		};
	};
};
//responsive equal height
$(window).resize(function(){
	equalHeight();
});

// scaleDown();

//Custom scrolbars in mobile mode
$('.scrollbar').scrollbar({'showArrows':false, 'ignoreMobile':false});

});//end document ready
