import subprocess
import time
import requests
from datetime import datetime

# --- SOZLAMALAR ---
TOKEN = "8237760389:AAFEMm5nBDzU5YPQnvR5OpCyBXpe5Ya-__o"  # BotFather'dan olingan
CHAT_ID = "7325327724"  # userinfobot'dan olingan
# Siz qiziqqan "o'lja" domenlar ro'yxati
TARGETS = ["4w.uz", "70.uz", "k3.uz", "v2.uz"] 
# Tekshirish oralig'i (soniyada). 600 = 10 daqiqa.
CHECK_INTERVAL = 600 

def send_telegram(message):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    try:
        requests.post(url, json={"chat_id": CHAT_ID, "text": message, "parse_mode": "Markdown"})
    except Exception as e:
        print(f"Telegram error: {e}")

def get_whois_data(domain):
    try:
        res = subprocess.run(['whois', domain], capture_output=True, text=True, timeout=10)
        stdout = res.stdout.lower()
        
        if "not found" in stdout:
            return "FREE"
        if "pending delete" in stdout:
            return "PENDING DELETE"
        if "redemption period" in stdout:
            return "REDEMPTION"
        if "expired" in stdout:
            return "EXPIRED"
        return "ACTIVE"
    except:
        return "ERROR"

def main():
    print("🚀 Sniper Bot ishga tushdi...")
    send_telegram("✅ *Sniper Bot ishga tushdi!*\nMonitoring ostidagi domenlar: " + ", ".join(TARGETS))
    
    last_statuses = {}

    while True:
        for domain in TARGETS:
            current_status = get_whois_data(domain)
            
            # Agar status avvalgisidan farq qilsa (yoki birinchi marta tekshirilayotgan bo'lsa)
            if domain not in last_statuses or current_status != last_statuses[domain]:
                
                emoji = "ℹ️"
                if current_status == "FREE": emoji = "🔥"
                if current_status == "PENDING DELETE": emoji = "⚠️"
                
                msg = (f"{emoji} *Status O'zgardi!*\n"
                       f"🌐 *Domen:* {domain}\n"
                       f"📊 *Yangi holat:* `{current_status}`\n"
                       f"⏰ *Vaqt:* {datetime.now().strftime('%H:%M:%S')}")
                
                send_telegram(msg)
                last_statuses[domain] = current_status
                
            time.sleep(5) # Har bir domen orasida qisqa tanaffus

        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()
