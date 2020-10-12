function jacksUp (robot, up = true) {
  var clockRot = up ? 1 : -1;
  
  // robot parts
  var upperRightArm = robot.right_upper_arm;
  var lowerRightArm = robot.right_lower_arm;
  var rightLeg = robot.right_upper_leg;

  var upperLeftArm = robot.left_upper_arm;
  var lowerLeftArm = robot.left_lower_arm;
  var leftLeg = robot.left_upper_leg;

  // rotation points
  var upperRightArmRotPt = robot.upperRightArmRotPt;
  var lowerRightArmRotPt = robot.lowerRightArmRotPt;
  var rightUpperLegRotPt = robot.rightUpperLegRotPt;

  var upperLeftArmRotPt = robot.upperLeftArmRotPt;
  var lowerLeftArmRotPt = robot.lowerLeftArmRotPt;
  var leftUpperLegRotPt = robot.leftUpperLegRotPt;

  // radian rates
  var upperArmRate = robot.upperArmRate;
  var lowerArmRate = robot.lowerArmRate;
  var legRate = robot.legRate;

  // axis
  var rightArmAxis = robot.rightArmAxis;
  var rightLegAxis = robot.rightLegAxis;

  var leftArmAxis = robot.leftArmAxis;
  var leftLegAxis = robot.leftLegAxis;

  // arms rotation
  upperRightArm.rotateAroundPoint(upperRightArmRotPt, (clockRot * upperArmRate), rightArmAxis);
  lowerRightArm.rotateAroundPoint(lowerRightArmRotPt, (clockRot * lowerArmRate), rightArmAxis);
  
  upperLeftArm.rotateAroundPoint(upperLeftArmRotPt, (clockRot * upperArmRate), leftArmAxis);
  lowerLeftArm.rotateAroundPoint(lowerLeftArmRotPt, (clockRot * lowerArmRate), leftArmAxis);
  
  // rotate legs 60 degrees
  if(rotateUntil((i * robot.legDegreeRate), 'lesser', 60)){
    rightLeg.rotateAroundPoint(rightUpperLegRotPt, (clockRot * legRate), rightLegAxis);
    leftLeg.rotateAroundPoint(leftUpperLegRotPt, (clockRot * legRate), leftLegAxis);
  }
  
}

function jumpingUp(robot, up = true) {
  var move = up? new THREE.Vector3(0, 0.1, 0) : new THREE.Vector3(0,-0.1, 0);
  robot.torso.position.add(move);
};


var i = 0
var stage = 1 // 1 - first rotation | 2 - second rotation | 3 - etc.

// jumping jacks animation
function polichinelo () {
  lastKeyDown = '2';

  // starts rotation radian rates
  var upperArmRate = 0.15;
  var lowerArmRate = upperArmRate/2;
  var legRate = upperArmRate/2.5;

  // starts rotation degree rates
  var upperDegreeRate = radianToDegree(upperArmRate);
  var legDegreeRate = radianToDegree(legRate);

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
    // degree rates
    upperDegreeRate,
    legDegreeRate,

    // radian rates
    upperArmRate,
    lowerArmRate,
    legRate,
    
    // parts
    torso,
    right_upper_arm,
    right_lower_arm,
    right_upper_leg,
      
    left_upper_arm,
    left_lower_arm,
    left_upper_leg,

    // rotation points
    upperRightArmRotPt: createUpperArmRotationPoint(right_upper_arm),
    lowerRightArmRotPt: createLowerArmRotationPoint(right_lower_arm),
    rightUpperLegRotPt: createUpperLegRotationPoint(right_upper_leg),

    upperLeftArmRotPt: createUpperArmRotationPoint(left_upper_arm, 'left'),
    lowerLeftArmRotPt: createLowerArmRotationPoint(left_lower_arm),
    leftUpperLegRotPt: createUpperLegRotationPoint(left_upper_leg),
    
    // axis
    rightArmAxis,
    rightLegAxis,
    leftArmAxis,
    leftLegAxis,
  };
  
  switch(stage) {
    case 1: {
      if (rotateUntil((i * upperDegreeRate), 'greater', 144)){
        stage = 2;
        return i = 0
      }
  
      jumpingUp(jackRobot, true);
      jacksUp(jackRobot, true);
  
      return i++;
    }
    case 2: {
      if (rotateUntil((i * upperDegreeRate), 'greater', 144)){
        resetRobotPosition();
        stage = 1;
  
        if(animationKeyDown !== '2'){
          lastKeyDown = null;
          finishAnimation = 2;
        }

        return i = 0
      }
  
      jumpingUp(jackRobot, false)
      jacksUp(jackRobot, false);
  
      return i++;  
    }
  }

}