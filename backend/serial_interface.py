# import serial
# import threading
# import time

# from backend.db import log_event, update_robot_state

# #note that this will HAVEEE TO BE CHANGED BASED ON THE ARDUINO SPECS AND ARCH LINUX
# # ================================
# #  CONFIGURE SERIAL CONNECTION 
# # ================================
# # IMPORTANT:
# # Replace '/dev/ttyUSB0' with your actual Arduino port:
# # - macOS:     /dev/tty.usbmodemXXXX or /dev/cu.usbserial-XXX
# # - Windows:   COM3, COM4, etc.
# # - Linux:     /dev/ttyUSB0 or /dev/ttyACM0



# ##3 READ THE PART I SEND FROM ARDUINO TO KNOW WHAT PORT TO USE AND THEN YOU CAN DO THE ARUDINO CODE PART 
# SERIAL_PORT = "/dev/tty.usbmodem1101"   # <-- you MUST update this
# BAUD_RATE = 115200

# ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=0.1)


# # =============================================
# #  LISTEN TO ARDUINO IN A BACKGROUND THREAD
# # =============================================

# # basically this part is replacing the ROS subscriber that was listening to the topic published by the bridge node by direcatly listeting to the serial port of teh arduino 
# def listen_to_arduino():
#     print("Listening to Arduino on serial...")
#     while True:
#         try:
#             raw = ser.readline().decode().strip()

#             if raw:
#                 # Log ANY message from Arduino
#                 log_event("arduino", "event", raw)

#                 # STATE UPDATE EXAMPLE:
#                 # "STATE J0=10,J1=20,J2=5,J3=0,J4=0,J5=0"
#                 if raw.startswith("STATE"):
#                     joint_values = parse_state_message(raw)
#                     update_robot_state(joint_values)

#         except Exception as e:
#             print("Serial read error:", e)

#         time.sleep(0.01)  # avoid CPU max-out

# # this is a replacemnet for the spin() in ROS basically just is contatly taking in data from the serial port
# # Launch background listener
# listener_thread = threading.Thread(target=listen_to_arduino, daemon=True)
# listener_thread.start()


# #this is the function that will be called from main.py when we want to send a command to the arduino 
# # ===============================
# #  SEND COMMANDS TO ARDUINO
# # ===============================
# def send_command(cmd: str):
#     """
#     Sends a command string to the Arduino over serial.
#     Also logs this in robot_events.
#     """
#     try:
#         # this is what is writing to the arduino 
#         ser.write((cmd + "\n").encode())
#         log_event("backend", "command", cmd)
#     except Exception as e:
#         log_event("backend", "error", f"Failed to send: {e}")
#         raise e


# # returns angles of the joins in a json like file
# # ==========================================
# #  PARSE STATE MESSAGES FROM ARDUINO
# # ==========================================
# def parse_state_message(message: str):
#     """
#     Converts:
#         "STATE J0=10,J1=20,J2=5,J3=0,J4=0,J5=0"
#     Into:
#         {0:10, 1:20, 2:5, 3:0, 4:0, 5:0}
#     """
#     try:
#         message = message.replace("STATE ", "")
#         pairs = message.split(",")
#         joints = {}

#         for p in pairs:
#             j, val = p.split("=")
#             index = int(j.replace("J", ""))
#             joints[index] = int(val)

#         return joints

#     except Exception as e:
#         log_event("backend", "error", f"Failed to parse STATE: {message}")
#         return {}

from serial import Serial
import time
import os

arduino = Serial(port=os.getenv("ARDUINO_LOCATION"), baudrate=9600, timeout=1) 
time.sleep(2)  # wait for Arduino to reset

def send_angle(angle: int):
    arduino.write(f"{angle}\n".encode())  # send command
    response = arduino.readline().decode().strip()
    print("Arduino response:", response)

send_angle(30)