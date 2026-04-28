# boot.py -- run on boot-up
import network
import webrepl
import gc
import time

def do_connect():
    ssid = 'vivo Y300 5G'
    password = 'rohit564'
    
    sta_if = network.WLAN(network.STA_IF)
    if not sta_if.isconnected():
        print('Connecting to network...')
        sta_if.active(True)
        sta_if.connect(ssid, password)
        while not sta_if.isconnected():
            time.sleep(0.1)
    print('Network config:', sta_if.ifconfig())

# Connect to WiFi
try:
    do_connect()
    time.sleep(2)  # Give the network a moment
except Exception as e:
    print("WiFi error:", e)

# Start WebREPL
try:
    print("Starting WebREPL...")
    webrepl.start()
    print("WebREPL started!")
except Exception as e:
    print("WebREPL failed:", e)

# Garbage collection
gc.collect()
