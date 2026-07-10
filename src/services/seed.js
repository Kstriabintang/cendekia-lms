// Realistic campus seed data. Structure mirrors the future Supabase schema so the
// mock repository and the real one expose the same shapes.

export const users = [
  { id: 'u-admin', role: 'admin', name: 'Rina Kusuma', email: 'admin@cendekia.ac.id', avatar: null, title: 'Administrator Akademik' },
  { id: 'u-dosen-1', role: 'dosen', name: 'Dr. Bagus Prakoso', email: 'bagus@cendekia.ac.id', avatar: null, title: 'Dosen · Teknik Informatika', nidn: '0812098701' },
  { id: 'u-dosen-2', role: 'dosen', name: 'Siti Anggraini, M.Kom', email: 'siti@cendekia.ac.id', avatar: null, title: 'Dosen · Sistem Informasi', nidn: '0819057503' },
  { id: 'u-mhs-1', role: 'mahasiswa', name: 'Rangga Tassin', email: 'rangga@student.cendekia.ac.id', avatar: null, title: 'Teknik Informatika · Semester 4', nim: '2110511042', prodi: 'Teknik Informatika', ipk: 3.62 },
  { id: 'u-mhs-2', role: 'mahasiswa', name: 'Dewi Lestari', email: 'dewi@student.cendekia.ac.id', avatar: null, nim: '2110511043', prodi: 'Teknik Informatika', ipk: 3.81 },
  { id: 'u-mhs-3', role: 'mahasiswa', name: 'Fajar Nugroho', email: 'fajar@student.cendekia.ac.id', avatar: null, nim: '2110511044', prodi: 'Sistem Informasi', ipk: 3.24 },
]

export const courses = [
  { id: 'mk-1', code: 'IF3201', title: 'Pemrograman Web', sks: 3, dosenId: 'u-dosen-1', semester: 'Genap 2025/2026', category: 'Wajib', color: '#5145e5', desc: 'Membangun aplikasi web modern: HTTP, REST, komponen, state, dan deployment.', cover: 'web' },
  { id: 'mk-2', code: 'IF3105', title: 'Basis Data Lanjut', sks: 3, dosenId: 'u-dosen-1', semester: 'Genap 2025/2026', category: 'Wajib', color: '#12a150', desc: 'Perancangan skema, normalisasi, indexing, transaksi, dan query optimization.', cover: 'db' },
  { id: 'mk-3', code: 'SI2204', title: 'Interaksi Manusia & Komputer', sks: 2, dosenId: 'u-dosen-2', semester: 'Genap 2025/2026', category: 'Wajib', color: '#d99a2b', desc: 'Prinsip usability, desain antarmuka, dan evaluasi pengalaman pengguna.', cover: 'ux' },
  { id: 'mk-4', code: 'IF4302', title: 'Kecerdasan Buatan', sks: 3, dosenId: 'u-dosen-2', semester: 'Genap 2025/2026', category: 'Pilihan', color: '#2f6bec', desc: 'Search, knowledge representation, machine learning dasar, dan etika AI.', cover: 'ai' },
]

// enrollment: which student is in which course
export const enrollments = [
  { id: 'en-1', userId: 'u-mhs-1', courseId: 'mk-1', progress: 67 },
  { id: 'en-2', userId: 'u-mhs-1', courseId: 'mk-2', progress: 40 },
  { id: 'en-3', userId: 'u-mhs-1', courseId: 'mk-3', progress: 100 },
  { id: 'en-4', userId: 'u-mhs-1', courseId: 'mk-4', progress: 25 },
  { id: 'en-5', userId: 'u-mhs-2', courseId: 'mk-1', progress: 74 },
  { id: 'en-6', userId: 'u-mhs-3', courseId: 'mk-1', progress: 55 },
  { id: 'en-7', userId: 'u-mhs-2', courseId: 'mk-3', progress: 90 },
  { id: 'en-8', userId: 'u-mhs-3', courseId: 'mk-4', progress: 33 },
]

