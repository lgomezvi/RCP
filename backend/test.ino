#include <Servo.h>

// Servo objects
Servo s_base;
Servo s_shoulder;
Servo s_elbow;
Servo s_wrist;
Servo s_grip;
Servo s_rotator;

// Joint → servo mapping
struct Joint {
  const char* name;
  Servo* servo;
};

Joint joints[] = {
  { "base",     &s_base     },
  { "shoulder", &s_shoulder },
  { "elbow",    &s_elbow    },
  { "wrist",    &s_wrist    },
  { "grip",     &s_grip     },
  { "rotator",  &s_rotator  }
};

int NUM_JOINTS = 6;

void setup() {
  Serial.begin(115200);

  // attach servo pins for UNO
  s_base.attach(3);
  s_shoulder.attach(5);
  s_elbow.attach(6);
  s_wrist.attach(9);
  s_grip.attach(10);
  s_rotator.attach(11);

  Serial.println("READY");
}

void moveJoint(const String& joint, int angle) {
  for (int i = 0; i < NUM_JOINTS; i++) {
    if (joint.equalsIgnoreCase(joints[i].name)) {
      joints[i].servo->write(angle);
      Serial.print("MOVED ");
      Serial.print(joint);
      Serial.print(" ");
      Serial.println(angle);
      return;
    }
  }

  // If unknown joint
  Serial.print("ERROR_UNKNOWN_JOINT ");
  Serial.println(joint);
}

void loop() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    int sep = cmd.indexOf(':');
    if (sep == -1) {
      Serial.print("ERROR_BAD_FORMAT ");
      Serial.println(cmd);
      return;
    }

    String joint = cmd.substring(0, sep);
    int angle = cmd.substring(sep + 1).toInt();

    moveJoint(joint, angle);
  }
}
