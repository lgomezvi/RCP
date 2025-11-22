# note that everytime we are importing we ignore the backned suffix 

# also note ros_interface is just a skeleton file for now, also need to look into ros_publish_command works 

# need to later see how we can turn this db into a vector db 

# we import Node but dont subclass it (understand why)

# in ros_intercafe check that DDS is the middleware we are using to set up the commnatcion w ros 

# later have to set a publisher.publish(msg) to send commands to the robot 

# line 30 ros_intercafe log_event("ros", "event", data) ## will need to redifine these events probably later on 


# a better explanation of how the interface works w ebveything 

# NEXT STEPS 
<!-- Create the ROS → Arduino bridge node (arduino_bridge_node.py)
Create the Arduino firmware (closed-loop movement)
Implement the /execute IR endpoint
Build the Next.js UI + agent (connect w what thomson did )-->

# what got done 
<!-- Database fully integrated
FastAPI endpoints working
ROS hooks prepared
Command pipeline prepared
Status + logs available -->
