# Product Backlog

Project: Smart Warehouse Bio Hazard and Pest Detection
Group: 5

Backlog ini disusun berdasarkan kebutuhan utama dari studi kasus hackathon PT. Kawan Lama, yaitu membangun sistem deteksi hewan liar di gudang secara otomatis menggunakan AI. Setiap item sudah diurutkan berdasarkan prioritas, dari yang paling krusial untuk sistem bisa berjalan, sampai fitur tambahan yang sifatnya nice to have.


## PB 01: Setup dan Training Model Object Detection (YOLO)

Priority: Tinggi
Type: AI/ML
Status: Done
Assigned to: Fathir

Goal: Kita perlu model AI yang bisa mengenali tiga jenis hewan (ular, kucing, dan cicak) di lingkungan gudang. Tanpa model ini, seluruh sistem tidak bisa berjalan karena ini jantung utama dari deteksi.

Detail: Fathir mengumpulkan dataset gambar dari berbagai sumber, melakukan anotasi manual, dan melatih model YOLOv11 Nano supaya ringan tapi tetap akurat. Dataset juga di augmentasi dengan perubahan brightness dan kontras supaya mirip kondisi pencahayaan gudang yang remang.

Acceptance Criteria: Model bisa mendeteksi ular, kucing, dan cicak dengan confidence di atas 60 persen pada video test.


## PB 02: Layout Dashboard Monitoring

Priority: Tinggi
Type: Frontend
Status: Done
Assigned to: Misha

Goal: Warehouse Manager butuh tampilan monitoring yang jelas dan intuitif supaya bisa langsung lihat kondisi gudang tanpa harus paham teknis AI.

Detail: Misha membangun dashboard menggunakan React dan Vite dengan empat halaman utama, yaitu Live Monitor, Detection Logs, Risk Analysis, dan Settings. Desainnya dibuat clean dan modern supaya nyaman dilihat selama berjam jam di shift kerja. Sidebar navigasi, stat cards, dan alert list semua dirancang responsive dari desktop sampai mobile.

Acceptance Criteria: Dashboard bisa diakses di browser, navigasi antar halaman lancar, dan layout tidak pecah di layar HP.


## PB 03: Video Simulator dan Live Streaming

Priority: Tinggi
Type: Integration
Status: Done
Assigned to: Fathir dan Sultan

Goal: Sistem harus bisa menampilkan feed video kamera gudang secara real time, lengkap dengan bounding box yang menandai hewan yang terdeteksi.

Detail: Backend menggunakan OpenCV untuk capture frame dari kamera, lalu YOLO memproses setiap frame untuk deteksi. Hasilnya dikirim sebagai MJPEG stream ke frontend. Kalau ada hewan terdeteksi, bounding box langsung digambar di frame sebelum dikirim ke client.

Acceptance Criteria: Tombol Start Cam di dashboard bisa mengaktifkan kamera, video tampil lancar, dan bounding box muncul saat ada hewan.


## PB 04: Database Logging untuk Setiap Deteksi

Priority: Tinggi
Type: Backend
Status: Done
Assigned to: Fathir

Goal: Semua event deteksi harus tersimpan di database supaya ada historical record yang bisa diakses kapan saja, bukan cuma real time.

Detail: Setiap kali model mendeteksi hewan, backend otomatis menyimpan data ke SQLite dengan informasi tipe hewan, lokasi zona kamera, timestamp, dan level risiko. Data ini kemudian bisa diambil oleh frontend melalui REST API endpoint.

Acceptance Criteria: Setiap deteksi tercatat di database, bisa dilihat di halaman Detection Logs, dan data bertahan meskipun server di restart.


## PB 05: Sistem Alert dan Notifikasi Cepat

Priority: Sedang
Type: Feature
Status: Done
Assigned to: Misha dan Sultan

Goal: Pekerja gudang butuh peringatan cepat kalau ada hewan berbahaya terdeteksi, terutama ular yang bisa mengancam keselamatan jiwa.

Detail: Sistem membedakan dua tingkat alert. Pertama, Bio Hazard untuk ular yang memicu peringatan darurat. Kedua, Contamination untuk kucing dan cicak yang sifatnya lebih ke risiko pencemaran barang. Alert muncul di Recent Alerts panel secara real time, dan bisa di share ke WhatsApp atau Telegram untuk notifikasi tim lapangan.

