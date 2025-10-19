# Debug Version - CrawlGuard Plugin

**Date**: October 18, 2025  
**Version**: 2.0.0-debug  
**Status**: ✅ READY FOR TESTING

## 🔍 What Changed

This version includes **comprehensive debugging** to help diagnose why Firecrawl detection isn't working.

## 📝 Debug Logging Added

### **1. Request Processing Logs**

Every request now logs:

```
=== CrawlGuard Plugin Active ===
CrawlGuard: Processing request at [timestamp]
CrawlGuard: IP Address = [IP]
CrawlGuard: User-Agent = [UA]
CrawlGuard: Request URI = [URI]
CrawlGuard: Monetization Enabled = [YES/NO]
CrawlGuard: Allowed Bots = [list]
```

### **2. Bot Detection Logs**

```
CrawlGuard: Starting bot detection...
CrawlGuard: detect_bot() - Checking [N] known bots
CrawlGuard: MATCHED known bot signature: [name] (if found)
CrawlGuard: Checking [N] suspicious patterns
CrawlGuard: MATCHED suspicious pattern: [pattern] (if found)
```

### **3. Heuristic Analysis Logs**

```
CrawlGuard: Running heuristic analysis...
CrawlGuard: Missing Accept-Language header (+20 points)
CrawlGuard: Missing Accept-Encoding header (+15 points)
CrawlGuard: No Referer on deep page (+25 points)
CrawlGuard: No cookies present (+20 points)
CrawlGuard: Datacenter IP detected (+30 points)
CrawlGuard: Total suspicious score = [N] (threshold: 40)
CrawlGuard: Score breakdown: [details]
```

### **4. Detection Results**

```
CrawlGuard: Bot Detected = [YES/NO]
CrawlGuard: Bot Type = [type]
CrawlGuard: Bot Name = [name]
CrawlGuard: Confidence = [N]%
CrawlGuard: Is AI Bot = [YES/NO]
```

### **5. Blocking Decision Logs**

```
CrawlGuard: handle_bot_request() called
CrawlGuard: Monetization enabled = [YES/NO]
CrawlGuard: MONETIZATION DISABLED - Not blocking, just logging
(or)
CrawlGuard: Checking allowed bots list...
CrawlGuard: Bot is in ALLOWED list - not blocking
(or)
CrawlGuard: Bot NOT in allowed list - proceeding to monetization...
CrawlGuard: BLOCKING REQUEST with HTTP 402
```

### **6. Processing Complete**

```
=== CrawlGuard Processing Complete ===
```

## 📊 What These Logs Will Tell You

### **If Plugin Not Running:**
```
(no logs at all)
```
**Diagnosis:** Plugin not activated or hooks not firing

### **If Monetization Disabled:**
```
=== CrawlGuard Plugin Active ===
CrawlGuard: Monetization Enabled = NO
CrawlGuard: MONETIZATION DISABLED - Not blocking, just logging
=== CrawlGuard Processing Complete ===
```
**Diagnosis:** Plugin working but monetization is off

### **If Detection Working:**
```
=== CrawlGuard Plugin Active ===
CrawlGuard: Bot Detected = YES
CrawlGuard: Bot Type = firecrawl
CrawlGuard: Confidence = 95%
CrawlGuard: Monetization enabled = YES
CrawlGuard: BLOCKING REQUEST with HTTP 402
```
**Diagnosis:** Everything working correctly!

### **If Heuristic Detection:**
```
CrawlGuard: No known bot signature matched
CrawlGuard: Running heuristic analysis...
CrawlGuard: Total suspicious score = 85 (threshold: 40)
CrawlGuard: DETECTED by heuristics! Score 85 >= 40
CrawlGuard: Bot Detected = YES
```
**Diagnosis:** Detection via scoring system

### **If Bot in Allowed List:**
```
CrawlGuard: Bot Detected = YES
CrawlGuard: Bot type = googlebot
CrawlGuard: Bot is in ALLOWED list - not blocking
```
**Diagnosis:** Bot detected but whitelisted

## 🧪 How to Check Logs

### **Option 1: WordPress Debug Log**

If WordPress debugging is enabled (`WP_DEBUG_LOG = true` in `wp-config.php`):

```bash
tail -f wp-content/debug.log
```

### **Option 2: Server Error Logs**

Check PHP error logs:

```bash
# Apache
tail -f /var/log/apache2/error.log

# Nginx
tail -f /var/log/nginx/error.log

# Hostinger
Check Hostinger control panel → Error Logs
```

### **Option 3: Enable WordPress Debug Mode**

Edit `wp-config.php`:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Then logs will be in `wp-content/debug.log`

## 🎯 Testing Workflow

### **Step 1: Download Updated Plugin**

