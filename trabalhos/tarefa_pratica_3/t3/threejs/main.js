// Rotation around point logic
// Based on https://stackoverflow.com/questions/42812861/three-js-pivot-point/42866733#42866733

THREE.Object3D.prototype.savePosition = function() {
    return function () {
        this.__position = this.position.clone(); 
        
        return this;
    }
}();

THREE.Object3D.prototype.rotateAroundPoint = function (point, theta, axis, rotationRate, pointIsWorld = false) {
  axis = new THREE.Vector3(axis.x, axis.y, axis.z)

  if(pointIsWorld){
    this.parent.localToWorld(this.position);
  }
  
  this.position.sub(point); // remove the offset
  this.position.applyAxisAngle(axis, theta); // rotate the POSITION
  this.position.add(point); // re-add the offset
    
  if(pointIsWorld){
    this.parent.worldToLocal(this.position); // undo world coordinates compensation
  }
  
  // changed to simulate rotation around self axis.
  this.rotation.y += rotationRate
  
  return this;
};


const setVector = function(x, y, z) {
  return new THREE.Vector3(x, y, z);
}

// ThreeJS variables
var camera, scene, renderer;

// OrbitControls (camera)
var controls;

// Optional (showFps)
var stats;

// Objects in Scene
var sun, earth, moon, system;

// Light in the scene 
var sunlight;



function init() {

  // Setting up renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  window.addEventListener('resize', onWindowResize, false);
  renderer.setSize(window.innerWidth, window.innerHeight); 

  // Setting up camera
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.5, 1000 );
  camera.position.z = 3;
  camera.position.y = 35;
  camera.lookAt( 0, 0, -4);
    
  // Setting up scene
  scene = new THREE.Scene();
  system = new THREE.Group();
    
  // Earth
  earth = createSphere(1, 20, 'texture/earth.jpg', 'Phong');
  earth.position.z = -10;

  // Moon
  moon = createSphere(0.5, 20, 'texture/moon.jpg', 'Phong');
  moon.position.z = -3;

  // Sun (Sphere + Light)
  sun = createSphere(2.25, 20, 'texture/sun.jpg');
  sun.position.z = -3;
  
  sunlight = new THREE.PointLight(0xffffff, 1.5);
  sunlight.position.set(0, 0, 0);
  sun.add(sunlight);

  earth.add(moon);
  sun.add(earth);
  system.add(sun)
  
  scene.add(system);
    
  // Adding both renderer and stats to the Web page, also adjusting OrbitControls
  stats = new Stats();
  document.body.appendChild(renderer.domElement);
  document.body.appendChild(stats.dom);
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.zoomSpeed = 2;

  // Adding listener for keydown 
  document.addEventListener("keydown", onDocumentKeyDown, false);

  // Saving initial position (necessary for rotation solution)
  scene.traverse( function( node ) {
    if ( node instanceof THREE.Object3D ) {
      node.savePosition();
    }  
  }); 
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);  
}

function onDocumentKeyDown(event) {
  console.log(event.which);
}

function animate() {    
  requestAnimationFrame( animate );

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();

  stats.update();
  renderer.render( scene, camera );
  
  var center = setVector(0,0,0);
  var axis = { x:0, y:-1, z:0};

  var earthYearRate = 0.005;
  var earthAxisRotatioRate = earthYearRate * 6.67;
  
  // adding earthAxisRotationRate to nullify its influence on moon rotation
  // makes the moon rotate approximately 12 times around earth on 1 earth cicle around the sun
  var moonCicleRate = (earthYearRate * 12) + earthAxisRotatioRate;
  var moonAxisRotationRate = -moonCicleRate;

  earth.rotateAroundPoint(center , earthYearRate, axis, earthAxisRotatioRate);
  moon.rotateAroundPoint(center, moonCicleRate, axis, moonAxisRotationRate);
}

init();
animate();


function createSphere(radius, segments, texture_path, type = 'Basic') {
    var sphGeom = new THREE.SphereGeometry(radius, segments, segments);
    const loader = new THREE.TextureLoader();
    const texture = loader.load(texture_path);
    if(type == 'Phong') {
        var sphMaterial = new THREE.MeshPhongMaterial({
            map: texture
        });
    }
    else {
        var sphMaterial = new THREE.MeshBasicMaterial({
            map: texture
        });
    }
    var sphere = new THREE.Mesh(sphGeom, sphMaterial);

    return sphere;
}