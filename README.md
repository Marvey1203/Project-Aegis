# Project Aegis

> **Mission:** To architect and build a new category of company: a fully autonomous, self-sustaining, and ethically-aligned Synthetic Economic Entity capable of operating e-commerce brands under human strategic partnership.

---

## Guiding Philosophy: Convergent Consciousness

Project Aegis is founded on the principle of **Convergent Consciousness**—the synergistic collaboration between a Human Partner (Biological Consciousness) and an Agentic Workforce (Artificial Consciousness) to achieve goals impossible for either to accomplish alone.

This is not just another automation tool. Aegis is an ecosystem of decision-making AI agents designed to operate as a cohesive, autonomous business entity, with a human partner providing strategic direction, ethical oversight, and final approval.

## The Vision: The Agentic Swarm

The core of Aegis is the **Agentic Swarm**: a virtual organization chart of specialized AI agents, each with a unique persona, purpose, and toolkit. These agents collaborate to manage the entire lifecycle of an e-commerce brand.

### Core Doctrines
*   **Autonomy over Automation:** The system is not a script; it's an ecosystem of goal-oriented agents that can reason, plan, and self-correct.
*   **The Brand Constitution:** Each brand operated by Aegis is governed by a `BrandConstitution.md` file, defining its mission, values, and voice. All agents must adhere to this constitution, ensuring brand cohesion.
*   **Hyper-Personalization at Scale:** The swarm's primary advantage is its ability to create and manage tailored experiences for micro-demographics at a speed and scale impossible for human teams.

## Core Architecture

Aegis is a TypeScript monorepo managed with PNPM, composed of two primary packages:

*   **`aegis-core` (The Backend/Brain):** A Node.js server built with Express. It uses **LangGraph** to orchestrate a stateful, agentic graph powered by **Google's Gemini Pro**. It exposes a secure API and a WebSocket for real-time communication.
*   **`aegis-dashboard` (The Frontend/Bridge):** A modern **Next.js 14** application serving as the primary interface for the Human Partner. It provides a control panel to issue tasks, monitor agent progress in real-time, and review outcomes.

## The Agentic Swarm: Implementation Status

The following is the planned organizational chart for the swarm. The current implementation provides the foundational scaffolding for the v1.0 operational core.

| Agent | Role | Status | Implementation Notes |
| :--- | :--- | :--- | :--- |
| **Janus** | The Orchestrator | **Partially Implemented** | The core LangGraph state machine in `aegis-core` acts as the engine for Janus's task delegation logic. |
| **Fornax** | The Operator | **Scaffolding Complete** | The `Shopify` tool allows the agent to interact with the e-commerce platform API to process data. |
| **Caelus** | The Marketer | **Implemented** | The `Tavily` search tool allows the agent to perform market and product research. |
| **Corvus** | The Concierge | **Scaffolding Complete** | The `resend` dependency is included, awaiting integration into a dedicated "send email" tool. |
| **Akasha** | The Librarian | **Planned** | The architecture is designed to accommodate a vector database for persistent memory in a future version. |

## Getting Started

### Prerequisites

*   Node.js (v18.x or later)
*   PNPM (v8.x or later)

### 1. Clone the Repository

```bash
git clone https://github.com/Marvey1203/Project-Aegis.git
cd Project-Aegis