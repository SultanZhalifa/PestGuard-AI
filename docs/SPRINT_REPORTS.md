# Sprint Reports

Project: Smart Warehouse Bio Hazard and Pest Detection
Group: 5


## Sprint 1 (Minggu ke 1): Fondasi Project dan Persiapan Data

### Sprint Goal
Menyiapkan fondasi teknis project dari nol. Ini mencakup inisialisasi repository, setup environment pengembangan, pengumpulan dataset gambar hewan, dan pembuatan kerangka awal dashboard. Di akhir sprint ini kita harus punya project yang bisa dijalankan di local meskipun belum ada fitur lengkap.

### Task Distribution

Risly mendokumentasikan protokol mitigasi risiko untuk setiap jenis hewan. Dia riset tentang bahaya ular di lingkungan gudang dan bagaimana SOP penanganannya di industri logistik. Outputnya jadi acuan untuk konten yang ditampilkan di halaman Risk Analysis.

Sultan melakukan setup awal project, mulai dari membuat React app dengan Vite, mengkonfigurasi struktur folder, membuat Python virtual environment untuk backend, dan menyiapkan file konfigurasi dasar seperti vite.config.js dan requirements.txt.

Fathir fokus ke pengumpulan dataset. Dia mengunduh gambar ular, kucing, dan cicak dari berbagai sumber, lalu melakukan anotasi manual untuk training YOLO. Total sekitar 1000 gambar berhasil dikumpulkan dan dianotasi di minggu pertama.

Misha membangun kerangka awal React, termasuk Sidebar navigation, routing antar halaman, dan layout dasar untuk Live Monitor. Dia juga sudah membuat komponen placeholder untuk video player dan alert list.

### Progress yang Sudah Selesai
Project React dan backend FastAPI sudah bisa dijalankan di local. Dataset 1000 gambar sudah terkumpul dan siap untuk training. Layout dashboard sudah responsive secara dasar dengan empat halaman yang bisa dinavigasi.

### Challenges
Mencari gambar cicak yang berkualitas tinggi di konteks gudang ternyata susah. Kebanyakan gambar yang ada di internet itu cicak di dinding rumah dengan pencahayaan bagus, bukan di lingkungan gelap seperti gudang.

### Solutions
Fathir melakukan data augmentation dengan mengubah brightness dan kontras gambar supaya menyimulasikan kondisi gudang yang minim cahaya. Sultan juga bantu cariin video CCTV gudang di YouTube sebagai referensi tambahan.

### Plan untuk Sprint 2
Mulai training model YOLO dengan dataset yang sudah ada. Fathir akan membangun backend endpoint untuk video streaming. Misha akan mulai mengintegrasikan video player di frontend.


---


## Sprint 2 (Minggu ke 2): Training Model dan Integrasi Video

### Sprint Goal
Melatih model object detection sampai akurat dan membangun pipeline video streaming dari backend ke frontend. Di akhir sprint ini, dashboard harus bisa menampilkan video feed dari kamera dengan bounding box yang muncul otomatis saat ada hewan terdeteksi.

### Task Distribution

Risly melakukan review terhadap threshold confidence yang dipakai model. Dia menguji beberapa skenario deteksi dan memberikan feedback soal mana yang terlalu sensitif (banyak false positive) dan mana yang kurang sensitif (hewan tidak terdeteksi).

Sultan membantu Fathir mengoptimasi script OpenCV untuk pemrosesan video. Dia juga yang meriset dan mengimplementasikan arsitektur MJPEG streaming supaya video bisa dikirim dari Python ke React tanpa latency tinggi.

Fathir melatih model YOLOv11 Nano dan membangun endpoint FastAPI yang menerima request dari frontend, memproses frame video, dan mengembalikan hasilnya sebagai stream. Dia juga membuat endpoint REST untuk login dan pengambilan data deteksi.

Misha menghubungkan komponen video player di React ke endpoint backend. Dia juga membuat stat cards untuk Command Center yang menampilkan jumlah zona aman, aktif, total log, dan kecepatan AI engine secara real time.

### Progress yang Sudah Selesai
Model terlatih dengan akurasi yang cukup untuk demo. Video streaming berjalan dari backend ke frontend. Stat cards sudah menampilkan data dinamis. Sistem login dengan JWT sudah berfungsi.

