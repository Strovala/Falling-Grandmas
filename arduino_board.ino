/*
  Pitch follower
 
 Plays a pitch that changes based on a changing analog input
 
 circuit:
 * 8-ohm speaker on digital pin 8
 * photoresistor on analog 0 to 5V
 * 4.7K resistor on analog 0 to ground
 
 created 21 Jan 2010
 modified 31 May 2012
 by Tom Igoe, with suggestion from Michael Flynn

This example code is in the public domain.
 
 http://arduino.cc/en/Tutorial/Tone2
 
 */
// constants won't change. They're used here to 
// set pin numbers:
const int buttonPin = 2;     // the number of the pushbutton pin
const int ledPin =  13;      // the number of the LED pin
const int soundOn =  49;      // the number of the LED pin

// variables will change:
int buttonState = 0;         // variable for reading the pushbutton status
  
int sensorReading = 100; 

void setup() {
  // initialize serial communications (for debugging only):
  Serial.begin(9600);
  // initialize the LED pin as an output:
  pinMode(ledPin, OUTPUT);      
  // initialize the pushbutton pin as an input:chr
  pinMode(buttonPin, INPUT); 
  Serial.read();
}
bool play = false;
void loop() {
   // read the state of the pushbutton value:
  buttonState = digitalRead(buttonPin);
  
  if(Serial.available()){
    // read the sensor:
    if(Serial.read() == soundOn){
      play = true;
      // turn LED on:    
      digitalWrite(ledPin, HIGH);
    }
    else {
      play = false;
      // turn LED off:
      Serial.println("silent_request_aproved");
      digitalWrite(ledPin, LOW); 
    }
  }
  
  if (buttonState == HIGH && play) {
    play = false;
    // turn LED off:
    Serial.println("im_alive");
    digitalWrite(ledPin, LOW);
  }
  
  
  if(play){
    // print the sensor reading so you know its range
    //Serial.println("RIP");
    // map the analog input range (in this case, 400 - 1000 from the photoresistor)
    // to the output pitch range (120 - 1500Hz)
    // change the minimum and maximum input numbers below
    // depending on the range your sensor's giving:
    int thisPitch = map(sensorReading, 1000, 1000, 4000, 20000);
    
    // play the pitch:
    tone(6, 65, 200);
 	delay(300);
 
tone(6, 65, 200);
 	delay(500);
tone(6, 98, 200);
 	delay(300);
tone(6, 98, 100);
 	delay(200);
tone(6, 104, 200);
 	delay(300);
tone(6, 104, 200);
 	delay(300);
tone(6, 104, 200);
 	delay(300); 	
tone(6, 104, 200);
 	delay(300);
  }
}
