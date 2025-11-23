#include <Servo.h>

Servo s;
int SERVO_PIN = 3; // <-- change for each joint

void setup() {
  Serial.begin(115200);
  while (!Serial);

  s.attach(SERVO_PIN);
  delay(1000);

  Serial.println("READY: send angle 0-180");
}

int is_valid(int pin) {
  return pin >= 0 && pin <= 5;
}

void loop() {
  if (Serial.available()) {
    int SERVO_PIN = Serial.parseInt();
    int angle = Serial.parseInt();

    if (is_valid(SERVO_PIN) && angle >= 0 && angle <= 180) {
      s.detach();
      s.attach(SERVO_PIN);

      Serial.print("Moving to ");
      Serial.println(angle);
      s.write(angle);
      delay(500);
    }
  }
}
