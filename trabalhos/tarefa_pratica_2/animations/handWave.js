var i = 0
var stage = 1 // 1 - first rotation | 2 - second rotation | 3 - etc.

function robotWave () {
  lastKeyDown = '1';

  // starts rotation radians rates
  var baseRadRate = 0.04;

  var upperArmRate = baseRadRate;
  var lowerArmRate = baseRadRate - 0.01;
  var handRate = baseRadRate + 0.05;

  // starts rotation degree rates
  var upperDegreeRate = radianToDegree(baseRadRate);
  var lowerDegreeRate = radianToDegree(lowerArmRate);
  var handDegreeRate = radianToDegree(handRate);

  // get robot parts
  var right_upper_arm = robot.getObjectByName("right_upper_arm");
  var right_lower_arm = right_upper_arm.getObjectByName("lower_arm");
  var right_hand = right_lower_arm.getObjectByName("hand");

  var upperArmRotPt = createUpperArmRotationPoint(right_upper_arm);
  var lowerArmRotPt = createLowerArmRotationPoint(right_lower_arm);
  var handRotPt = createLowerArmRotationPoint(right_hand);

  switch(stage) {
    case 1: {
      // rotate upper arm 105 degrees
      if (rotateUntil((i * upperDegreeRate), 105)) {
        stage = 2;
        return i = 0;
      }

      right_upper_arm.rotateAroundPoint(upperArmRotPt, upperArmRate, rightArmAxis);
    
      // rotate lower arm 45 degrees
      if(rotateUntil((i * lowerDegreeRate), 45, false)){
        right_lower_arm.rotateAroundPoint(lowerArmRotPt, lowerArmRate, rightArmAxis);
      }
      return i++;
    }
    case 2: {
      // rotate lower arm 25 degrees
      if (rotateUntil((i * lowerDegreeRate), 25)) {
        stage = 3;
        return i = 0;
      }
      
      right_lower_arm.rotateAroundPoint(lowerArmRotPt, lowerArmRate, rightArmAxis);
      return i++;
    }
    case 3:{
      // rotate hand 30 degrees
      if (rotateUntil((i * handDegreeRate), 30)) {
        stage = 4;
        return i = 0;
      }

      right_hand.rotateAroundPoint(handRotPt, handRate, rightArmAxis);
      return i++;
    }
    case 4: {
      // rotate hand on opposite direction 65 degrees
      if (rotateUntil((i * handDegreeRate), 65)) {
        stage = 0;
        return i = 0;
      }

      right_hand.rotateAroundPoint(handRotPt, -handRate, rightArmAxis);
      return i++;
    }
    default: {
      if( i > 10){
        resetRobotPosition();
        stage = 1;

        if(animationKeyDown !== '1') {
          lastKeyDown = null;
          finishAnimation = 1;
        }

        return i = 0;
      }

      return i++;
    }
  }
}