// meetings / pertemuan per course.
// `today` marks live sessions eligible for real-time presensi.
// Attendance session fields: sessionOpen, openedAt, code.
export const meetings = [
  { id: 'm-t1', courseId: 'mk-1', week: 8, title: 'Praktikum — Deploy SPA', date: '2026-07-11', time: '08:00', room: 'Lab RPL 2', mode: 'Luring', status: 'upcoming', today: true, sessionOpen: false, openedAt: null, code: null },
  { id: 'm-t2', courseId: 'mk-3', week: 8, title: 'Evaluasi Desain Antarmuka', date: '2026-07-11', time: '10:00', room: 'R. 2.10', mode: 'Luring', status: 'upcoming', today: true, sessionOpen: false, openedAt: null, code: null },
  { id: 'm-t3', courseId: 'mk-2', week: 8, title: 'Latihan Query Optimization', date: '2026-07-11', time: '13:00', room: 'R. 3.04', mode: 'Luring', status: 'upcoming', today: true, sessionOpen: false, openedAt: null, code: null },
  { id: 'm-1', courseId: 'mk-1', week: 9, title: 'State Management & Store', date: '2026-07-14', time: '08:00', room: 'Lab RPL 2', mode: 'Luring', status: 'upcoming' },
  { id: 'm-2', courseId: 'mk-2', week: 9, title: 'Transaksi & Locking', date: '2026-07-14', time: '13:00', room: 'R. 3.04', mode: 'Luring', status: 'upcoming' },
  { id: 'm-3', courseId: 'mk-3', week: 9, title: 'Usability Testing', date: '2026-07-15', time: '10:00', room: 'Daring (Zoom)', mode: 'Daring', status: 'upcoming' },
  { id: 'm-4', courseId: 'mk-1', week: 7, title: 'Komponen & Props', date: '2026-07-07', time: '08:00', room: 'Lab RPL 2', mode: 'Luring', status: 'done' },
  { id: 'm-5', courseId: 'mk-4', week: 8, title: 'Pengantar Machine Learning', date: '2026-07-16', time: '15:00', room: 'R. 4.01', mode: 'Luring', status: 'upcoming' },
]

// Course content structured as Bab (chapter) → Pelajaran (lesson).
// Logic borrowed from Frappe LMS (Course→Chapter→Lesson) + Django LMS lesson tracking.
export const chapters = [
  // Pemrograman Web (mk-1)
  { id: 'ch-1', courseId: 'mk-1', title: 'Bab 1 — Dasar Web Modern', lessons: [
    { id: 'l-101', title: 'HTML Semantik & Struktur', type: 'video', duration: '14 mnt' },
    { id: 'l-102', title: 'CSS Layout: Flexbox & Grid', type: 'video', duration: '18 mnt' },
    { id: 'l-103', title: 'Utility-first dengan Tailwind', type: 'reading', duration: '8 mnt' },
  ] },
  { id: 'ch-2', courseId: 'mk-1', title: 'Bab 2 — Fondasi Vue', lessons: [
    { id: 'l-104', title: 'Reactivity: ref & reactive', type: 'video', duration: '16 mnt' },
    { id: 'l-105', title: 'Komponen, Props & Emit', type: 'video', duration: '20 mnt' },
    { id: 'l-106', title: 'Navigasi dengan Vue Router', type: 'reading', duration: '10 mnt' },
  ] },
  { id: 'ch-3', courseId: 'mk-1', title: 'Bab 3 — State & Integrasi', lessons: [
    { id: 'l-107', title: 'Manajemen State Pinia', type: 'video', duration: '15 mnt' },
    { id: 'l-108', title: 'Konsumsi REST API', type: 'video', duration: '17 mnt' },
    { id: 'l-109', title: 'Build & Deploy SPA', type: 'reading', duration: '9 mnt' },
  ] },
  // Basis Data Lanjut (mk-2)
  { id: 'ch-4', courseId: 'mk-2', title: 'Bab 1 — Perancangan', lessons: [
    { id: 'l-201', title: 'Entity Relationship Diagram', type: 'video', duration: '13 mnt' },
    { id: 'l-202', title: 'Normalisasi 1NF–BCNF', type: 'video', duration: '19 mnt' },
  ] },
  { id: 'ch-5', courseId: 'mk-2', title: 'Bab 2 — Query & Performa', lessons: [
    { id: 'l-203', title: 'SQL Lanjut & Join', type: 'video', duration: '16 mnt' },
    { id: 'l-204', title: 'Strategi Indexing', type: 'reading', duration: '11 mnt' },
    { id: 'l-205', title: 'Transaksi & Locking', type: 'video', duration: '14 mnt' },
  ] },
  // IMK (mk-3)
  { id: 'ch-6', courseId: 'mk-3', title: 'Bab 1 — Prinsip Usability', lessons: [
    { id: 'l-301', title: 'Pengantar Usability', type: 'video', duration: '12 mnt' },
    { id: 'l-302', title: '10 Heuristik Nielsen', type: 'reading', duration: '9 mnt' },
  ] },
  { id: 'ch-7', courseId: 'mk-3', title: 'Bab 2 — Evaluasi', lessons: [
    { id: 'l-303', title: 'Metode Usability Testing', type: 'video', duration: '15 mnt' },
  ] },
  // Kecerdasan Buatan (mk-4)
  { id: 'ch-8', courseId: 'mk-4', title: 'Bab 1 — Pengantar AI', lessons: [
    { id: 'l-401', title: 'Search & Problem Solving', type: 'video', duration: '17 mnt' },
    { id: 'l-402', title: 'Representasi Pengetahuan', type: 'reading', duration: '10 mnt' },
  ] },
  { id: 'ch-9', courseId: 'mk-4', title: 'Bab 2 — Machine Learning', lessons: [
    { id: 'l-403', title: 'Regresi Linear', type: 'video', duration: '18 mnt' },
    { id: 'l-404', title: 'Klasifikasi Dasar', type: 'video', duration: '16 mnt' },
  ] },
]

