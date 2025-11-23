# backend/robot_controller.py

import serial
import time
from backend.db import log_event


# =============================
# SERIAL CONNECTION
# =============================
# Change the port for your OS.
# For macOS it will look like:
#   /dev/cu.usbmodem2101
SERIAL_PORT = "/dev/cu.usbmodem2101"
BAUD_RATE = 115200

ser = serial.Serial(
    SERIAL_PORT,
    BAUD_RATE,
    timeout=1
)


# =============================
# SERVO CONFIGURATION
# =============================

# Hardware mapping based on your setup
SERVO_PINS = {
    "base": 3,
    "shoulder": 5,
    "elbow": 6,
    "wrist": 9,
    "grip": 10,
    "rotator": 11
}

# Safety ranges discovered from your calibration
SAFE_RANGES = {
    "base": (0, 180),
    "shoulder": (0, 55),
    "elbow": (0, 180),
    "wrist": (0, 180),
    "grip": (0, 180),
    "rotator": (0, 180),
}

# Rate limiting (prevents overheating)
LAST_MOVE = {joint: 0 for joint in SERVO_PINS.keys()}
MOVE_COOLDOWN = 0.15  # seconds


# =============================
# SAFETY VALIDATION
# =============================

def validate_command(joint: str, angle: int):
    """
    Ensures the joint exists and the angle is within safe limits.
    """

    # Unknown joint
    if joint not in SAFE_RANGES:
        log_event("safety", "invalid_joint", f"{joint} is not in SAFE_RANGES")
        return False, f"Unknown joint '{joint}'."

    min_a, max_a = SAFE_RANGES[joint]

    # Angle not safe
    if not (min_a <= angle <= max_a):
        msg = f"Angle {angle} is outside safe range for {joint} ({min_a}-{max_a})."
        log_event("safety", "angle_out_of_range", msg)
        return False, msg

    return True, "OK"


# =============================
# RATE LIMITING
# =============================

def check_rate_limit(joint: str):
    """
    Prevents sending too many commands too quickly to one servo.
    """
    now = time.time()
    if now - LAST_MOVE[joint] < MOVE_COOLDOWN:
        return False
    LAST_MOVE[joint] = now
    return True


# =============================
# LOW-LEVEL SERIAL COMMAND
# =============================

def send_serial_command(joint: str, angle: int):
    """
    Format: <joint>:<angle>\n
    Example: shoulder:45
    """
    cmd = f"{joint}:{angle}\n"
    ser.write(cmd.encode())
    log_event("backend", "serial_write", cmd.strip())


# =============================
# PUBLIC API USED BY FASTAPI
# =============================

def move_joint(joint: str, angle: int):
    """
    Main function the FastAPI endpoint calls.
    Includes: safety validation + rate limiting + serial sending.
    """

    # 1. validate safety
    ok, msg = validate_command(joint, angle)
    if not ok:
        return {"status": "error", "message": msg}

    # 2. rate limiting
    if not check_rate_limit(joint):
        msg = f"Movement too fast for '{joint}'. Try again in a moment."
        return {"status": "error", "message": msg}

    # 3. send serial command
    send_serial_command(joint, angle)

    return {
        "status": "success",
        "joint": joint,
        "angle": angle,
        "message": "Command sent safely."
    }