1. Go to your dashboard: `http://localhost:3000`
2. Download the plugin (cache cleared, includes debug code)
3. Save as `crawlguard-wp-debug.zip`

### **Step 2: Install on WordPress**

1. Go to: `https://white-zebra-414272.hostingersite.com/wp-admin`
2. Plugins → Add New → Upload Plugin
3. Choose the debug ZIP
4. Click "Replace current with uploaded"
5. Activate the plugin

### **Step 3: Enable Monetization**

1. Go to: CrawlGuard → Settings
2. Check: ✅ **Monetization Enabled**
3. Enable: ✅ **Rate Limiting** (under Feature Flags)
4. Save settings

### **Step 4: Check Logs are Working**

Visit any page on your WordPress site, then check logs:

```bash
tail -f wp-content/debug.log
```

You should see:
```
=== CrawlGuard Plugin Active ===
...
=== CrawlGuard Processing Complete ===
```

If you see these → Plugin is running!

### **Step 5: Run Firecrawl Test**

1. Go to: `http://localhost:3000/test-firecrawl`
2. Enter: `https://white-zebra-414272.hostingersite.com`
3. Click "Run Test"
4. **Immediately check WordPress logs**

### **Step 6: Analyze Logs**

Look for:
- Did plugin run? (see `=== CrawlGuard Plugin Active ===`)
- Was bot detected? (see `Bot Detected = YES`)
- What was the score? (see `Total suspicious score = ...`)
- Was it blocked? (see `BLOCKING REQUEST` or `MONETIZATION DISABLED`)

## 🔍 Common Log Patterns

### **Pattern 1: Plugin Not Running**
```
(empty logs, no CrawlGuard entries)
```
**Fix:** Check if plugin is activated

### **Pattern 2: Monetization Off**
```
=== CrawlGuard Plugin Active ===
CrawlGuard: Monetization Enabled = NO
CrawlGuard: MONETIZATION DISABLED
```
**Fix:** Enable monetization in settings

### **Pattern 3: Detection Failed**
```
CrawlGuard: Bot Detected = NO
CrawlGuard: Score below threshold, not flagged as bot
```
**Fix:** Firecrawl bypassed detection (advanced stealth mode)

### **Pattern 4: Success!**
```
CrawlGuard: Bot Detected = YES
CrawlGuard: BLOCKING REQUEST with HTTP 402
```
**Result:** Working correctly!

## 📦 Files Modified

```
crawlguard-wp-main/includes/class-bot-detector.php
├── process_request() - Added 15 debug log statements
├── detect_bot() - Added 5 debug log statements  
├── apply_heuristics() - Added 10+ debug log statements
├── handle_bot_request() - Added 6 debug log statements
└── block_request() - Added 2 debug log statements

Total: ~40 debug log statements added
```

## ⚠️ Important Notes

1. **Performance Impact**: Debug logging adds ~5-10ms per request
2. **Log Size**: Logs can grow large on high-traffic sites
3. **Production**: Remove debug code before production deployment
4. **Privacy**: Logs contain IP addresses and User-Agents

## 🚀 Next Steps

1. **Download updated plugin** from dashboard
2. **Install on WordPress** site
3. **Enable monetization** in settings
4. **Run Firecrawl test** from test bench
5. **Check logs** to see what happened
6. **Share logs** with me so we can diagnose

## 📝 Log Format

All logs prefixed with `CrawlGuard:` for easy filtering:

```bash
# View only CrawlGuard logs
grep "CrawlGuard:" wp-content/debug.log

# Real-time monitoring
tail -f wp-content/debug.log | grep "CrawlGuard:"

# Count detections
grep "Bot Detected = YES" wp-content/debug.log | wc -l
```

## ✅ Expected Output (Successful Detection)

```
=== CrawlGuard Plugin Active ===
CrawlGuard: Processing request at 2025-10-18 19:00:00
CrawlGuard: IP Address = 35.123.45.67
CrawlGuard: User-Agent = Mozilla/5.0...
CrawlGuard: Monetization Enabled = YES
CrawlGuard: Starting bot detection...
CrawlGuard: Running heuristic analysis...
CrawlGuard: Datacenter IP detected (+30 points)
CrawlGuard: No cookies present (+20 points)
CrawlGuard: Missing Accept-Language header (+20 points)
CrawlGuard: Total suspicious score = 85 (threshold: 40)
CrawlGuard: DETECTED by heuristics! Score 85 >= 40
CrawlGuard: Bot Detected = YES
CrawlGuard: Confidence = 85%
CrawlGuard: handle_bot_request() called
CrawlGuard: Monetization enabled = YES
CrawlGuard: Bot NOT in allowed list - proceeding to monetization...
CrawlGuard: BLOCKING REQUEST with HTTP 402
=== CrawlGuard Processing Complete ===
```

---

**Ready to test!** Download the plugin and watch the logs! 📊
