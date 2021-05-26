var scene, renderer, camera;
var cameraCenter = new THREE.Vector3();
var cameraHorzLimit = 10;
var cameraVertLimit = 10;
var mouse = new THREE.Vector2();
var mouseDown = new THREE.Vector2();
var state = 0;
var leftClickPressed = false;
var rightClickPressed = false;

var cameraPos = new THREE.Vector3(0, 0, 7);

var light;
var lightPos = new THREE.Vector3(10, 0, 25);

var projector;
var theta = 0;
var phi = 0;
var onMouseDownTheta = 0
var onMouseDownPhi = 0;
var radious = 7;
var cursorCircle;
var cursorCircleRadius = .1;
var raycaster = new THREE.Raycaster();
var raycasterInRadius = []
var vector, dir, distance, pos;
var elasticity = 0
var allElasticities = []
var elasticityObjects = []
var elasticityObjectsForPhysics = []
var file;
var isMouseDown = false;

var gridSizeX = 20;
var gridSizeY = 20;

var sketchPlane, intersects;

var sketchMode = false;

var boxGeoList = []

var islandObjects = [];
var physicsBlocks = [];

var exportBoxHeight = .2;

var mesh;
var planeMat;


init();
animate();
Ammo().then(start)

function init() {
    for(var i = 10; i < 40; i += 10) {
        elasticityObjects[i] = []
    }

    


    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor("#f5f5f5");
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





    var cube = new THREE.BoxGeometry(1, 1, 1);
    var cubeMaterials = [ 
        new THREE.MeshBasicMaterial({color:0xff0000, side: THREE.DoubleSide}),
        new THREE.MeshBasicMaterial({color:0x00ff00, side: THREE.DoubleSide}), 
        new THREE.MeshBasicMaterial({color:0x0000ff, side: THREE.DoubleSide}),
        new THREE.MeshBasicMaterial({color:0xffff00, side: THREE.DoubleSide}), 
        new THREE.MeshBasicMaterial({color:0xff00ff, side: THREE.DoubleSide}), 
        new THREE.MeshBasicMaterial({color:0x00ffff, side: THREE.DoubleSide}), 
    ]; 
    // Create a MeshFaceMaterial, which allows the cube to have different materials on each face 
    var cubeMaterial = new THREE.MeshFaceMaterial(cubeMaterials); 
    //https://threejs.org/docs/#api/en/constants/Materials
    mesh = new THREE.Mesh(cube, cubeMaterial);
    mesh.position.set(0,0,0);
    //scene.add(mesh);
    light = new THREE.PointLight(0xFFFFFF, 1, 500);
    light.position.set(lightPos.x,lightPos.y,lightPos.z);
    scene.add(light);
    //https://threejs.org/docs/#api/en/lights/PointLight

    var circleGeom = new THREE.CircleGeometry( .1, 64 );
    var circleMaterial = new THREE.LineBasicMaterial( { color: 0x00ffff } );
    cursorCircle = new THREE.Mesh(circleGeom, circleMaterial );
    cursorCircle.rotation.setFromVector3(new THREE.Vector3( Math.PI / 2), 0, 0);
    cursorCircle.material.side = THREE.DoubleSide;
    cursorCircle.name = "Cursor Circle";

    var sketchPlaneGeo = new THREE.PlaneGeometry(10, 10, 32, 32 );
    var sketchPlaneMat = new THREE.MeshBasicMaterial( {color: Math.random() * 0xFFFFFF, side: THREE.DoubleSide, opacity: 0, transparent:true} );
    sketchPlane = new THREE.Mesh( sketchPlaneGeo, sketchPlaneMat );
    sketchPlane.rotation.setFromVector3(new THREE.Vector3( Math.PI / 2, 0, 0));
    sketchPlane.name = "Sketch Plane";
    scene.add(sketchPlane);
    renderer.render(scene, camera);

    initSketchMode();
    addEventListeners();

    document.addEventListener('mousemove', updateCamera, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.getElementById('color selector').addEventListener('mousemove', colorSelector, false);
    document.getElementById('circleScale1').onclick = () => {changeCircleScale(1)};
    document.getElementById('circleScale2').onclick = () => {changeCircleScale(2)};
    document.getElementById('circleScale4').onclick = () => {changeCircleScale(4)};
    

    createGrid(gridSizeX, gridSizeY, .25)

    
}
function animate()
{   
    //updateCamera();
    requestAnimationFrame ( animate );  
    renderer.render (scene, camera);
}

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
    distance = - camera.position.z / dir.z;
    pos = camera.position.clone().add( dir.multiplyScalar( distance ) );

    updateSketchTrail();
    findGridOverlap(intersects);

}
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

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth,window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;

        camera.updateProjectionMatrix();

    })
}

