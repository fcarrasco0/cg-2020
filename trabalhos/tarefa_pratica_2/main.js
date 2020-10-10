// Rotation around point logic
// Based on https://stackoverflow.com/questions/42812861/three-js-pivot-point/42866733#42866733

THREE.Object3D.prototype.savePosition = function() {
  return function () {
    this.__position = this.position.clone();      
    return this;
  }
}();

// point: Vector3 -  center of rotation
// theta: float - rotation angle (in radians)
// pointIsWord: bool
THREE.Object3D.prototype.rotateAroundPoint = function (point, theta, axis, pointIsWorld = false) {
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
    
  this.rotateOnAxis(axis, theta); // rotate the OBJECT

  return this;
};


// ThreeJS variables
var camera, scene, renderer;
var stats;
var robot;

// control variables
var i = 0.0;
var animationKeyDown = null;
var lastKeyDown = null;
var finishAnimation = false;

// Auxiliary function to generate rectangle
function gen_rect(width, height, color = 0x7ca4bd) {
  var plane_geometry = new THREE.PlaneGeometry( width, height );
  var plane_material = new THREE.MeshBasicMaterial( {color, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh(plane_geometry, plane_material);

  return plane;
}

// Auxiliary function to generate circle
function gen_circle( radius, segs = 30, color = 0xffffff) {
  var circle_geometry = new THREE.CircleGeometry(radius, segs);
  var circle_material = new THREE.MeshBasicMaterial( {color} );
  var circle = new THREE.Mesh(circle_geometry, circle_material);

  return circle
}

// Auxiliary function to generate triangle
function gen_triangle(size, v1 = {x: -0.8, y:0, z:0}, v2 = {x:0.8, y:0, z:0}, v3 = {x:0, y:1.5, z:0}) {

  v1 = new THREE.Vector3(v1.x, v1.y, v1.z);
  v2 = new THREE.Vector3(v2.x, v2.y, v2.z);
  v3 = new THREE.Vector3(v3.x, v3.y, v3.z);

  var triangle_geometry = new THREE.Geometry();
  var triangle = new THREE.Triangle(v1, v2, v3);
  var normal = triangle.normal();

  triangle_geometry.vertices.push(triangle.a);
  triangle_geometry.vertices.push(triangle.b);
  triangle_geometry.vertices.push(triangle.c);
  triangle_geometry.faces.push(new THREE.Face3(0, 1, 2, normal));
    
  var triangle = new THREE.Mesh(triangle_geometry, new THREE.MeshNormalMaterial());
  triangle.size = size;

  return triangle;
}

function init() {
  // Canvas width/height 
  var width = 45;
  var height = 27;

  // Setting up camera
  camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 0, 2 );
  camera.lookAt( 0, 0, -1);
  camera.position.z = 1;

  // Setting up scene
  scene = new THREE.Scene();
  robot = gen_robot();
  scene.add(robot);

  // Setting up renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  window.addEventListener('resize', onWindowResize, false);
    
  /* renderer.setViewport( vpXmin, vpYmin, vpXwidth, vpYheight );  Unused */ 
  renderer.setSize(window.innerWidth, window.innerHeight); 

  // Adding both renderer and stats to the Web page
  stats = new Stats();
  document.body.appendChild(renderer.domElement);
  document.body.appendChild(stats.dom);

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
  /* renderer.setViewport( vpXmin, vpYmin, vpXwidth, vpYheight ); Unused */
  renderer.setSize(window.innerWidth, window.innerHeight);
    
}

function onDocumentKeyDown(event) {
  // One for Hand wave, Two for your Custom Animation #2 and Three - Your Custom Animation #3
  switch(event.key) {
    case '1':
      return animationKeyDown = '1';
    case '2': 
      return animationKeyDown = '2';
    case '3':
      return animationKeyDown = '3';
    case 'r':
      return animationKeyDown = 'r';
    default:
      return animationKeyDown = null;
  }
}

function animate() {

  // reset animation instantly pushing r key
  if(animationKeyDown === 'r'){
    i = 0;
    lastKeyDown = null;
    finishAnimation = 1;

    resetRobotPosition();
  }

  // animation 1 called
  if((animationKeyDown === '1' && !lastKeyDown) || (!finishAnimation && lastKeyDown === '1')) {
    if (finishAnimation) finishAnimation = false;
    i = robotWave(i);
  }

  // animation 2 called
  if( (animationKeyDown === '2' && !lastKeyDown) || (!finishAnimation && lastKeyDown === '2')) {
    if (finishAnimation) finishAnimation = false;
    i = polichinelo(i);
  };

  // animation 3 called
  if( (animationKeyDown === '3' && !lastKeyDown) || (!finishAnimation && lastKeyDown === '3')) {
    if (finishAnimation) finishAnimation = false;
    i = karateKick(i);
  };
      
  requestAnimationFrame(animate);
    
  // Update changes to renderer
  stats.update();
  renderer.render(scene, camera);
  
}

init();
animate(0);