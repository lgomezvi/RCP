# # this file is pretty much the bridge between ROS and the backend
# # workflow fastapi talk to ros, ros to arduino. this is the middleman 

# import rclpy #library for ROS2 in python 
# from rclpy.node import Node # a node is the building block in ROS (think if it like a process) note we aernt using it here in fact we are using rclpy.create_node directly
# from std_msgs.msg import String
# from threading import Thread # so fun! so that we can run the ROS node in background while fastapi does its thing too 

# from backend.db import log_event, update_robot_state

# # Global variables
# ros_ready = False
# ros_node = None
# publisher = None # used to publish commands to ROS

# def start_ros_node():
#     global ros_ready, ros_node, publisher

#     # note this must alwys be called befrore creating any nodes
#     # sets up the connection to the ROS2 middleware (DDS) - check if is the middkleware that allows nodes to communicate
#     rclpy.init()

#     ros_node = rclpy.create_node("backend_bridge") # this creates a node called backend_bridge that will publish to /robot/commands and subscribe to /robot/events
#     publisher = ros_node.create_publisher(String, '/robot/commands', 10)

#     # Subscriber for Arduino → ROS → Backend events
#     # will be called whenever a message is received on /robot/events
#     def callback(msg):
#         data = msg.data
#         log_event("ros", "event", data) ## will need to redifine these events probably later on 

#         # makes sure tables are up to date
#         if data.startswith("STATE"):
#             joint_values = parse_state_message(data)
#             update_robot_state(joint_values)

#     ros_node.create_subscription(String, '/robot/events', callback, 10)

#     ros_ready = True

#     # Spin ROS in background
#     rclpy.spin(ros_node) # takes care of calling the callback when messages arrive

# def run_ros_in_background():
#     # makes sure fastapi and ros can run at the same time 
#     thread = Thread(target=start_ros_node, daemon=True) #will kill thread once done
#     thread.start()

# def ros_publish_command(cmd: str):
#     if not ros_ready:
#         raise Exception("ROS node not ready")
    
#     msg = String()
#     msg.data = cmd
#     publisher.publish(msg)

# # Used later when Arduino sends STATE data
# def parse_state_message(message: str):
#     """
#     Example message: STATE J0=10,J1=20,J2=5,J3=0,J4=0,J5=0
#     Returns: {0:10, 1:20, 2:5 ...}
#     """
#     message = message.replace("STATE ", "")
#     pairs = message.split(",")
#     joints = {}
#     for p in pairs:
#         j, val = p.split("=")
#         index = int(j.replace("J", ""))
#         joints[index] = int(val)
#     return joints
