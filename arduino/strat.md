# implementation strategy

1. emergency stop button functionality -- a MUST!  
2. test serial input from the client to the Pi to the arduino - use LED
3. safety strategies, stability & motor angle 
4. configuring the reorient() function for starting position of the robot.
5. define and test input and output returns: for each thing, what should the arduino code expect, and what are the valid outputs the arduino should return to the server? (pair programming)
6. individual motor executions -- integrate motor by motor with the server

NOTE: The current motor movement is discrete/single-sequential, where no 2 motors are moving at the same time.
