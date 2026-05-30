# Daily Sprint Log

Project: PestGuard AI — Bio Hazard and Pest Detection
Team: Andalusia
Methodology: Agile / Scrum

This file contains the daily standup logs for all three sprints. Each entry follows the same format:

- What I finished since yesterday
- What I am working on today
- Any blockers

Logs are submitted asynchronously through the group chat every morning before 09.00. Sultan as Scrum Master reviews blockers and responds the same day.


---


## Sprint 1 — Week 1


### Day 1 — Monday

**Risly**
Yesterday: Nothing yet, project just started.
Today: Reading through the PT. Kawan Lama hackathon brief thoroughly to understand what they actually need. Will extract the real problem statement from the document.
Blocker: None.

**Sultan**
Yesterday: Nothing yet.
Today: Setting up the React project with Vite and the FastAPI backend. Getting the folder structure right before anyone else starts writing code.
Blocker: None.

**Fathir**
Yesterday: Nothing yet.
Today: Starting dataset research. Going to look at what is available on Roboflow Universe and Kaggle for snake, cat, and gecko images.
Blocker: None.

**Misha**
Yesterday: Nothing yet.
Today: Sketching the dashboard layout on paper. Figuring out how many pages we need and what goes on each one.
Blocker: None.


### Day 2 — Tuesday

**Risly**
Yesterday: Finished reading the brief. Identified the three main pain points: detection speed, false positive rate, and alert delivery to field workers.
Today: Writing the risk classification framework. Figuring out which animals should be Bio Hazard versus Contamination and what the SOP should look like for each.
Blocker: None.

**Sultan**
Yesterday: React and Vite are set up. FastAPI is running on port 8000. Both talk to each other with CORS configured correctly.
Today: Writing the base database.py with the initial SQLite schema. Going to include tables for users and detection logs.
Blocker: None.

**Fathir**
Yesterday: Found a decent snake dataset on Roboflow. Not many warehouse-specific images though.
Today: Downloading more images manually. Going to look for gecko images specifically, they seem harder to find in realistic settings.
Blocker: None.

**Misha**
Yesterday: Layout sketch is done. Four pages: Live Monitor, Detection Logs, Risk Analysis, Settings.
Today: Starting the React component structure. Sidebar navigation and routing first.
Blocker: None.


### Day 3 — Wednesday

**Risly**
Yesterday: Risk classification draft is done. Snake is Bio Hazard, cat is Contamination, gecko and lizard are Monitoring level. Each has a response protocol.
Today: Writing the content for the Risk Mitigation section. Going to research what Indonesian logistics companies actually do when they find a snake.
Blocker: None.

**Sultan**
Yesterday: Database schema is done. Users table and logs table created. First migration also handled.
Today: Setting up the config.py with environment variables. Want to make sure SECRET_KEY, DB_PATH, and CORS_ORIGINS are all configurable before we go further.
Blocker: None.

**Fathir**
Yesterday: Got around 600 images total. Snake is covered well, cat is okay, gecko is still thin.
Today: Going to start annotating what we have. Using LabelImg for the bounding box annotations in YOLO format.
Blocker: Gecko images are mostly from house settings with bright backgrounds. Not realistic for a warehouse.

**Misha**
Yesterday: Sidebar component is done. React Router set up with four routes.
Today: Building the base layout wrapper so all pages share the same sidebar and top nav.
Blocker: None.


### Day 4 — Thursday

**Risly**
Yesterday: Finished the risk mitigation content draft. Referenced BPOM food safety guidelines for the contamination section.
Today: Reviewing Misha's layout to give feedback from a user perspective. Is it clear enough for a non-technical manager?
Blocker: None.

**Sultan**
Yesterday: Config and environment setup done. .env.example is also written so new team members can set up quickly.
Today: Writing the base authentication endpoints. Login, token verification, and logout first.
Blocker: None.

**Fathir**
Yesterday: Annotated around 400 images. Hands are tired. Going to take breaks.
Today: Continuing annotation. Also going to try finding CCTV footage of warehouses on YouTube to get more realistic gecko frames.
Blocker: Annotation is slow when done manually.

**Misha**
Yesterday: Base layout done. Pages render inside the layout correctly.
Today: Building placeholder stat cards for the Live Monitor page. Will connect to real data later.
Blocker: None.


