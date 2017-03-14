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
	save_format = 'png', //must be exactly 'png' or 'svg' for storing on a server
	save_size = 500, //the dimentions for avatar stored on a server (pixels)
	svg_download_size = 600, //the conditional dimentions of SVG file when download by user (pixels)
	png_one_download_size = 500, //the dimentions of first option PNG file when download by user (pixels)
	png_two_download_size = 400, //the dimentions of second option PNG file when download by user (pixels)
	png_ios_download_size = 500, //the dimentions of PNG file when download by user on iOS devices (pixels)
	png_win8tablet_download_size = 400, //the dimentions of PNG file when download by user on Win8 phones and tablets (pixels)
	gravatar_size = 200,//the dimentions of PNG file for Gravatar service (pixels)
	hide_save = true, //true will disable save on your server option
	hide_svg_download_on_Android = true, //true will disable download SVG option on Android devices (not useful)
	hide_svg_download = true, //true will disable download SVG option
	hide_png_one_download = false, //true will disable download PNG with first dimensions
	hide_png_two_download = false, //true will disable download PNG with second dimensions
	hide_gravatar = false, //true will disable the possibility to install created avatar as gravatar
	color_theme = 'dark'; //must be exactly 'light' or 'dark'

//Share options
var	hide_share = false, //true will disable share option
	share_image_size = 500, //the dimentions of PNG file for share with Social networks (pixels)
	facebook_app_id = 'replace me!', //you must have an Facebook's App ID for correct work of share function (https://developers.facebook.com/apps)
	facebook = true, //false will disable Facebook share option
	twitter = true, //false will disable Twitter share option
	pinterest = true, //false will disable Pinterest share option
	googleplus = true, //false will disable Google Plus share option
	share_link = document.URL, //will be an URL of a HTML page where the generator is placed
	share_title = document.title, //will be the title tag of a HTML page where the generator is placed
	share_description = '', //if you leave it blank, it might be taken from your meta description tag
	share_credit = 'Created on YourSite.com';//replase YourSite.com with yours or leave it blank (do NOT delete variable itself!), if you don't want a watermark on avatar for Social share

//Calling the func with translation.
//It must be defined in HTML file above this file like so:
//<script src="svgavatars/js/svgavatars.??.js"></script>
//<script src="svgavatars/js/svgavatars.core.js"></script>
//where ?? are 2 letters of language code
svgAvatarsTranslation(png_one_download_size, png_two_download_size);	

var postingInProgress = false;
var positions = {};
var resetAvatar;

