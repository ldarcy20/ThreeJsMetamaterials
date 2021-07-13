var scene, renderer, camera;
var mouse = new THREE.Vector2();
var mouseDown = new THREE.Vector2();
var leftClickPressed = false;
var rightClickPressed = false;
var cameraPos = new THREE.Vector3(0, 0, 7);
var light;
var theta = 0;
var phi = 0;
var onMouseDownTheta = 0
var onMouseDownPhi = 0;
var radious = 7;
var cursorCircleRadius = .1;
var raycaster = new THREE.Raycaster();
var raycasterInRadius = []
var vector, dir, distance, pos;
var elasticity = 0
var elasticityObjectsForPhysics = []
var isMouseDown = false;
var gridSizeX = 20;
var gridSizeY = 20;
var gridBoxSize = .25
var sketchPlane, intersects;
var sketchMode = false;
var boxGeoList = []
var islandObjects = [];
var physicsBlocks = [];
var exportBoxHeight = .2;
var mesh;
var planeMat;
var mouseDownX, mouseDownY;

init();
animate();
Ammo().then(start)

/* Create threeJS scene and initialize event listeners */
function init() {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor("#ffffff");
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.body.appendChild(renderer.domElement);
    camera = new THREE.PerspectiveCamera(
        75, //Field of view
        window.innerWidth/window.innerHeight, //aspect ratio
        .1, //near plane
        1000); //far plane

    camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
    camera.lookAt (new THREE.Vector3(0,0,0));
    camera.rotateZ(THREE.Math.degToRad(0));

    for(var i = 0; i < 8; i++) {
        raycasterInRadius[i] = new THREE.Raycaster();
    }
    light = new THREE.PointLight(0xFFFFFF, 1, 500);
    light.position.set(10, 0, 25);
    scene.add(light);

    var sketchPlaneGeo = new THREE.PlaneGeometry(10, 10, 32, 32 );
    var sketchPlaneMat = new THREE.MeshBasicMaterial( {color: Math.random() * 0xFFFFFF, side: THREE.DoubleSide, opacity: 0, transparent:true} );
    sketchPlane = new THREE.Mesh( sketchPlaneGeo, sketchPlaneMat );
    sketchPlane.rotation.setFromVector3(new THREE.Vector3( Math.PI / 2, 0, 0));
    sketchPlane.name = "Sketch Plane";
    scene.add(sketchPlane);
    renderer.render(scene, camera);

    addEventListeners();
    createGrid(gridSizeX, gridSizeY, gridBoxSize);
}

/* Begin Ammo animation */
function animate() {   
    requestAnimationFrame(animate);  
    renderer.render(scene, camera);
}

/* Event listener for camera movement */
function updateCamera(event) {
    //offset the camera x/y based on the mouse's position in the window
    event.preventDefault();
    if (leftClickPressed && !sketchMode) {
        theta = - ( ( event.clientX - mouseDown.x ) * 0.5 )
                + onMouseDownTheta;
        phi = ( ( event.clientY - mouseDown.y ) * 0.5 )
              + onMouseDownPhi;
        if(phi >= 180) phi = 180;
        else if(phi <= -180) phi = -180;

        camera.position.x = radious * Math.sin( theta * Math.PI / 360 )
                            * Math.cos( phi * Math.PI / 360 );
        camera.position.y = radious * Math.sin( phi * Math.PI / 360 );
        camera.position.z = radious * Math.cos( theta * Math.PI / 360 )
                            * Math.cos( phi * Math.PI / 360 );
        camera.updateMatrix();
        light.position.set(camera.position.x,camera.position.y,camera.position.z);
        camera.lookAt( new THREE.Vector3(0,0,0))

    }
}

