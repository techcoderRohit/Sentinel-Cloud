import dht
import machine
import time
import network
from umqtt.simple import MQTTClient
import ujson
import ubinascii
import sys
import uio
import uos

MQTT_BROKER = "10.190.69.133"

# Unique Identification
# Generate ID based on MAC address to avoid collisions with other students
CLIENT_ID = "my_esp8266_98"
print("🆔 Assigned Unique Client ID:", CLIENT_ID)

API_KEY = "sk-sentinel-f5d5c09018c17f280850763ee74b2a86"

# Dashboard logic topics (Inhe dhyan se check karein)

COMMAND_TOPIC = "sentinel/device/{}/repl/rx".format(CLIENT_ID)
RESPONSE_TOPIC = "sentinel/device/{}/repl/tx".format(CLIENT_ID)
INPUT_TOPIC = "sentinel/device/{}/command".format(CLIENT_ID)
DATA_TOPIC = "sensors/data"

# Application-level Auth topics
AUTH_TOPIC = "sentinel/auth"
AUTH_RX_TOPIC = "sentinel/device/{}/auth_tx".format(CLIENT_ID)
OTA_TOPIC = "sentinel/device/{}/ota_update".format(CLIENT_ID)

is_authorized = False
pending_ota_url = None # Flag for OTA update

# Hardware Setup
led = machine.Pin(2, machine.Pin.OUT) # Internal LED
pwm_led = machine.PWM(led, freq=1000) # PWM for brightness control
relay = machine.Pin(4, machine.Pin.OUT) # Relay on D2
sensor = dht.DHT11(machine.Pin(5))

# --- REPL EXECUTION ENGINE ---
# Maintain a persistent context for commands (variables stay in memory)
repl_globals = {
    'led': led,
    'pwm_led': pwm_led,
    'relay': relay,
    'sensor': sensor,
    'time': time,
    'machine': machine,
    'network': network
}

def run_repl_command(cmd):
    """Executes code and captures its stdout using uos.dupterm."""
    output = uio.StringIO()
    
    # MicroPython doesn't support sys.stdout assignment.
    # We use uos.dupterm() to redirect terminal output to our buffer.
    class StreamWrapper:
        def __init__(self, stream):
            self.stream = stream
        def write(self, data):
            self.stream.write(data)
        def readinto(self, buf):
            return 0
    
    sw = StreamWrapper(output)
    redirected = False
    
    try:
        # Slot 1 captures output for the web terminal
        try:
            uos.dupterm(sw, 1)
            redirected = True
        except:
            try:
                uos.dupterm(sw)
                redirected = True
            except:
                pass 
    
        # 1. Try eval() for single expressions (like 5+5)
        try:
            result = eval(cmd, repl_globals)
            if result is not None:
                print(result)
        except SyntaxError:
            # 2. If eval fails (e.g. print statement), try exec()
            exec(cmd, repl_globals)
        except Exception as e:
            # 3. Fallback for other errors
            exec(cmd, repl_globals)
    except Exception as e:
        print("Error:", e)
    finally:
        # Restore terminal output
        if redirected:
            try:
                uos.dupterm(None, 1)
            except:
                try:
                    uos.dupterm(None)
                except:
                    pass
        
    return output.getvalue().strip()

# --- CALLBACK FUNCTION (Dashboard commands yahan receive honge) ---
def sub_cb(topic, msg):
    global is_authorized
    
    decoded_topic = topic.decode()
    print("[TRACE] Callback Triggered on: {}".format(decoded_topic))
    
    try:
        data = ujson.loads(msg)
        
        if decoded_topic == AUTH_RX_TOPIC:
            if data.get("status") == "authorized":
                is_authorized = True
                print("✅ Handshake Authorized! We can send telemetry now.")
            else:
                is_authorized = False
                print("❌ Handshake Denied! Check your API Key.")
            return

        # OTA Update Processing
        if decoded_topic == OTA_TOPIC:
            print("🚀 OTA Command Received!")
            update_url = data.get("url")
            if update_url:
                global pending_ota_url
                pending_ota_url = update_url # Set flag to handle outside callback
            return

        # 2. INPUT COMMANDS (Slider, Button, etc.)
        if decoded_topic == INPUT_TOPIC:
            # Use .lower() to handle case-sensitivity from dashboard (e.g. BRIGHTNESS vs brightness)
            field = data.get("field", "").lower()
            value = data.get("value")
            print("[INPUT] Widget Update: {} -> {}".format(field, value))
            
            if field == 'relay':
                # Relay Control (Active Low)
                if value is True or value == 1:
                    relay.value(0) # ON
                else:
                    relay.value(1) # OFF
            
            elif field == 'brightness':
                # LED Brightness Control (0-100 range)
                # Note: Internal LED on ESP8266 (Pin 2) is Active Low.
                # 100% brightness = 0 duty, 0% brightness = 1023 duty.
                duty = int(((100 - value) / 100) * 1023)
                pwm_led.duty(duty)
                print("[PWM] Brightness set to: {}% (Duty: {})".format(value, duty))
                
            return

        # Regular Repl Command Processing
        print("[TRACE] Processing command...")
        
        # Check for 'execute' (code block) or 'command' (single line)
        code_to_run = data.get("execute") or data.get("command")
        
        if code_to_run:
            response = ""
            color = "#94a3b8" # Default Gray
            
            # Handle legacy/built-in commands first
            cmd_clean = code_to_run.lower().strip()
            if cmd_clean == "led_on":
                pwm_led.duty(0) # ON (Active Low: 0 is full brightness)
                response = "Success: LED is now ON"
                color = "#4ade80" # Green
            elif cmd_clean == "led_off":
                pwm_led.duty(1023) # OFF (Active Low: 1023 is no brightness)
                response = "Success: LED is now OFF"
                color = "#f87171" # Red
            elif cmd_clean == "status":
                response = "System: Operational | Temp/Hum active"
                color = "#22d3ee" # Cyan
            elif cmd_clean == "help":
                response = "Available: led_on, led_off, status, help, or any MicroPython code (e.g. print(1+1))"
            else:
                # Run as arbitrary MicroPython code
                print("[REPL] Executing: {}".format(code_to_run))
                response = run_repl_command(code_to_run)
                if not response:
                    response = "OK"
                color = "#ffffff" # White for code results

            # Publish result back to Dashboard
            client.publish(RESPONSE_TOPIC, ujson.dumps({"output": response, "color": color}))
        
    except Exception as e:
        error_msg = "Critical Error: " + str(e)
        client.publish(RESPONSE_TOPIC, ujson.dumps({"output": error_msg, "color": "#ff5f56"}))