### Day 5 — Friday

**Risly**
Yesterday: Reviewed Misha's layout. Left comments on the group chat. Main feedback is the alert panel should show location, not just animal type.
Today: No major tasks today. Going to proofread everything written this week and prepare notes for sprint review.
Blocker: None.

**Sultan**
Yesterday: Login endpoint done. Token is generated and stored in memory on successful login.
Today: Writing the logout and token verification middleware. Also want to add basic rate limiting before the week ends.
Blocker: None.

**Fathir**
Yesterday: Found some Indonesian warehouse CCTV footage online. Extracted around 200 frames with realistic backgrounds.
Today: Finishing annotation for all images. Target is 1,200 labeled images before the weekend.
Blocker: None.

**Misha**
Yesterday: Stat cards are built. They show static values for now.
Today: Building the alert list component on the Live Monitor page. Will use placeholder data.
Blocker: None.


### Day 6 — Saturday

**Sultan**
Yesterday: Rate limiting done for the login endpoint. Token verification middleware is also done.
Today: Helping Fathir think through the training setup. Which model size, how many epochs, what augmentation to apply.
Blocker: None.

**Fathir**
Yesterday: Annotation is done. 1,200 images total across four classes.
Today: Setting up the YOLO training environment. Going to use Google Colab because the laptop gets too hot during long training runs.
Blocker: None.


---


## Sprint 2 — Week 2


### Day 7 — Monday

**Risly**
Yesterday: Weekend. Rested.
Today: Going to test the annotated dataset by looking through some samples manually. Checking whether the bounding boxes actually match the animals correctly.
Blocker: None.

**Sultan**
Yesterday: Weekend. Reviewed the training plan with Fathir over chat.
Today: Researching how to stream processed video frames from FastAPI to React. Going to compare REST polling, WebSocket, and MJPEG streaming.
Blocker: None.

**Fathir**
Yesterday: First training run finished overnight on Colab. mAP is around 52 percent. Not great.
Today: Analyzing which classes are failing. Gecko is the weakest. Going to adjust the dataset balance and run another training.
Blocker: Colab session keeps disconnecting if I leave it overnight.

**Misha**
Yesterday: Weekend.
Today: Starting to build the video player component. Will just show a static placeholder for now until the streaming backend is ready.
Blocker: None.


### Day 8 — Tuesday

**Risly**
Yesterday: Checked about 150 annotated images. Found a few where the bounding box was too tight on the head and missed the body. Flagged them for Fathir.
Today: Going to do threshold testing. Will watch recordings and note at what confidence level the detection looks reliable.
Blocker: Need the model to be at a testable state first.

**Sultan**
Yesterday: Researched streaming options. MJPEG looks like the best fit for our stack because it does not need WebSocket infrastructure for the video part.
Today: Starting to implement the MJPEG streaming endpoint in FastAPI. Going to follow the multipart boundary approach.
Blocker: None.

**Fathir**
Yesterday: Second training run done. mAP went up to 64 percent after balancing the dataset and adjusting augmentation. Still need to improve gecko.
Today: Running a third training with additional gecko images and more aggressive augmentation for that class specifically.
Blocker: Colab is slow today.

**Misha**
Yesterday: Video player component is built with a placeholder image.
Today: Trying to connect the video player to the backend stream URL. Stuck on how to handle auth for an img tag since you cannot set headers on it.
Blocker: Cannot pass Bearer token through an img src attribute.


### Day 9 — Wednesday

**Risly**
Yesterday: Waited for the model. Used the time to write the first draft of the Executive Summary.
Today: Going to test the model as soon as Fathir shares the latest weights.
Blocker: Waiting on model.

**Sultan**
Yesterday: MJPEG streaming endpoint is working. Video frames are being sent from FastAPI as multipart/x-mixed-replace.
Today: Helping Misha solve the auth problem for the img tag. The solution is probably to pass the token as a query parameter instead of a header.
Blocker: None.

**Fathir**
Yesterday: Third training run finished. mAP is now at 71 percent. Gecko improved significantly.
Today: Integrating the model into the video processing loop. Going to wire it to the MJPEG endpoint Sultan built.
Blocker: None.

