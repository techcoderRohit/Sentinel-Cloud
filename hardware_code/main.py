import dht
import machine
import time
import network
from umqtt.simple import MQTTClient
import ujson

# --- CONFIGURATION ---
WIFI_SSID = "vivo Y300 5G"
WIFI_PASSWORD = "rohit564"
MQTT_BROKER = "172.18.85.133"  
CLIENT_ID = "ESP32_Sensor_Node"
API_KEY = "sk-sentinel-a4b215b87885b14e6ca9ba56aaddbb7c"

# Dashboard logic topics (Inhe dhyan se check karein)
COMMAND_TOPIC = "sentinel/device/{}/repl/rx".format(CLIENT_ID)
RESPONSE_TOPIC = "sentinel/device/{}/repl/tx".format(CLIENT_ID)
DATA_TOPIC = "sensors/data"

# Application-level Auth topics
AUTH_TOPIC = "sentinel/auth"
AUTH_RX_TOPIC = "sentinel/device/{}/auth_tx".format(CLIENT_ID)

is_authorized = False

# Hardware Setup
led = machine.Pin(2, machine.Pin.OUT) # Internal LED
sensor = dht.DHT11(machine.Pin(5))

# --- CALLBACK FUNCTION (Dashboard commands yahan receive honge) ---
def sub_cb(topic, msg):
    global is_authorized
    
    # Topic ko decode karke check karna professional practice hai
    decoded_topic = topic.decode()
    print("📩 Received on {}: {}".format(decoded_topic, msg))
    
    try:
        data = ujson.loads(msg)
        
        # Check if it is an auth response
        if decoded_topic == AUTH_RX_TOPIC:
            if data.get("status") == "authorized":
                is_authorized = True
                print("✅ Handshake Authorized! We can send telemetry now.")
            else:
                is_authorized = False
                print("❌ Handshake Denied! Check your API Key.")
            return

        # Regular Repl Command Processing
        command = data.get("command", "").lower().strip()
        
        # Dashboard ko acknowledgment bhejna ki humne command sun li hai
        response = ""
        color = "#94a3b8" # Default Gray

        if command == "led_on":
            led.value(0)
            response = "Success: LED is now ON"
            color = "#4ade80" # Green
        elif command == "led_off":
            led.value(1)
            response = "Success: LED is now OFF"
            color = "#f87171" # Red
        elif command == "status":
            response = "System: Operational | Temp/Hum active"
            color = "#22d3ee" # Cyan
        elif command == "help":
            response = "Commands: led_on, led_off, status, help"
        else:
            response = "Error: Unknown command '{}'".format(command)
            color = "#ffbd2e" # Yellow

        # Dashboard REPL history mein result dikhane ke liye publish karein
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
        client.connect()
        # Topic subscribe karna sabse zaroori hai Dashboard se baat karne ke liye
        client.subscribe(COMMAND_TOPIC)
        client.subscribe(AUTH_RX_TOPIC)
        print('🚀 Connected to Sentinel Broker & Subscribed to REPL')
        
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
telemetry_interval = 5 # 5 seconds gap for sensor data

while True:
    try:
        # 1. Humesha incoming messages check karein (REPL connectivity ke liye)
        if mqtt_client:
            mqtt_client.check_msg()
        else:
            mqtt_client = connect_mqtt()
            time.sleep(2)
            continue

        # 2. Sensor Telemetry (Non-blocking delay use kar rahe hain)
        current_time = time.time()
        if current_time - last_telemetry_time >= telemetry_interval:
            
            # Auth Check before pushing
            if not is_authorized:
                print("⏳ Waiting for backend authorization... skipping telemetry.")
                time.sleep(1)
                continue

            sensor.measure()
            temp = sensor.temperature()
            hum = sensor.humidity()
            
            # Lightweight Payload - No API Key Needed!
            payload = ujson.dumps({
                "clientId": CLIENT_ID,
                "temperature": temp,
                "humidity": hum,
                "timestamp": current_time
            })
            
            mqtt_client.publish(DATA_TOPIC, payload)
            print("📊 Telemetry Sent:", payload)
            last_telemetry_time = current_time

    except Exception as e:
        print("💥 Loop Error:", e)
        mqtt_client = None 
        time.sleep(2)