function initSketchMode() {
    var boxGeo = new THREE.PlaneGeometry(30, 32, 32)
}

function createBox(point1, point2) {
    var lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } )
    const points = []
    points.push(new THREE.Vector3(point1.x, 0, point1.y))
    points.push(new THREE.Vector3(point1.x, 0, point2.y))
    points.push(new THREE.Vector3(point2.x, 0, point2.y))
    points.push(new THREE.Vector3(point2.x, 0, point1.y))
    points.push(new THREE.Vector3(point1.x, 0, point1.y))
    var lineGeom1 = new THREE.BufferGeometry().setFromPoints(points);
    var line1Mesh = new THREE.Line(lineGeom1, lineMaterial)
    
    var planeGeo = new THREE.PlaneGeometry( Math.max(point1.x, point2.x) - Math.min(point1.x, point2.x), Math.max(point1.y, point2.y) - Math.min(point1.y, point2.y), 32, 32 );
    var planeMat = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide, opacity: 0, transparent: true} );
    planeMesh = new THREE.Mesh( planeGeo, planeMat );
    planeMesh.rotation.setFromVector3(new THREE.Vector3( Math.PI / 2, 0, 0));
    var halfX = (Math.max(point1.x, point2.x) - Math.min(point1.x, point2.x))/2
    var halfY = (Math.max(point1.y, point2.y) - Math.min(point1.y, point2.y))/2
    planeMesh.position.set(Math.max(point1.x, point2.x) - halfX, -.0005, Math.max(point1.y, point2.y) - halfY)
    planeMesh.name = "Grid Box"
    scene.add(line1Mesh)
    scene.add(planeMesh)
    return {
        line1Mesh,

    };
}
function createGrid(xBoxNum, yBoxNum, boxWidth) {
    startingX = (xBoxNum/2) * -boxWidth
    startingY = (yBoxNum/2) * -boxWidth 
    var acc = 0;
    for(var x = 0; x < xBoxNum; x++) {
        for(var y = 0; y < yBoxNum; y++) {
           createBox(new THREE.Vector2(startingX + (x * boxWidth), startingY + (y * boxWidth)),
                     new THREE.Vector2(startingX + ((x + 1) * boxWidth), startingY + ((y + 1) * boxWidth)));
            acc++;
        }
    }
}

function updateSketchTrail() {
    if(sketchMode) {
        for ( let i = 0; i < intersects.length; i ++ ) {
		    if( intersects[i].object.name == "Sketch Plane") {
                //console.log("Here");
                cursorCircle.position.set(intersects[i].point.x, .05, intersects[i].point.z);
            }
	    }
    }
}

function toggleSketchMode() {
    sketchMode = !sketchMode;
    console.log("Toggled sketch Mode");
    if(sketchMode){
        scene.add(cursorCircle);
        document.getElementById('body').classList.add("RemoveCursor");
    } else {
        scene.remove(cursorCircle);
        document.getElementById('body').classList.remove("RemoveCursor");
        onMouseDownTheta = 0
        onMouseDownPhi = 180
        camera.lookAt( new THREE.Vector3(0,0,0))
    }

    camera.position.set(0, 7, 0);
    camera.lookAt(new THREE.Vector3(0,0,0));
}
function findGridOverlap(objectsOverlapped) {
    if(sketchMode) {
        if(leftClickPressed) {
            for(var i = 0; i < objectsOverlapped.length; i++) {
                if(intersects[i].object.name == "Grid Box" && intersects[i].object.material.transparent) {
                    
                    intersects[ i ].object.material.transparent = false;
                    intersects[ i ].object.material.opacity = 1;
                    if(elasticity == 10) intersects[i].object.material.color.setHex(0xFF0000);
                    else if(elasticity == 20) intersects[i].object.material.color.setHex(0x00FF00);
                    else if(elasticity == 30) intersects[i].object.material.color.setHex(0x0000FF);
                }
            }
        }
        if(rightClickPressed) {
            for(var i = 0; i < objectsOverlapped.length; i++) {
                if(intersects[i].object.name == "Grid Box") {
                    intersects[ i ].object.material.transparent = true;
                    intersects[ i ].object.material.opacity = 0;
                }
            }
        }
    }
}

function changeCircleScale(scaleRadius) {
    cursorCircleRadius = scaleRadius/10;
    cursorCircle.scale.set(scaleRadius, scaleRadius);
}
function changeElasticity(elasticityVal) {
    elasticity = elasticityVal
}

function circleRectangleIntersect(circleCenter, edge1, edge2, edge3, edge4) {
    //Check if circleCenter is in Rectangle

}