### Challenges
Saat pertama kali mencoba kirim video frame yang sudah diproses dari FastAPI ke React, terjadi lag yang sangat parah. Setiap frame butuh waktu lama untuk sampai ke browser dan hasilnya video terlihat patah patah.

### Solutions
Sultan dan Misha memutuskan untuk mengganti pendekatan dari REST polling (frontend terus menerus minta frame baru) ke MJPEG streaming (backend terus mengirim frame sebagai continuous stream). Perubahan ini menghilangkan overhead request response dan membuat video jauh lebih lancar.

### Plan untuk Sprint 3
Implementasi alert system dan notifikasi. Membuat halaman Risk Analysis dengan chart. Final polish untuk UI dan bug fixing sebelum demo hackathon.


---


## Sprint 3 (Minggu ke 3): Alert System, Polish, dan Persiapan Demo

### Sprint Goal
Menyelesaikan semua fitur yang tersisa, memperbaiki bug, memoles tampilan UI supaya production ready, dan mempersiapkan seluruh materi untuk presentasi hackathon.

### Task Distribution

Risly menyusun Executive Summary berdasarkan data deteksi riil dari database. Dia juga menyiapkan slide presentasi dan memastikan pitch script sudah mencakup semua poin penting yang diminta juri.

Sultan melakukan bug testing menyeluruh di semua halaman. Dia menemukan dan memperbaiki beberapa masalah, termasuk objek benda mati seperti sofa dan tas yang masuk ke detection log sebagai kontaminasi. Solusinya adalah menambahkan whitelist filter di backend. Sultan juga mengurus final polish untuk tampilan UI supaya konsisten di semua halaman.

Fathir mengimplementasikan database logging otomatis untuk setiap event deteksi. Setiap kali model mendeteksi sesuatu, data langsung disimpan ke SQLite dengan informasi lengkap (tipe, lokasi, waktu, risiko). Dia juga menambahkan cooldown timer supaya satu objek yang sama tidak di log berulang kali dalam waktu singkat.

Misha membangun halaman Risk Analysis dengan chart distribusi risiko mingguan menggunakan Recharts. Dia juga membuat sistem alert visual dengan badge warna yang berbeda untuk Bio Hazard dan Contamination, serta tombol share ke WhatsApp dan Telegram.

### Progress yang Sudah Selesai
Seluruh fitur sudah selesai dan terintegrasi. Alert system berjalan otomatis. Database mencatat setiap deteksi. Dashboard tampil konsisten dan rapi di desktop dan mobile. Pitch script dan slide presentasi sudah final.

### Challenges
Model kadang salah mengenali kabel tebal atau tali sebagai ular. Ini menghasilkan false positive yang bisa merusak kredibilitas demo di depan juri.

### Solutions
Fathir menambahkan lebih banyak negative samples (gambar kabel, tali, selang) ke dataset dan melakukan fine tuning ulang. Hasilnya, false positive berkurang signifikan. Risly juga menambahkan penjelasan di Executive Summary tentang bagaimana tim menangani edge case ini sebagai bukti iterasi dan continuous improvement.


---


## Daily Sprint Log

Selama tiga minggu pengerjaan, tim menjalankan daily standup secara asinkron melalui grup chat. Setiap hari, masing masing anggota mengirimkan update singkat tentang apa yang sudah dikerjakan kemarin, apa yang akan dikerjakan hari ini, dan apakah ada blocker yang menghalangi. Commit dilakukan setiap hari oleh setiap anggota yang aktif coding.

Contoh format daily update yang kami gunakan:

"Kemarin: Selesai bikin endpoint /api/detections buat ambil data log. Hari ini: Mau mulai integrasi sama tabel di frontend. Blocker: Belum ada, lancar."

"Kemarin: Training model batch ke 3 selesai, accuracy naik ke 78 persen. Hari ini: Mau coba augmentasi lagi buat gambar cicak. Blocker: GPU laptop mulai panas, mungkin pindah ke Google Colab."

"Kemarin: Layout halaman Risk Analysis sudah jadi, chart masih dummy. Hari ini: Mau hubungin chart ke data API. Blocker: Endpoint belum ready, tunggu Fathir."

Pola ini membantu kami tetap sinkron meskipun tidak selalu bisa ketemu langsung. Kalau ada blocker yang serius, Sultan sebagai Scrum Master langsung bantu cariin solusi atau redistribusi task supaya tidak ada yang stuck terlalu lama.
