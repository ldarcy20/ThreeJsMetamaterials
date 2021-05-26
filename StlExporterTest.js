var scene, renderer, camera;
var cameraPos = new THREE.Vector3(0, 7, 7);

var light;
var lightPos = new THREE.Vector3(10, 0, 25);

init();
function init() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor("#f5f5f5");
    renderer.setSize(window.innerWidth,window.innerHeight);

    camera = new THREE.PerspectiveCamera(
        75, //Field of view
        window.innerWidth/window.innerHeight, //aspect ratio
        .1, //near plane
        1000); //far plane

    camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
    camera.lookAt (new THREE.Vector3(0,0,0));
    camera.rotateZ(THREE.Math.degToRad(0));

    var cube = new THREE.BoxGeometry(1, 1, 1);
    var cubeMaterials = [ 
        new THREE.MeshBasicMaterial({color:0xff0000, side: THREE.DoubleSide}),
        new THREE.MeshBasicMaterial({color:0x00ff00, side: THREE.DoubleSide}), 
        new THREE.MeshBasicMaterial({color:0x0000ff, side: THREE.DoubleSide}),
        new THREE.MeshBasicMaterial({color:0xffff00, side: THREE.DoubleSide}), 
        new THREE.MeshBasicMaterial({color:0xff00ff, side: THREE.DoubleSide}), 
        new THREE.MeshBasicMaterial({color:0x00ffff, side: THREE.DoubleSide}), 
    ]; 
    var cube2 = new THREE.BoxGeometry(1,1,1);
    // Create a MeshFaceMaterial, which allows the cube to have different materials on each face 
    var cubeMaterial = new THREE.MeshFaceMaterial(cubeMaterials); 
    //https://threejs.org/docs/#api/en/constants/Materials
    mesh = new THREE.Mesh(cube, cubeMaterial);
    var mesh2 = new THREE.Mesh(cube2, cubeMaterial);
    mesh.position.set(0,0,0);
    mesh2.position.set(2,2,2);
    scene.add(mesh);
    scene.add(mesh2);
    light = new THREE.PointLight(0xFFFFFF, 1, 500);
    light.position.set(lightPos.x,lightPos.y,lightPos.z);
    renderer.render(scene, camera);

    var exporter = new THREE.STLExporter();
    var str = exporter.parse(scene); // Export the scene
    var blob = new Blob( [str], { type : 'text/plain' } ); // Generate Blob from the string
    console.log(blob);
    // saveAs( blob, 'file.stl' ); //Save the Blob to file.stl
}