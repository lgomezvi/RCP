#include <Arduino.h>
#include <Servo.h>

// ---------------------------------------------------------
// 1. CONFIGURATION & GLOBALS (Addressing the TODO)
// ---------------------------------------------------------

// Define total motors based on your specs (3x MG996R + 2x SG90)
const int NUM_SERVOS = 5; 

// Hardware Pin Mapping
// // Ensure these pins match your wiring. 
// Note: MG996R (High Torque) are usually Base/Shoulder/Elbow.
const int SERVO_PINS[NUM_SERVOS] = {3, 5, 6, 9, 10};

// Safety Limits (As per "Input Sanitization" strategy)
// These hard-coded constraints prevent the robot from hitting itself.
const int MIN_LIMITS[NUM_SERVOS] = {0,   15,  20,  0,   10};
const int MAX_LIMITS[NUM_SERVOS] = {180, 165, 160, 180, 100};

// Home Positions (As per "Safe Startup" strategy)
const int HOME_POS[NUM_SERVOS] = {90, 90, 90, 90, 90};

// Emergency Stop Pin
const int E_STOP_PIN = 2; 

// Create Servo objects array
Servo servos[NUM_SERVOS];

// Forward declaration of helper functions
void safeMove(int id, int angle); 
void reorient();

// ---------------------------------------------------------
// 2. SETUP
// ---------------------------------------------------------
void setup() {
    // Start Serial Communication
    // Must match Python connection settings
    Serial.begin(9600); 

    // Setup Emergency Stop Button
    pinMode(E_STOP_PIN, INPUT_PULLUP);

    // Attach Motors & Immediate Soft Start
    for (int i = 0; i < NUM_SERVOS; i++) {
        servos[i].attach(SERVO_PINS[i]);
        
        // STRATEGY CHECK: Move immediately to Home to prevent jumping
        servos[i].write(HOME_POS[i]); 
    }

    // Allow hardware to settle before accepting commands
    delay(1000); 
    
    // Handshake to server
    Serial.println("READY"); 
}

// ---------------------------------------------------------
// 3. MAIN LOOP
// ---------------------------------------------------------
void loop() {
    // PRIORITY 1: Check Emergency Stop
    if (digitalRead(E_STOP_PIN) == LOW) {
        // If button pressed, trap code here. 
        // To recover, user must reset the Arduino.
        while(true) {
            // Optional: Blink LED to indicate error
        }
    }

    // PRIORITY 2: Listener Logic
    // Only read if data is actually available
    if (Serial.available() > 0) {
        listener();
    }
}

// ---------------------------------------------------------
// 4. LISTENER (The Protocol Parser)
// ---------------------------------------------------------
void listener() {
    // STRATEGY CHECK: Read until newline to handle variable length inputs
    // Protocol Format: "ID,ANGLE\n"
    String input = Serial.readStringUntil('\n');
    input.trim(); // Remove whitespace

    // Basic validation
    if (input.length() == 0) return;

    // Manual CSV Parsing (No JSON libraries to save memory)
    int commaIndex = input.indexOf(',');
    
    if (commaIndex != -1) {
        // Split the string
        String idStr = input.substring(0, commaIndex);
        String angleStr = input.substring(commaIndex + 1);

        // Convert to integers
        int id = idStr.toInt();
        int angle = angleStr.toInt();

        // Execute the move
        safeMove(id, angle);
    }
}

// ---------------------------------------------------------
// 5. MOVEMENT HELPER (Consolidated)
// ---------------------------------------------------------
// We merged moveMG996R and moveSG90 into one function.
// Why? The logic (constrain -> write -> delay) is identical for both.
// Differentiation is handled by the MIN/MAX arrays defined at the top.
void safeMove(int id, int targetAngle) {
    
    // STRATEGY CHECK: Ignore bad IDs
    if (id < 0 || id >= NUM_SERVOS) return;

    // STRATEGY CHECK: Hard-coded constraints
    // This ensures inputs from Python never breach physical limits
    int safeAngle = constrain(targetAngle, MIN_LIMITS[id], MAX_LIMITS[id]);

    // Physical Movement
    servos[id].write(safeAngle);

    // Mechanical Delay
    // Necessary so the motor reaches position before we say "DONE"
    delay(200); // Adjust based on load

    // STRATEGY CHECK: Handshake back to Python
    // This releases the "Store and Forward" lock on the server
    Serial.println("DONE");
}

// ---------------------------------------------------------
// 6. CLEANUP / REORIENT
// ---------------------------------------------------------
void reorient() {
    // As per 'cleanup()' strategy: Do NOT detach servos
    // Just move them back to home positions gently.
    
    for (int i = 0; i < NUM_SERVOS; i++) {
        safeMove(i, HOME_POS[i]);
        delay(300); // Extra delay for smooth homing
    }
    // Note: Python server will likely trigger this by sending specific 
    // home commands, or you can call this if a specific "RESET" 
    // command string is received.
}