def connect_mqtt():
    global client
    try:
        client = MQTTClient(CLIENT_ID, MQTT_BROKER, port=1883, keepalive=60)
        client.set_callback(sub_cb)
        
        # Connection timeout handling
        print('📡 Connecting to MQTT at {}...'.format(MQTT_BROKER))
        client.connect()
        
        # Subscribe to essential topics
        client.subscribe(COMMAND_TOPIC)
        client.subscribe(AUTH_RX_TOPIC)
        client.subscribe(OTA_TOPIC)
        client.subscribe(INPUT_TOPIC)
        print('🚀 Connected to Sentinel & Subscribed to REPL/OTA/INPUT')
        
        # Handshake Initiate karein
        print('🔐 Sending Handshake using API Key...')
        auth_payload = ujson.dumps({"clientId": CLIENT_ID, "apiKey": API_KEY})
        client.publish(AUTH_TOPIC, auth_payload)
        
        return client
    except Exception as e:
        print("❌ MQTT Connect Error:", e)
        return None

# --- MAIN EXECUTION ---
# connect_wifi()
mqtt_client = connect_mqtt()

last_telemetry_time = 0
telemetry_interval = 5 
last_handshake_time = 0
handshake_retry_interval = 10
wlan = network.WLAN(network.STA_IF)

while True:
    try:
        # 1. WiFi Guard: Agar network gaya, toh pehle WiFi wapas lao
        if not wlan.isconnected():
            print("📡 WiFi Connection Lost! Reconnecting...")
            is_authorized = False # Reset auth state on drop
            # connect_wifi()
            mqtt_client = connect_mqtt()
            time.sleep(2)
            continue

        # 2. MQTT Guard: Agar client nahi hai, toh reconnect karein
        if not mqtt_client:
            print("🔄 Attempting MQTT Reconnection...")
            mqtt_client = connect_mqtt()
            if not mqtt_client:
                time.sleep(5) # Thoda zyada wait karein repeat connect se pehle
                continue

        # 3. Check for incoming messages (REPL/Commands)
        mqtt_client.check_msg()

        # 4. Handle Pending OTA Update (Outside callback to save RAM)
        if pending_ota_url:
            print("📦 Processing Pending OTA...")
            import ota_client
            # Close MQTT before update to free up a socket and RAM
            try:
                mqtt_client.disconnect()
            except:
                pass
            ota_client.pull_update(pending_ota_url)
            pending_ota_url = None # Reset flag (though update usually reboots)

        # 5. Telemetry Logic
        gc.collect() # Clean up memory regularly
        current_time = time.time()
        if current_time - last_telemetry_time >= telemetry_interval:
            
            if not is_authorized:
                # Har 10 sec mein handshake retry (agar auth tx nahi mila)
                if current_time - last_handshake_time >= handshake_retry_interval:
                    print("⏳ Handshake pending... retrying.")
                    auth_payload = ujson.dumps({"clientId": CLIENT_ID, "apiKey": API_KEY})
                    mqtt_client.publish(AUTH_TOPIC, auth_payload)
                    last_handshake_time = current_time
                # Removed time.sleep(1) to allow check_msg() to run faster
                continue

            # Read Sensor
            try:
                sensor.measure()
                temp = sensor.temperature()
                hum = sensor.humidity()
                
                payload = ujson.dumps({
                    "clientId": CLIENT_ID,
                    "temperature": temp,
                    "humidity": hum,
                    "timestamp": current_time
                })
                
                mqtt_client.publish(DATA_TOPIC, payload)
                print("📊 Telemetry Sent:", payload)
            
                last_telemetry_time = current_time
            except Exception as se:
                print("⚠️ Sensor Read Error:", se)

    except OSError as e:
        # Error 110 = ETIMEDOUT, 104 = ECONNRESET
        print("🌐 Network Error (OSError):", e)
        mqtt_client = None 
        time.sleep(5)
    except Exception as e:
        print("💥 Unexpected Loop Error:", e)
        mqtt_client = None 
        time.sleep(2)