/* Event listener for when the mouse is moved in the threejs canvas */
function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );
    raycasterInRadius[0].setFromCamera(new THREE.Vector2(mouse.x + cursorCircleRadius/8, mouse.y), camera);	
    raycasterInRadius[1].setFromCamera(new THREE.Vector2(mouse.x - cursorCircleRadius/8, mouse.y), camera);	
    raycasterInRadius[2].setFromCamera(new THREE.Vector2(mouse.x, mouse.y + cursorCircleRadius/8), camera);	
    raycasterInRadius[3].setFromCamera(new THREE.Vector2(mouse.x, mouse.y - cursorCircleRadius/8), camera);	
	intersects = raycaster.intersectObjects(scene.children).concat(raycasterInRadius[0].intersectObjects(scene.children)).concat(raycasterInRadius[1].intersectObjects(scene.children)).concat(raycasterInRadius[2].intersectObjects(scene.children)).concat(raycasterInRadius[3].intersectObjects(scene.children));
    
    vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject( camera );

    dir = vector.sub( camera.position ).normalize();
    distance = -camera.position.z / dir.z;
    pos = camera.position.clone().add( dir.multiplyScalar( distance ) );

    findGridOverlap(intersects);
}

/* Create all event listeners */
function addEventListeners() {
    var cc = document.getElementsByTagName("canvas");
    cc[0].addEventListener('mousedown', (e) => {
        e = e || window.event;
        e.preventDefault();
        if(e.which == 1) {
            leftClickPressed = true;
            mouseDown.x = e.clientX;
            mouseDown.y = e.clientY;
        } else if(e.which == 3) {
            rightClickPressed = true;
        }

        if(!sketchMode && !isSimulating) {
            selectIsland(e);
        }
    });
    document.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        checkBallPos();
        
    });
    document.addEventListener('mouseup', (e) => {
        isMouseDown = false;
        if(e.which == 1) {
        onMouseDownTheta = theta;
        onMouseDownPhi = phi;
        leftClickPressed = false;
        } else if(e.which == 3) {
            rightClickPressed = false;
        }
    });
    document.getElementById("color selector").addEventListener('mousedown', (e) => {
        mouseDownX = e.clientX;
        mouseDownY = e.clientY;
    });

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth,window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;

        camera.updateProjectionMatrix();

    });

    document.addEventListener('mousemove', updateCamera, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.getElementById('color selector').addEventListener('mousemove', colorSelector, false);
}

/* Export threeJS scene to JSON file */
function saveScene() {
    var result = scene.toJSON();
    var output = JSON.stringify(result);
    var fileName = makeid(10);
    downloadJSON(result, fileName);
}

/* Prompt the file explorer (probably didnt need this comment idk */
function promptFileExplorer() {
    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => { 
        var file = e.target.files[0];
        loadFile(file);
    }
    input.click();
}

/* Load JSON files into the application */
function loadFile(file) {
    var thingy;
    const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            thingy = event.target.result;
            loadScene(thingy);
    });
    reader.readAsText(file);
}

/* Turn a JSON file into a threeJS scene */
function loadScene(file) {
    var request = new XMLHttpRequest();
    request.open("GET", "saved_files/testFileJson.json", false);
    request.send(null)
    var my_JSON_object = JSON.parse(file);
    scene = new THREE.ObjectLoader().parse(my_JSON_object);

}

/* Download a json file with filename */
function downloadJSON( json, filename ) {
	saveString( JSON.stringify( json ), filename );  
}

var link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link ); // Firefox workaround, see #6594

function save( blob, filename ) {
	link.href = URL.createObjectURL( blob );
	link.download = filename;
	link.click();
}

function saveString( text, filename ) {
	save( new Blob( [ text ], { type: 'application/json' } ), filename );
}

/* Creates a string of random letters of length specified by param */
function makeid(length) {
    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
   }
   return result.join('');
}

/* Depth first search recursive solution for finding all boxes in a signle island */
function numOfIslandsDFS(row, col, visited, boxElasticity, islands) {
    if (row < 0 || col < 0 || row >= gridSizeX || col >= gridSizeY || boxGeoList[row + col * gridSizeY].material.opacity != 1 || visited[row + col * gridSizeY] == 1 || boxGeoList[row + col * gridSizeY].material.name != boxElasticity)
            return visited;
    visited[row + col * gridSizeY] = 1; //marking it visited

    if(islandObjects[islands] == undefined) islandObjects[islands] = [];
    (islandObjects[islands]).push(boxGeoList[row + col * gridSizeY]); 

    visited = numOfIslandsDFS(row + 1, col, visited, boxElasticity, islands); // go right
    visited = numOfIslandsDFS(row - 1, col, visited, boxElasticity, islands); //go left
    visited = numOfIslandsDFS(row, col + 1, visited, boxElasticity, islands); //go down
    visited = numOfIslandsDFS(row, col - 1, visited, boxElasticity, islands); // go up
    return visited;
}

