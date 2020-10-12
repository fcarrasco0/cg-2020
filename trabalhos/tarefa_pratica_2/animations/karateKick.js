function fightPosition( robot, start = false) {
  var clockRot = start ? 1 : -1;
  var degree = clockRot > 0 ? 72: 76;

  // robot parts
  var righUpperArm = robot.right_upper_arm;
  var rightLowerArm = robot.right_lower_arm;

  var leftUpperArm = robot.left_upper_arm;
  var leftLowerArm = robot.left_lower_arm;

  // rotation points
  var upperRightArmRotPt = robot.upperRightArmRotPt;
  var lowerRightArmRotPt = robot.lowerRightArmRotPt;
  var upperLeftArmRotPt = robot.upperLeftArmRotPt;
  var lowerLeftArmRotPt = robot.lowerLeftArmRotPt;

  // rates
  var upperArmRate = robot.upperArmRate;
  var lowerArmRate = robot.lowerArmRate;

  // axis
  var rightArmAxis = robot.rightArmAxis;
  var leftArmAxis = robot.leftArmAxis;

  // rotates upper arms to limit degree
  if(rotateUntil((i * robot.upperDegreeRate), 'greater', degree)){
    stage++;
    return i = 0;
  }

  // rotate upper arms
  righUpperArm.rotateAroundPoint(upperRightArmRotPt, (clockRot * upperArmRate), rightArmAxis);
  leftUpperArm.rotateAroundPoint(upperLeftArmRotPt, -(clockRot * upperArmRate), leftArmAxis);
    
  // rotate lower arms 
  if(rotateUntil((i * robot.lowerDegreeRate), 'lesser', degree - 8)){
    rightLowerArm.rotateAroundPoint(lowerRightArmRotPt, (clockRot * lowerArmRate), rightArmAxis);
    leftLowerArm.rotateAroundPoint(lowerLeftArmRotPt, -(clockRot * lowerArmRate), leftArmAxis);
  }
  
  
};

function liftRightLeg(robot, lift = false) {
  var degree
  var clockRot;
  var upperLegPosition, lowerLegPosition;
  
  // robot data for liftRightLeg
  var righrUpperLeg = robot.right_upper_leg;
  var rightLowerLeg = robot.right_lower_leg;

  var rightUpperLegRotPt = robot.rightUpperLegRotPt;
  var upperLegRate = robot.upperLegRate;
  var rightLegAxis = robot.rightLegAxis;

  if(lift) {
    clockRot = 1;

    upperLegPosition = new THREE.Vector3(0, 0, 0);
    lowerLegPosition = new THREE.Vector3(0, 0, 0);
  } else {
    clockRot = -1;

    upperLegPosition = new THREE.Vector3(0.030, -0.01, 0);
    lowerLegPosition = new THREE.Vector3(0.005, -0.014, 0);
  }

  degree = clockRot > 0 ? 228 : 220
  if(rotateUntil((i * robot.upperLegDegreeRate), 'greater', degree)){
    stage++;
    return i = 0;
  }

  righrUpperLeg.rotateAroundPoint(rightUpperLegRotPt, (clockRot * upperLegRate), rightLegAxis);
  
  righrUpperLeg.position.add(upperLegPosition);
  rightLowerLeg.position.add(lowerLegPosition);
}

function jump(robot, up = true) {
  var move = up? new THREE.Vector3(0, 0.1, 0) : new THREE.Vector3(0,-0.1, 0);
  robot.torso.position.add(move);
}

function kick(robot, kick = false) {
  var degree;
  var clockRot;
  var positionAdd;
  
  // robot data for kick
  var rightLowerLeg = robot.right_lower_leg;
  var rightLowerLegRotPt = robot.rightLowerLegRotPt;
  var lowerLegRate = robot.lowerLegRate;
  var rightLegAxis = robot.rightLegAxis;

  if(kick){
    clockRot = 1;
    positionAdd = new THREE.Vector3(-0.1, -0.01, 0)
  } else {
    clockRot = -1
    positionAdd = new THREE.Vector3(0.1, 0.01, 0)
  }

  degree = clockRot > 0 ? 140 : 143;
  if(rotateUntil((i * robot.lowerLegDegreeRate), 'greater', degree)){
    stage++;
    return i = 0;
  }

  rightLowerLeg.rotateAroundPoint(rightLowerLegRotPt, (clockRot * lowerLegRate), rightLegAxis);
  robot.right_lower_leg.position.add(positionAdd);
}

