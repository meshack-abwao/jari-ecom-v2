# JARI.ECO - IDEA SHELF
## Features to build later (validated but not prioritized)

---

## 🍽️ VISUAL MENU / FOOD ORDERS

### 1. WhatsApp Order Notifications (Add-on)
**Status:** Infrastructure ready, implementation pending
**Value:** Push notifications to customers at each status change
**Implementation:**
- Integrate with WhatsApp Business API
- Send automated messages: "Order confirmed", "Being prepared", "Ready!"
- Include order tracking link
- Could be a paid add-on (KES 500/month?)

### 2. Kitchen Display System (KDS) / Service Tab
**Status:** Idea validated with restaurant flow
**Value:** Separate view for kitchen staff vs front-of-house
**Features:**
- Split view: Dine-in vs Delivery/Pickup
- Table map visualization
- Chef-specific view (just items to cook)
- Waiter-specific view (orders to serve)
- Real-time sync between devices

### 3. Smart Prep Time Calculation
**Status:** Basic infrastructure in place
**Value:** Auto-estimate based on menu items
**Implementation:**
- Add `prep_time_minutes` field to products
- Calculate: `max(item prep times) + buffer`
- Learn from historical data over time

---

## 📅 BOOKINGS / SERVICES

### 4. SMS Reminders
**Status:** Idea
**Value:** Reduce no-shows
**Implementation:**
- Africa's Talking SMS API
- Send reminders: 24hr, 2hr, 30min before
- Could be a paid add-on

### 5. Google Calendar Sync
**Status:** Idea
**Value:** Service providers see bookings in their calendar
**Implementation:**
- OAuth with Google Calendar API
- Two-way sync

---

## 🛒 GENERAL PLATFORM

### 6. Multi-language Support
**Status:** Idea
**Value:** Swahili, other local languages
**Implementation:**
- i18n framework
- Translate UI strings

### 7. Analytics Dashboard
**Status:** Basic stats exist
**Value:** Deep insights for merchants
**Features:**
- Revenue trends
- Popular items
- Peak hours
- Customer retention

### 8. Inventory Management
**Status:** Idea
**Value:** Track stock levels
**Features:**
- Low stock alerts
- Auto-disable out-of-stock items
- Reorder suggestions

---

## 💰 MONETIZATION IDEAS

### 9. Premium Add-ons Pricing
- WhatsApp Notifications: KES 500/month
- SMS Reminders: KES 300/month
- Priority Support: KES 1,000/month
- Custom Domain: KES 2,000/month

---

## 🌐 CUSTOM DOMAINS & INFRASTRUCTURE

### 10. Cloudflare Migration for Custom Domains
**Status:** Researched, post-launch implementation
**Value:** Free custom domains for users, better performance in Africa
**Why Cloudflare over Netlify:**
- Free tier handles 100 custom domains (vs Netlify Pro $19/mo)
- Superior CDN performance, especially in Africa
- Better DDoS protection
- Cloudflare for SaaS feature designed for multi-tenant apps

**Cost Comparison:**
| Stores | Netlify Pro | Cloudflare Free |
|--------|-------------|-----------------|
| 100    | $19/mo      | $0              |
| 500    | $19/mo      | $40/mo          |
| 1000   | $19/mo      | $90/mo          |

**Migration Steps:**
1. Create Cloudflare account
2. Add jarisolutionsecom.store to Cloudflare
3. Update nameservers at Namecheap
4. Enable "Cloudflare for SaaS"
5. Configure SSL settings
6. Update API for domain registration

**Timeline:** February 2026 (post-launch)

### 11. Dashboard Domain Propagation Issue
**Status:** In progress (January 23, 2026)
**Issue:** dashboard.jarisolutionsecom.store showing SSL certificate warning
**Resolution:** Wait for DNS propagation + Netlify SSL auto-provision
**Expected:** 5-15 minutes, up to 24 hours worst case

---

*Last updated: January 23, 2026*
*Add ideas here as they come up during development*
