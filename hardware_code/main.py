import dht
import machine
import time
import network
from umqtt.simple import MQTTClient
import ujson
import ubinascii
import sys
import uio

# --- CONFIGURATION ---
WIFI_SSID = "hood hogan"
WIFI_PASSWORD = "1qa2ws3ed4rf"
MQTT_BROKER = "10.104.179.140"

# Unique Identification
# Generate ID based on MAC address to avoid collisions with other students
CLIENT_ID = "my_esp8266_mm"
print("🆔 Assigned Unique Client ID:", CLIENT_ID)

API_KEY = "sk-sentinel-6709d9a0b9fe278a48cd18a3e8e70568"

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

# Hardware Setup
led = machine.Pin(2, machine.Pin.OUT) # Internal LED
relay = machine.Pin(4, machine.Pin.OUT) # Relay on D2
sensor = dht.DHT11(machine.Pin(5))

# --- REPL EXECUTION ENGINE ---
# Maintain a persistent context for commands (variables stay in memory)
repl_globals = {
    'led': led,
    'relay': relay,
    'sensor': sensor,
    'time': time,
    'machine': machine,
    'network': network
}

def run_repl_command(cmd):
    """Executes code and captures its stdout."""
    output = uio.StringIO()
    original_stdout = sys.stdout
    sys.stdout = output
    
    try:
        # 1. Try eval() for single expressions (to capture return values)
        try:
            result = eval(cmd, repl_globals)
            if result is not None:
                print(result)
        except SyntaxError:
            # 2. If eval fails (e.g. assignment), try exec()
            exec(cmd, repl_globals)
        except Exception as e:
            # 3. Fallback for other errors that might be valid in exec
            exec(cmd, repl_globals)
    except Exception as e:
        print("Error:", e)
    finally:
        sys.stdout = original_stdout
        
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
                import ota_client
                ota_client.pull_update(update_url)
            return

        # Input Feed Control (New Command System)
        if decoded_topic == INPUT_TOPIC:
            print('input topic')
            field = data.get("field")
            value = data.get("value")
            
            print("🕹️ Dashboard Input: {} -> {}".format(field, value))
            
            if field == "status":
                if value is True or value == 1:
                    led.value(0) # ON
                else:
                    led.value(1) # OFF
            elif field == "relay":
                print('relay_feed')
                if value is True or value == 1:
                    relay.value(0) # ON (Relays are usually HIGH active)
                else:
                    relay.value(1) # OFF
            
            # You can add more logic here for other fields (e.g. brightness, threshold)
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
                led.value(0)
                response = "Success: LED is now ON"
                color = "#4ade80" # Green
            elif cmd_clean == "led_off":
                led.value(1)
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

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print('📶 Connecting to WiFi...')
        wlan.connect(WIFI_SSID, WIFI_PASSWORD)
        while not wlan.isconnected():
            time.sleep(0.5)
    print('✅ WiFi Connected:', wlan.ifconfig())

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
connect_wifi()
mqtt_client = connect_mqtt()

last_telemetry_time = 0
telemetry_interval = 5 
wlan = network.WLAN(network.STA_IF)

while True:
    try:
        # 1. WiFi Guard: Agar network gaya, toh pehle WiFi wapas lao
        if not wlan.isconnected():
            print("📡 WiFi Connection Lost! Reconnecting...")
            is_authorized = False # Reset auth state on drop
            connect_wifi()
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
        # check_msg() non-blocking hai, but flaky network pe throw kar sakta hai
        mqtt_client.check_msg()

        # 4. Telemetry Logic
        current_time = time.time()
        if current_time - last_telemetry_time >= telemetry_interval:
            
            if not is_authorized:
                print("⏳ Handshake pending... skipping telemetry.")
                # Har 10 sec mein handshake retry (agar auth tx nahi mila)
                if current_time % 10 == 0:
                    print('🔐 Retrying Handshake...')
                    auth_payload = ujson.dumps({"clientId": CLIENT_ID, "apiKey": API_KEY})
                    mqtt_client.publish(AUTH_TOPIC, auth_payload)
                time.sleep(1)
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