## **Software Strategy Guide: Reliable Robot Arm Control**

**Project Context:** A 4-DOF robot arm controlled via a web server interface through a Serial connection.
**Objective:** Deliver a reliable, crash-resistant prototype within a 20-hour window.
**Constraint:** Architecture must prioritize safety and simplicity to bypass OS-level complexities (Docker/ROS on macOS) and hardware limitations (power brownouts). 
**Assumptions:** The hardware has been handled.

### **I. System Architecture**

This system uses a **Direct Serial Synchronous Architecture**. It bypasses middleware (ROS) to reduce latency and configuration overhead.

**The Data Flow:**

1.  **Client (Frontend):** Sends a batch of actions (e.g., "Pick up object") to the Server.
2.  **Server (Python):** Decomposes the batch into atomic single-motor steps.
3.  **Communication (Serial):** Server sends ONE command $\rightarrow$ Waits for "DONE" signal $\rightarrow$ Sends next command.
4.  **Driver (Arduino):** Receives command $\rightarrow$ Validates bounds $\rightarrow$ Moves motor $\rightarrow$ Reports status.


### **II. Python Server Strategy (The "Brain")**

The server handles all logic, sequencing, and smoothing. The Arduino is treated as a dumb driver.

#### **1. The "Store and Forward" Queue**

  * **Problem:** Sending a list of 50 moves crashes the Arduino's memory (SRAM).
  * **Strategy:** Implement a Blocking Queue.
      * **Method:** `execute_sequence(actions: list)`
      * **Logic:** Iterate through the list. Send `action[i]`. Block execution until `serial.readline()` returns "DONE". Only then proceed to `action[i+1]`.

#### **2. Software "Soft Start" (Smoothing)**

  * **Problem:** Moving from $0^{\circ}$ to $180^{\circ}$ instantly causes current spikes (brownouts) and mechanical stress.
  * **Strategy:** Interpolate large moves.
      * **Method:** `interpolate_move(motor_id, start_angle, end_angle, step_size=5)`
      * **Logic:** Instead of sending `180`, generate a list: `[10, 20, 30... 180]`. Feed this list to the *Store and Forward* queue.

#### **3. Connection Reliability**

  * **Problem:** Arduino resets when the Serial port opens.
  * **Strategy:** Mandatory Wait.
      * **Logic:** `serial = Serial(port, 9600); time.sleep(2);` immediately after connection.

### **III. Arduino Firmware Strategy (The "Muscle")**

The firmware focuses purely on safety enforcement and protocol parsing.

#### **1. Communication Protocol (CSV)**

  * **Format:** `ID,ANGLE\n` (e.g., `1,90\n`)
  * **Why:** Parsable with standard C++ string functions. No JSON libraries required (saves memory).
  * **Response:** Arduino must print `DONE\n` after every move to release the Python lock.

#### **2. Input Sanitization**

  * **Problem:** Python might send a command to a non-existent motor or an unsafe angle.
  * **Strategy:** Hard-coded constrains.
      * **Logic:**
        ```cpp
        if (id < 0 || id >= NUM_SERVOS) return; // Ignore bad ID
        int safeAngle = constrain(targetAngle, MIN_LIMIT[id], MAX_LIMIT[id]);
        ```

#### **3. Safe Startup ("Homing")**

  * **Problem:** On boot, servos might jump to $0^{\circ}$ (uncontrolled) if not initialized.
  * **Strategy:** Define a `HOME_POS` array (e.g., all $90^{\circ}$).
      * **Logic:** In `setup()`, `attach()` the servo and immediately `write(HOME_POS[i])` before the main loop starts.

### **IV. Implementation Checklist for Agents**

If an AI agent is generating code for this project, it must verify these conditions:

1.  **Check:** Does the Python script pause (`time.sleep(2)`) after `serial.Serial()`?
2.  **Check:** Does the Arduino code use `Serial.readStringUntil('\n')` to handle variable-length inputs?
3.  **Check:** Are the safety limits (`const int MAX_ANGLE`) defined at the top of the Arduino file?
4.  **Check:** Is the Python loop blocking? (i.e., does it wait for "DONE" before sending the next command?)

### **V. API Reference (Internal)**

**Function: `move_motor(id, angle)`**

  * **Input:** `id` (int: 0-4), `angle` (int: 0-180)
  * **Process:**
    1.  Send string: `f"{id},{angle}\n"`
    2.  Start Timeout Timer (e.g., 2 seconds).
    3.  Read Line.
    4.  If "DONE", return Success.
    5.  If Timeout, raise `RobotConnectionError`.

**Function: `cleanup()`**

  * **Process:**
    1.  Do **not** detach servos.
    2.  Send sequence to move all motors to `HOME_POS`.
    3.  Close Serial connection.
