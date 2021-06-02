let physicsWorld, rigidBodies = [], tmpTrans = null
let prevVelocityY = [];
let isSimulating = false;
let cbContactResult;
let ballsGlobal = []
let ballElasiticitys = []

function start() {
    tmpTrans = new Ammo.btTransform();

    setupPhysicsWorld();

}

function setupPhysicsWorld(){
    clock = new THREE.Clock();

    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache    = new Ammo.btDbvtBroadphase(),
        solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -40, 0));

}

function createBlock(pos){
    
    // let pos = {x: 0, y: -.5, z: 0};
    let scale = {x: .25, y: 1, z: .25};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    //threeJS Section
    let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: 0xa0afa4}));

    blockPlane.position.set(pos.x, pos.y, pos.z);
    blockPlane.scale.set(scale.x, scale.y, scale.z);

    blockPlane.castShadow = true;
    blockPlane.receiveShadow = true;

    //scene.add(blockPlane);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    physicsBlocks.push(body);
    physicsWorld.addRigidBody(body);
    // renderFrame();

}

function createBall(pos){
    
    let radius = .15;
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 1;

    //threeJS Section
    let ball = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32 ), new THREE.MeshPhongMaterial({color: 0xff0505}));
    ball.castShadow = true;


    ball.position.set(pos.x, pos.y, pos.z);
    
    ball.castShadow = true;
    ball.receiveShadow = true;

    scene.add(ball);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btSphereShape( radius );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(0);
    body.setRollingFriction(0);


    physicsWorld.addRigidBody( body );
    
    ball.userData.physicsBody = body;
    rigidBodies.push(ball);
}

function renderFrame(){

    let deltaTime = clock.getDelta();
    updatePhysics( deltaTime );
    requestAnimationFrame( renderFrame );

}

function updatePhysics( deltaTime ){

    // Step world
    physicsWorld.stepSimulation( deltaTime, 10 );

    // Update rigid bodies
    for ( let i = 0; i < rigidBodies.length; i++ ) {
        let objThree = rigidBodies[ i ];
        let objAmmo = objThree.userData.physicsBody;
        let ms = objAmmo.getMotionState();
        if ( ms ) {
            ms.getWorldTransform( tmpTrans );
            let p = tmpTrans.getOrigin();
            let q = tmpTrans.getRotation();
            objThree.position.set( p.x(), p.y(), p.z() );
            objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

        }
    }
    for(var i = 0; i < rigidBodies.length; i++) {
        if(rigidBodies[i].userData.physicsBody.getLinearVelocity().y() < -1) {
            prevVelocityY[i] = rigidBodies[i].userData.physicsBody.getLinearVelocity().y();
        }
    }
    ballsGlobal = rigidBodies
    detectCollision2(rigidBodies);

}

function detectCollision2(balls) {
    for(var i = 0; i < balls.length; i++) {
        physicsWorld.contactTest( balls[i].userData.physicsBody , cbContactResult );
    }
}

function setupContactResultCallback() {
    cbContactResult = new Ammo.ConcreteContactResultCallback();

	cbContactResult.addSingleResult = function(cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1){

		let contactPoint = Ammo.wrapPointer( cp, Ammo.btManifoldPoint );

		const distance = contactPoint.getDistance();

		if( distance > 0 ) return;

		let colWrapper0 = Ammo.wrapPointer( colObj0Wrap, Ammo.btCollisionObjectWrapper );
		let rb0 = Ammo.castObject( colWrapper0.getCollisionObject(), Ammo.btRigidBody );

		let colWrapper1 = Ammo.wrapPointer( colObj1Wrap, Ammo.btCollisionObjectWrapper );
		let rb1 = Ammo.castObject( colWrapper1.getCollisionObject(), Ammo.btRigidBody );

		let threeObject0 = rb0.threeObject;
		let threeObject1 = rb1.threeObject;

		let tag, localPos, worldPos


		localPos = contactPoint.get_m_localPointA();
		worldPos = contactPoint.get_m_positionWorldOnA();

		localPos = contactPoint.get_m_localPointB();
		worldPos = contactPoint.get_m_positionWorldOnB();


		let localPosDisplay = {x: localPos.x(), y: localPos.y(), z: localPos.z()};
		let worldPosDisplay = {x: worldPos.x(), y: worldPos.y(), z: worldPos.z()};
        for(var i = 0; i < ballsGlobal.length; i++) {
            if(ballsGlobal[i].userData.physicsBody == rb0) {
                setBallVelocity(rb0, 0, -prevVelocityY[i], 0, ballElasiticitys[i]);
            }
        }

	}
}
function setBallVelocity(body,x,y,z, factor){
    var velocityVal = new Ammo.btVector3();
    velocityVal.setValue(x,factor * y,z);
    body.setLinearVelocity(velocityVal);
}

function removeFromPhysicsBlocks(objectIntersect) {
    if(elasticityObjectsForPhysics.indexOf(objectIntersect) != -1) {
        var removeIndex = elasticityObjectsForPhysics.indexOf(objectIntersect);
        physicsWorld.removeRigidBody(physicsBlocks[removeIndex]);
        elasticityObjectsForPhysics.splice(removeIndex, 1);
        physicsBlocks.splice(removeIndex, 1);
    }
}
function clearAllBalls() {
    while(rigidBodies.length > 0) {
        scene.remove(rigidBodies[rigidBodies.length -1]);
        rigidBodies.pop();
    }
}