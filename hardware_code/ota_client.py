import urequests
import os
import machine
import gc

class OTAClient:
    def __init__(self, download_url):
        self.url = download_url

    def update(self):
        print("🚀 Starting OTA Update from:", self.url)
        gc.collect()
        print("📊 Free memory before update:", gc.mem_free())
        
        try:
            # 1. Download to temp file using streaming to save RAM
            response = urequests.get(self.url, stream=True)
            if response.status_code != 200:
                print("❌ Download failed. HTTP:", response.status_code)
                response.close()
                return False

            print("💾 Writing new firmware in chunks...")
            with open('main.py.new', 'wb') as f:
                while True:
                    chunk = response.raw.read(512) # Read in 512 byte blocks
                    if not chunk:
                        break
                    f.write(chunk)
                    gc.collect() # Clean up after each chunk
            
            response.close()

            # 2. Swap files
            print("🔄 Applying changes...")
            # Delete old backup if exists
            try:
                os.remove('main.py.bak')
            except:
                pass
            
            # Backup current
            try:
                os.rename('main.py', 'main.py.bak')
            except:
                pass
            
            # Install new
            os.rename('main.py.new', 'main.py')

            print("✅ Update successful! Rebooting...")
            machine.reset()
            return True

        except Exception as e:
            print("❌ OTA Error:", e)
            return False
        finally:
            gc.collect()

def pull_update(url):
    client = OTAClient(url)
    return client.update()
