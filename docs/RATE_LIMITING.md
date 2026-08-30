# 🛡️ Rate Limiting & Anti-Abuse Configuration Guide

This guide details the rate-limiting strategies implemented in YuvaHub to protect the platform from abuse, brute-force attacks, and traffic spikes.

## 🚦 Threshold Definitions

| Zone | Time Window | Max Requests | Purpose |
| :--- | :--- | :--- | :--- |
| **Standard API** | 15 minutes | `100` | Limits general API traffic (GET requests, etc.) to prevent server overload. |
| **AI Chat Routes** | 15 minutes | `10` | Stricter limits to prevent Gemini API cost overruns and abuse. |
| **Authentication** | 15 minutes | `5` | Aggressive limits on login/signup endpoints to prevent brute-force attacks. |

## 🏗️ Redis Fail-Open Logic

YuvaHub utilizes Redis for distributed rate limiting. We have implemented a **"Fail-Open"** architectural design. 
- **What this means:** If the Redis cache disconnects, crashes, or becomes unreachable, the rate limiter middleware will gracefully bypass the limits rather than blocking all incoming traffic. 
- **Why:** This ensures the application remains online and accessible to users during cache outages, prioritizing availability over strict abuse prevention during infrastructure failures.

## 🛠️ Adjusting Limits (Environment Variables)

During an attack or traffic spike, rate limits can be overridden instantly via environment variables without requiring a code deployment. Set the following variables in your `.env` or deployment platform:

```env
RATE_LIMIT_STANDARD_MAX=100
RATE_LIMIT_AI_MAX=10
RATE_LIMIT_AUTH_MAX=5

```

## 📡 Client Experience & HTTP Status

When a client exceeds the defined threshold, the server rejects the request and responds with:

* **HTTP Status Code:** `429 Too Many Requests`
* **Error Message:** `{"error": "Too many requests from this IP, please try again later."}`
* **Headers:** Includes `Retry-After`, `RateLimit-Limit`, and `RateLimit-Remaining` headers so the client knows when to retry.

## 🔓 IP Whitelisting

To whitelist specific IPs (e.g., internal scrapers or trusted services) from rate limits, add their IP addresses to the `WHITELISTED_IPS` environment variable as a comma-separated list.

```env
WHITELISTED_IPS=127.0.0.1,192.168.1.50

```

The middleware automatically bypasses the rate-limit check if the incoming `req.ip` matches any address in this list.

```