**Misha**
Yesterday: Stuck on the auth issue. Could not find a clean solution.
Today: Sultan suggested passing the token as a query param in the URL. Going to try that approach.
Blocker: Was blocked, now unblocked.


### Day 10 — Thursday

**Risly**
Yesterday: Got access to the model. Tested it on three different video clips. Snake detection is solid. Cat is fine. Gecko sometimes misses when it is partially hidden.
Today: Writing up the test results in a structured format. Giving Fathir specific timestamps and scenarios where detection failed.
Blocker: None.

**Sultan**
Yesterday: Token-as-query-param is working. Misha confirmed the video loads correctly now.
Today: Adding the detection cooldown logic. The same animal should not be logged more than once every ten seconds.
Blocker: None.

**Fathir**
Yesterday: Model is integrated into the MJPEG loop. Bounding boxes are being drawn on frames before they are sent to the client.
Today: Building the detection logging endpoint. Every confirmed detection should write to the database automatically.
Blocker: None.

**Misha**
Yesterday: Video feed is working end to end. Bounding boxes are visible in the browser.
Today: Connecting the stat cards to the real API data. Inference time, active zones, and total log count should all be live.
Blocker: None.


### Day 11 — Friday

**Risly**
Yesterday: Test report is written. Shared it on the group chat. Three main issues: gecko partial occlusion, cat in very dark frames, false positives with cables.
Today: No new tasks. Going to review the sprint output and prepare questions for the weekend check-in.
Blocker: None.

**Sultan**
Yesterday: Cooldown logic is done. Works per class per zone independently.
Today: Testing the full pipeline: start zone, wait for detection, check database, check frontend. Going to document any bugs.
Blocker: None.

**Fathir**
Yesterday: Database logging is working. Every detection writes to SQLite with type, zone, timestamp, confidence, and risk level.
Today: Adding snapshot saving. When a detection is logged, the annotated frame should also be saved to disk as a JPEG.
Blocker: None.

**Misha**
Yesterday: Stat cards are now showing live data from the API.
Today: Building the Detection Logs page table. Should fetch data from the API and paginate properly.
Blocker: None.


### Day 12 — Saturday

**Fathir**
Yesterday: Snapshot saving is done. Each log entry has a corresponding image file.
Today: Running the third training pass with the negative samples Risly flagged. Cables and ropes added as negatives.
Blocker: None.

**Sultan**
Yesterday: Full pipeline test done. Found two bugs: the zone toggle returns 500 when the video file path is wrong, and the detection logs page crashes when the table is empty.
Today: Fixing both bugs. The path issue needs a smarter check on startup.
Blocker: None.


---


## Sprint 3 — Week 3


### Day 13 — Monday

**Risly**
Yesterday: Weekend.
Today: Starting the presentation slides. Will follow the hackathon judging criteria for the structure.
Blocker: None.

**Sultan**
Yesterday: Fixed the path validation bug. init_camera_zones now checks if the stored path exists before trying to use it and updates it automatically if not.
Today: Moving invite tokens and reset codes to persistent database tables. They should not disappear on server restart.
Blocker: None.

**Fathir**
Yesterday: Fine-tuning with negative samples is done. False positive rate on cables is much lower now.
Today: Implementing the WebSocket manager. Detection events should be pushed to all connected frontend clients in real time.
Blocker: None.

**Misha**
Yesterday: Detection Logs page is mostly done. Table renders, pagination works.
Today: Building the Risk Analysis page. Chart for weekly detection trends using Recharts.
Blocker: None.


### Day 14 — Tuesday

**Risly**
Yesterday: First draft of slides is done. Sent it to Sultan for review.
Today: Writing the script for the pitch. Need to cover problem, solution, demo walkthrough, and business model in five minutes.
Blocker: None.

**Sultan**
Yesterday: invite_tokens and password_reset_codes are now in SQLite. Also added an admin endpoint to view active reset codes from the dashboard.
Today: Hardening the authentication. Bcrypt migration for old SHA-256 hashes, stronger rate limiting, and a proper 256-bit SECRET_KEY.
Blocker: None.

**Fathir**
Yesterday: WebSocket manager is done. Broadcasts detection events to all connected clients.
Today: Wiring the WebSocket broadcast into the detection logging flow. When a log is written, the alert goes out immediately.
Blocker: None.

