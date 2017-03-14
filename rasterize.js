var redirectCount = 0;
var system = require('system');
var page = require('webpage').create(),
    address, output, size, delaySeconds;

page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.87 Safari/537.36';

function renderPage(address, sargs) {
    

    page.onResourceReceived = function(resource) {
        if (address == resource.url && resource.redirectURL) {
            redirectURL = resource.redirectURL;
        }
    };

    output = sargs[2];
    page.viewportSize = { width: 500, height: 500 };
    page.zoomFactor = 1;
    if (sargs.length > 3 && sargs[2].substr(-4) === ".pdf") {
        size = sargs[3].split('*');
        page.paperSize = size.length === 2 ? { width: size[0], height: size[1], margin: '0px' }
                                           : { format: sargs[3], orientation: 'portrait', margin: '1cm' };
    } else if (sargs.length > 3 && sargs[3].substr(-2) === "px") {
        size = sargs[3].split('*');
        if (size.length === 2) {
            pageWidth = parseInt(size[0], 10);
            pageHeight = parseInt(size[1], 10);
            page.viewportSize = { width: pageWidth, height: pageHeight };
            page.clipRect = { top: 0, left: 0, width: pageWidth, height: pageHeight };
        } else {
            console.log("size:", sargs[3]);
            pageWidth = parseInt(sargs[3], 10);
            pageHeight = parseInt(pageWidth * 3/4, 10); // it's as good an assumption as any
            console.log ("pageHeight:",pageHeight);
            page.viewportSize = { width: pageWidth, height: pageHeight };
        }
    }
    
    if (sargs.length > 4 && sargs[4]) {
        delaySeconds = parseInt(sargs[4]) * 1000;
    }

    if (sargs.length > 5) {
        page.zoomFactor = sargs[5];
    }

    var renderAndExit = function(){
        page.viewportSize = { width: 500, height: 500 };
        setTimeout(function() {
            page.evaluate(function(w, h) {                
                document.body.style.width = w + "px";
                document.body.style.height = h + "px";
            }, 500, 500);
            page.render(output);
            console.log('page ' + address + ' was rendered to ' + output);
            phantom.exit();
        }, 3000);
    }

    page.open(address, function (status) {
         if (status !== 'success') {
            console.log('Unable to load the address!');
            phantom.exit();
        } else {
            console.log('page is ready');
            if(window.document.readyState == "complete"){
                renderAndExit()
            } else {
                window.addEventListener ?
                window.addEventListener("load", renderAndExit, false) :
                window.attachEvent && window.attachEvent("onload", renderAndExit);
            }
        }
    });
}


if (system.args.length < 3 || system.args.length > 5) {
    console.log('Usage: rasterize.js URL filename [paperwidth*paperheight|paperformat] [delaySeconds] [zoom]');
    console.log('  paper (pdf output) examples: "5in*7.5in", "10cm*20cm", "A4", "Letter"');
    console.log('  image (png/jpg output) examples: "1920px" entire page, window width 1920px');
    console.log('                                   "800px*600px" window, clipped to 800x600');
    phantom.exit(1);
} else {
    console.log('grabbing screenshot of ' + system.args[1]);
    renderPage(system.args[1], system.args);
}
