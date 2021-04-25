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

function updateSketchTrail() {
    if(sketchMode) {
        for ( let i = 0; i < intersects.length; i ++ ) {
		    if( intersects[i].object.name == "Sketch Plane") {
                cursorCircle.position.set(intersects[i].point.x, .05, intersects[i].point.z);
            }
	    }
    }
}

function toggleSketchMode() {
    numOfIslands();
    sketchMode = !sketchMode;
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
                    elasticityObjects[elasticity] = intersects[i].object; //add elasticity object to datastructure

                    intersects[i].object.material.transparent = false;
                    intersects[i].object.material.opacity = 1;
                    intersects[i].object.material.name = elasticity;
                    intersects[i].object.material.color.setHex(hsvToRgb((elasticity/100), 1, 1));
                }
            }
        }
        if(rightClickPressed) {
            for(var i = 0; i < objectsOverlapped.length; i++) {
                if(intersects[i].object.name == "Grid Box") {
                    elasticityObjects[elasticity] = [];
                    elasticityObjects[elasticity].splice(elasticityObjects[elasticity].indexOf(intersects[i].object), 1);
                    elasticityObjects[elasticity] = intersects[i].object;
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
function updateElasticity() {
    var isInList = false;
    elasticity = document.getElementById("elasticityText").value;
    for(var i = 0; i < allElasticities.length; i++) {
        if(elasticity == allElasticities[i]) {
            isInList = true;
        }
    }
    if(!isInList) {
        allElasticities.push(elasticity);
        var nextText = document.createElement("text");
        var textValue = document.createTextNode((elasticity.toString()).concat(": "));
        nextText.appendChild(textValue);
        nextText.style.position = "absolute";
        nextText.style.left = "1720px";
        var yLoc = 40 + (20*allElasticities.length)
        var yLocString = yLoc.toString();
        nextText.style.top = yLocString.concat("px");

        var nextBox = document.createElement("div");
        nextBox.style.position = "absolute";
        nextBox.style.left = "1760px";
        nextBox.style.height = "20px";
        nextBox.style.width = "20px";
        nextBox.style.top = yLocString.concat("px");
        nextBox.style.backgroundColor = "#".concat(fixString((hsvToRgb((elasticity/100), 1, 1)).toString(16)));

        var docElement = document.getElementById("body");
        var child = document.getElementById("legendText");
        docElement.insertBefore(nextText, child);
        docElement.insertBefore(nextBox, child);
    }
}
function changeElasticity(elasticityVal) {
    elasticity = elasticityVal
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

function fixString(hexString) {
    while(hexString.length < 6) {
        hexString = ("0").concat(hexString)
    }

    return hexString;
}