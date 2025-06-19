
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

The system is composed of four primary layers:

1.  **Aegis Command Center (Frontend):** The central hub for the human operator.
2.  **Janus (The Orchestrator Agent - Backend):** The "CEO" of the swarm, responsible for coordinating the worker agents.
3.  **The Worker Agents (Specialized Functions):** A team of specialized agents that perform the core business functions.
4.  **Aegis Database (Data Store):** The centralized database that serves as the single source of truth for all business data.

### 1. Aegis Command Center

*   **Technology:** Next.js
*   **Core Library:** Vercel AI SDK
*   **Function:** The primary interface for the human operator. The core of the Command Center is a **conversational interface** where the operator issues commands in natural language to the Orchestrator Agent. Dashboards for Products, Marketing, Finance, etc., will serve as real-time, read-only "Supporting Views" to provide visual context.

### 2. Janus (The Orchestrator Agent)

*   **Technology:** Python, FastAPI
*   **Core Library:** LangGraph
*   **Function:** Serves as the backend for the Command Center. Its primary role is to understand the human operator's natural language commands, translate them into actionable tasks, and delegate those tasks to the appropriate worker agents. It manages the overall state of the business and reports back to the operator through the conversational interface.

### 3. Aegis Database

*   **Technology:** To be determined (will start as a simple JSON file and can be upgraded to SQLite or a cloud database as needed).
*   **Function:** The single source of truth for all business data, including products, orders, customers, and financial records. This decouples the agents and provides a holistic view of the entire operation. It is designed for multi-tenancy to support multiple stores or a future SaaS model.

## The Agentic Swarm: Roles & Implementation

The following is the planned organizational chart for the swarm.

| Agent | Role | Core Responsibility | Status |
| :--- | :--- | :--- | :--- |
| **Janus** | The Orchestrator | To manage the overall business strategy and coordinate the worker agents. | **Partially Implemented** |
| **Fornax** | The Operator | To manage product listings on the e-commerce platform. | **Scaffolding Complete** |
| **Caelus** | The Marketer | To create marketing materials and manage advertising campaigns. | **Partially Implemented** |
| **Corvus** | The Concierge | To process customer orders and handle basic customer communication. | **Scaffolding Complete** |
| **Argent** | The Accountant | To track all revenue and costs to determine profitability. | **Planned** |
| **Akasha** | The Librarian | To manage the long-term memory and knowledge of the swarm. | **Planned** |

## Initial Strategic Decisions (First Store)

*   **E-commerce Platform:** Shopify
*   **Primary Supplier:** CJ Dropshipping
*   **Initial Target Niche:** The Pet Niche
*   **Ad Creative Technology:** Stable Diffusion (via API) for its fine-tuning capabilities.

## Getting Started

### Prerequisites

*   Node.js (v18.x or later)
*   PNPM (v8.x or later)

### 1. Clone the Repository

```bash
git clone https://github.com/Marvey1203/Project-Aegis.git
cd Project-Aegis
```
