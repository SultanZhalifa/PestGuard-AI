# Proposal AI Open Innovation Challenge 2026

---

## TEAM IDENTITY

| | |
|---|---|
| **Team Name** | Andalusia |
| **Team Leader Name** | Sultan Zhalifunnas Musyaffa |
| **Participant Category** | University & Public |
| **WhatsApp No.** | *(isi nomor WA lo)* |
| **Email** | sultanzhalifunnasmusyaffa@gmail.com |
| **Institution** | President University |
| **Link Portfolio** | https://github.com/SultanZhalifa/smartwarehouse-ai |

### Members Name and Roles

| Name | Role |
|---|---|
| Sultan Zhalifunnas Musyaffa | Team Leader, Full-Stack Developer, AI/ML Engineer |
| *(isi nama anggota lain kalau ada)* | *(isi role)* |

---

## Executive Summary

SmartWarehouse AI is a real-time bio-hazard and pest detection platform built specifically for the warehouse operations of PT. Kawan Lama Group. The system uses a custom-trained YOLO11 computer vision model to automatically monitor warehouse zones through CCTV cameras, detecting the presence of hazardous animals such as snakes, cats, and reptiles 24 hours a day without human intervention.

The problem this solution addresses is the inadequacy of manual inspection in large-scale warehouses. When pests enter storage areas, they pose a direct risk to product safety, employee wellbeing, and regulatory compliance. SmartWarehouse AI eliminates response delays by sending real-time alerts via dashboard, audio alarm, and Telegram the moment a threat is detected. The platform also includes an AI-powered assistant, risk analytics, SOP protocols, and an ROI calculator, creating a complete operational intelligence layer for warehouse management.

*(Max 150 words -- trim if needed)*

---

## Problem Statement

**Selected Case Statement:** PT Kawan Lama Warehouse Bio Hazard & Pest Detection

**Selected Sub-Case Statement:** PT Kawan Lama Warehouse Bio Hazard & Pest Detection

### Main Objectives

The main objective of SmartWarehouse AI is to eliminate the detection gap caused by manual inspection in warehouse environments. Specific targets include:

1. Detect bio-hazard animals (snakes, cats, geckos, lizards) in real time with confidence scoring across all active warehouse zones.
2. Deliver alert notifications to security personnel within one second of detection via three channels: web dashboard, audio alarm, and Telegram.
3. Reduce dependency on manual patrol rounds by providing a fully automated 24/7 monitoring layer.
4. Provide management with data-driven insights through risk analytics, peak hours analysis, and zone-level threat heatmaps.
5. Give operations teams standardized SOP protocols per animal type and a calculator to quantify cost savings against traditional pest control.

The system is designed to be deployable across multiple warehouse locations with minimal hardware requirements, making it practical and scalable for PT. Kawan Lama Group's distribution network.

*(Max 200 words)*

---

## Problem Definition

### What is the main problem?

Large warehouses like those operated by PT. Kawan Lama Group face a persistent and underestimated risk: wild animals entering storage areas. Snakes are the most dangerous, posing direct physical harm to warehouse staff. Cats contaminate stored goods and create hygiene violations. Reptiles such as geckos and lizards, while less immediately dangerous, indicate structural gaps in the facility that allow larger pests to enter.

The core problem is not just the animals themselves, but the detection system. Manual inspection by security officers is inherently limited. It cannot cover all zones simultaneously, it does not operate reliably at night or during shift gaps, and it provides no historical data for pattern analysis. By the time a pest is found during a routine patrol, the contamination or safety incident may already have occurred.

There is no early warning system. There is no automated response. And there is no data trail to help management understand where and when these incidents are most likely to happen. SmartWarehouse AI addresses all three of these gaps in one integrated platform.

*(Max 200 words)*

### Who is impacted and to what scale?

The primary stakeholders are the warehouse operations team and security personnel at PT. Kawan Lama Group, who currently carry the manual burden of pest monitoring. Secondary stakeholders include warehouse managers who need visibility into threat patterns, compliance officers managing food safety and product quality standards, and ultimately the customers whose purchased goods must arrive in uncontaminated condition.

At scale, PT. Kawan Lama Group operates multiple distribution warehouses across Indonesia. Each facility faces the same risk independently, and without a centralized detection system, each also carries the same operational inefficiency. A single contamination incident involving stored products can trigger recalls, regulatory action, and reputational damage that far exceeds the cost of prevention.

*(Max 150 words)*

### Prove the problem

According to the Indonesian National Agency of Drug and Food Control (BPOM), product contamination from biological sources remains one of the leading causes of product recalls in the food and consumer goods sector. Pest intrusion in storage facilities is a documented contributor to these incidents.

