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
THREE.Object3D.prototype.rotateAroundPoint = function (point, theta, axis = {x:0, y:0, z:1}, pointIsWorld = false) {
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


// Function to generate robot
// The strategy below is just a suggestion, you may change the shapes to create your customized robot

function gen_robot() {
    // Creating Group (not necessary, but better readability)
    var robot = new THREE.Group();

    // torso
    var torso = gen_rect(4.5, 8);
    torso.name = "torso";

    // head
    var head = gen_rect(2.5,3);
    head.name = "head";
    head.position.y = 5.6;
    head.position.z = -0.05;  // Not necessary, makes head not in front of other robot parts

    // face
    var left_eye = gen_circle(0.25, 30);
    var right_eye = left_eye.clone();
    var mouth = gen_circle(0.005, 30);
    
    left_eye.name = 'left_eye'
    right_eye.name = 'right_eye'
    mouth.name = 'mouth';

    head.add(left_eye);
    head.add(right_eye);
    head.add(mouth);

    left_eye.position.x = -0.5;
    right_eye.position.x = 0.5;

    left_eye.position.y = 0.3;
    right_eye.position.y = 0.3;
    mouth.position.y = -0.8

    // left: upper arm, arm, hand
    var left_upper_arm = gen_rect(1.2, 4);
    var left_lower_arm = gen_rect(1, 3.5);
    var left_hand = gen_triangle(1);

    left_upper_arm.name = "left_upper_arm";
    left_lower_arm.name = "lower_arm";
    left_hand.name = "hand";
    
    left_upper_arm.add(left_lower_arm);
    left_lower_arm.add(left_hand);
    
    left_hand.position.y = -2.65;
    left_lower_arm.position.y = -3.7;
    left_upper_arm.position.y = 1.8;
    left_upper_arm.position.x = -3.1;

    // right: upper arm, arm, hand
    var right_upper_arm = left_upper_arm.clone();  
    right_upper_arm.name = "right_upper_arm";
    right_upper_arm.position.x = 3.1;
    
    // left: upper leg, leg, foot
    var left_upper_leg = gen_rect(1.5,4);
    var left_lower_leg = gen_rect(1.3,3.5);
    var left_foot = gen_rect(1.8,0.5);

    left_upper_leg.name = 'left_upper_leg';
    left_lower_leg.name = 'lower_leg';
    left_foot.name = 'foot';

    left_upper_leg.add(left_lower_leg);
    left_lower_leg.add(left_foot);
    
    left_foot.position.y = -2;
    left_lower_leg.position.y = -3.6;
    left_upper_leg.position.y = -6.2;
    left_upper_leg.position.x = -1;

    // right: upper leg, leg, foot
    var right_upper_leg = left_upper_leg.clone();
    right_upper_leg.name = 'right_upper_leg';
    right_upper_leg.position.x = 1;

    // Creating hieararchy
    robot.add(torso);
    torso.add(head);
    torso.add(left_upper_arm);
    torso.add(right_upper_arm);
    torso.add(left_upper_leg);
    torso.add(right_upper_leg);

    robot.name = "robot";
    return robot
}

// Auxiliary function to generate rectangle
function gen_rect( width, height ) {
    var plane_geometry = new THREE.PlaneGeometry( width, height );
    var plane_material = new THREE.MeshBasicMaterial( {color: Math.random() * 0xffffff, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh(plane_geometry, plane_material);

    return plane;
}

// Auxiliary function to generate circle
function gen_circle( radius, segs = 30 ) {
    var circle_geometry = new THREE.CircleGeometry( radius, segs);
    var circle_material = new THREE.MeshBasicMaterial( {color: Math.random() * 0xffffff} );
    var circle = new THREE.Mesh(circle_geometry, circle_material);

    return circle
}

// Auxiliary function to generate triangle
function gen_triangle( size, v1 = new THREE.Vector3(-0.8, 0, 0), v2 = new THREE.Vector3(0.8, 0, 0), v3 = new THREE.Vector3(0, 1.5, 0) ) {
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
    
    /* Unused
    //Viewport set up
    var oc_aspect_ratio = width / height; 
    var vp_aspect_ratio = oc_aspect_ratio; 
    var vpXwidth = 800; //... pixels
    var vpYheight =  vpXwidth / vp_aspect_ratio;  //... pixels, to ensure no distortion
    var vpXmin = -vpXwidth  /2; vpXmax = vpXwidth  /2; //... pixels
    var vpYmin = -vpYheight /2; vpYmax = vpYheight /2; //... pixels
    */   

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
    
    } );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    /* renderer.setViewport( vpXmin, vpYmin, vpXwidth, vpYheight ); Unused */
    renderer.setSize(window.innerWidth, window.innerHeight);
    
}

function onDocumentKeyDown(event) {
    // One for Hand wave, Two for your Custom Animation #2 and Three - Your Custom Animation #3
    // For now, only prints inserted key
    console.log(event.which);
}

function createRotationPoint(x, y, z) {
  return new THREE.Vector3 (x, y, z);
}

var i = 0.0;

function robotWave (i = 0) {
  var rate = 0.015;
  var upperArmRotPt;
  var lowerArmRotPt;
  var handRotPt;

  var right_upper_arm = robot.getObjectByName("right_upper_arm");
  var right_lower_arm = right_upper_arm.getObjectByName("lower_arm");
  var right_hand = right_lower_arm.getObjectByName("hand");


  upperArmRotPt = createRotationPoint(
    ( right_upper_arm.geometry.parameters.width + right_upper_arm.__position.x) / 1.6,
    ( right_upper_arm.geometry.parameters.height + right_upper_arm.__position.y) / 1.8,
    0
  );

  lowerArmRotPt = createRotationPoint(
      ( 0) / 2,
      ( right_lower_arm.__position.y  ) / 1.6,
      0
  );

  handRotPt = createRotationPoint(
    ( 0) / 2,
    ( right_hand.__position.y  ) / 1.6,
    0
  );
  
  if( i < 110) {  
    // Sample animation, you should implement at least 3 animations:
    // One is the hand wave (as in lecture 3.4)
    // The other two: explore your creativity =)
    
    right_upper_arm.rotateAroundPoint( upperArmRotPt, rate );
    right_lower_arm.rotateAroundPoint( lowerArmRotPt, rate - 0.003 );

  } else if (i < 120) {
    right_lower_arm.rotateAroundPoint( lowerArmRotPt, rate - 0.003 );

  } else if( i < 130) {
    rate = rate + 0.05
    
    right_hand.rotateAroundPoint( handRotPt, rate );

  } else if( i < 150) {
    rate = rate + 0.05
    right_hand.rotateAroundPoint( handRotPt, -rate );
  }
  // var head = robot.getObjectByName("head");
  // var mouth = head.getObjectByName("mouth");
  // mouth.geometry.parameters.radius += 0.15
  
  // console.log(mouth.geometry.parameters.radius)

  // renderer.render(scene, camera);
}

function resetRobotPosition () {
  scene = scene.remove(robot);

  robot = gen_robot();
  scene = scene.add(robot);

  return renderer.render(scene, camera);
}

function animate() {

  if(i < 150) {
    robotWave(i);
    i++ 
  }
      
  requestAnimationFrame(animate);
    
  // Update changes to renderer
  stats.update();
  renderer.render(scene, camera);
  
}

init();
animate(0);