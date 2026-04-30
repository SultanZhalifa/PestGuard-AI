# Sprint Reports

Project: Smart Warehouse Bio Hazard and Pest Detection
Group: 5


## Sprint 1 (Week 1): Project Foundation and Data Preparation

### Sprint Goal
Set up the entire technical foundation from scratch. This includes initializing the repository, setting up the development environment, collecting animal image datasets, and building the initial dashboard skeleton. By the end of this sprint we should have a project that runs locally even if the features are not complete yet.

### Task Distribution

Risly documented the risk mitigation protocols for each animal type. She researched the dangers of snakes in warehouse environments and how the handling SOPs work in the logistics industry. Her output became the reference for the content displayed on the Risk Analysis page.

Sultan handled the initial project setup, from creating the React app with Vite, configuring the folder structure, setting up the Python virtual environment for the backend, and preparing the base configuration files like vite.config.js and requirements.txt.

Fathir focused on dataset collection. He downloaded images of snakes, cats, and geckos from various sources, then manually annotated them for YOLO training. Around 1000 images were collected and annotated during the first week.

Misha built the initial React skeleton, including the sidebar navigation, routing between pages, and the base layout for the Live Monitor. She also created placeholder components for the video player and alert list.

### Progress Completed
The React project and FastAPI backend can both run locally. A dataset of 1000 images has been collected and is ready for training. The dashboard layout is basically responsive with four navigable pages.

### Challenges
Finding high quality images of geckos in a warehouse context turned out to be really difficult. Most gecko images available online show geckos on house walls with good lighting, not in dark environments like a warehouse.

### Solutions
Fathir used data augmentation by adjusting brightness and contrast of existing images to simulate the low light conditions of a warehouse. Sultan also helped find warehouse CCTV footage on YouTube as additional reference material.

### Plan for Sprint 2
Start training the YOLO model with the collected dataset. Fathir will build the backend endpoint for video streaming. Misha will start integrating the video player on the frontend.


---


## Sprint 2 (Week 2): Model Training and Video Integration

### Sprint Goal
Train the object detection model to a usable accuracy level and build the video streaming pipeline from backend to frontend. By the end of this sprint, the dashboard should be able to display the camera video feed with bounding boxes appearing automatically when animals are detected.

### Task Distribution

Risly reviewed the confidence thresholds being used by the model. She tested several detection scenarios and gave feedback on which ones were too sensitive (too many false positives) and which ones were not sensitive enough (animals going undetected).

Sultan helped Fathir optimize the OpenCV video processing script. He also researched and implemented the MJPEG streaming architecture so video could be sent from Python to React without high latency.

Fathir trained the YOLOv11 Nano model and built the FastAPI endpoint that receives requests from the frontend, processes video frames, and returns the results as a stream. He also created REST endpoints for login and detection data retrieval.

Misha connected the video player component in React to the backend endpoint. She also built the stat cards for the Command Center that display the number of safe zones, active zones, total logs, and AI engine speed in real time.

### Progress Completed
The model is trained with sufficient accuracy for the demo. Video streaming runs from backend to frontend. Stat cards display dynamic data. The login system with JWT is functional.

### Challenges
When we first tried sending processed video frames from FastAPI to React, there was really bad lag. Each frame took a long time to reach the browser and the video looked extremely choppy.

### Solutions
Sultan and Misha decided to switch the approach from REST polling (the frontend continuously requesting new frames) to MJPEG streaming (the backend continuously sending frames as a single stream). This change removed the request response overhead and made the video much smoother.

### Plan for Sprint 3
Implement the alert system and notifications. Build the Risk Analysis page with charts. Final UI polish and bug fixing before the hackathon demo.


---


## Sprint 3 (Week 3): Alert System, Polish, and Demo Preparation

### Sprint Goal
Finish all remaining features, fix bugs, polish the UI to make it production ready, and prepare all materials for the hackathon presentation.

### Task Distribution

Risly wrote the Executive Summary based on real detection data from the database. She also prepared the presentation slides and made sure the pitch script covered all the important points the judges would be looking for.

Sultan did comprehensive bug testing across all pages. He found and fixed several issues, including inanimate objects like couches and backpacks being logged as contamination events. The solution was adding a whitelist filter in the backend. Sultan also handled the final UI polish to make the design consistent across all pages.

Fathir implemented automatic database logging for every detection event. Every time the model detects something, the data is immediately saved to SQLite with complete information (type, location, timestamp, risk level). He also added a cooldown timer so the same object does not get logged multiple times in quick succession.

Misha built the Risk Analysis page with a weekly risk distribution chart using Recharts. She also created the visual alert system with different colored badges for Bio Hazard and Contamination levels, plus share buttons for WhatsApp and Telegram.

### Progress Completed
All features are complete and integrated. The alert system runs automatically. The database records every detection. The dashboard displays consistently and cleanly on both desktop and mobile. The pitch script and presentation slides are finalized.

### Challenges
The model sometimes misidentified thick cables or ropes as snakes. This produced false positives that could damage the credibility of the demo in front of the judges.

### Solutions
Fathir added more negative samples (images of cables, ropes, hoses) to the dataset and ran another round of fine tuning. As a result, false positives dropped significantly. Risly also added an explanation in the Executive Summary about how the team handled this edge case as evidence of iteration and continuous improvement.


---


## Daily Sprint Log

Throughout the three weeks of development, the team ran daily standups asynchronously through the group chat. Every day, each member sent a short update about what they finished yesterday, what they plan to work on today, and whether there are any blockers. Commits were made daily by every member who was actively coding.

Here is the format we used for daily updates:

"Yesterday: Finished building the /api/detections endpoint to fetch log data. Today: Going to start integrating it with the frontend table. Blocker: None, everything is smooth."

"Yesterday: Training batch 3 is done, accuracy went up to 78 percent. Today: Going to try more augmentation on gecko images. Blocker: Laptop GPU is starting to overheat, might switch to Google Colab."

"Yesterday: Risk Analysis page layout is done, chart is still using dummy data. Today: Going to connect the chart to the API data. Blocker: Endpoint is not ready yet, waiting on Fathir."

This pattern helped us stay in sync even when we could not always meet in person. Whenever a serious blocker came up, Sultan as the Scrum Master would immediately help find a solution or redistribute tasks so nobody stayed stuck for too long.