Manual pest control services for a single large warehouse in Indonesia typically cost between Rp 15 million and Rp 30 million per month, a figure acknowledged by facilities management industry benchmarks. Despite this expenditure, manual inspection cannot guarantee real-time detection, particularly in multi-zone facilities operating across three shifts.

Research on YOLO-based object detection in industrial environments consistently demonstrates detection accuracy exceeding 85% mAP for common animal classes when trained on domain-specific datasets. This demonstrates that computer vision is a technically mature and operationally viable approach to solving this problem at the warehouse scale.

*(Max 180 words)*

---

## Problem Solution

### Main Solution

SmartWarehouse AI is a complete warehouse monitoring platform that uses a custom-trained YOLO11 computer vision model to detect bio-hazard animals in real time. The system connects to warehouse cameras, processes each frame through AI inference, and immediately triggers alerts when a threat is identified.

The platform operates on three levels. First, it detects and classifies threats by animal type and assigns a risk level: DANGER for snakes, WARNING for cats, and INFO for geckos and lizards. Second, it distributes those alerts instantly through the web dashboard, an audio alarm, and Telegram notifications. Third, it accumulates detection data over time and surfaces patterns through analytics, zone heatmaps, and peak hour analysis, giving management the intelligence to take proactive measures.

The system also includes a Gemini 2.0 Flash AI assistant that can answer operational questions using live warehouse data, standardized SOP protocols per threat type, and an ROI calculator. It is accessible from any device through a responsive web interface and supports role-based access for admin, manager, and operator roles.

*(Max 200 words)*

### How does the solution work?

The pipeline flows from input to output in four stages.

**Input:** Video frames are captured from warehouse cameras (webcam or RTSP stream) at up to 30fps. The frame skip setting (default: every 3rd frame) controls the balance between detection frequency and CPU load.

**Preprocessing:** Each frame passes through CLAHE (Contrast Limited Adaptive Histogram Equalization) to enhance visibility in low-light conditions common in warehouses at night or in poorly lit storage areas.

**Process:** The preprocessed frame is fed into the YOLO11-Nano model. The model runs inference at 320px resolution and returns bounding boxes, class labels, and confidence scores for any detected objects. The backend maps detections to warehouse zones and risk levels, then stores the result in the database.

**Output:** If a detection occurs, the backend broadcasts it simultaneously to all connected dashboard clients via WebSocket, sends a Telegram notification, and triggers a browser audio alarm for DANGER-level events. The dashboard updates in under one second. All detections are logged with timestamp, zone, class, confidence, and a snapshot image for audit purposes.

*(Max 200 words)*

---

## Impact & Outcome

### Key Benefits of Adopting the Solution

Warehouse operations staff gain immediate visibility into threats the moment they occur, rather than discovering them during the next patrol round. This reduces the window between pest entry and response from potentially hours to under one second.

For management, the platform provides historical detection data organized by zone, time of day, and animal type. This turns pest management from a reactive cost center into a data-driven operation where resources can be allocated to the zones and shifts that carry the highest documented risk.

For compliance and quality control, the automatic snapshot logging of every detection creates an audit trail that can be used to demonstrate due diligence during regulatory inspections or in response to contamination claims.

Financially, the reduction in manual pest control rounds and faster response times translate to measurable cost savings. Estimated savings per warehouse are between Rp 144 million and Rp 324 million annually, with a break-even period of four to six months.

The multi-zone architecture also means the same system can monitor all areas of a warehouse simultaneously, a capability that no manual inspection process can match.

*(Max 200 words)*

### Short and Mid-Term Outcomes

In the short term (within 0-3 months of deployment), the immediate outcome is the elimination of undetected pest incidents during off-peak hours and night shifts. Security teams gain a real-time alerting layer that does not depend on patrol schedules. Detection logs begin accumulating data that reveals entry patterns.

In the mid term (3-12 months), the accumulated data enables pattern-based decision making. Facility managers can use zone heatmaps and peak hours analysis to reinforce entry points, adjust patrol schedules, and negotiate better terms with external pest control vendors using documented incident frequency data.

In the longer term (beyond 12 months), the system's architecture supports expansion to additional warehouse locations without rebuilding from scratch. The AI model can be retrained periodically on new footage to improve accuracy for warehouse-specific conditions. Integration with existing warehouse management systems is feasible given the REST API backend design.

The ROI calculator built into the platform provides a living estimate of cost savings that updates as detection data accumulates, giving management a real-time view of the financial case for continued operation.

*(Max 200 words)*

---

## Innovation & Differentiation

### What Makes Your Solution Different?

