require([
	'goo/entities/GooRunner',
	'goo/addons/howler/systems/HowlerSystem',
	'goo/loaders/DynamicLoader',
	'js/CubeSpinScript',
	'js/SimplePick'
], function (
	GooRunner,
	HowlerSystem,
	DynamicLoader,
	CubeSpinScript,
	SimplePick
) {
	'use strict';

	function init() {

		// If you try to load a scene without a server, you're gonna have a bad time
		if (window.location.protocol==='file:') {
			alert('You need to run this webpage on a server. Check the code for links and details.');
			return;

			/*

			Loading scenes uses AJAX requests, which require that the webpage is accessed via http. Setting up
			a web server is not very complicated, and there are lots of free options. Here are some suggestions
			that will do the job and do it well, but there are lots of other options.

			- Windows

			There's Apache (http://httpd.apache.org/docs/current/platform/windows.html)
			There's nginx (http://nginx.org/en/docs/windows.html)
			And for the truly lightweight, there's mongoose (https://code.google.com/p/mongoose/)

			- Linux
			Most distributions have neat packages for Apache (http://httpd.apache.org/) and nginx
			(http://nginx.org/en/docs/windows.html) and about a gazillion other options that didn't
			fit in here.
			One option is calling 'python -m SimpleHTTPServer' inside the unpacked folder if you have python installed.


			- Mac OS X

			Most Mac users will have Apache web server bundled with the OS.
			Read this to get started: http://osxdaily.com/2012/09/02/start-apache-web-server-mac-os-x/

			*/
		}

		// Make sure user is running Chrome/Firefox and that a WebGL context works
		var isChrome, isFirefox, isIE, isOpera, isSafari, isCocoonJS;
		isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
			isFirefox = typeof InstallTrigger !== 'undefined';
			isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
			isChrome = !!window.chrome && !isOpera;
			isIE = false || document.documentMode;
			isCocoonJS = navigator.appName === "Ludei CocoonJS";
		if (!(isFirefox || isChrome || isSafari || isCocoonJS || isIE === 11)) {
			alert("Sorry, but your browser is not supported.\nGoo works best in Google Chrome or Mozilla Firefox.\nYou will be redirected to a download page.");
			window.location.href = 'https://www.google.com/chrome';
		} else if (!window.WebGLRenderingContext) {
			alert("Sorry, but we could not find a WebGL rendering context.\nYou will be redirected to a troubleshooting page.");
			window.location.href = 'http://get.webgl.org/troubleshooting';
		} else {

			// Preventing browser peculiarities to mess with our controls
			document.body.addEventListener('touchstart', function(event) {
				event.preventDefault();
			}, false);
			// Loading screen callback
			var progressCallback = function (handled, total) {
				var loadedPercent = (100*handled/total).toFixed();
				var loadingOverlay = document.getElementById("loadingOverlay");
				var progressBar = document.getElementById("progressBar");
				var progress = document.getElementById("progress");
				var loadingMessage = document.getElementById("loadingMessage");
				loadingOverlay.style.display = "block";
				loadingMessage.style.display = "block";
				progressBar.style.display = "block";
				progress.style.width = loadedPercent + "%";
			};

			// Create typical Goo application
			var goo = new GooRunner({
				antialias: true,
				manuallyStartGameLoop: true
			});
			SimplePick.setWorld(goo.world);

			// The loader takes care of loading the data
			var loader = new DynamicLoader({
				world: goo.world,
				rootPath: 'res',
				progressCallback: progressCallback
			});

			loader.load('root.bundle').then(function(result) {

				// Grab the first project in the bundle.
				var bundleKeys = Object.keys(result);
				var projectIds = bundleKeys.filter(function(k) {
					return /\.project$/.test(k);
				});
				var projectId = projectIds[0];
				if (!projectId) {
					alert('Error: No project in bundle'); // Should never happen
					return null;
				}

				return loader.load(projectId);

			}).then(function() {

				// This code will be called when the project has finished loading.

				goo.renderer.domElement.id = 'goo';
				document.body.appendChild(goo.renderer.domElement);

				goo.world.process();

				// Application code goes here!

				var cube = goo.world.by.name("Cube Root").first();
				cube.transformComponent.transform.translation.z += 1;
				cube.transformComponent.setUpdated();

				var cubeMesh = goo.world.by.name("The Cube").first();
				cubeMesh.hitMask = 1;

				CubeSpinScript.setGoo(goo);
				CubeSpinScript.setEnt(cube);
				CubeSpinScript.setCam(goo.world.by.name("Fixed Cam").first());

				/*
				To get a hold of entities, one can use the World's selection functions:
				var allEntities = goo.world.getEntities();                  // all
				var entity      = goo.world.by.name('EntityName').first();  // by name
				*/

				// Start the rendering loop!
				goo.startGameLoop();

			}).then(null, function(e) {
				// If something goes wrong, 'e' is the error message from the engine.
				alert('Failed to load project: ' + e);
			});

		}
	}

	init();
});
