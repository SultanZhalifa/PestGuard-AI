# Product Backlog

Project: Smart Warehouse Bio Hazard and Pest Detection
Group: 5

This backlog is based on the core requirements from the PT. Kawan Lama hackathon case study. The goal is to build an automated AI system that detects wild animals inside warehouse environments. Each item is ordered by priority, starting from the most critical system components down to additional features.


## PB 01: Setup and Training of Object Detection Model (YOLO)

Priority: High
Type: AI/ML
Status: Done
Assigned to: Fathir

Goal: We need an AI model that can recognize three types of animals (snakes, cats, and geckos) inside a warehouse setting. Without this model, the entire system cannot function because this is the core engine of the detection pipeline.

Detail: Fathir collected image datasets from various sources, manually annotated them, and trained a YOLOv11 Nano model to keep it lightweight but still accurate. The dataset was also augmented with brightness and contrast adjustments to simulate the dim lighting conditions typical of warehouses.

Acceptance Criteria: The model can detect snakes, cats, and geckos with confidence above 60 percent on test video footage.


## PB 02: Monitoring Dashboard UI Layout

Priority: High
Type: Frontend
Status: Done
Assigned to: Misha

Goal: The Warehouse Manager needs a clear and intuitive monitoring interface so they can immediately see what is happening in the warehouse without needing to understand the technical details of the AI.

Detail: Misha built the dashboard using React and Vite with four main pages: Live Monitor, Detection Logs, Risk Analysis, and Settings. The design was kept clean and modern so it is comfortable to look at during long work shifts. Sidebar navigation, stat cards, and the alert list were all designed to be responsive from desktop down to mobile.

Acceptance Criteria: The dashboard loads in the browser, navigation between pages works smoothly, and the layout does not break on mobile screens.


## PB 03: Video Simulator and Live Streaming

Priority: High
Type: Integration
Status: Done
Assigned to: Fathir and Sultan

Goal: The system must be able to display the warehouse camera feed in real time, complete with bounding boxes marking any detected animals.

Detail: The backend uses OpenCV to capture frames from the camera, then YOLO processes each frame for detection. The result is sent as an MJPEG stream to the frontend. If an animal is detected, bounding boxes are drawn on the frame before it is sent to the client.

Acceptance Criteria: The Start Cam button on the dashboard activates the camera, video plays smoothly, and bounding boxes appear when animals are detected.


## PB 04: Database Logging for Every Detection

Priority: High
Type: Backend
Status: Done
Assigned to: Fathir

Goal: All detection events must be saved in a database so there is a historical record that can be accessed anytime, not just in real time.

Detail: Every time the model detects an animal, the backend automatically saves the data to SQLite with full information including animal type, camera zone location, timestamp, and risk level. This data can then be retrieved by the frontend through the REST API endpoint.

Acceptance Criteria: Every detection is recorded in the database, viewable on the Detection Logs page, and data persists even when the server is restarted.


## PB 05: Alert and Rapid Notification System

Priority: Medium
Type: Feature
Status: Done
Assigned to: Misha and Sultan

Goal: Warehouse workers need a fast warning when a dangerous animal is detected, especially snakes that can threaten human safety.

Detail: The system distinguishes two alert levels. First, Bio Hazard for snakes which triggers an emergency warning. Second, Contamination for cats and geckos which are more about the risk of product spoilage. Alerts appear in the Recent Alerts panel in real time, and can be shared to WhatsApp or Telegram to notify field teams.

Acceptance Criteria: Alerts appear automatically when a new detection occurs, risk badges display correctly, and share buttons work.


## PB 06: Risk Analysis Page and Executive Summary

Priority: Medium
Type: Feature
Status: Done
Assigned to: Misha and Risly

Goal: Managers need a weekly analysis summary that can be presented to PT. Kawan Lama management, not just raw data.

Detail: The Risk Analysis page displays a weekly risk distribution chart using Recharts. There is also a section on rapid response protocols explaining the standard operating procedure for handling each animal type. Risly wrote the executive summary content based on real data from the detection database.

Acceptance Criteria: Charts display weekly data, handling protocols are clearly readable, and the page can be exported or screenshotted for presentations.


## PB 07: API Endpoints and JWT Authentication

Priority: High
Type: Backend
Status: Done
Assigned to: Fathir and Sultan

Goal: The frontend needs secure API endpoints to retrieve detection data, and the system must prevent unauthorized access to the camera and database.

Detail: The backend provides several REST endpoints through FastAPI, including endpoints for login, registration, fetching detection logs, and video streaming. All sensitive endpoints are protected by JWT tokens. If a user is not logged in, the request is automatically rejected by the server.

Acceptance Criteria: Users must log in before accessing the dashboard, tokens expire after a set time, and camera endpoints cannot be accessed without authentication.


## PB 08: Smart Object Filtering (Whitelist Detection)

Priority: Medium
Type: Bug Fix / Enhancement
Status: Done
Assigned to: Sultan

Goal: The YOLO model by default detects 80 object classes including inanimate objects like couches, backpacks, and laptops. We need a filter so only relevant animals are logged.

Detail: Sultan added a class whitelist in the backend that only allows classes like person, cat, dog, bird, horse, sheep, cow, and other relevant animals. Objects like backpack, couch, and laptop are automatically ignored even if detected by the model. This eliminates false positives that would clutter the logs.

Acceptance Criteria: Only animals and humans appear in detection logs. Inanimate objects are no longer recorded as contamination events.


## PB 09: Mobile Responsiveness Across All Devices

Priority: Medium
Type: Frontend
Status: Done
Assigned to: Misha and Sultan

Goal: The dashboard must be comfortably usable from field workers' phones, not just from office computers.

Detail: CSS media queries were added for breakpoints at 768px and 480px. Stat cards that were in a 4 column grid on desktop switch to a vertical stack on mobile. The sidebar becomes collapsible, and camera control buttons do not get cut off on small screens. Testing was done on resolutions from iPhone XR up to Samsung Note series.

Acceptance Criteria: All pages display properly on phone screens without horizontal scrolling and without any elements being cut off.


## PB 10: Settings Page and User Configuration

Priority: Low
Type: Feature
Status: Done
Assigned to: Misha

Goal: Warehouse admins need to be able to adjust basic preferences like dark mode, notification language, and account settings from within the dashboard.

Detail: The Settings page provides a toggle for dark mode, user profile settings, and other configuration options. All changes are saved in local state and immediately affect the entire dashboard appearance.

Acceptance Criteria: Dark mode toggle works, settings changes are immediately visible, and the page does not error when accessed.