Most existing pest detection solutions in Indonesia are reactive: a pest control company visits the facility on a fixed schedule and addresses problems that have already occurred. SmartWarehouse AI is proactive, automated, and continuous.

Several features distinguish this system from generic surveillance or generic object detection implementations. The YOLO11 model is fine-tuned specifically on warehouse pest classes, not a general-purpose detection model. It includes CLAHE preprocessing to handle the low-light conditions that are common in real warehouse environments but often absent from standard training datasets. The three-channel alerting system (WebSocket, audio, Telegram) ensures that alerts reach the right person regardless of where they are at the moment of detection.

The AI assistant powered by Gemini 2.0 Flash with RAG is also a differentiator. Rather than providing generic answers, the chatbot has access to real-time data from the warehouse and answers questions in the context of what is actually happening in the facility right now.

Finally, the inclusion of SOP protocols, an ROI calculator, and a role-based access system makes this a complete operational platform rather than just a detection tool.

*(Max 200 words)*

### Positioning Compared to Existing Approaches

Traditional pest control contracts provide periodic inspection and treatment but offer no continuous monitoring and no data trail. They are useful for remediation but cannot prevent incidents from occurring between visits.

Generic CCTV systems with motion detection can trigger alerts but cannot classify what triggered the alert. A motion alert in a busy warehouse is nearly useless without knowing whether it was caused by a forklift, a person, or a snake.

General-purpose AI detection tools exist but are not trained on the specific pest classes relevant to warehouse environments, particularly in the partial occlusion and low-light scenarios that are common in storage areas. These tools require significant customization to be practically useful.

SmartWarehouse AI occupies the gap between these approaches. It provides the continuous automated monitoring that generic CCTV systems lack, the classification specificity that general AI tools cannot deliver out of the box, and the operational tooling (SOP, ROI, analytics, AI chat) that pure detection tools do not include. It is designed to integrate into the existing security workflow rather than replace it entirely.

*(Max 200 words)*

---

## Technical Approach

### Main Solution Technologies

The system is built on the following core technologies: YOLO11 (Ultralytics) for real-time object detection, Python 3.12 with FastAPI for the backend REST API and WebSocket server, React 18 with Vite for the frontend dashboard, SQLite in WAL mode for concurrent-safe data storage, Google Gemini 2.0 Flash for the AI assistant, Telegram Bot API for mobile notifications, Web Audio API for browser-based alarm sounds, and Docker for containerized deployment. The frontend is deployed on Vercel with lazy-loaded page chunks for fast initial load times.

*(Max 150 words)*

### Technology Selection and Implementation

YOLO11-Nano was selected over heavier architectures because warehouse deployment hardware often lacks dedicated GPU capacity. At 5.2 MB and running inference at 320px resolution, it achieves acceptable detection accuracy while remaining fast enough for real-time operation on CPU. FastAPI was chosen for its async support, which is essential for handling concurrent WebSocket connections from multiple dashboard clients while simultaneously processing camera frames. React with Vite provides a fast development cycle and produces optimized production bundles. SQLite in WAL mode handles concurrent read-write operations from multiple background threads without requiring a full database server. Gemini 2.0 Flash was selected for its speed and the quality of its instruction-following, which is important for the RAG pattern where responses need to incorporate structured warehouse data accurately.

*(Max 150 words)*

### Solution Algorithm

The detection pipeline uses YOLO11-Nano, an anchor-free single-stage object detection architecture. Each input frame is preprocessed with CLAHE before inference. The model outputs bounding box coordinates, class probabilities, and confidence scores. Post-processing applies a confidence threshold (default 0.5) and NMS (Non-Maximum Suppression) to eliminate duplicate detections of the same object.

The AI chat uses Retrieval-Augmented Generation. When a user submits a query, the backend retrieves real-time context (active zones, recent detections, system status) from the database and injects it into the prompt before calling the Gemini API. This grounds the model's response in current warehouse data rather than general knowledge.

Detection events are broadcast to all WebSocket clients in under one second using an async broadcast manager that maintains a registry of active connections per zone.

*(Max 150 words)*

### Primary Data or Input Used

**Camera input:** Live video frames from warehouse cameras (webcam or RTSP). Frames are captured at up to 30fps with a configurable frame skip to manage processing load.

**Training dataset:** Compiled from Roboflow Public datasets for snake, cat, gecko, and lizard detection, supplemented with custom footage captured in warehouse environments. The dataset includes samples in low-light conditions and partial occlusion scenarios to improve robustness in real deployment conditions. Augmentation techniques applied: horizontal flip, brightness adjustment (+-30%), rotation (+-15 degrees), and mosaic. Split: 70% training, 20% validation, 10% test.