/* Finding all islands by calling DFS method */
function numOfIslands() {
    var visited = []
    var islands = 0;
    islandObjects = []
    for(var x = 0; x < gridSizeX; x++) {
        for(var y = 0; y < gridSizeY; y++) {
            if(boxGeoList[x + y * gridSizeY].material.opacity == 1 && visited[x + y * gridSizeY] != 1) {
                visited = numOfIslandsDFS(x, y, visited, boxGeoList[x + y * gridSizeY].material.name, islands);
                islands++;
            }
        }
    }
    return islands;
}

/* Color selector wheel */
function colorSelector(e) {
    if(!isMouseDown) return;
    var style = window.getComputedStyle(document.getElementById("color selector"))
    var midX = parseInt(style.getPropertyValue('left'), 10) + 100;
    var midY = parseInt(style.getPropertyValue('top'), 10) + 100;
    var x = e.clientX - midX; //x position within the element.
    var y = e.clientY - midY;  //y position within the element.

    var distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    if(distance > 50 && distance < 80) {
        var angle = 0;
        if(y > 0) {
            angle = toDegrees(Math.atan2(y, x));
        } else {
            angle = toDegrees(Math.atan2(y, x)) + 360;
        }
        document.getElementById("colorWheelLine").x1.baseVal.value = (50 * Math.cos(toRadians(angle))) + midX;
        document.getElementById("colorWheelLine").y1.baseVal.value = (50 * Math.sin(toRadians(angle))) + midY;
        document.getElementById("colorWheelLine").x2.baseVal.value = (80 * Math.cos(toRadians(angle))) + midX;
        document.getElementById("colorWheelLine").y2.baseVal.value = (80 * Math.sin(toRadians(angle))) + midY; 
        var displayAngle = (angle / 3.6) + 25;
        if(displayAngle > 100) displayAngle = displayAngle - 100; 
        document.getElementById("elasticityText").value = (Math.round(displayAngle)).toString();
        elasticity = (Math.round(displayAngle));
    } else if (distance >= 80) {
        var xChange = e.clientX - mouseDownX;
        var yChange = e.clientY - mouseDownY;
        mouseDownX = e.clientX;
        mouseDownY = e.clientY;
        var currLeftSquare = parseInt(getStyleSheetRule(document.styleSheets[0], ".square", "left"));
        var currTopSquare = parseInt(getStyleSheetRule(document.styleSheets[0], ".square", "top"));
        var currLeftImg = parseInt(getStyleSheetRule(document.styleSheets[0], ".hsvimg", "left"));
        var currTopImg = parseInt(getStyleSheetRule(document.styleSheets[0], ".hsvimg", "top"));
        var currLeftTxt = parseInt(getStyleSheetRule(document.styleSheets[0], ".elasticityField", "left"));
        var currTopTxt = parseInt(getStyleSheetRule(document.styleSheets[0], ".elasticityField", "top"));
        changeStylesheetRule(document.styleSheets[0], ".square", "left", (currLeftSquare += xChange).toString().concat("px"));
        changeStylesheetRule(document.styleSheets[0], ".square", "top", (currTopSquare += yChange).toString().concat("px"));
        changeStylesheetRule(document.styleSheets[0], ".hsvimg", "left", (currLeftImg += xChange).toString().concat("px"));
        changeStylesheetRule(document.styleSheets[0], ".hsvimg", "top", (currTopImg += yChange).toString().concat("px"));
        changeStylesheetRule(document.styleSheets[0], ".elasticityField", "left", (currLeftTxt += xChange).toString().concat("px"));
        changeStylesheetRule(document.styleSheets[0], ".elasticityField", "top", (currTopTxt += yChange).toString().concat("px"));
        document.getElementById("colorWheelLine").x1.baseVal.value += xChange;
        document.getElementById("colorWheelLine").x2.baseVal.value += xChange;
        document.getElementById("colorWheelLine").y1.baseVal.value += yChange;
        document.getElementById("colorWheelLine").y2.baseVal.value += yChange;
    } else {

    }
}

