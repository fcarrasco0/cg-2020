// Function to generate robot
// The strategy below is just a suggestion, you may change the shapes to create your customized robot

function gen_robot() {
  // Creating Group (not necessary, but better readability)
  var robot = new THREE.Group();

  // torso
  var torso = gen_rect(4.5, 8, 0x9900ff);
  torso.name = "torso";

  // head
  var head = gen_rect(2.5,3, 0x7B25AA);
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
  var left_upper_arm = gen_rect(1.2, 4, 0x5167AC);
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
  var left_upper_leg = gen_rect(1.5,4, 0x5167AC);
  var left_lower_leg = gen_rect(1.3,3.5);
  var left_foot = gen_rect(1.8,0.5, 0xff751a);

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

function createUpperArmRotationPoint(upperArm, left = false) {
  var x = !left ? 1 : -1;

  return new THREE.Vector3 (
    ( (x * upperArm.geometry.parameters.width) + upperArm.__position.x) / 1.6,
    ( upperArm.geometry.parameters.height + upperArm.__position.y) / 1.8,
    0
  );
}

function createUpperLegRotationPoint(leg) {
  return new THREE.Vector3 (
    ( 0),
    ( leg.geometry.parameters.height + leg.__position.y) / 0.75,
    0
  );
}

function createLowerArmRotationPoint(lowerArm) {
  return new THREE.Vector3 (
    (0) / 2,
    ( lowerArm.__position.y  ) / 1.6,
    0
  );
}

// rotation axis variables
var torsoAxis = { x:0, y:0, z:0 }
var rightArmAxis = { x:0, y:0, z:1 }
var rightLegAxis = { x: -0.01, y: 0, z: 0.5 }

var leftArmAxis = { x: 0, y: 0, z: -1 }
var leftLegAxis = { x: -0.01, y: 0, z: -0.5 }

function resetRobotPosition () {
  scene = scene.remove(robot);

  robot = gen_robot();
  scene = scene.add(robot);

  scene.traverse( function( node ) {
    if ( node instanceof THREE.Object3D ) {
      node.savePosition();
    }
  });

  return renderer.render(scene, camera);
}