var i = 0;
var stage = 1 // 1 - first rotation | 2 - second rotation | 3 - etc.

function karateKick () {
  lastKeyDown = '3';
  
  // starts rotation radian rates
  var upperArmRate = 0.07;
  var lowerArmRate = upperArmRate - 0.005;
  var upperLegRate = 0.15;
  var lowerLegRate = 0.1;

  // start rotation degree rates
  var upperDegreeRate = radianToDegree(upperArmRate);
  var lowerDegreeRate = radianToDegree(lowerArmRate);
  var upperLegDegreeRate = radianToDegree(upperLegRate);
  var lowerLegDegreeRate = radianToDegree(lowerLegRate);

  // get robot parts
  var torso = robot.getObjectByName('torso');

  var right_upper_arm = robot.getObjectByName("right_upper_arm");
  var right_lower_arm = right_upper_arm.getObjectByName("lower_arm");
  var right_upper_leg = robot.getObjectByName('right_upper_leg');
  var right_lower_leg = right_upper_leg.getObjectByName('lower_leg');

  var left_upper_arm = robot.getObjectByName("left_upper_arm");
  var left_lower_arm = left_upper_arm.getObjectByName("lower_arm");

  var karateRobot = {
    // degree rates
    upperDegreeRate,
    lowerDegreeRate,
    upperLegDegreeRate,
    lowerLegDegreeRate,
    
    // radian rates
    upperArmRate,
    lowerArmRate,
    upperLegRate,
    lowerLegRate,
    
    // parts
    torso,
    
    right_upper_arm,
    right_lower_arm,
    right_upper_leg,
    right_lower_leg,
    
    left_upper_arm,
    left_lower_arm,

    // rotation points
    upperRightArmRotPt: createUpperArmRotationPoint(right_upper_arm),
    lowerRightArmRotPt: createLowerArmRotationPoint(right_lower_arm),
    rightUpperLegRotPt: createUpperLegRotationPoint(right_upper_leg),
    rightLowerLegRotPt: createUpperLegRotationPoint(right_lower_leg),

    upperLeftArmRotPt: createUpperArmRotationPoint(left_upper_arm, 'left'),
    lowerLeftArmRotPt: createLowerArmRotationPoint(left_lower_arm),
    
    // axis
    rightArmAxis,
    rightLegAxis,
    leftArmAxis,
  };

  switch(stage){
    case 1: { // start fight position
      fightPosition(karateRobot, true);
      return i++;
    }
    case 2: { // lift upper leg
      liftRightLeg(karateRobot, true);
      return i++;
    }
    case 3:{ // prepare kick
      kick(karateRobot, false);
      return i++;
    }
    case 4:{ // jump up
      if( i === 40) {
        stage++;
        return i = 0;
      }

      jump(karateRobot, true);
      return i++;
    }
    case 5:{ // kick
      kick(karateRobot, true);
      return i++;
    }
    case 6: { // jump down
      if( i === 40) {
        stage++;
        return i = 0;
      }

      jump(karateRobot, false);
      return i++;
    }
    case 7: { // drop upper leg
      liftRightLeg(karateRobot, false);
      return i++;
    }
    case 8: { // return to original position
      fightPosition(karateRobot, false);
      return i++;
    }
    default: { // restart the loop
      if(i > 10){
        stage = 1;
        resetRobotPosition();
        
        if(animationKeyDown !== '3') { // finish animation
          lastKeyDown = null;
          finishAnimation = 3;
        }

        return i = 0;
      }

      return i++;
    }
  }
}