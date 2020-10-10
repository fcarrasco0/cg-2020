function fightPosition( robot, start = false) {
  var clockRot = !start ? -1 : 1;
  
  robot.part.right_upper_arm.rotateAroundPoint(
    robot.rot.upperRightArmRotPt, (clockRot * robot.rate.upperArmRate), robot.axis.rightArmAxis
  );
  
  robot.part.right_lower_arm.rotateAroundPoint(
    robot.rot.lowerRightArmRotPt, (clockRot * robot.rate.lowerArmRate), robot.axis.rightArmAxis
  );
    
  robot.part.left_upper_arm.rotateAroundPoint(
    robot.rot.upperLeftArmRotPt, -(clockRot * robot.rate.upperArmRate), robot.axis.leftArmAxis
  );
  
  robot.part.left_lower_arm.rotateAroundPoint(
    robot.rot.lowerLeftArmRotPt, -(clockRot * robot.rate.lowerArmRate), robot.axis.leftArmAxis,
  );
};

function liftRightLeg(robot, lift = false) {
  var clockRot;
  var upperLegPosition, lowerLegPosition;
  
  if(lift) {
    clockRot = 1;

    upperLegPosition = new THREE.Vector3(0, 0, 0);
    lowerLegPosition = new THREE.Vector3(0, 0, 0);
  } else {
    clockRot = -1;

    upperLegPosition = new THREE.Vector3(0.015, -0.005, 0);
    lowerLegPosition = new THREE.Vector3(0.005, -0.007, 0);
  }

  robot.part.right_upper_leg.rotateAroundPoint(
    robot.rot.rightUpperLegRotPt, (clockRot * robot.rate.legRate), robot.axis.rightLegAxis
  );
  
  robot.part.right_upper_leg.position.add(upperLegPosition);
  robot.part.right_lower_leg.position.add(lowerLegPosition);
}

function jump(robot, up = true) {
  var move = up? new THREE.Vector3(0, 0.1, 0) : new THREE.Vector3(0,-0.1, 0);
  robot.part.torso.position.add(move);
}

function kick(robot, kick = false) {
  var clockRot;
  var positionAdd;
  
  if(kick){
    clockRot = 1;
    positionAdd = new THREE.Vector3(-0.1, -0.01, 0)
  } else {
    clockRot = -1
    positionAdd = new THREE.Vector3(0.1, 0.01, 0)
  }

  robot.part.right_lower_leg.rotateAroundPoint(
    robot.rot.rightLowerLegRotPt, (clockRot * robot.rate.legRate), robot.axis.rightLegAxis,
  );
  
  robot.part.right_lower_leg.position.add(positionAdd);
}

function karateKick (i = 0) {
  lastKeyDown = '3';
  
  var torso = robot.getObjectByName('torso');

  var right_upper_arm = robot.getObjectByName("right_upper_arm");
  var right_lower_arm = right_upper_arm.getObjectByName("lower_arm");
  var right_upper_leg = robot.getObjectByName('right_upper_leg');
  var right_lower_leg = right_upper_leg.getObjectByName('lower_leg');

  var left_upper_arm = robot.getObjectByName("left_upper_arm");
  var left_lower_arm = left_upper_arm.getObjectByName("lower_arm");

  var karateRobot = {
    rate: {
      upperArmRate: 0.05,
      lowerArmRate: 0.05 - 0.005,
      legRate: 0.1,
    },
    part: {
      torso,
      right_upper_arm,
      right_lower_arm,
      right_upper_leg,
      right_lower_leg,
      left_upper_arm,
      left_lower_arm,
    },
    rot: {
      upperRightArmRotPt: createUpperArmRotationPoint(right_upper_arm),
      lowerRightArmRotPt: createLowerArmRotationPoint(right_lower_arm),
      rightUpperLegRotPt: createUpperLegRotationPoint(right_upper_leg),
      rightLowerLegRotPt: createUpperLegRotationPoint(right_lower_leg),
  
      upperLeftArmRotPt: createUpperArmRotationPoint(left_upper_arm, 'left'),
      lowerLeftArmRotPt: createLowerArmRotationPoint(left_lower_arm),
    },
    axis: {
      rightArmAxis,
      rightLegAxis,
      leftArmAxis,
    },
  }

  if( i < 25) {
    fightPosition(karateRobot, true);

  } else if (i < 65) {
    liftRightLeg(karateRobot, true);

  } else if (i < 90) {
    kick(karateRobot, false);

  } else if(i < 130) {
    jump(karateRobot);

  } else if(i < 155) {
    kick(karateRobot, true);
    if(i > 144) jump(karateRobot, false);
    
  } else if (i < 185) {
    jump(karateRobot, false);

  } else if (i < 225) {
    liftRightLeg(karateRobot, false);

  } else if (i < 250) { 
    fightPosition(karateRobot, false);
  } else if ( i > 275 && animationKeyDown === '3'){
    // restart animation

    resetRobotPosition();
    return 0;
  } else if (i > 275) {
    // finish the loop if another animation is selected

    resetRobotPosition();
    lastKeyDown = null;
    finishAnimation = 3;

    return 0;
  }

  return i + 1;
}