//Extend SVGJS lib with special methods for controls
SVG.extend(SVG.Element, {
	svgaCenterScale: function(sx, sy) {
		var temp = this.bbox();
		var cx = temp.cx,
			cy = temp.cy;
		if (!sy) {sy = sx};
		return this.transform({
			a: sx,
			b: 0,
			c: 0,
			d: sy,
			e: cx - sx * cx,
			f: cy - sy * cy
		});
	},
	svgaLeft: function(times, step) {
		var times = times ? times : 3,
				step = step ? step : lr_step,
				leftright = this.data('leftright'),
				updown = this.data('updown');
		if ( leftright > -(times*step) ) {
			this.move(leftright-step, updown);
			this.data('leftright', leftright-step-0.0000001);
		};
		return this;
	},
	svgaRight: function(times, step) {
		var times = times ? times : 3,
				step = step ? step : lr_step,
				leftright = this.data('leftright'),
				updown = this.data('updown');
		if ( leftright < times*step ) {
			this.move(leftright+step, updown);
			this.data('leftright', leftright+step+0.0000001);
		};
		return this;
	},
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
	},
	svgaScaleUp: function(times, stepX, stepY) {
		var times = times ? times : 3,
				stepX = stepX ? stepX : scale_step,
				stepY = stepY ? stepY : stepX,
				scaleX = this.data('scaleX')+0.0000001,
				scaleY = this.data('scaleY')+0.0000001;
		if ( scaleX < 1+times*stepX ) {
			this.svgaCenterScale(scaleX+stepX, scaleY+stepY);
			this.data('scaleX', scaleX+stepX+0.00000011);
			this.data('scaleY', scaleY+stepY+0.00000011);
		};
		return this;
	},
	svgaScaleDown: function(times,stepX,stepY) {
		var times = times ? times : 3,
				stepX = stepX ? stepX : scale_step,
				stepY = stepY ? stepY : stepX,
				scaleX = this.data('scaleX')-0.0000001,
				scaleY = this.data('scaleY')-0.0000001;
		if ( scaleX > 1-times*stepX ) {
			this.svgaCenterScale(scaleX-stepX, scaleY-stepY);
			this.data('scaleX', scaleX-stepX-0.00000011);
			this.data('scaleY', scaleY-stepY-0.00000011);
		};
		return this;
	},
	svgaRotateLeft: function(times, step, cx, cy) {
		var times = times ? times : 2,
				step = step ? step : rotate_step,
				rotate = this.data('rotate');
		if ( rotate > -(times*step) ) {
			this.rotate(rotate-step-0.0000001, cx, cy);
			this.data('rotate', rotate-step);
		};
		return this;
	},
	svgaRotateRight: function(times, step, cx, cy) {
		var times = times ? times : 2,
				step = step ? step : rotate_step,
				rotate = this.data('rotate');
		if ( rotate < times*step ) {
			this.rotate(rotate+step+0.0000001, cx, cy);
			this.data('rotate', rotate+step);
		};
		return this;
	},
	svgaCancelRotate: function() {
		return this.rotate(0.0000001).data('rotate',0.0000001,true);
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

//exit from script if SVG is not supported
if (!SVG.supported) {
	return;
};

//hiding unwanted options
if (hide_save) {
	$('#svga-saveavatar').remove();
};
if (hide_share) {
	$('#svga-shareavatar').remove();
};
if (hide_svg_download && hide_png_one_download && hide_png_two_download) {
	$('#svga-downloadavatar').remove();
} else {
	if (hide_png_one_download) {
		$('#svga-png-one').remove();
	};
	if (hide_png_two_download) {
		$('#svga-png-two').remove();
	};
	if (hide_svg_download) {
		$('#svga-svgfile').remove();
	};
};
if (hide_gravatar) {
	$('#svga-gravataravatar').remove();
};

//hiding unwanted share services
if (!facebook) {
	$('#svga-share-facebook').remove();
};
if (!twitter) {
	$('#svga-share-twitter').remove();
};
if (!pinterest) {
	$('#svga-share-pinterest').remove();
};
if (!googleplus) {
	$('#svga-share-googleplus').remove();
};

//iOS Safari doesn't allow to force download any files, so it's not possible to save an SVG file.
//Also only one PNG dimensions will be available for download when '#svga-downloadavatar' is taped.
if (iOS) {
	$('#svga-container').removeClass('svga-no-touch');
	$('#svga-downloadavatar > ul').remove();
};
//Hide SVG download on Android devices
if (Android && hide_svg_download_on_Android) {
	$('#svga-svgfile').remove();
};
//Add special class for Opera browser
if (Opera) {
	$('#svga-container').addClass('svga-opera');
};
//Add special class and download option for Win8 phones and tablets
//Win phones doesn't correctly work with hover event and 
//doesn't allow to swipe the content (colors, graphic parts, etc.) in mobile view (breakpoint 481px)
if (Win8tablet) {
	$('#svga-container').addClass('svga-win8tablet');
	$('#svga-downloadavatar > ul').remove();
};

//icons on start screen init
$('#svga-start-boys').append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40px" height="40px" viewBox="0 0 80 80"><path class="svga-icon-boy" d="M73.22,72.6c-1.05-6.99-8.49-9.28-14.35-10.97c-3.07-0.89-6.98-1.58-9.48-3.72C47.3,56.13,47.5,50.9,49,49.8c3.27-2.39,5.26-7.51,6.14-11.25c0.25-1.07-0.36-0.46,0.81-0.64c0.71-0.11,2.13-2.3,2.64-3.21c1.02-1.83,2.41-4.85,2.42-8.02c0.01-2.23-1.09-2.51-2.41-2.29c-0.43,0.07-0.93,0.21-0.93,0.21c1.42-1.84,1.71-8.22-0.67-13.4C53.56,3.71,44.38,2,40,2c-2.35,0-7.61,1.63-7.81,3.31c-3.37,0.19-7.7,2.55-9.2,5.89c-2.41,5.38-1.48,11.4-0.68,13.4c0,0-0.5-0.14-0.93-0.21c-1.32-0.21-2.42,0.07-2.41,2.29c0.01,3.16,1.41,6.19,2.43,8.02c0.51,0.91,1.93,3.1,2.64,3.21c1.17,0.18,0.56-0.42,0.81,0.64c0.89,3.74,3.09,9.03,6.14,11.25c1.69,2.04,1.7,6.33-0.39,8.11c-2.84,2.43-7.37,3.07-10.84,4.12c-5.86,1.77-13.29,4.9-13.27,12.25C6.51,76.73,7.7,78,10.13,78h59.74c2.43,0,3.68-1.27,3.63-3.72C73.5,74.28,73.4,73.81,73.22,72.6C72.63,68.73,73.4,73.81,73.22,72.6z"/></svg>');
$('#svga-start-girls').append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40px" height="40px" viewBox="0 0 80 80"><path class="svga-icon-girl" d="M71,74.56c-0.08-5.44-4.21-7.67-8.81-9.63c-3.65-1.55-12.07-2.23-13.83-6.23c-0.83-1.89-0.22-3.15,0.11-5.85c6.95,0.23,17.72-5.29,19.02-10.4c0.65-2.55-2.79-4.44-4.22-6.01c-1.86-2.04-3.3-4.5-4.29-7.07c-2.17-5.61-0.2-11.18-2.14-16.7C54.18,5.14,46.53,2.01,40,2.01l0,0c0,0,0,0,0,0s0,0,0,0l0,0c-6.53,0-14.18,3.13-16.83,10.66c-1.94,5.51,0.03,11.09-2.14,16.7c-0.99,2.57-2.44,5.03-4.29,7.07c-1.43,1.58-4.87,3.46-4.22,6.01c1.3,5.1,12.07,10.62,19.02,10.4c0.34,2.7,0.94,3.95,0.11,5.85c-1.75,3.99-10.18,4.67-13.83,6.23c-4.6,1.96-8.74,4.2-8.81,9.63c-0.04,2.79-0.04,3.43,3.49,3.43H67.5C71.04,77.99,71.04,77.35,71,74.56z"/></svg>');

getLastAvatars(true);

function chooseBoys() {
	$('#svga-gender').hide();
	$('#svga-elements').empty();
	$('#svga-colors').empty();	

	setTimeout(function(){
		$.ajax({
			url: path_to_folder + 'json/svgavatars-male-data.json',
			async: false,
			dataType: 'json',
			success: function (data) {
				svgAvatars('boys', data);
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

function chooseGirls() {
	$('#svga-gender').hide();
	$('#svga-elements').empty();
	$('#svga-colors').empty();	

	setTimeout(function(){
		$.ajax({
			url: path_to_folder + 'json/svgavatars-female-data.json',
			async: false,
			dataType: 'json',
			success: function (data) {
				svgAvatars('girls', data);
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
		down:'M7.575,12.824c0.235,0.234,0.614,0.234,0.849,0l4.808-4.809c0.235-0.234,0.235-0.613,0-0.85l-0.565-0.564c-0.234-0.235-0.614-0.235-0.849,0L9,9.42V3.6C9,3.268,8.732,3,8.4,3H7.6C7.269,3,7,3.27,7,3.6v5.82L4.182,6.602c-0.234-0.234-0.615-0.234-0.849,0L2.768,7.168c-0.234,0.234-0.234,0.613,0,0.848L7.575,12.824z',
		left:'M3.176,7.575c-0.234,0.235-0.234,0.614,0,0.849l4.809,4.808c0.234,0.235,0.613,0.235,0.85,0l0.564-0.565c0.235-0.234,0.235-0.614,0-0.849L6.58,9H12.4C12.732,9,13,8.732,13,8.4V7.6C13,7.269,12.73,7,12.4,7H6.58l2.819-2.818c0.234-0.234,0.234-0.615,0-0.849L8.832,2.768c-0.234-0.234-0.613-0.234-0.848,0L3.176,7.575z',
		right:'M12.824,8.425c0.234-0.235,0.234-0.614,0-0.849L8.016,2.769c-0.234-0.235-0.613-0.235-0.85,0L6.602,3.334c-0.235,0.234-0.235,0.614,0,0.849L9.42,7H3.6C3.268,7,3,7.268,3,7.6V8.4C3,8.731,3.27,9,3.6,9h5.82l-2.818,2.818c-0.234,0.234-0.234,0.614,0,0.849l0.566,0.565c0.234,0.234,0.613,0.234,0.848,0L12.824,8.425z',
		tightly:'M12.594,8l3.241,3.205c0.22,0.216,0.22,0.567,0,0.783l-0.858,0.85c-0.219,0.217-0.575,0.217-0.795,0L9.683,8.393c-0.221-0.216-0.221-0.568,0-0.785l4.499-4.445c0.22-0.217,0.576-0.217,0.795,0l0.858,0.849c0.22,0.217,0.22,0.568,0,0.785L12.594,8z M0.164,11.205c-0.219,0.216-0.219,0.567,0,0.783l0.859,0.85c0.221,0.217,0.575,0.217,0.795,0l4.499-4.445c0.22-0.217,0.22-0.568,0-0.785L1.818,3.163c-0.221-0.217-0.576-0.217-0.795,0L0.164,4.012c-0.219,0.217-0.219,0.568,0,0.785L3.405,8L0.164,11.205z',
		wider:'M3.039,8.001l3.203,3.203c0.217,0.216,0.217,0.567,0,0.784l-0.85,0.85c-0.217,0.217-0.567,0.217-0.785,0L0.163,8.393c-0.217-0.216-0.217-0.568,0-0.785l4.444-4.445c0.218-0.217,0.568-0.217,0.785,0l0.85,0.849c0.217,0.217,0.217,0.568,0,0.785L3.039,8.001z M9.758,11.204c-0.217,0.216-0.217,0.567,0,0.784l0.85,0.849c0.217,0.218,0.568,0.218,0.785,0l4.445-4.444c0.217-0.218,0.217-0.568,0-0.785l-4.445-4.445c-0.219-0.217-0.568-0.217-0.785,0l-0.85,0.849c-0.217,0.217-0.217,0.568,0,0.785l3.203,3.204L9.758,11.204z',
		scaledown:'M13.974,12.904l-2.716-2.715c-0.222-0.223-0.582-0.223-0.804,0L8.82,8.541c0.708-0.799,1.229-1.865,1.229-3.017C10.049,3.026,8.023,1,5.524,1S1,3.026,1,5.524c0,2.499,2.025,4.524,4.524,4.524c0.899,0,1.791-0.307,2.496-0.758l1.63,1.701c-0.223,0.223-0.223,0.582,0,0.805l2.716,2.717c0.222,0.221,0.582,0.221,0.804,0l0.804-0.805C14.196,13.486,14.196,13.127,13.974,12.904z M5.485,8.461c-1.662,0-3.009-1.378-3.009-3.041s1.347-3.009,3.009-3.009c1.661,0,3.071,1.347,3.071,3.009S7.146,8.461,5.485,8.461z M7.5,6h-4V5h4V6z',
		scaleup:'M13.974,12.904l-2.716-2.715c-0.222-0.223-0.582-0.223-0.804,0L8.82,8.541c0.708-0.799,1.229-1.865,1.229-3.016C10.049,3.026,8.023,1,5.524,1S1,3.026,1,5.524c0,2.499,2.025,4.524,4.524,4.524c0.899,0,1.792-0.307,2.496-0.758l1.63,1.701c-0.223,0.223-0.223,0.582,0,0.805l2.716,2.717c0.222,0.221,0.582,0.221,0.804,0l0.804-0.805C14.196,13.486,14.196,13.127,13.974,12.904z M5.485,8.46c-1.662,0-3.009-1.378-3.009-3.04c0-1.662,1.347-3.009,3.009-3.009c1.661,0,3.071,1.347,3.071,3.009C8.557,7.082,7.146,8.46,5.485,8.46z M7.5,6H6v1.5H5V6H3.5V5H5V3.5h1V5h1.5V6z',
		eb1:'M5.453,8.316C5.129,7.499,4.146,6.352,1.492,5.521C1.087,5.393,0.868,4.982,1.003,4.602c0.135-0.379,0.572-0.586,0.98-0.458c2.996,0.938,4.917,2.505,5.015,4.088c0.026,0.4-0.3,0.767-0.728,0.767C5.875,8.998,5.531,8.514,5.453,8.316z M9.021,8.313C8.66,8.077,8.593,7.626,8.841,7.301c0.983-1.288,3.5-1.651,6.569-0.948c0.415,0.095,0.669,0.489,0.567,0.877c-0.102,0.39-0.518,0.628-0.937,0.533c-2.718-0.623-4.315-0.188-4.939,0.282C9.908,8.191,9.5,8.625,9.021,8.313z',
		eb2:'M9.729,8.998c-0.428,0-0.753-0.366-0.728-0.767c0.098-1.583,2.02-3.149,5.016-4.088c0.407-0.128,0.845,0.079,0.979,0.458c0.136,0.38-0.083,0.792-0.488,0.919c-2.654,0.831-3.638,1.978-3.961,2.796C10.469,8.514,10.125,8.998,9.729,8.998z M5.898,8.045C5.274,7.576,3.677,7.141,0.959,7.764C0.54,7.858,0.124,7.62,0.022,7.23C-0.079,6.842,0.175,6.448,0.59,6.353c3.069-0.703,5.586-0.34,6.569,0.948c0.248,0.325,0.181,0.776-0.18,1.012C6.5,8.625,6.092,8.191,5.898,8.045z',
		eb3:'M5.453,8.316C5.129,7.499,4.146,6.352,1.492,5.521C1.087,5.393,0.868,4.982,1.003,4.602c0.135-0.379,0.572-0.586,0.98-0.458c2.996,0.938,4.917,2.505,5.015,4.088c0.026,0.4-0.3,0.767-0.728,0.767C5.875,8.998,5.531,8.514,5.453,8.316z M9.729,8.998c-0.428,0-0.753-0.366-0.728-0.767c0.098-1.583,2.02-3.149,5.016-4.088c0.407-0.128,0.845,0.079,0.979,0.458c0.136,0.38-0.083,0.792-0.488,0.919c-2.654,0.831-3.638,1.978-3.961,2.796C10.469,8.514,10.125,8.998,9.729,8.998z',
		eb4:'M5.728,6.662C4.873,6.458,3.369,6.605,1.166,8.303C0.829,8.562,0.367,8.506,0.133,8.176C-0.1,7.848-0.019,7.371,0.32,7.111C2.807,5.195,5.192,4.52,6.545,5.348c0.343,0.208,0.456,0.685,0.211,1.036C6.528,6.708,5.935,6.711,5.728,6.662z M9.244,6.383C8.999,6.033,9.111,5.556,9.455,5.348c1.353-0.828,3.737-0.152,6.225,1.764c0.339,0.26,0.421,0.737,0.187,1.065c-0.233,0.33-0.695,0.386-1.032,0.127c-2.203-1.698-3.707-1.845-4.563-1.641C10.065,6.712,9.471,6.708,9.244,6.383z',
		ebcancel:'M11.294,3.091l1.617,1.615c0.119,0.12,0.119,0.315,0,0.436L10.052,8l2.858,2.858c0.12,0.12,0.12,0.314,0.001,0.435l-1.617,1.618c-0.12,0.119-0.314,0.119-0.435-0.001l-2.858-2.859l-2.86,2.86c-0.12,0.119-0.314,0.119-0.435-0.001L3.09,11.293c-0.12-0.12-0.12-0.314,0-0.435L5.949,8L3.09,5.142c-0.12-0.12-0.12-0.315,0-0.436l1.616-1.615c0.12-0.121,0.314-0.121,0.435,0l2.86,2.858l2.858-2.858C10.979,2.97,11.174,2.97,11.294,3.091z',
		tiltleft:'M13.399,10h-0.851c-0.165,0-0.299-0.135-0.31-0.3C12.085,7.494,10.244,5.75,8,5.75c-1.393,0-2.627,0.67-3.402,1.705l1.335,1.333C6.049,8.904,6.01,9,5.845,9H2.3C2.135,9,2,8.865,2,8.699V5.156C2,4.99,2.095,4.951,2.212,5.068l1.354,1.354C4.611,5.129,6.208,4.3,8,4.3c3.047,0,5.535,2.393,5.691,5.4C13.7,9.865,13.564,10,13.399,10z',
		tiltright:'M2.309,9.7C2.465,6.693,4.953,4.3,8,4.3c1.792,0,3.389,0.829,4.434,2.122l1.354-1.354C13.905,4.951,14,4.99,14,5.156v3.543C14,8.865,13.865,9,13.7,9h-3.545C9.99,9,9.951,8.904,10.067,8.787l1.335-1.333C10.627,6.42,9.393,5.75,8,5.75c-2.244,0-4.085,1.744-4.239,3.95C3.75,9.865,3.616,10,3.451,10h-0.85C2.435,10,2.3,9.865,2.309,9.7z',
		back:'M1.17,6.438l4.406,4.428C5.811,11.1,6,11.021,6,10.689V8c0,0,8,0,8,7C14,3,6,4,6,4V1.311c0-0.332-0.189-0.41-0.424-0.176L1.17,5.563C0.943,5.805,0.943,6.197,1.17,6.438z',
		forward:'M14.829,6.438l-4.405,4.428C10.189,11.1,10,11.021,10,10.689V8c0,0-8,0-8,7C2,3,10,4,10,4V1.311c0-0.332,0.189-0.41,0.424-0.176l4.405,4.429C15.057,5.805,15.057,6.197,14.829,6.438z',
		random:'M24.311,14.514c-0.681,0-1.225,0.553-1.318,1.227c-0.599,4.243-4.245,7.512-8.655,7.512c-2.86,0-6.168-2.057-7.711-4.112l-3.655-4.412c-0.196-0.205-0.547-0.292-0.74-0.131C2.107,14.702,2,14.833,2,14.974v9.503c0,0.339,0.194,0.42,0.436,0.181l2.782-2.782c2.149,2.658,5.436,4.358,9.119,4.358c6.056,0,11.04-4.594,11.657-10.489c0.072-0.678-0.488-1.231-1.169-1.231H24.311z M3.689,13.486c0.681,0,1.225-0.553,1.319-1.227c0.598-4.243,4.245-7.512,8.654-7.512c2.861,0,5.816,1.542,7.71,4.112l3.655,4.412c0.195,0.205,0.547,0.293,0.739,0.13C25.893,13.299,26,13.167,26,13.026V3.522c0-0.339-0.195-0.419-0.437-0.181l-2.782,2.784c-2.149-2.659-5.435-4.36-9.119-4.36c-6.056,0-11.04,4.595-11.656,10.49c-0.072,0.678,0.488,1.231,1.169,1.231H3.689z M15.277,16.982h-1.896l-0.006-0.231c-0.026-1.809,1.087-2.446,2.282-3.581c1.224-1.162-0.229-2.5-1.542-2.339c-0.789,0.097-1.337,0.646-1.574,1.385c-0.166,0.517-0.158,0.653-0.158,0.653l-1.744-0.545c0.051-0.838,0.446-1.583,1.071-2.137c1.202-1.06,3.252-1.16,4.651-0.442c1.418,0.727,2.229,2.522,1.196,3.913C16.638,14.899,15.247,15.266,15.277,16.982z M13.382,19.719v-1.977h1.974v1.977H13.382z',
		reset:'M5.515,5.515c-4.686,4.686-4.686,12.284,0,16.971c4.687,4.687,12.284,4.686,16.971,0c4.687-4.687,4.687-12.284,0-16.971C17.799,0.829,10.201,0.828,5.515,5.515z M6.929,6.929C10.595,3.263,16.4,3.04,20.328,6.258L6.257,20.328C3.04,16.4,3.263,10.595,6.929,6.929z M21.071,21.071c-3.667,3.666-9.471,3.89-13.4,0.671l14.071-14.07C24.961,11.601,24.737,17.405,21.071,21.071z',
		save:'M25.64,7.142l-4.761-4.779C20.679,2.162,20.282,2,20,2H3.026C2.458,2,2,2.459,2,3.027v21.946C2,25.539,2.458,26,3.026,26h21.947C25.541,26,26,25.539,26,24.974V8.02C26,7.736,25.839,7.341,25.64,7.142z M14,4v5h-4V4H14z M20,24H8v-8h12V24z M24,24h-2v-8.973C22,14.461,21.541,14,20.969,14H7.027C6.458,14,6,14.461,6,15.027V24H4V4h2v4.97C6,9.538,6.458,10,7.027,10h7.862C15.456,10,16,9.538,16,8.97V4h3.146c0.281,0,0.674,0.162,0.873,0.363l3.623,3.257C23.838,7.817,24,8.212,24,8.495V24z M19,18H9v-1h10V18z M19,20H9v-1h10V20z M19,22H9v-1h10V22z',
		download:'M28,24.8c0,0.663-0.537,1.2-1.2,1.2H1.2C0.537,26,0,25.463,0,24.8v-4.2C0,20.293,0.297,20,0.6,20H3.4C3.703,20,4,20.293,4,20.6V22h20v-1.4c0-0.307,0.299-0.6,0.601-0.6h2.8c0.302,0,0.6,0.293,0.6,0.6V24.8z M14.873,19.658l8.857-8.811C24.199,10.379,24.043,10,23.379,10H18V3.2C18,2.538,17.463,2,16.801,2H11.2C10.537,2,10,2.538,10,3.2V10H4.621c-0.662,0-0.82,0.379-0.352,0.848l8.855,8.811C13.607,20.113,14.391,20.113,14.873,19.658z',
		gravatar:'M16.39,7.2c0,0.19,0,5.34,0,5.53c-0.03,3.21-4.73,3.26-4.76,0.04c-0.01-1.37-0.01-7.55,0-8.25c0.01-1.54,1.01-2.53,2.54-2.52c5.75,0.05,10.74,4.38,11.62,10.07c1.01,6.54-3.25,12.55-9.72,13.74c-10.9,2-18.81-11.34-10.64-20.16c2.23-2.4,5.84,0.85,3.56,3.24C4.1,14,8.12,21.58,14.54,21.13C22.24,20.58,23.72,9.79,16.39,7.2z',
		share:'M21.32,19.51l-3.7-2.61c0.66-1.59,0.46-3.4-0.58-4.83l3.01-3.4C22.39,9.74,25,8.03,25,5.5C25,3.57,23.43,2,21.5,2c-2.74,0-4.43,3.03-2.95,5.37l-2.98,3.36c-1.51-0.91-3.33-1.01-5-0.07L7.62,7.44C7.85,7.01,8,6.52,8,6c0-3.96-6-3.97-6,0c0,2.14,2.17,3.59,4.15,2.77l2.91,3.19c-1.41,1.82-1.41,4.25-0.02,6.07l-2.8,3.1C4.57,20.6,3,21.87,3,23.5C3,24.88,4.12,26,5.5,26c1.8,0,3.06-1.87,2.25-3.57l2.8-3.1c2.08,1.18,4.46,0.72,5.97-0.79l3.63,2.56C18.74,25.57,26,26.53,26,22C26,19.58,23.29,18.18,21.32,19.51z',
		facebook:'M27 2H5C3.34 2 2 3.34 2 5v22c0 1.66 1.34 3 3 3h22c1.66 0 3-1.34 3-3V5C30 3.34 28.66 2 27 2zM23.66 16.11h-3.28V28h-4.92V16.11H13v-4.1h2.46c0-3.5-0.53-7.79 5.33-7.79h3.28v4.1c-4.09 0-3.68-0.32-3.7 3.69h3.72L23.66 16.11z',
		twitter:'M27 2H5C3.34 2 2 3.34 2 5v22c0 1.66 1.34 3 3 3h22c1.66 0 3-1.34 3-3V5C30 3.34 28.66 2 27 2zM24.75 11.57c0.26 6.54-4.58 13.43-12.83 13.43 -3.9 0-6.55-1.75-6.92-2.03 3.58 0.47 6.14-1.37 6.68-1.87 -2.1 0.04-3.84-1.7-4.22-3.13 1.02 0.24 2.04-0.08 2.04-0.08 -2.49-0.5-3.68-2.79-3.62-4.48 0.77 0.4 1.32 0.5 2.04 0.56 -1.74-1.17-2.74-3.73-1.4-6.03 3.69 4.4 8.37 4.67 9.3 4.72 -0.86-4.93 4.74-7.25 7.69-4.12 1.03-0.2 1.99-0.58 2.86-1.09 -0.34 1.05-1.05 1.94-1.98 2.5C25.32 9.84 26.19 9.6 27 9.24 26.39 10.14 25.63 10.94 24.75 11.57z',
		googleplus:'M12.22 11.62c-0.43-3.29-2.83-5.94-5.34-6.01 -2.52-0.07-4.2 2.45-3.77 5.74C4.17 19.41 13.24 19.4 12.22 11.62zM30 10V5c0-1.7-1.3-3-3-3H5C3.3 2 2 3.3 2 5c0 0 0.02 0.88 0 1.54C5.68 3.3 7.72 3.96 17.87 3.96l-2.19 1.85h-3.1c2.72 1.04 5.92 6.4 0.39 10.71 -1.58 1.23-1.88 1.74-1.88 2.78 0 0.89 1.69 2.41 2.57 3.03 2.58 1.82 3.42 3.51 3.42 6.33 0 0.45-0.05 0.9-0.17 1.34H27c1.7 0 3-1.3 3-3V12h-6v6h-2v-6h-6v-2h6V4h2v6H30zM8.78 22.93C7.5 21.7 7 20.2 7.94 18.42 7.4 18.5 4.23 18.6 2 16.7v7.36C4.83 22.71 8.78 22.93 8.78 22.93zM2 26.45v0.7C2 28.85 3.3 30 5 30h9.5C15.46 24.15 6.21 21.86 2 26.45z',
		pinterest:'M27 2H5C3.34 2 2 3.34 2 5v22c0 1.66 1.34 3 3 3h22c1.66 0 3-1.34 3-3V5C30 3.34 28.66 2 27 2zM17.36 20.23c-1.28-0.1-1.81-0.73-2.82-1.34C14 21.78 13.32 24.55 11.33 26c-0.62-4.37 0.9-7.65 1.61-11.13 -1.2-2.03 0.15-6.1 2.68-5.1 3.12 1.24-2.71 7.53 1.21 8.32 4.09 0.82 5.75-7.09 3.22-9.66 -3.66-3.71-10.66-0.08-9.8 5.23 0.21 1.3 1.55 1.69 0.54 3.49C5.64 16 7.18 5.94 14.95 5.07 27.93 3.62 25.78 20.89 17.36 20.23L17.36 20.23z'
	},
	control_names = ['up','down'],
	glob_control_names = ['up','down','left','right','scaledown','scaleup','tiltleft','tiltright'],
	menu_names = ['random','reset','save','share','gravatar','download'],
	share_names = ['facebook','twitter','pinterest','googleplus'],
	share_colors = ['#385997','#19A6CA','#CB2028','#D33D2C'],
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
	if (share_credit) {
		draw = SVG.get('svga-group-wrapper');
		rect = draw.rect(200,15).move(0,185).fill('#ecf0f1').opacity(0.5);
		text = draw.text(share_credit).font({
			family: '"Roboto", "Helvetica Neue", Helvetica, Arial, sans-serif',
			size:   '0.84em',
			anchor: 'middle',
			weight: 400 }).fill('#000');
		var w = text.bbox().width;
		text.move( (200-w)/2,185 );
		rect.hide();
		text.hide();
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

//creating icons in menu (random, reset, save, download)
for (var i = 0; i < menu_names.length; i++) {
	$('#svga-'+menu_names[i]+'avatar > div').append('<svg class="svga-menu-icon" xmlns="http://www.w3.org/2000/svg" version="1.1" xlink="http://www.w3.org/1999/xlink" viewBox="0 0 28 28" preserveAspectRatio="xMinYMin meet"><path class="svga-menu-icon-path" d="'+ icons_data[menu_names[i]] +'"/></svg>');
};

//creating socials icons svga-facebook-icon
for (var i = 0; i < share_names.length; i++) {
	$('#svga-'+share_names[i]+'-icon').append('<svg class="svga-share-icons" xmlns="http://www.w3.org/2000/svg" version="1.1" xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" preserveAspectRatio="xMinYMin meet"><path class="svga-share-icons-path" fill="' + share_colors[i] + '" d="'+ icons_data[share_names[i]] +'"/></svg>');
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
	$('#svga-ios').fadeOut('fast');
	$('#svga-share-block').fadeOut('fast');
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

// scaleDown();

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