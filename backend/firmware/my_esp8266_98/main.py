import machine
import time

# Most NodeMCUs have the internal LED on GPIO 2
# Note: Pin(2) corresponds to D4 on the board
led = machine.Pin(2, machine.Pin.OUT)

while True:
    led.value(0)   # 0 is LOW (LED ON for active-low boards)
    time.sleep(1)  # Wait 1 second
    led.value(1)   # 1 is HIGH (LED OFF)
    time.sleep(1)  # Wait 1 second