---
name: Resend email delivery restriction
description: Resend test-mode accounts can only send to the connecting account's own email until a domain is verified.
---

## Resend requires domain verification to send to arbitrary recipients

A Resend connection in test mode (no verified sending domain) rejects any `to` address other than the email of the account that authorized the connector, returning `403 validation_error`: "You can only send testing emails to your own email address ... To send emails to other recipients, please verify a domain at resend.com/domains".

**Why:** Resend's anti-abuse safeguard for unverified accounts — this is not a bug in our integration code, and cannot be fixed from the app side.
**How to apply:** When wiring a new outbound-email feature (contact forms, notifications, receipts) via the Resend connector, expect delivery to the real target address to fail with this 403 until the user verifies a domain at resend.com/domains and the `from` address is switched to use it. Build the feature and surface this as a known limitation rather than treating a 403 here as an integration bug.
