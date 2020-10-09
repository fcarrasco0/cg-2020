// jumping jacks animation
function polichinelo (i = 0) {
  lastKeyDown = '2';

  // starts rotation degree rates
  var upperArmRate = 0.035;
  var lowerArmRate = upperArmRate - 0.015;
  var legRate = upperArmRate - 0.02;

  var up = new THREE.Vector3(0, 0.03, 0);
  var down = new THREE.Vector3(0,-0.03, 0);

  // get robot parts
  var torso = robot.getObjectByName('torso');

  var right_upper_arm = robot.getObjectByName("right_upper_arm");
  var right_lower_arm = right_upper_arm.getObjectByName("lower_arm");
  var right_upper_leg = robot.getObjectByName('right_upper_leg');

  var left_upper_arm = robot.getObjectByName('left_upper_arm');
  var left_lower_arm = left_upper_arm.getObjectByName("lower_arm");
  var left_upper_leg = robot.getObjectByName('left_upper_leg');
 
  // get rotation points for right limbs
  var rightUpperArmRotPt = createUpperArmRotationPoint(right_upper_arm);
  var rightLowerArmRotPt = createLowerArmRotationPoint(right_lower_arm);
  var rightUpperLegRotPt = createUpperLegRotationPoint(right_upper_leg);

  // get rotation points for left limbs
  var leftUpperArmRotPt = createUpperArmRotationPoint(left_upper_arm, 1);
  var leftLowerArmRotPt = createLowerArmRotationPoint(left_lower_arm);
  var leftUpperLegRotPt = createUpperLegRotationPoint(left_upper_leg);
  
  if( i < 75) {  
    // translate torso up
    torso.position.add(up);
    
    right_upper_arm.rotateAroundPoint(rightUpperArmRotPt, upperArmRate, rightArmAxis);
    right_lower_arm.rotateAroundPoint(rightLowerArmRotPt, lowerArmRate, rightArmAxis);
    right_upper_leg.rotateAroundPoint(rightUpperLegRotPt, legRate, rightLegAxis);

    left_upper_arm.rotateAroundPoint(leftUpperArmRotPt, upperArmRate, leftArmAxis);
    left_lower_arm.rotateAroundPoint(leftLowerArmRotPt, lowerArmRate, leftArmAxis);
    left_upper_leg.rotateAroundPoint(leftUpperLegRotPt, legRate, leftLegAxis);
    
  } else if (i < 150) {
    // translate torso down
    torso.position.add(down);

    right_upper_arm.rotateAroundPoint(rightUpperArmRotPt, -upperArmRate, rightArmAxis);
    right_lower_arm.rotateAroundPoint(rightLowerArmRotPt, -lowerArmRate, rightArmAxis);
    right_upper_leg.rotateAroundPoint(rightUpperLegRotPt, -legRate, rightLegAxis );

    left_upper_arm.rotateAroundPoint(leftUpperArmRotPt, -upperArmRate, leftArmAxis);
    left_lower_arm.rotateAroundPoint(leftLowerArmRotPt, -lowerArmRate, leftArmAxis);
    left_upper_leg.rotateAroundPoint(leftUpperLegRotPt, -legRate, leftLegAxis);

  } else if (animationKeyDown === '2' && i > 150){
    // restart the loop
    resetRobotPosition();
    
    return 0;
  } else if (i > 150) {
    // finish the loop if another animation is selected
    resetRobotPosition();

    lastKeyDown = null;
    finishAnimation = 2;

    return 0;
  }

  return i + 1;
}