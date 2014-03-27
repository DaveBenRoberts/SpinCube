define([
	'goo/math/Ray',
	'goo/entities/systems/PickingSystem',
	'goo/picking/PrimitivePickLogic',
	'goo/math/Vector3'
],function(
	Ray,
	PickingSystem,
	PrimitivePickLogic,
	Vector3
){

	var picking = new PickingSystem({pickLogic: new PrimitivePickLogic()});
    var v1 = new Vector3();
    var v2 = new Vector3();
	var cross = new Vector3();
   
    var SimplePick = {};
    SimplePick.ray = new Ray();

    // extend our 'primitive pick logic' with something a little less primitive
    picking.onPick = function(result){
    	var hit = null;
		if(null != result){

			if(result.length > 0){
				var hitIndex = -1;
	    		var hitElement = -1;
	    		var mrc = null;
    			var distance = typeof picking.pickRay.distance !== 'undefined' ? picking.pickRay.distance : Infinity;
    			for(var i = 0, ilen = result.length; i < ilen; i++){
    				mrc = result[i].entity.meshRendererComponent;
    				if(null == mrc){console.log("entity.meshRenderComponent does not exist!");}
    				else{
    					if(null != result[i].entity.hitMask){
    						if((result[i].entity.hitMask & picking.mask) != 0){
    							for(var j = 0, jlen = result[i].intersection.distances.length; j < jlen; j++){
    								if(result[i].intersection.distances[j] < distance){
    									if(picking.all){
    									}
    									else{
			        						distance = result[i].intersection.distances[j];
			        						hitIndex = i;
			        						hitElement = j;
		        						}
    								}
        						}
    						}
    					}
    				}
    			}
	    		if(hitIndex != -1){
	    			// create two CCW 'edge vectors' based on the points of the face hit
	    			v1.x = result[hitIndex].intersection.vertices[hitElement][0].x - result[hitIndex].intersection.vertices[hitElement][1].x;
					v1.y = result[hitIndex].intersection.vertices[hitElement][0].y - result[hitIndex].intersection.vertices[hitElement][1].y;
					v1.z = result[hitIndex].intersection.vertices[hitElement][0].z - result[hitIndex].intersection.vertices[hitElement][1].z;

					v2.x = result[hitIndex].intersection.vertices[hitElement][2].x - result[hitIndex].intersection.vertices[hitElement][0].x;
					v2.y = result[hitIndex].intersection.vertices[hitElement][2].y - result[hitIndex].intersection.vertices[hitElement][0].y;
					v2.z = result[hitIndex].intersection.vertices[hitElement][2].z - result[hitIndex].intersection.vertices[hitElement][0].z;
					
					// use the cross product of the face edges to get the 'normal'
					cross.x = (v1.y * v2.z) - (v1.z * v2.y);
					cross.y = (v1.z * v2.x) - (v1.x * v2.z);
					cross.z = (v1.x * v2.y) - (v1.y * v2.x);
					cross.normalize();

					// use the dot product to determine if the normal is facing the origin
					// of the ray or not *** doesn't work ***
					//	dp = (-cross.x * ray.direction.x) + (-cross.y * ray.direction.y) + (-cross.z * ray.direction.z);

	    			hit = {
						entity: result[hitIndex].entity,
						point: new Vector3().copy(result[hitIndex].intersection.points[hitElement]),
						normal: new Vector3().copy(cross),
						distance: result[hitIndex].intersection.distances[hitElement]
					}
	    		}
	    	}
	    }
		picking.hit = hit;
    };

    
    SimplePick.setWorld = function(world){
    	world.setSystem(picking);
    }
	
   	SimplePick.castRay = function(ray, mask, all){
    	picking.pickRay = ray;
    	picking.mask = mask;
    	picking.all = all;
    	picking._process();
    	return picking.hit;
    };
    Object.freeze(SimplePick.castRay);

    return SimplePick;
});