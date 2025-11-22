#!/usr/bin/env python3
"""
ros_ik_serial.py
- subscribes to /llm_instructions (std_msgs/String) containing JSON
- computes IK for 2-link planar arm + base yaw + wrist + gripper
- sends serial commands to Arduino in the format: "B:...;S:...;E:...;W:...;G:...\n"
"""

import rclpy
from rclpy.node import Node
import json
import math
import serial
from std_msgs.msg import String

# ----- CONFIG (tune these) -----
SERIAL_PORT = "/dev/ttyUSB0"   # change to your Orange Pi -> Arduino serial
BAUDRATE = 9600

L1 = 0.12    # meters (shoulder -> elbow)
L2 = 0.12    # meters (elbow -> wrist)
BASE_HEIGHT = 0.08  # meters from base to shoulder joint

# servo mapping (example calibrations)
# maps joint radians -> servo degree command
# each entry: (rad_to_deg_scale, offset_deg, min_deg, max_deg, invert_flag)
SERVO_MAP = {
    "base":     (180.0 / math.pi,  90, 0, 180, False),  # theta_base (rad -> deg)
    "shoulder": (180.0 / math.pi,  90, 0, 180, False),  # theta1
    "elbow":    (180.0 / math.pi,  90, 0, 180, False),  # theta2
    "wrist":    (180.0 / math.pi,  90, 0, 180, False),  # wrist roll
    "gripper":  (1.0,              10, 0, 100, False)   # treat gripper as percent/deg
}

# choose elbow configuration: "up" or "down"
ELBOW_CONFIG = "down"

# ----- END CONFIG -----

def clamp(val, a, b):
    return max(a, min(b, val))

def rad_to_servo(joint_name, rad_or_val):
    scale, offset, mn, mx, invert = SERVO_MAP[joint_name]
    deg = rad_or_val * scale if joint_name != "gripper" else rad_or_val
    deg = deg + offset
    if invert:
        deg = offset - (deg - offset)
    deg = clamp(round(deg), mn, mx)
    return deg

def compute_ik(x, y, z, desired_yaw):
    """
    Returns (theta_base, theta_shoulder, theta_elbow, theta_wrist) in radians
    Throws ValueError if unreachable.
    """
    # base angle
    theta_base = math.atan2(y, x)

    # planar reach
    r = math.hypot(x, y)  # distance from base axis to wrist projection
    rp = r  # if wrist has offset, subtract here

    z_rel = z - BASE_HEIGHT

    # distance in plane from shoulder to target
    D_sq = rp*rp + z_rel*z_rel
    # law of cosines
    num = D_sq - L1*L1 - L2*L2
    den = 2.0 * L1 * L2
    D = num / den

    if abs(D) > 1.0:
        raise ValueError("Target unreachable: D=%f > 1" % D)

    # elbow angle
    if ELBOW_CONFIG == "down":
        theta2 = math.atan2(-math.sqrt(1.0 - D*D), D)   # elbow-down
    else:
        theta2 = math.atan2(math.sqrt(1.0 - D*D), D)    # elbow-up

    # shoulder angle
    phi = math.atan2(z_rel, rp)
    psi = math.atan2(L2 * math.sin(theta2), L1 + L2 * math.cos(theta2))
    theta1 = phi - psi

    # wrist: to achieve desired yaw; if wrist roll is independent we can set directly
    theta_wrist = desired_yaw  # for simple wrist roll config

    # normalize angles to -pi..pi
    def norm(a):
        return math.atan2(math.sin(a), math.cos(a))

    return (norm(theta_base), norm(theta1), norm(theta2), norm(theta_wrist))

class IKSerialNode(Node):
    def __init__(self):
        super().__init__('ik_serial_node')
        self.ser = None
        self.try_serial_connect()
        self.subscription = self.create_subscription(
            String,
            '/llm_instructions',
            self.instruction_cb,
            10
        )
        self.pub_feedback = self.create_publisher(String, '/ik_feedback', 10)
        self.get_logger().info("ik_serial_node ready")

    def try_serial_connect(self):
        try:
            self.ser = serial.Serial(SERIAL_PORT, BAUDRATE, timeout=1)
            self.get_logger().info(f"Opened serial port {SERIAL_PORT}")
        except Exception as e:
            self.get_logger().error(f"Failed to open serial port {SERIAL_PORT}: {str(e)}")
            self.ser = None

    def instruction_cb(self, msg):
        try:
            data = json.loads(msg.data)
        except Exception as e:
            self.get_logger().error(f"Invalid JSON: {e}")
            return

        # parse JSON
        tgt = data.get("target", {})
        x = float(tgt.get("x", 0.0))
        y = float(tgt.get("y", 0.0))
        z = float(tgt.get("z", 0.0))
        yaw = float(tgt.get("yaw", 0.0))
        gr = data.get("gripper", {})
        gr_action = gr.get("action", "set")
        gr_val = gr.get("value", 50)

        try:
            theta_base, theta_shoulder, theta_elbow, theta_wrist = compute_ik(x, y, z, yaw)
        except ValueError as e:
            self.get_logger().warn(f"IK failure: {e}")
            feedback_msg = String()
            feedback_msg.data = json.dumps({"status":"unreachable", "reason": str(e)})
            self.pub_feedback.publish(feedback_msg)
            return

        # map angles to servo positions
        servo_base  = rad_to_servo("base", theta_base)
        servo_shldr = rad_to_servo("shoulder", theta_shoulder)
        servo_elbow = rad_to_servo("elbow", theta_elbow)
        servo_wrist = rad_to_servo("wrist", theta_wrist)

        # gripper action
        if gr_action == "open":
            servo_grip = SERVO_MAP["gripper"][1] + 80  # example
        elif gr_action == "close":
            servo_grip = SERVO_MAP["gripper"][1] + 10
        else:
            servo_grip = rad_to_servo("gripper", float(gr_val))

        # Build serial command
        cmd = "B:{:d};S:{:d};E:{:d};W:{:d};G:{:d}\n".format(
            int(servo_base), int(servo_shldr), int(servo_elbow),
            int(servo_wrist), int(servo_grip)
        )

        self.get_logger().info(f"IK -> cmd: {cmd.strip()}")

        # send to Arduino
        if self.ser is None:
            self.try_serial_connect()
            if self.ser is None:
                self.get_logger().error("No serial connection, cannot send command")
                feedback_msg = String()
                feedback_msg.data = json.dumps({"status":"error", "reason":"no_serial"})
                self.pub_feedback.publish(feedback_msg)
                return

        try:
            self.ser.write(cmd.encode('utf-8'))
            feedback_msg = String()
            feedback_msg.data = json.dumps({
                "status":"sent",
                "cmd": cmd.strip(),
                "angles": {
                    "base": servo_base, "shoulder": servo_shldr, "elbow": servo_elbow,
                    "wrist": servo_wrist, "gripper": servo_grip
                }
            })
            self.pub_feedback.publish(feedback_msg)
        except Exception as e:
            self.get_logger().error(f"Serial write failed: {e}")
            feedback_msg = String()
            feedback_msg.data = json.dumps({"status":"error", "reason":str(e)})
            self.pub_feedback.publish(feedback_msg)

def main(args=None):
    rclpy.init(args=args)
    node = IKSerialNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == "__main__":
    main()