// per-user lesson completion (starting state for demo mahasiswa u-mhs-1)
export const lessonProgress = [
  // mk-1 → 6/9 (67%)
  { userId: 'u-mhs-1', lessonId: 'l-101' }, { userId: 'u-mhs-1', lessonId: 'l-102' },
  { userId: 'u-mhs-1', lessonId: 'l-103' }, { userId: 'u-mhs-1', lessonId: 'l-104' },
  { userId: 'u-mhs-1', lessonId: 'l-105' }, { userId: 'u-mhs-1', lessonId: 'l-106' },
  // mk-2 → 2/5 (40%)
  { userId: 'u-mhs-1', lessonId: 'l-201' }, { userId: 'u-mhs-1', lessonId: 'l-202' },
  // mk-3 → 3/3 (100%)
  { userId: 'u-mhs-1', lessonId: 'l-301' }, { userId: 'u-mhs-1', lessonId: 'l-302' },
  { userId: 'u-mhs-1', lessonId: 'l-303' },
  // mk-4 → 1/4 (25%)
  { userId: 'u-mhs-1', lessonId: 'l-401' },
]

// materials / materi (berkas unduhan pendukung)
export const materials = [
  { id: 'mat-1', courseId: 'mk-1', title: 'Modul 8 — Pinia & Reactivity', type: 'pdf', size: '2.4 MB', date: '2026-07-08' },
  { id: 'mat-2', courseId: 'mk-1', title: 'Rekaman Kuliah Minggu 7', type: 'video', size: '48 min', date: '2026-07-07' },
  { id: 'mat-3', courseId: 'mk-2', title: 'Slide — Indexing Strategies', type: 'slide', size: '1.1 MB', date: '2026-07-06' },
  { id: 'mat-4', courseId: 'mk-3', title: 'Checklist Heuristik Nielsen', type: 'doc', size: '320 KB', date: '2026-07-05' },
]

// assignments / tugas
export const assignments = [
  { id: 'as-1', courseId: 'mk-1', title: 'Tugas 3 — Mini SPA Katalog', due: '2026-07-13', points: 100, status: 'open', submitted: false },
  { id: 'as-2', courseId: 'mk-2', title: 'ERD & Normalisasi Studi Kasus', due: '2026-07-18', points: 100, status: 'open', submitted: true, grade: null },
  { id: 'as-3', courseId: 'mk-3', title: 'Laporan Usability Test', due: '2026-07-10', points: 100, status: 'graded', submitted: true, grade: 88 },
  { id: 'as-4', courseId: 'mk-1', title: 'Tugas 2 — Layouting Tailwind', due: '2026-06-29', points: 100, status: 'graded', submitted: true, grade: 92 },
]

// quizzes (logic borrowed from Django LMS quiz engine)
export const quizzes = [
  {
    id: 'qz-1', courseId: 'mk-1', title: 'Kuis 2 — Reactivity & Router', passMark: 70, duration: 20, attemptsAllowed: 1,
    questions: [
      { id: 'q1', type: 'mcq', text: 'Fungsi utama Vue Router adalah…', options: ['Manajemen state global', 'Navigasi antar view SPA', 'Styling komponen', 'Fetch data API'], answer: 1, points: 25 },
      { id: 'q2', type: 'mcq', text: 'Di Pinia, tempat menyimpan state adalah…', options: ['mutations', 'reducers', 'state()', 'props'], answer: 2, points: 25 },
      { id: 'q3', type: 'mcq', text: 'Directive untuk two-way binding form adalah…', options: ['v-bind', 'v-model', 'v-for', 'v-once'], answer: 1, points: 25 },
      { id: 'q4', type: 'essay', text: 'Jelaskan singkat perbedaan ref() dan reactive().', points: 25 },
    ],
  },
  {
    id: 'qz-2', courseId: 'mk-2', title: 'Kuis 1 — Normalisasi', passMark: 65, duration: 15, attemptsAllowed: 2,
    questions: [
      { id: 'q1', type: 'mcq', text: 'Bentuk normal yang menghilangkan partial dependency adalah…', options: ['1NF', '2NF', '3NF', 'BCNF'], answer: 1, points: 50 },
      { id: 'q2', type: 'mcq', text: 'Index paling tepat untuk range query adalah…', options: ['Hash', 'B-Tree', 'Bitmap', 'Full-text'], answer: 1, points: 50 },
    ],
  },
]

