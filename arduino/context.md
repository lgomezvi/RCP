# Overview 

This repo contains the code for direct control over a robot arm with 4 degrees of freedom and 5 servo motors.

Setup: The arduino is connected to a web server via serial (USB), where the web server is running the FastAPI server in the `../backend` directory.

Hardware specifcations:

- MG996R motors x 3
- SG90 9G motors x 2 


The arduino needs to contain:

1. An initial setup() function to orient the motors at their starting positions.
2. A listener() function that is run inside `void loop()` to continuously listen for input from the server. The server would send a sequence of actions to take that the arduino would execute in sequential, chronological order. Would the format be JSON?
3. Heuristic safety checks for the range of the motors that can be moved.
4. A cleanup function() that is called after all the actions have been executed.

 
Are there any more things you can think of that can improve the safety, stability and reliability of the motor controls?
