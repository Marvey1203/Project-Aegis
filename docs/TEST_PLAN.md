# Project Aegis: V1 End-to-End Test Plan

This document outlines the steps to perform a full end-to-end test of the Project Aegis system in a sandbox environment.

**Objective:** To verify that the entire agent swarm can successfully execute the core e-commerce workflow, from product scouting to a simulated sale and fulfillment, with all safety checks and data logging functioning correctly.

**Prerequisites:**
1. All dependencies for both `@aegis/aegis-core` and `@aegis/aegis-dashboard` are installed (`pnpm install`).
2. A `.env` file is correctly configured at the project root with valid credentials for Shopify, CJ Dropshipping, and any other required services.
3. The `@aegis/aegis-core` server is running (`pnpm --filter @aegis/aegis-core start`).
4. The `@aegis/aegis-dashboard` development server is running (`pnpm --filter @aegis/aegis-dashboard dev`).
5. The `product_shortlist.json` file is empty or deleted.

---