// attendance / presensi (per meeting, per student)
export const attendance = [
  { id: 'at-1', meetingId: 'm-4', userId: 'u-mhs-1', status: 'hadir', at: '2026-07-07 08:03' },
  { id: 'at-2', meetingId: 'm-4', userId: 'u-mhs-2', status: 'hadir', at: '2026-07-07 08:01' },
  { id: 'at-3', meetingId: 'm-4', userId: 'u-mhs-3', status: 'izin', at: '2026-07-07 07:40' },
]

// grades summary per course for a student
export const grades = [
  { id: 'g-1', userId: 'u-mhs-1', courseId: 'mk-1', tugas: 92, kuis: 78, uts: 80, uas: null, akhir: null, huruf: null },
  { id: 'g-2', userId: 'u-mhs-1', courseId: 'mk-3', tugas: 88, kuis: 85, uts: 82, uas: 86, akhir: 85.4, huruf: 'A' },
  { id: 'g-3', userId: 'u-mhs-1', courseId: 'mk-2', tugas: 75, kuis: 70, uts: 68, uas: null, akhir: null, huruf: null },
]

// certificates
export const certificates = [
  { id: 'cert-1', userId: 'u-mhs-1', courseId: 'mk-3', issued: '2026-06-30', score: 'A', code: 'CDK-3-2026-1042' },
]

// discussion threads / forum
export const discussions = [
  { id: 'd-1', courseId: 'mk-1', authorId: 'u-mhs-2', title: 'Error CORS saat fetch API kampus', body: 'Ada yang tahu cara atasi CORS di dev server Vite? Sudah set proxy tapi masih kena.', date: '2026-07-10', tag: 'Pertanyaan', likes: 7,
    replies: [
      { id: 'r-1', authorId: 'u-dosen-1', body: 'Pakai server.proxy di vite.config, arahkan /api ke backend. Nanti kita bahas di kelas.', date: '2026-07-10' },
      { id: 'r-2', authorId: 'u-mhs-1', body: 'Aku sempat kena juga, solved setelah tambah header di backend.', date: '2026-07-10' },
    ] },
  { id: 'd-2', courseId: 'mk-3', authorId: 'u-mhs-3', title: 'Referensi checklist usability yang enak dipakai?', body: 'Selain Nielsen 10 heuristics, ada rekomendasi lain buat evaluasi UI?', date: '2026-07-09', tag: 'Diskusi', likes: 4,
    replies: [ { id: 'r-3', authorId: 'u-dosen-2', body: 'Coba juga cognitive walkthrough dan SUS untuk skor kuantitatif.', date: '2026-07-09' } ] },
  { id: 'd-3', courseId: 'mk-2', authorId: 'u-mhs-1', title: 'Beda index B-Tree vs Hash untuk range query', body: 'Kenapa B-Tree lebih cocok untuk range query dibanding Hash ya?', date: '2026-07-08', tag: 'Pertanyaan', likes: 5, replies: [] },
]

// gamification points (for leaderboard)
export const points = [
  { userId: 'u-mhs-2', xp: 2480, streak: 12, badges: ['Rajin Absen', 'Kuis Master', 'Aktif Forum'] },
  { userId: 'u-mhs-1', xp: 2135, streak: 8, badges: ['Rajin Absen', 'Tepat Waktu'] },
  { userId: 'u-mhs-3', xp: 1620, streak: 3, badges: ['Pendatang Baru'] },
]

// announcements / activity feed
export const announcements = [
  { id: 'an-1', courseId: 'mk-1', authorId: 'u-dosen-1', title: 'Pengumpulan Tugas 3 diperpanjang', body: 'Deadline Tugas 3 mundur ke Minggu, 13 Juli pukul 23:59.', date: '2026-07-09', tag: 'Tugas' },
  { id: 'an-2', courseId: 'mk-3', authorId: 'u-dosen-2', title: 'Kuliah pekan ini daring', body: 'Pertemuan minggu 8 dilaksanakan via Zoom. Link menyusul di grup.', date: '2026-07-08', tag: 'Jadwal' },
  { id: 'an-3', courseId: 'mk-2', authorId: 'u-dosen-1', title: 'Nilai UTS sudah keluar', body: 'Silakan cek rekap nilai. Sanggah nilai paling lambat 3 hari.', date: '2026-07-07', tag: 'Nilai' },
]