Acceptance Criteria: Alert muncul otomatis saat ada deteksi baru, badge risiko tampil dengan benar, dan tombol share berfungsi.


## PB 06: Halaman Risk Analysis dan Executive Summary

Priority: Sedang
Type: Feature
Status: Done
Assigned to: Misha dan Risly

Goal: Manager butuh ringkasan analisis mingguan yang bisa dipresentasikan ke manajemen PT. Kawan Lama, bukan cuma data mentah.

Detail: Halaman Risk Analysis menampilkan chart distribusi risiko per minggu menggunakan Recharts. Ada juga section rapid response protocols yang menjelaskan SOP penanganan untuk setiap tipe hewan. Risly menyusun konten executive summary berdasarkan data riil dari database deteksi.

Acceptance Criteria: Chart menampilkan data mingguan, protokol penanganan jelas terbaca, dan halaman bisa di export atau di screenshot untuk presentasi.


## PB 07: API Endpoint dan Autentikasi JWT

Priority: Tinggi
Type: Backend
Status: Done
Assigned to: Fathir dan Sultan

Goal: Frontend butuh API yang aman untuk mengambil data deteksi, dan sistem harus mencegah akses tidak sah ke kamera dan database.

Detail: Backend menyediakan beberapa endpoint REST melalui FastAPI, termasuk endpoint untuk login, register, mengambil detection logs, dan streaming video. Semua endpoint yang sensitif dilindungi oleh JWT token. Kalau user belum login, request otomatis ditolak oleh server.

Acceptance Criteria: User harus login dulu sebelum bisa akses dashboard, token expired setelah waktu tertentu, dan endpoint kamera tidak bisa diakses tanpa autentikasi.


## PB 08: Filter Objek Cerdas (Whitelist Detection)

Priority: Sedang
Type: Bug Fix / Enhancement
Status: Done
Assigned to: Sultan

Goal: Model YOLO secara default mendeteksi 80 kelas objek termasuk benda mati seperti sofa, tas, dan laptop. Kita perlu filter supaya hanya hewan relevan yang masuk ke log.

Detail: Sultan menambahkan whitelist class di backend yang hanya mengizinkan kelas person, cat, dog, bird, horse, sheep, cow, dan beberapa hewan lain yang relevan. Objek seperti backpack, couch, dan laptop otomatis diabaikan meskipun terdeteksi oleh model. Ini menghilangkan false positive yang bikin log berantakan.

Acceptance Criteria: Hanya hewan dan manusia yang muncul di detection logs. Benda mati tidak lagi tercatat sebagai kontaminasi.


## PB 09: Responsivitas Mobile untuk Semua Perangkat

Priority: Sedang
Type: Frontend
Status: Done
Assigned to: Misha dan Sultan

Goal: Dashboard harus bisa diakses dengan nyaman dari HP pekerja lapangan, bukan cuma dari komputer kantor.

Detail: CSS media queries ditambahkan untuk breakpoint 768px dan 480px. Stat cards yang tadinya grid 4 kolom di desktop berubah jadi stack vertical di mobile. Sidebar menjadi collapsible, dan tombol tombol kontrol kamera tidak terpotong di layar kecil. Testing dilakukan di resolusi iPhone XR sampai Samsung Note series.

Acceptance Criteria: Semua halaman tampil rapi di layar HP tanpa horizontal scroll dan tanpa elemen yang terpotong.


## PB 10: Halaman Settings dan Konfigurasi User

Priority: Rendah
Type: Feature
Status: Done
Assigned to: Misha

Goal: Admin gudang perlu bisa mengatur preferensi dasar seperti dark mode, bahasa notifikasi, dan pengaturan akun dari dalam dashboard.

Detail: Halaman Settings menyediakan toggle untuk dark mode, pengaturan profil user, dan opsi konfigurasi lainnya. Semua perubahan tersimpan di local state dan langsung berpengaruh ke seluruh tampilan dashboard.

Acceptance Criteria: Toggle dark mode berfungsi, perubahan settings langsung terlihat efeknya, dan halaman tidak error saat diakses.