function saveScene() {
    var result = scene.toJSON();
    var output =JSON.stringify(result);
    var fileName = makeid(10);
    downloadJSON(result, fileName);


}
function promptFileExplorer() {
    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => { 
        var file = e.target.files[0];
        console.log(file);
        loadFile(file);
    }

    input.click();
}

function loadFile(file) {
    var thingy;
    const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            thingy = event.target.result;
            loadScene(thingy);
    });
    reader.readAsText(file);
}

function loadScene(file) {
    var request = new XMLHttpRequest();
    request.open("GET", "saved_files/testFileJson.json", false);
    request.send(null)
    console.log(file);
    var my_JSON_object = JSON.parse(file);
    console.log(my_JSON_object);
    scene = new THREE.ObjectLoader().parse(my_JSON_object);

}


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

function makeid(length) {
    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
   }
   return result.join('');
}

function disableRightClickMenu(event) {
    event.preventDefault();
    return false;
}
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
        
    } else {

    }
}
function exportObjects() {
    var numIslands = numOfIslands();
    var tempScene = new THREE.Scene();
    var scalePos = {x: 0, z: 0}
    var scaleDims = {x: 0, z: 0}
    var scaleAmount = (.039 / 2); //For 1 mm: .039 (That is per object)

    for(var island = 0; island < numIslands; island++) {
        for(var currPlane = 0; currPlane < islandObjects[island].length; currPlane++) {
            scalePos.x = islandObjects[island][currPlane].position.x;
            scalePos.z = islandObjects[island][currPlane].position.z;
            scaleDims.x = islandObjects[island][currPlane].geometry.parameters.width;
            scaleDims.z = islandObjects[island][currPlane].geometry.parameters.height;
            var hasNeighbors = boxHasNeighbors(islandObjects[island][currPlane], island);
            if(!hasNeighbors.left) {
                scalePos.x += scaleAmount
                scaleDims.x -= scaleAmount
            }
            if(!hasNeighbors.right) {
                scalePos.x -= scaleAmount
                scaleDims.x -= scaleAmount
            }
            if(!hasNeighbors.top) {
                scalePos.z -= scaleAmount;
                scaleDims.z -= scaleAmount
            }
            if(!hasNeighbors.bottom) {
                scalePos.z += scaleAmount;
                scaleDims.z -= scaleAmount;
            }
            var exportBoxGeo = new THREE.BoxGeometry(scaleDims.x, exportBoxHeight, scaleDims.z);
            var exportBoxMaterial = new THREE.MeshBasicMaterial({color: (elasticity / 100) * 0xFFFFFF});
            var exportBoxMesh = new THREE.Mesh(exportBoxGeo, exportBoxMaterial);

            exportBoxMesh.position.set(scalePos.x, islandObjects[island][currPlane].position.y, scalePos.z);
            tempScene.add(exportBoxMesh);
        }
    }
    tempScene.scale.set(25.4, 25.4, 25.4)
    // scene.add(tempScene);

    //For some reason with STLExporter, you need to give it a renderer for it to export the scene properly
    var renderer2 = new THREE.WebGLRenderer({antialias: true});
    renderer2.setClearColor("#f5f5f5");
    renderer2.setSize(window.innerWidth,window.innerHeight);
    renderer2.render(tempScene, camera);

    var exporter = new THREE.STLExporter();
    var str = exporter.parse(tempScene); // Export the scene
    var blob = new Blob( [str], { type : 'text/plain' } ); // Generate Blob from the string
    saveAs( blob, (makeid(10).concat(".stl"))); //Save the Blob to file.stl
}

function boxHasNeighbors(currObject, islandNum) {
    var islandIndex = 0;
    var leftVal = true;
    var rightVal = true;
    var topVal = true;
    var bottomVal = true;

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
    return {left: leftVal, right: rightVal, top: topVal, bottom: bottomVal};
}