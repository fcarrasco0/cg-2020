function robotRobbed (i = 0) {
  lastKeyDown = '3';
  
  // starts rotation degree rates
  var upperArmRate = 0.015;
  var lowerArmRate = upperArmRate - 0.005;
  var legRate = upperArmRate + 0.002;

  // get robot parts
  var torso = robot.getObjectByName('torso');

  var right_upper_arm = robot.getObjectByName("right_upper_arm");
  var right_lower_arm = right_upper_arm.getObjectByName("lower_arm");
  var right_upper_leg = robot.getObjectByName('right_upper_leg');
  var right_lower_leg = right_upper_leg.getObjectByName('lower_leg');

  var left_upper_arm = robot.getObjectByName("left_upper_arm");
  var left_lower_arm = left_upper_arm.getObjectByName("lower_arm");
  var left_upper_leg = robot.getObjectByName('left_upper_leg');
  var left_lower_leg = left_upper_leg.getObjectByName('lower_leg');

  var upperRightArmRotPt = createUpperArmRotationPoint(right_upper_arm);
  var lowerRightArmRotPt = createLowerArmRotationPoint(right_lower_arm);
  var rightUpperLegRotPt = createUpperLegRotationPoint(right_upper_leg);
  var rightLowerLegRotPt = createUpperLegRotationPoint(right_lower_leg);

  var upperLeftArmRotPt = createUpperArmRotationPoint(left_upper_arm, 'left');
  var lowerLeftArmRotPt = createLowerArmRotationPoint(left_lower_arm);
  var leftUpperLegRotPt = createUpperLegRotationPoint(left_upper_leg);
  var leftLowerLegRotPt = createUpperLegRotationPoint(left_lower_leg);
  
  
  if( i < 80) {  
    right_upper_arm.rotateAroundPoint(upperRightArmRotPt, upperArmRate, rightArmAxis);
    right_lower_arm.rotateAroundPoint(lowerRightArmRotPt, lowerArmRate, rightArmAxis);
    
    left_upper_arm.rotateAroundPoint(upperLeftArmRotPt, -upperArmRate, leftArmAxis);
    left_lower_arm.rotateAroundPoint(lowerLeftArmRotPt, -lowerArmRate, leftArmAxis);
    right_upper_leg.rotateAroundPoint(rightUpperLegRotPt, legRate, rightLegAxis);

  } else if (i < 230) {
    right_upper_leg.rotateAroundPoint(rightUpperLegRotPt, legRate, rightLegAxis);
  } else if (i < 300) {
    right_lower_leg.rotateAroundPoint(rightLowerLegRotPt, -0.05, rightLegAxis);
    right_lower_leg.position.add(new THREE.Vector3(0.035, 0.0, 0));

  } else if(i < 370) {
    right_lower_leg.rotateAroundPoint(rightLowerLegRotPt, 0.05, rightLegAxis);
    right_lower_leg.position.sub(new THREE.Vector3(0.035, 0.0, 0));

  } else if (i < 600) {
    right_upper_leg.rotateAroundPoint(rightUpperLegRotPt, -legRate, rightLegAxis);

  } else if (i < 605) {
    right_upper_leg.position.add(new THREE.Vector3(0.0, -0.02, 0));
    right_lower_leg.position.add(new THREE.Vector3(0.025, -0.04, 0));

  } else if (i < 685) {
    right_upper_arm.rotateAroundPoint(upperRightArmRotPt, -upperArmRate, rightArmAxis);
    right_lower_arm.rotateAroundPoint(lowerRightArmRotPt, -lowerArmRate, rightArmAxis);
    
    left_upper_arm.rotateAroundPoint(upperLeftArmRotPt, upperArmRate, leftArmAxis);
    left_lower_arm.rotateAroundPoint(lowerLeftArmRotPt, lowerArmRate, leftArmAxis);
  } else if ( i > 695 && animationKeyDown === '3'){
    // restart animation
    resetRobotPosition();

    return 0;
  } else if (i > 695) {
    // finish the loop if another animation is selected
    resetRobotPosition();
    
    lastKeyDown = null;
    finishAnimation = 3;

    return 0;
  }

  return i + 1;
}