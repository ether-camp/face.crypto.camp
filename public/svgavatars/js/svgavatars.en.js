/**************************************************************************
 * svgavatars.en.js - English file
 * @version: 1.3 (20.01.2014)
 * @requires jQuery v1.8.2 or later
 * @URL http://svgavatars.com
 * @author DeeThemes (http://codecanyon.net/user/DeeThemes)
**************************************************************************/

function svgAvatarsTranslation (png_one_download_size, png_two_download_size) {

//Ready for the translation to your language (any text inside quotes and please don't break JavaScript sintax!)
return welcome_slogan = '<h2>Welcome to SVG Avatar Generator</h2>',
	welcome_msg = '<p>please choose a gender</p>',
	wait_msg = '<p>please wait...</p>',
	rnd_msg  = 'random',
	reset_msg  = 'reset',
	save_msg  = 'save',
	share_msg = 'post to blockchain',
	gravatar_msg = 'Gravatar',
	dnl_msg  = 'download',
	svg_msg = 'svg - vector format',
	png_one_msg = 'png - ' + png_one_download_size + 'x' + png_one_download_size,
	png_two_msg = 'png - ' + png_two_download_size + 'x' + png_two_download_size,
	confirm_msg = '<h3>Are you sure?</h3><p>The all current changes will be lost.</p>',
	enter_pkey_msg = '<p>Please enter your private key.</p>',	
	ios_msg = '<p>Please tap and hold the image and choose Save</p>',
	gravatar_title = '<h3>You can upload to and use the created avatar on Gravatar.com</h3><p>Please enter your Gravatar email and password</p>',
	gravatar_email = 'Your Gravatar email',
	gravatar_pwd = 'Your Gravatar password',
	gravatar_rating = 'Rating:',
	gravatar_note ='<p><small>Note: Your email and password will NEVER be stored on our server</small></p>',
	install_msg = 'upload',
	alert_svg_support_error = 'Sorry, but your browser does not support SVG (Scalable Vector Graphic).<br> Avatar Generator cannot start.',
	alert_json_error = '<h3>Error loading graphic data!</h3><p>Please reload a page</p>',
	alert_success = '<h3>Your avatar is stored on our server.</h3><p>Thank you!</p>',
	alert_error = '<h3>Avatar is not saved!</h3><p>Please try again</p>',
	alert_error_download = '<h3>An error occured!</h3><p>Please try again</p>',
	alert_error_image = '<h3>The image is broken!</h3><p>Please try again</p>',
	alert_success_gravatar = '<h3>Congratulations!</h3><p>You have successfully changed your Gravatar.</p><p>Please allow 5 to 10 minutes for avatar changes to take effect</p>',
	alert_common_error_gravatar = '<h3>An unknown error occured!</h3><p>Please try again</p>',
	alert_error_ratingfail = '<h3>The wrong Rating value!</h3><p>Don\'t change input radio values. Please try again</p>',
	alert_error_emailfail = '<h3>Email is empty!</h3><p>Please enter your email and try again</p>',
	alert_error_passwordfail = '<h3>Password is empty!</h3><p>Please enter your password and try again</p>',
	alert_error_imagefail = '<h3>An error with converting your avatar to PNG data!</h3><p>Please try again</p>',
	alert_error_faultcode_8 = '<h3>Internal error on secure.gravatar.com</h3><p>Please try later</p>',
	alert_error_faultcode_9 = '<h3>Incorrect Email or Password!</h3><p>Please check them and try again</p>',
	crd_msg = 'Graphic engine by ',
	ok_msg = 'ok',
	cancel_msg = 'cancel',
	close_msg = 'close',
	tryagain_msg = 'try again',
	block_titles = {
		face:'face',
		eyes:'eyes',
		hair:'hair',
		clothes:'clothes',
		backs:'backs'
	},
	body_zone_titles = {
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
};