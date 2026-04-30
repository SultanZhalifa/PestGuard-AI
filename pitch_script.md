# Hackathon Pitch Script: Group 5

Project: Smart Warehouse - Bio Hazard and Pest Detection (PT. Kawan Lama)
Target Time: Around 3 Minutes

---

## 1. The Hook (Risly - Product Owner) [0:00 - 0:45]
[Slide: Title and Problem Statement]
"Good afternoon, judges. We are Group 5, and today we are solving a massive, hidden problem for PT. Kawan Lama's large scale warehouses: Unseen Bio Hazards.
In a facility spanning tens of thousands of square meters, manual monitoring is physically impossible. Wild animals, specifically snakes, cats, and geckos, often slip into blind spots. A snake poses a lethal threat to our warehouse staff, while cats and geckos risk severe contamination of valuable goods. Our solution? An automated, AI driven surveillance ecosystem that does not sleep."

## 2. The Solution and Live Demo (Misha - Frontend Lead) [0:45 - 1:45]
[Slide: Live React Dashboard and Command Center]
"To solve this, we built a 100 percent real, full stack monitoring Command Center. What you are looking at is our React application fetching live data.
Notice the Live Monitor feed and the real time Recent Alerts. This is not a mockup; we are using WebSockets and React Context API for global state management. When the AI detects a threat, the bounding boxes are drawn, and the event is immediately pushed to our table without requiring a page refresh.
Furthermore, our system is smart enough to differentiate between threats and staff. If it detects a human, it logs it as Safe and silences the alarm, completely eliminating false alert fatigue."

## 3. The Architecture (Fathir - Backend and AI Lead) [1:45 - 2:30]
[Slide: Tech Stack, Threading and Security]
"Under the hood, we engineered an enterprise grade architecture. Our Python FastAPI backend utilizes a Singleton Background Threading model for the OpenCV and YOLO11 pipeline. This guarantees maximum FPS and ensures the system will not crash even if multiple managers open the camera feed simultaneously.
We did not stop at just AI. We secured the entire REST API ecosystem with JWT (JSON Web Token) Authentication. Any unauthorized attempt to access our camera or database logs is immediately blocked at the server level."

## 4. Business Impact and Conclusion (Sultan - Scrum Master) [2:30 - 3:00]
[Slide: Executive Summary and CSV Export]
"Finally, we understand that data is only valuable if it is actionable. All detections are persisted in an SQLite database. Managers can view weekly risk distribution charts, and with one click, generate an Export to CSV report for external business intelligence tools.
We executed this project using strict Agile Scrum methodology over three intensive sprints. We have delivered a highly scalable, secure, and production ready solution that protects both human lives and business inventory.
Thank you, and we now open the floor to your questions."
