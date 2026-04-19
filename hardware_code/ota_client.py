import urequests
import os
import machine

class OTAClient:
    def __init__(self, download_url):
        self.url = download_url

    def update(self):
        print("🚀 Starting OTA Update from:", self.url)
        try:
            # 1. Download to temp file (Safe approach)
            response = urequests.get(self.url)
            if response.status_code != 200:
                print("❌ Download failed. HTTP:", response.status_code)
                return False

            print("💾 Writing new firmware...")
            with open('main.py.new', 'w') as f:
                f.write(response.text)
            
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

def pull_update(url):
    client = OTAClient(url)
    return client.update()
