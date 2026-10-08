# DisruptionDesk — Logistics Control Room
> **Disruption-Aware Logistics Planning & Rapid Operational Recovery**  
> Built for 24-Hour Hackathon • Control Desk UI for Logistics Managers

---

## 1. Quick Start — How to Run

The app is **already running in the background** on:
👉 **[http://localhost:5173/](http://localhost:5173/)**

If you want to start it yourself in a new terminal window:

```bash
# 1. Open the project folder
cd "c:\Users\P.SAHANA\Downloads\New folder"

# 2. Install dependencies (already installed)
npm install

# 3. Start the local development server
npm run dev
```

Then open your browser and navigate to **`http://localhost:5173/`**.

---

## 2. Problem Statement
When real-world disruptions strike (vehicle breakdowns, sudden road closures, monsoon downpours, customer schedule reschedules), logistics operators struggle under time pressure to answer three critical questions on a single screen:
1. **WHAT CHANGED?** (Which asset or corridor failed?)
2. **WHAT IS AFFECTED?** (Which stops are directly hit, and which cascade across vehicles due to consignment dependencies?)
3. **WHAT SHOULD I DO NEXT?** (What are the ranked, actionable recovery plans with cost and delay tradeoffs?)

---

## 3. Solution Overview: The 3-Question Framework
**DisruptionDesk** provides a real-time, single-screen control desk designed for laptop screens (1366x768+) and tablets.

- **Header & Simulated Clock**: Starts at `09:15` with `+15m` and `+30m` controls to advance simulated time, update deliveries, and mark completed stops.
- **Top Status Banner**: Real-time 3-part triage sequence updating live on disruptions:
  `WHAT CHANGED -> WHAT IS AFFECTED -> WHAT NEXT`
- **Left Column — Live Plan**:
  - Interactive Leaflet map with Coimbatore coordinates, depot marker, numbered delivery stop markers, and colored routes.
  - Live van positions with truck icons.
  - Fleet capacity utilization cards.
  - Interactive cross-van dependency chain (`D6 -> D7 -> D12`).
  - Searchable and filterable delivery manifest table.
- **Middle Column — What is Affected**:
  - Direct impact detection.
  - **Animated dependency cascade** revealing downstream compromised stops 300ms apart.
  - Priority scoring (`CRITICAL`, `AT RISK`, `LOW RISK`) based on customer urgency, time remaining, and dependent deliveries.
- **Right Column — What Should I Do Next**:
  - Generates 3 concrete, ranked recovery plans:
    1. **Reassign**: Load balances packages to healthy vans with spare capacity.
    2. **Resequence / Reroute**: Detours via alternate routes or reprioritizes tightest windows first.
    3. **Delay / Renegotiate**: Grace periods with client notification lists.
  - "Hover to Preview" ghosted routes on the map.
  - One-click **Apply Plan** that updates routes to blue, recalculates ETAs, and reveals a **Before vs. After** impact audit card with an **Undo** button.
- **Bottom Activity Log**: Collapsible incident audit timeline tracking every event.

---

## 4. Demo Walkthrough (Step-by-Step)

### Scenario 1: Van 2 Breakdown (Primary Demo)
1. Open [http://localhost:5173/](http://localhost:5173/). Notice all vans are green and the banner states *"All deliveries on track"*.
2. Click **"Report Disruption"** in the header.
3. Select preset **"1. Van 2 Breakdown"** (Van 2 halted at 09:30, out for the day).
4. **Observe the Banner**: Updates immediately to:
   `WHAT CHANGED: Van 2 broke down at 09:30 -> WHAT IS AFFECTED: 6 deliveries (2 critical) -> WHAT NEXT: 3 options ready`.
5. **Observe the Map & Impact Panel**:
   - Van 2's route turns red.
   - Deliveries `D4`, `D5`, `D6` flagged as directly affected.
   - `D7` and `D12` cascade sequentially (animated) because `D7` needs consignment `D6` and `D12` needs `D7`.
   - **City Hospital (D4)** appears as **CRITICAL** at the top with reason: *"Critical recipient, due in 45 min"*.
6. **Observe the Options Panel**:
   - Evaluates 3 ranked recovery options.
   - The top option is marked **RECOMMENDED** (reassigns `D4` & `D5` to Van 3 which has spare capacity).
7. Hover over the recommended option to see the cyan ghosted detour route on the map.
8. Click **"Apply Plan"**:
   - Routes update immediately in cyan/blue.
   - Before vs. After comparison card displays: *5 deliveries saved, 100% Medical SLAs met, +25m delay, +₹220 extra cost*.
   - Click **"Copy Summary"** in the header to copy the incident briefing text.
9. Click **"Undo Plan"** to verify rollback to the prior plan.

### Scenario 2: Avinashi Road Closure
1. Click **"Report Disruption"** -> Select **"2. Avinashi Rd Closed"**.
2. Road segment `R1` (Peelamedu ↔ Saravanampatti) is shown dashed red on the map.
3. Recovery plan recommends detouring via *Sathy Road (+12 min)*.
4. Apply the plan to see route updated.

### Scenario 3: Heavy Rain in North Coimbatore
1. Click **"Report Disruption"** -> Select **"3. Heavy Rain North"**.
2. Applies a 1.4x travel multiplier to legs in Saravanampatti, Thudiyalur, and Peelamedu.
3. Tight delivery windows turn amber/at-risk. Resequencing options are provided.

---

## 5. Algorithmic Logic Breakdown

- **Travel Time & ETA (`/src/logic/time.js`)**:
  - Haversine distance formula between lat/lng points.
  - Speed baseline: 30 km/h with 8 min dwell/service time per stop.
  - Accounts for weather multiplier (1.4x) and road closure detours.
- **Dependency Cascade (`/src/logic/dependencies.js`)**:
  - Directed acyclic graph traversal (`buildDependencyGraph`).
  - Downstream BFS traversal identifying parent-child consignment blockers.
- **Priority Scoring (`/src/logic/priority.js`)**:
  $$\text{Score} = \text{UrgencyScore} + \text{CustomerScore} + \text{DependentsScore}$$
  - Window end $<30\text{m} \to 40$, $<90\text{m} \to 25$, else $10$
  - Customer tier: Critical ($40$), High ($25$), Medium ($15$), Low ($5$)
  - Downstream dependents: $+10$ per blocked child delivery
  - Thresholds: $\ge 70$ CRITICAL, $40\text{--}69$ AT RISK, $<40$ LOW RISK
- **Recovery Options Generator (`/src/logic/options.js`)**:
  - Evaluates fleet spare capacities, driver shifts, and geographical proximity.
  - Generates Reassign, Reroute/Resequence, and Delay/Renegotiate plans.
  - Ranks by: Deliveries Saved (Desc) $\to$ Total Delay (Asc) $\to$ Marginal Cost (Asc).

---

## 6. Future Scope
- Live GPS telemetry & telematics ingestion.
- Real-time TomTom / Google Traffic API integrations.
- Machine-learning predictive dwell time by delivery recipient profile.
- Automated WhatsApp/SMS dispatch webhooks for customer notification.
