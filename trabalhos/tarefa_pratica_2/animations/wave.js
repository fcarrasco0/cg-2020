function robotWave (i = 0) {
  lastKeyDown = '1';

  // starts rotation degree rates
  var upperArmRate = 0.025;
  var lowerArmRate = upperArmRate - 0.017;
  var handRate = upperArmRate + 0.05;

  // get robot parts
  var right_upper_arm = robot.getObjectByName("right_upper_arm");
  var right_lower_arm = right_upper_arm.getObjectByName("lower_arm");
  var right_hand = right_lower_arm.getObjectByName("hand");

  var upperArmRotPt = createUpperArmRotationPoint(right_upper_arm);
  var lowerArmRotPt = createLowerArmRotationPoint(right_lower_arm);
  var handRotPt = createLowerArmRotationPoint(right_hand);
  
  if( i < 90) {  
    // lift upper arm
    right_upper_arm.rotateAroundPoint(upperArmRotPt, upperArmRate, rightArmAxis);
    right_lower_arm.rotateAroundPoint(lowerArmRotPt, lowerArmRate, rightArmAxis);

  } else if (i < 100) {
    // lift lower arm
    right_lower_arm.rotateAroundPoint(lowerArmRotPt, lowerArmRate, rightArmAxis);

  } else if( i < 110) {
    // wave towards the body
    right_hand.rotateAroundPoint(handRotPt, handRate, rightArmAxis);

  } else if( i <= 125) {
    // wave away from the body
    right_hand.rotateAroundPoint(handRotPt, -handRate, rightArmAxis);
    
  } else if ( i > 150 && animationKeyDown === '1'){
    // restart animation
    resetRobotPosition();

    return 0;
  } else if (i > 150) {
    // finish the loop if another animation is selected
    resetRobotPosition();
    
    lastKeyDown = null;
    finishAnimation = 1;

    return 0;
  }

  return i + 1;
}