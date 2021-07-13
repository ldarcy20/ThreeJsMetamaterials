function createBox(point1, point2) {
    var lineMaterial = new THREE.LineBasicMaterial( { color: 0x000000 } )
    const points = []
    points.push(new THREE.Vector3(point1.x, 0, point1.y))
    points.push(new THREE.Vector3(point1.x, 0, point2.y))
    points.push(new THREE.Vector3(point2.x, 0, point2.y))
    points.push(new THREE.Vector3(point2.x, 0, point1.y))
    points.push(new THREE.Vector3(point1.x, 0, point1.y))
    var lineGeom1 = new THREE.BufferGeometry().setFromPoints(points);
    var line1Mesh = new THREE.Line(lineGeom1, lineMaterial)
    line1Mesh.name = "Grid Lines";
    
    var planeGeo = new THREE.PlaneGeometry( Math.max(point1.x, point2.x) - Math.min(point1.x, point2.x), Math.max(point1.y, point2.y) - Math.min(point1.y, point2.y), 32, 32 );
    planeMat = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide, opacity: 0, transparent: true} );
    planeMesh = new THREE.Mesh( planeGeo, planeMat );
    planeMesh.rotation.setFromVector3(new THREE.Vector3( Math.PI / 2, 0, 0));
    var halfX = (Math.max(point1.x, point2.x) - Math.min(point1.x, point2.x))/2
    var halfY = (Math.max(point1.y, point2.y) - Math.min(point1.y, point2.y))/2
    planeMesh.position.set(Math.max(point1.x, point2.x) - halfX, -.0005, Math.max(point1.y, point2.y) - halfY)
    planeMesh.name = "Grid Box"
    planeMesh.material.name = elasticity
    scene.add(line1Mesh)
    scene.add(planeMesh)
    return planeMesh
}
function createGrid(xBoxNum, yBoxNum, boxWidth) {
    startingX = (xBoxNum/2) * -boxWidth
    startingY = (yBoxNum/2) * -boxWidth 
    for(var x = 0; x < xBoxNum; x++) {
        for(var y = 0; y < yBoxNum; y++) {
           boxGeoList[x + y * yBoxNum] = createBox(new THREE.Vector2(startingX + (x * boxWidth), startingY + (y * boxWidth)),
                     new THREE.Vector2(startingX + ((x + 1) * boxWidth), startingY + ((y + 1) * boxWidth)));
        }
    }
}


function toggleSketchMode() {
    sketchMode = !sketchMode;
    if(!sketchMode) {
        onMouseDownTheta = 0
        onMouseDownPhi = 180
        camera.lookAt( new THREE.Vector3(0,0,0))
    }

    camera.position.set(0, 7, 0);
    camera.lookAt(new THREE.Vector3(0,0,0));
}
function togglePhysicsSimulator() {
    isSimulating = !isSimulating;
    setupContactResultCallback();
    createBall();
    renderFrame();
}
function findGridOverlap(objectsOverlapped) {
    if(sketchMode) {
        if(leftClickPressed) {
            for(var i = 0; i < objectsOverlapped.length; i++) {
                if(intersects[i].object.name == "Grid Box") {
                    intersects[i].object.material.transparent = false;
                    intersects[i].object.material.opacity = 1;
                    intersects[i].object.material.name = elasticity;
                    intersects[i].object.material.color.setHex(hsvToRgb((elasticity/100), 1, 1));
                    createBlock({x: intersects[i].object.position.x, y: -.5, z: intersects[i].object.position.z});
                    elasticityObjectsForPhysics.push(intersects[i].object);
                }
            }
        }
        if(rightClickPressed) {
            for(var i = 0; i < objectsOverlapped.length; i++) {
                if(intersects[i].object.name == "Grid Box") {
                    intersects[i].object.material.transparent = true;
                    intersects[i].object.material.opacity = 0;
                    removeFromPhysicsBlocks(intersects[i].object);
                }
            }
        }
    } 
}
function checkBallPos() {
    if(isSimulating) {
        objectsOverlapped = raycaster.intersectObjects(scene.children);
        for(var i = 0; i < objectsOverlapped.length; i++) {
            if(intersects[i].object.name == "Grid Box") {
                createBall({x: intersects[i].object.position.x, y: 4, z: intersects[i].object.position.z});
                ballElasiticitys.push(intersects[i].object.material.name / 100);
                renderFrame();
            }
        }
    }
}

function changeCircleScale(scaleRadius) {
    cursorCircleRadius = scaleRadius/10;
    cursorCircle.scale.set(scaleRadius, scaleRadius);
}
function updateElasticity() {
    elasticity = document.getElementById("elasticityText").value;
}

function hsvToRgb(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return (Math.round(r * 255) * Math.pow(16, 4) + Math.round(g * 255) * Math.pow(16, 2) + Math.round(b * 255));
}