**Operational data:** All detections are stored in SQLite with timestamps, zone IDs, class labels, confidence scores, and JPEG snapshots. This data powers the analytics dashboard, feeds the RAG context for the AI assistant, and forms the basis of the CSV and PDF export functions.

*(Max 200 words)*

### Security and Scalability Considerations

Authentication uses bcrypt password hashing and session tokens with configurable expiry. Role-based access control (Admin, Manager, Operator) limits what each user can view and modify. The API validates all inputs at the boundary and uses parameterized queries throughout to prevent injection attacks. Camera feeds are processed locally on the backend server and are not transmitted to third-party services. Only the Gemini API receives text-based prompt data, not raw video.

For scalability, the multi-zone architecture already supports simultaneous monitoring of multiple cameras. Additional zones can be added through the dashboard without code changes. The Docker Compose configuration makes horizontal deployment straightforward. The SQLite database is suitable for single-facility deployment; a production-scale rollout across many warehouses would migrate to PostgreSQL using the same ORM layer. The React frontend uses lazy loading so that only the pages currently in use are loaded, keeping performance consistent as the feature set grows.

*(Max 150 words)*

---

## Implementation Feasibility

### Invention Status

**Current stage: Working Prototype / Pilot-ready**

The system is fully built, running, and accessible via a live web deployment. The YOLO11 model is trained and integrated. The detection pipeline, WebSocket alerts, Telegram notifications, AI chat, analytics, SOP module, and user management are all operational. The frontend is deployed on Vercel and the backend runs via ngrok tunnel for demo access. The system has been tested end-to-end with live camera input.

### Is the Innovation Realistic to Build?

The team has already built it. The technical components (YOLO11 fine-tuning, FastAPI WebSocket server, React dashboard, Gemini RAG integration) are within the demonstrated capability of the team. The tools used are all open source or available under accessible API pricing. Hardware requirements are minimal: any standard server or PC can run the backend. The only external dependency is the Gemini API key for the AI chat feature.

*(Max 150 words)*

### Development Stages

The development followed an agile sprint model over three sprints totaling 18 working days.

**Sprint 1 (Days 1-6):** Project setup, YOLO11 dataset preparation, model training and validation, basic FastAPI backend with camera routing and SQLite schema, initial React frontend with live monitor page.

**Sprint 2 (Days 7-12):** WebSocket real-time alerts, Telegram Bot integration, audio alarm, Gemini AI chat with RAG, detection logs page, risk analytics with charts, SOP and ROI calculator pages.

**Sprint 3 (Days 13-18):** User management with role-based access, AI performance metrics page, report generator (PDF/CSV export), mobile responsiveness across all device sizes, code splitting for performance, production deployment on Vercel, full documentation.

The current state is a complete, deployable prototype. Next steps for production deployment would include hardware integration with existing warehouse CCTV infrastructure and a security audit of the production backend configuration.

*(Max 180 words)*

### Business Model and Sustainability

The business model is a Software-as-a-Service (SaaS) platform licensed to warehouse operators, structured around the following canvas:

**Value Proposition:** Automated 24/7 pest detection that reduces response time from hours to under one second, reduces manual inspection cost, and provides management with data-driven operational intelligence.

**Customer Segments:** Warehouse operators and logistics companies in Indonesia, starting with PT. Kawan Lama Group.

**Revenue Streams:** Monthly or annual SaaS subscription per warehouse location, tiered by the number of active camera zones. Optional professional services for on-site hardware integration.

**Cost Structure:** Cloud hosting for the frontend, API usage costs for Gemini, periodic model retraining costs, and customer support.

**Key Activities:** Model maintenance and periodic retraining on new footage, platform updates, and customer onboarding.

**Sustainability:** The system's value compounds over time as detection logs accumulate. More data means better analytics, more accurate models after retraining, and stronger ROI documentation for the customer. This creates natural retention and a defensible data advantage over time.

*(Max 200 words)*

---

## Attachment & Reference

**GitHub Repository:** https://github.com/SultanZhalifa/smartwarehouse-ai

**Live Demo:** *(masukkan link Vercel deployment lo di sini)*

**References:**

1. Badan Pengawas Obat dan Makanan (BPOM). Product contamination statistics and recall reports, 2023-2024.
2. Redmon, J., & Farhadi, A. (2018). YOLOv3: An Incremental Improvement. arXiv:1804.02767.
3. Ultralytics. YOLO11 Documentation. https://docs.ultralytics.com
4. Zuiderveld, K. (1994). Contrast Limited Adaptive Histogram Equalization. Graphics Gems IV, Academic Press.
5. Google DeepMind. Gemini 2.0 Flash Technical Report, 2025.
6. Roboflow. Open Dataset Repository. https://roboflow.com
