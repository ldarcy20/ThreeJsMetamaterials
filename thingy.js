https://mrdoob.com/projects/voxels/#A/alnSdYeafiacdaehahc
var scene, renderer, camera;
var cameraCenter = new THREE.Vector3();
var cameraHorzLimit = 10;
var cameraVertLimit = 10;
var mouse = new THREE.Vector2();
var mouseDown = new THREE.Vector2();
var state = 0;
var leftClickPressed = false;
var rightClickPressed = false;
//state : 0 "l" (Light Pos)
//state : 1 "c" (Camera Pos)

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
var elasticityObjects = []
var file;

var sketchPlane, intersects;

var sketchMode = false;

var boxGeoList = []

init();
animate();


function init() {
    for(var i = 10; i < 40; i += 10) {
        elasticityObjects[i] = []
    }

    

    var buttons = document.getElementsByTagName("button");

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor("#e5e5e5");
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
    var mesh = new THREE.Mesh(cube, cubeMaterial);
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
    // document.addEventListener('contextmenu', disableRightClickMenu, false);
    document.getElementById('circleScale1').onclick = () => {changeCircleScale(1)};
    document.getElementById('circleScale2').onclick = () => {changeCircleScale(2)};
    document.getElementById('circleScale4').onclick = () => {changeCircleScale(4)};
    document.getElementById('elasticity10').onclick = () => {changeElasticity(10)};
    document.getElementById('elasticity20').onclick = () => {changeElasticity(20)};
    document.getElementById('elasticity30').onclick = () => {changeElasticity(30)};
    

    createGrid(20, 20, .25)

    
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
    for(var i = 0; i < intersects.length; i++) {
        //console.log(intersects[i].object.name)
    }

    vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject( camera );

    dir = vector.sub( camera.position ).normalize();
    distance = - camera.position.z / dir.z;
    pos = camera.position.clone().add( dir.multiplyScalar( distance ) );

    updateSketchTrail();
    findGridOverlap(intersects);

}
function addEventListeners() {
    document.addEventListener('mousedown', (e) => {
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
    document.addEventListener('mouseup', (e) => {
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
        loadScene(file);
    }

    input.click();
}

function loadScene(file) {
    const fs = require('fs')

    console.log(file.name)
    fs.readFile(file.name, 'utf8', (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err)
            return
        }
        console.log('File data:', jsonString) 
    })
    var request = new XMLHttpRequest();
    request.open("GET", "saved_files/testFileJson.json", false);
    request.send(null)
    var my_JSON_object = JSON.parse(request.responseText);
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
    console.log("Here");
    return false;
}