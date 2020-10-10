function jacksUp (robot, up = true) {
  var clockRot = up ? 1 : -1;

  robot.part.right_upper_arm.rotateAroundPoint(
    robot.rot.upperRightArmRotPt, (clockRot * robot.rate.upperArmRate), robot.axis.rightArmAxis,
  );
  
  robot.part.right_lower_arm.rotateAroundPoint(
    robot.rot.lowerRightArmRotPt, (clockRot * robot.rate.lowerArmRate), robot.axis.rightArmAxis,
  );
  
  robot.part.right_upper_leg.rotateAroundPoint(
    robot.rot.rightUpperLegRotPt, (clockRot * robot.rate.legRate), robot.axis.rightLegAxis,
  );

  robot.part.left_upper_arm.rotateAroundPoint(
    robot.rot.upperLeftArmRotPt, (clockRot * robot.rate.upperArmRate), robot.axis.leftArmAxis,
  );
  
  robot.part.left_lower_arm.rotateAroundPoint(
    robot.rot.lowerLeftArmRotPt, (clockRot * robot.rate.lowerArmRate), robot.axis.leftArmAxis,
  );
  
  robot.part.left_upper_leg.rotateAroundPoint(
    robot.rot.leftUpperLegRotPt, (clockRot * robot.rate.legRate), robot.axis.leftLegAxis,
  );
}

function jumpingUp(robot, up = true) {
  var move = up? new THREE.Vector3(0, 0.1, 0) : new THREE.Vector3(0,-0.1, 0);
  robot.part.torso.position.add(move);
};

// jumping jacks animation
function polichinelo (i = 0) {
  lastKeyDown = '2';

  // starts rotation degree rates
  var upperArmRate = 0.1;

  // get robot parts
  var torso = robot.getObjectByName('torso');

  var right_upper_arm = robot.getObjectByName("right_upper_arm");
  var right_lower_arm = right_upper_arm.getObjectByName("lower_arm");
  var right_upper_leg = robot.getObjectByName('right_upper_leg');

  var left_upper_arm = robot.getObjectByName('left_upper_arm');
  var left_lower_arm = left_upper_arm.getObjectByName("lower_arm");
  var left_upper_leg = robot.getObjectByName('left_upper_leg');
 
  // create local robot object to use in local functions
  var jackRobot = {
    rate: {
      upperArmRate,
      lowerArmRate: upperArmRate/1.4,
      legRate: 0.045,
    },
    part: {
      torso,
      right_upper_arm,
      right_lower_arm,
      right_upper_leg,
      
      left_upper_arm,
      left_lower_arm,
      left_upper_leg,
    },
    rot: {
      upperRightArmRotPt: createUpperArmRotationPoint(right_upper_arm),
      lowerRightArmRotPt: createLowerArmRotationPoint(right_lower_arm),
      rightUpperLegRotPt: createUpperLegRotationPoint(right_upper_leg),
  
      upperLeftArmRotPt: createUpperArmRotationPoint(left_upper_arm, 'left'),
      lowerLeftArmRotPt: createLowerArmRotationPoint(left_lower_arm),
      leftUpperLegRotPt: createUpperLegRotationPoint(left_upper_leg),
    },
    axis: {
      rightArmAxis,
      rightLegAxis,
      leftArmAxis,
      leftLegAxis,
    },
  };
 
  if( i < 25) {  
    jumpingUp(jackRobot, true)
    jacksUp(jackRobot, true);

  } else if (i < 50) {
    jumpingUp(jackRobot, false)
    jacksUp(jackRobot, false);

  } else if (i > 50 && animationKeyDown === '2'){
    // restart the loop
    resetRobotPosition();
    
    return 0;
  } else if (i > 50) {
    // finish the loop if another animation is selected
    resetRobotPosition();

    lastKeyDown = null;
    finishAnimation = 2;

    return 0;
  }

  return i + 1;
}