/* Creates STL file from threeJS scene */
function exportObjects() {
    var numIslands = numOfIslands();
    var tempScene = new THREE.Scene();
    var scalePos = {x: 0, z: 0}
    var scaleDims = {x: 0, z: 0}
    var scaleAmount = .05; //For 1 mm: (.039 / 2) (That is per object)
    var changedLeft = false;
    var changedRight = false;
    var changedTop = false;
    var changedBottom = false;

    for(var island = 0; island < numIslands; island++) {
        for(var currPlane = 0; currPlane < islandObjects[island].length; currPlane++) {
            scalePos.x = islandObjects[island][currPlane].position.x;
            scalePos.z = islandObjects[island][currPlane].position.z;
            scaleDims.x = islandObjects[island][currPlane].geometry.parameters.width;
            scaleDims.z = islandObjects[island][currPlane].geometry.parameters.height;
            var hasNeighbors = boxHasNeighbors(islandObjects[island][currPlane], island);
            if(!hasNeighbors.left && !changedLeft) {
                scalePos.x += scaleAmount
                scaleDims.x -= scaleAmount
                changedLeft = true;
            }
            if(!hasNeighbors.right && !changedRight) {
                scalePos.x -= scaleAmount
                scaleDims.x -= scaleAmount
                changedRight = true;
            }
            if(!hasNeighbors.top && !changedTop) {
                scalePos.z -= scaleAmount;
                scaleDims.z -= scaleAmount;
                changedTop = true;
            }
            if(!hasNeighbors.bottom && !changedBottom) {
                scalePos.z += scaleAmount;
                scaleDims.z -= scaleAmount;
                changedBottom = true;
            }
            /* if(!hasNeighbors.topLeft) {
                if(!changedLeft) {
                    scalePos.x += scaleAmount
                    scaleDims.x -= scaleAmount
                    changedLeft = true;
                }
                if(!changedTop) {
                    scalePos.z -= scaleAmount;
                    scaleDims.z -= scaleAmount;
                    changedTop = true;
                }
            }
            if(!hasNeighbors.bottomLeft) {
                if(!changedLeft) {
                    scalePos.x += scaleAmount
                    scaleDims.x -= scaleAmount
                    changedLeft = true;
                }
                if(!changedBottom) {
                    scalePos.z += scaleAmount;
                    scaleDims.z -= scaleAmount;
                    changedBottom = true;
                }
            }
            if(!hasNeighbors.topRight) {
                if(!changedRight) {
                    scalePos.x -= scaleAmount
                    scaleDims.x -= scaleAmount
                    changedRight = true;
                }
                if(!changedTop) {
                    scalePos.z -= scaleAmount;
                    scaleDims.z -= scaleAmount;
                    changedTop = true;
                }
            }
            if(!hasNeighbors.bottomRight) {
                if(!changedRight) {
                    scalePos.x -= scaleAmount
                    scaleDims.x -= scaleAmount
                    changedRight = true;
                }

                if(!changedBottom) {
                    scalePos.z += scaleAmount;
                    scaleDims.z -= scaleAmount;
                    changedBottom = true;
                }
            } */
            var exportBoxGeo = new THREE.BoxGeometry(scaleDims.x, exportBoxHeight, scaleDims.z);
            var exportBoxMaterial = new THREE.MeshBasicMaterial({color: (elasticity / 100) * 0xFFFFFF});
            var exportBoxMesh = new THREE.Mesh(exportBoxGeo, exportBoxMaterial);

            exportBoxMesh.position.set(scalePos.x, islandObjects[island][currPlane].position.y, scalePos.z);
            tempScene.add(exportBoxMesh);

            changedLeft = false;
            changedRight = false;
            changedTop = false;
            changedBottom = false;
        }
    }
    tempScene.scale.set(25.4, 25.4, 25.4)
    // scene.add(tempScene);

    //For some reason with STLExporter, you need to give it a renderer for it to export the scene properly
    var renderer2 = new THREE.WebGLRenderer({antialias: true});
    renderer2.setClearColor("#f5f5f5");
    renderer2.setSize(window.innerWidth,window.innerHeight);
    renderer2.render(tempScene, camera);
    console.log(tempScene)

    var exporter = new THREE.STLExporter();
    var str = exporter.parse(tempScene); // Export the scene
    var blob = new Blob( [str], { type : 'text/plain' } ); // Generate Blob from the string
    saveAs( blob, (makeid(10).concat(".stl"))); //Save the Blob to file.stl

    
    //Create Second STL File
    var tempScene2 = new THREE.Scene()
    var randomNumArray = []
    var loader = new THREE.STLLoader();
    loader.load( 'photos/active.stl', function (inputGeometry) {
        for(var island = 0; island < numIslands; island++) {
            for(var currPlane = 0; currPlane < islandObjects[island].length; currPlane++) {
                var randomNum = Math.random()
                if(randomNum < .5) {
                    var posX = islandObjects[island][currPlane].position.x;
                    var posY = islandObjects[island][currPlane].position.y;
                    var posZ = islandObjects[island][currPlane].position.z;
                    console.log(posX + " " + posY + " " + posZ)
                    var material = new THREE.MeshLambertMaterial({color: 0xFFFFFF});
                    var tempMesh = new THREE.Mesh( inputGeometry, material );
                    // tempMesh.position.set( islandObjects[island][currPlane].position.x, islandObjects[island][currPlane].position.y, islandObjects[island][currPlane].position.z);
                    tempMesh.position.set(posX + .125, posY, posZ - .125)
                    tempMesh.rotation.set(Math.PI / 2, 0, 0);
                    tempMesh.scale.set( 1/(25.4 * 4), 1/(25.4 * 4), 1/(25.4 * 4));
                    tempScene2.add( tempMesh );
                }
                randomNumArray.push(randomNum)
            }
        }
    });
    var counter = 0
    loader.load( 'photos/deactive.stl', function (inputGeometry) {
        for(var island = 0; island < numIslands; island++) {
            for(var currPlane = 0; currPlane < islandObjects[island].length; currPlane++) {
                if(randomNumArray[counter] >= .5) {
                    var posX = islandObjects[island][currPlane].position.x;
                    var posY = islandObjects[island][currPlane].position.y;
                    var posZ = islandObjects[island][currPlane].position.z;
                    console.log(posX + " " + posY + " " + posZ)
                    var material = new THREE.MeshLambertMaterial({color: 0xFFFFFF});
                    var tempMesh = new THREE.Mesh( inputGeometry, material );
                    // tempMesh.position.set( islandObjects[island][currPlane].position.x, islandObjects[island][currPlane].position.y, islandObjects[island][currPlane].position.z);
                    tempMesh.position.set(posX + .125, posY, posZ - .125)
                    tempMesh.rotation.set(Math.PI / 2, 0, 0);
                    tempMesh.scale.set( 1/(25.4 * 4), 1/(25.4 * 4), 1/(25.4 * 4));
                    tempScene2.add( tempMesh );
                }
                counter++
            }
        }
        console.log(tempScene2)
        // scene.add(tempScene2)

        var renderer3 = new THREE.WebGLRenderer({antialias: true});
        renderer3.setClearColor("#f5f5f5");
        renderer3.setSize(window.innerWidth,window.innerHeight);
        renderer3.render(tempScene2, camera);
        
            
        tempScene2.scale.set(25.4, 25.4, 25.4)
        var exporter2 = new THREE.STLExporter();
        var str2 = exporter2.parse(tempScene2); // Export the scene
        var blob2 = new Blob( [str2], { type : 'text/plain' } ); // Generate Blob from the string
        saveAs( blob2, (makeid(10).concat(".stl"))); //Save the Blob to file.stl
    });


}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

