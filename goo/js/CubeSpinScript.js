define([
	'goo/math/Vector2',
	'js/SimplePick',
	'goo/math/MathUtils'
]
,function(
	Vector2,
	SimplePick,
	MathUtils
){

	var mouseDelta = new Vector2();
	var mouseOld = new Vector2();
	var mousePosition = new Vector2();
	document.documentElement.addEventListener("mousedown", mouseDown, false);
	document.documentElement.addEventListener("mouseup", mouseUp, false);
	document.documentElement.addEventListener("mousemove", mouseMove, false);

	var goo = null;
	var ent = null;
	var cam = null;
	var button = 0;
	var spinning = false;

	var CubeSpinScript = {};
	CubeSpinScript.setEnt = function(entity){
		ent = entity;
		ent.spinVel = 0;
		ent.slowSpeed = 10;
		ent.set(cubeUpdate);
		function cubeUpdate(ent, tpf){
			if(ent.spinVel != 0){
				// update this with a better spin interpolation
				ent.spinVel = MathUtils.lerp(tpf, ent.spinVel, 0);
				var entRot = ent.transformComponent.transform.rotation.toAngles();
				var entRotY = entRot.y;
				ent.transformComponent.transform.rotation.fromAngles(0, entRotY + (tpf * ent.spinVel), 0);
				ent.transformComponent.setUpdated();
			}
		}
	}
	CubeSpinScript.setGoo = function(goorunner){
		goo = goorunner;
	}
	CubeSpinScript.setCam = function(camera){
		cam = camera;
	}

	function mouseDown(e){
		// this is for cross browser crap
		var btn = 0;
		if(null == e.which){
			btn = e.button;
		}
		else{
			switch(e.which){
				case 1:
					btn = 1;
					break;
				case 2:
					btn = 4;
					break;
				case 3:
					btn = 2;
					break;
			};
		}

		button |= btn;

		// which was pressed ? 1 == left, 2 == right, 4 == middle
		switch(btn){
			case 1:
			cam.cameraComponent.camera.getPickRay(
				mousePosition.x,
				mousePosition.y,
				goo.renderer.viewportWidth,
				goo.renderer.viewportHeight,
				SimplePick.ray);

			var hit = SimplePick.castRay(SimplePick.ray, 1);
			if(hit){
				spinning = true;
			}
			break;
		}
	};

	function mouseUp(e){
		// this is for cross browser crap
		var btn = 0;
		if(null == e.which){
			btn = e.button;
		}
		else{
			switch(e.which){
				case 1:
					btn = 1;
					break;
				case 2:
					btn = 4;
					break;
				case 3:
					btn = 2;
					break;
			};
		}

		button &= ~btn;

		// which was released ? 1 == left, 2 == right, 4 == middle
		switch(btn){
			case 1:
			spinning = false;
			break;
		}
	};

	function mouseMove(e){
		updateMousePos(e);
		if(spinning){
			if(mouseDelta.x != 0){
				ent.spinVel = MathUtils.clamp(mouseDelta.x, -10, 10);
			}
		}
	};

	function updateMousePos(e){
		e = e || window.event;
		if (e && e.preventDefault) {e.preventDefault();}
		if (e && e.stopPropagation) {e.stopPropagation();}
		
		var newX = e.pageX ? e.pageX : e.clientX + (document.documentElement.scrollLeft) ||
			(document.body.scrollLeft - document.documentElement.clientLeft);
			
		var newY = e.pageY ? e.pageY : e.clientY + (document.documentElement.scrollTop) ||
			(document.body.scrollTop - document.documentElement.scrollTop);

		newX -= goo.renderer.domElement.offsetLeft;
		newY -= goo.renderer.domElement.offsetTop;
		mouseDelta.x = newX - mousePosition.x;
		mouseDelta.y = newY - mousePosition.y;
		mouseOld.x = mousePosition.x;
		mouseOld.y = mousePosition.y;
		mousePosition.x = newX;
		mousePosition.y = newY;
	};

	return CubeSpinScript;
});