**Misha**
Yesterday: Risk Analysis chart is rendering. Using weekly aggregation from the analytics endpoint.
Today: Rebuilding the Recent Alerts panel. The old one grows without limit and becomes unusable after a lot of detections.
Blocker: None.


### Day 15 — Wednesday

**Risly**
Yesterday: Pitch script done. Practiced it once and it comes in at about four and a half minutes.
Today: Doing a full walkthrough test of the system as if I am a judge seeing it for the first time. Will document everything that looks wrong or confusing.
Blocker: None.

**Sultan**
Yesterday: Auth hardening done. Rate limiting tested and confirmed working.
Today: Testing the complete system with all four zones running simultaneously. Looking for performance issues or crashes.
Blocker: None.

**Fathir**
Yesterday: WebSocket is fully wired in. New alerts appear in the frontend within about one second of detection.
Today: Testing the snapshot pipeline under load. Making sure images are saved correctly even when multiple zones detect simultaneously.
Blocker: None.

**Misha**
Yesterday: New alerts panel is done. Max 20 items, fixed height, dismiss button per alert, Clear All button.
Today: Fixing the footer link that was pointing to the wrong route. Also going to clean up some inconsistent spacing across pages.
Blocker: None.


### Day 16 — Thursday

**Risly**
Yesterday: Walkthrough test done. Found that the system status shows Offline even when zones are running. Also the TTS alert sounds strange in some conditions.
Today: Writing up the final list of bugs from the walkthrough and sorting them by severity.
Blocker: None.

**Sultan**
Yesterday: Four-zone simultaneous test passed. CPU usage is manageable, no crashes.
Today: Fixing the Offline status display bug. The status should reflect whether any zone is actually running.
Blocker: None.

**Fathir**
Yesterday: Snapshot saving works correctly under concurrent load. No race conditions observed.
Today: Final check on the model metadata endpoint. Making sure it reads the actual results.csv from training rather than hardcoded values.
Blocker: None.

**Misha**
Yesterday: Router link fixed. Footer now navigates correctly to /logs using React Router Link instead of a plain anchor.
Today: Final UI pass. Checking dark mode consistency, font sizes, and button alignment across all pages.
Blocker: None.


### Day 17 — Friday

**Risly**
Yesterday: Bug report shared with the team. Three high severity items, two medium.
Today: Reviewing the proposal PDF before submission. Making sure all the technical claims match what the system actually does.
Blocker: None.

**Sultan**
Yesterday: System status bug fixed. Also committed all the production hardening changes in one organized commit.
Today: Final git cleanup. Making sure the commit history is clean and the README has enough information for someone cloning for the first time.
Blocker: None.

**Fathir**
Yesterday: model-info endpoint verified. Returns real training metrics parsed from results.csv.
Today: Running a final detection test on all three demo videos. Snake, Cat, and Gecko should all trigger correctly with bounding boxes and database entries.
Blocker: None.

**Misha**
Yesterday: Dark mode and spacing pass done.
Today: Final review of all pages. Will open the browser, go through every page, click every button, and note anything that does not work or look right.
Blocker: None.


### Day 18 — Saturday

**Sultan**
Yesterday: README updated. Commit history reviewed. Pushed final production-ready commit to main.
Today: Running docker-compose to verify the full stack runs correctly from a clean build. Also updating the build hash in Settings to the actual current git hash.
Blocker: None.

**Fathir**
Yesterday: All three demo videos trigger correct detections. Snake at Zone D, Cat at Zone B, Gecko at Zone C. All confirmed in database and visible in dashboard.
Today: Done with development. Reviewing the product backlog to make sure everything marked Done is actually done.
Blocker: None.

**Misha**
Yesterday: Full page walkthrough done. Found one layout glitch on mobile for the Detection Logs table. Fixed it.
Today: Done with development. Final check on the proposal document to make sure the UI screenshots match the current version.
Blocker: None.

**Risly**
Yesterday: Proposal reviewed. Flagged two sentences that made claims the system cannot actually support yet.
Today: Revising those two sentences to be more accurate. Will finalize the PDF for submission by end of day.
Blocker: None.