/* Checks if a box has any neighbors and which ones it has */
function boxHasNeighbors(currObject, islandNum) {
    var islandIndex = 0;
    var leftVal = true;
    var rightVal = true;
    var topVal = true;
    var bottomVal = true;
    var topLeftVal = true;
    var topRightVal = true;
    var bottomLeftVal = true;
    var bottomRightVal = true;

    for(var i = 0; i < boxGeoList.length; i++) {
        if(boxGeoList[i] == currObject) islandIndex = i;
    }

    if(islandIndex % gridSizeX > 0) { //is to the left
        if(!islandObjects[islandNum].includes(boxGeoList[(islandIndex) - 1])) {
            leftVal = false;
        }

    }

    if(islandIndex % gridSizeX < (gridSizeX - 1)) { //is to right
        if(!islandObjects[islandNum].includes(boxGeoList[islandIndex + 1])) {
            rightVal = false;
        }

    }

    if(islandIndex > (gridSizeY - 1)) { //is under
        if(!islandObjects[islandNum].includes(boxGeoList[islandIndex - gridSizeY])) {
            bottomVal = false;
        }

    }
    if(islandIndex < (gridSizeY - 1) * gridSizeX) { //is on top
        if(!islandObjects[islandNum].includes(boxGeoList[islandIndex + gridSizeY])) {
            topVal = false;
        }
    }

    //add edge cases later
    if(leftVal && topVal && !islandObjects[islandNum].includes(boxGeoList[(islandIndex - 1) - gridSizeY])) {
        topLeftVal = false;
    }

    if(rightVal && topVal && !islandObjects[islandNum].includes(boxGeoList[(islandIndex + 1) - gridSizeY])) {
        topRightVal = false;
    }

    if(leftVal && bottomVal && !islandObjects[islandNum].includes(boxGeoList[(islandIndex - 1) + gridSizeY])) {
        bottomLeftVal = false;
    }

    if(rightVal && bottomVal && !islandObjects[islandNum].includes(boxGeoList[(islandIndex + 1) + gridSizeY])) {
        bottomRightVal = false;
    }
    return {left: leftVal, right: rightVal, top: topVal, bottom: bottomVal, topLeft: topLeftVal, bottomLeft: bottomLeftVal, topRight: topRightVal, bottomRight: bottomRightVal};
}

function changeGridSize() {
    gridSizeX = document.getElementById("gridInputX").value;
    gridSizeY = document.getElementById("gridInputY").value;
    gridBoxSize = document.getElementById("gridInputBoxSize").value;
    for(var i = 0; i < scene.children.length; i++) {
        if(scene.children[i].name == "Grid Box" || scene.children[i].name == "Grid Lines") {
            scene.remove(scene.children[i]);
            console.log("removed");
        }
    }

    createGrid(gridSizeX, gridSizeY, gridBoxSize);
}

function selectIsland(event) {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    //Update Intersects List and Islands
    raycaster.setFromCamera( mouse, camera );
	intersects = raycaster.intersectObjects(scene.children);
    numOfIslands();

    //Find the selected plane
    var selectedPlane;
    for(var i = 0; i < intersects.length; i++) {
        if(intersects[i].object.name == "Grid Box") {
            selectedPlane = intersects[i].object;
        }
    }
    //Find the island the selected plane is part of
    var selectedIslands = [];
    for(var i = 0; i < islandObjects.length; i++) {
        for(var j = 0; j < islandObjects[i].length; j++) {
            if(selectedPlane == (islandObjects[i])[j]) {
                selectedIslands = islandObjects[i];
            }
        }
    }
    if(islandObjects.length == 0 || selectedIslands.length == 0) return;

    //Change the color of all objects in selected group
    for(var i = 0; i < selectedIslands.length; i++) {
        console.log(selectedIslands[i]);
        selectedIslands[i].material.color.setHex(hsvToRgb(0, 0, 0));
    }

    tab("menuCtrlTab4");
}

function changeAllElasticities() {
    for(var i = 0; i < elasticityObjectsForPhysics.length; i++) {
        var objColor = elasticityObjectsForPhysics[i].material.color;
        if(objColor.r == 0 && objColor.g == 0 && objColor.b == 0) {
            elasticityObjectsForPhysics[i].material.name = document.getElementById("newElasticityInput").value;
            elasticityObjectsForPhysics[i].material.color.setHex(hsvToRgb((document.getElementById("newElasticityInput").value/100), 1, 1));
            console.log(elasticityObjectsForPhysics[i]);
        }
    }
}

function removeSelectedRegions() {
    var tempArray = [...elasticityObjectsForPhysics]; //Copy array

    for(var i = 0; i < elasticityObjectsForPhysics.length; i++) {
        var objColor = elasticityObjectsForPhysics[i].material.color;
        if(objColor.r == 0 && objColor.g == 0 && objColor.b == 0) {
            elasticityObjectsForPhysics[i].material.transparent = true;
            elasticityObjectsForPhysics[i].material.opacity = 0;
            tempArray.splice(elasticityObjectsForPhysics.indexOf(elasticityObjectsForPhysics[i]), 1);
        }
    }
    elasticityObjectsForPhysics = tempArray;
}
