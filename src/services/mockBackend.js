// In-memory backend seeded from seed.js, persisted to localStorage.
// Exposes the same method surface the real Supabase backend will implement,
// so views never import Supabase directly — they call `api`.

import * as seed from './seed.js'

const KEY = 'cendekia-db-v3'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  const fresh = {
    users: seed.users, courses: seed.courses, enrollments: seed.enrollments,
    meetings: seed.meetings, materials: seed.materials, assignments: seed.assignments,
    quizzes: seed.quizzes, attendance: seed.attendance, grades: seed.grades,
    certificates: seed.certificates, announcements: seed.announcements,
    discussions: seed.discussions, points: seed.points,
    chapters: seed.chapters, lessonProgress: seed.lessonProgress,
    quizAttempts: [],
  }
  persist(fresh)
  return fresh
}
function persist(db) { try { localStorage.setItem(KEY, JSON.stringify(db)) } catch (e) {} }

let db = load()
const wait = (ms = 120) => new Promise((r) => setTimeout(r, ms))
const clone = (v) => JSON.parse(JSON.stringify(v))
const uid = (p) => p + '-' + Math.random().toString(36).slice(2, 9)
const nowStr = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function userById(id) { return db.users.find((u) => u.id === id) }
function courseById(id) { return db.courses.find((c) => c.id === id) }
function lessonDone(userId, lessonId) { return !!db.lessonProgress.find((p) => p.userId === userId && p.lessonId === lessonId) }
function courseLessons(courseId) { return (db.chapters || []).filter((c) => c.courseId === courseId).flatMap((c) => c.lessons) }
// progress derived from completed lessons when a course has chapters; else stored enrollment value
function computeProgress(courseId, userId) {
  const lessons = courseLessons(courseId)
  if (lessons.length && userId) {
    const done = lessons.filter((l) => lessonDone(userId, l.id)).length
    return Math.round((done / lessons.length) * 100)
  }
  const en = db.enrollments.find((e) => e.courseId === courseId && e.userId === userId)
  return en ? en.progress : null
}

export const mockBackend = {
  resetDemo() { localStorage.removeItem(KEY); db = load() },

  async login(email) {
    await wait()
    const u = db.users.find((x) => x.email.toLowerCase() === String(email).toLowerCase())
    if (!u) throw new Error('Email tidak terdaftar')
    return clone(u)
  },

  async listUsers(role) {
    await wait(80)
    return clone(role ? db.users.filter((u) => u.role === role) : db.users)
  },

  // Courses, decorated with dosen + enrollment counts
  async listCourses({ userId, role } = {}) {
    await wait()
    let list = db.courses
    if (role === 'dosen' && userId) list = list.filter((c) => c.dosenId === userId)
    if (role === 'mahasiswa' && userId) {
      const enrolled = db.enrollments.filter((e) => e.userId === userId).map((e) => e.courseId)
      list = list.filter((c) => enrolled.includes(c.id))
    }
    return list.map((c) => {
      const dosen = userById(c.dosenId)
      const students = db.enrollments.filter((e) => e.courseId === c.id).length
      return { ...clone(c), dosen: dosen ? { id: dosen.id, name: dosen.name, title: dosen.title } : null, students, progress: computeProgress(c.id, userId) }
    })
  },

  async getCourse(courseId, userId) {
    await wait()
    const c = courseById(courseId)
    if (!c) throw new Error('Mata kuliah tidak ditemukan')
    const dosen = userById(c.dosenId)
    const roster = db.enrollments.filter((e) => e.courseId === courseId).map((e) => ({ ...clone(userById(e.userId)), progress: e.progress }))
    const chapters = (db.chapters || []).filter((ch) => ch.courseId === courseId).map((ch) => ({
      ...clone(ch),
      lessons: ch.lessons.map((l) => ({ ...clone(l), done: userId ? lessonDone(userId, l.id) : false })),
    }))
    const totalLessons = chapters.reduce((s, ch) => s + ch.lessons.length, 0)
    const doneLessons = chapters.reduce((s, ch) => s + ch.lessons.filter((l) => l.done).length, 0)
    return {
      ...clone(c),
      dosen: dosen ? clone(dosen) : null,
      roster,
      progress: computeProgress(courseId, userId),
      chapters, totalLessons, doneLessons,
      meetings: clone(db.meetings.filter((m) => m.courseId === courseId).sort((a, b) => a.week - b.week)),
      materials: clone(db.materials.filter((m) => m.courseId === courseId)),
      assignments: clone(db.assignments.filter((a) => a.courseId === courseId)),
      quizzes: clone(db.quizzes.filter((q) => q.courseId === courseId)),
      announcements: clone(db.announcements.filter((a) => a.courseId === courseId)),
    }
  },

  async toggleLesson(lessonId, userId) {
    await wait(80)
    const idx = db.lessonProgress.findIndex((p) => p.userId === userId && p.lessonId === lessonId)
    let done
    if (idx >= 0) { db.lessonProgress.splice(idx, 1); done = false }
    else { db.lessonProgress.push({ userId, lessonId }); done = true }
    // sync enrollment.progress with derived value
    const ch = (db.chapters || []).find((c) => c.lessons.some((l) => l.id === lessonId))
    if (ch) {
      const p = computeProgress(ch.courseId, userId)
      const en = db.enrollments.find((e) => e.courseId === ch.courseId && e.userId === userId)
      if (en) en.progress = p
      if (done) { const pt = db.points.find((x) => x.userId === userId); if (pt) pt.xp += 5 }
    }
    persist(db)
    return { done, courseId: ch?.courseId, progress: ch ? computeProgress(ch.courseId, userId) : null }
  },

  async listMeetings({ courseId, upcoming } = {}) {
    await wait(80)
    let list = db.meetings
    if (courseId) list = list.filter((m) => m.courseId === courseId)
    if (upcoming) list = list.filter((m) => m.status === 'upcoming')
    return list.map((m) => ({ ...clone(m), course: clone(courseById(m.courseId)) }))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  },

  async listAssignments({ userId, role, courseId } = {}) {
    await wait(80)
    let list = db.assignments
    if (courseId) list = list.filter((a) => a.courseId === courseId)
    if (role === 'dosen' && userId) {
      const mine = db.courses.filter((c) => c.dosenId === userId).map((c) => c.id)
      list = list.filter((a) => mine.includes(a.courseId))
    }
    if (role === 'mahasiswa' && userId) {
      const enrolled = db.enrollments.filter((e) => e.userId === userId).map((e) => e.courseId)
      list = list.filter((a) => enrolled.includes(a.courseId))
    }
    return list.map((a) => ({ ...clone(a), course: clone(courseById(a.courseId)) }))
  },

  async submitAssignment(assignmentId) {
    await wait()
    const a = db.assignments.find((x) => x.id === assignmentId)
    if (a) { a.submitted = true; if (a.status === 'open') a.status = 'submitted'; persist(db) }
    return clone(a)
  },

  async getQuiz(quizId) {
    await wait()
    const q = db.quizzes.find((x) => x.id === quizId)
    if (!q) throw new Error('Kuis tidak ditemukan')
    return { ...clone(q), course: clone(courseById(q.courseId)) }
  },

  async submitQuiz(quizId, answers, userId) {
    await wait(200)
    const q = db.quizzes.find((x) => x.id === quizId)
    let auto = 0, autoMax = 0
    q.questions.forEach((qq) => {
      if (qq.type === 'mcq') { autoMax += qq.points; if (answers[qq.id] === qq.answer) auto += qq.points }
    })
    const scaled = autoMax ? Math.round((auto / autoMax) * 100) : 0
    const attempt = { id: uid('att'), quizId, userId, answers, autoScore: scaled, passed: scaled >= q.passMark, at: '2026-07-11' }
    db.quizAttempts.push(attempt); persist(db)
    return clone(attempt)
  },

  // Normalize a raw builder payload into a clean, storable quiz.
  // Shared by create & update so both persist the exact same shape the player reads.
  _normalizeQuiz(payload) {
    const questions = (payload.questions || []).map((q, i) => {
      const base = { id: q.id || `q${i + 1}`, type: q.type === 'essay' ? 'essay' : 'mcq', text: (q.text || '').trim(), points: Math.max(1, Number(q.points) || 1) }
      if (base.type === 'mcq') {
        base.options = (q.options || []).map((o) => (o || '').trim()).filter((o, idx) => o !== '' || idx < 2)
        base.answer = Math.min(Math.max(0, Number(q.answer) || 0), base.options.length - 1)
      }
      return base
    })
    return {
      courseId: payload.courseId,
      title: (payload.title || '').trim(),
      passMark: Math.min(100, Math.max(0, Number(payload.passMark) || 0)),
      duration: Math.max(1, Number(payload.duration) || 10),
      attemptsAllowed: Math.max(1, Number(payload.attemptsAllowed) || 1),
      questions,
    }
  },

  async createQuiz(payload) {
    await wait(200)
    const data = mockBackend._normalizeQuiz(payload)
    if (!data.courseId) throw new Error('Mata kuliah wajib dipilih')
    if (!data.title) throw new Error('Judul kuis wajib diisi')
    if (!data.questions.length) throw new Error('Tambahkan minimal satu soal')
    const quiz = { id: uid('qz'), ...data }
    db.quizzes.push(quiz); persist(db)
    return { ...clone(quiz), course: clone(courseById(quiz.courseId)) }
  },

  async updateQuiz(quizId, payload) {
    await wait(200)
    const q = db.quizzes.find((x) => x.id === quizId)
    if (!q) throw new Error('Kuis tidak ditemukan')
    const data = mockBackend._normalizeQuiz(payload)
    if (!data.title) throw new Error('Judul kuis wajib diisi')
    if (!data.questions.length) throw new Error('Tambahkan minimal satu soal')
    Object.assign(q, data)
    persist(db)
    return { ...clone(q), course: clone(courseById(q.courseId)) }
  },

  async deleteQuiz(quizId) {
    await wait(120)
    const i = db.quizzes.findIndex((x) => x.id === quizId)
    if (i >= 0) { db.quizzes.splice(i, 1); persist(db) }
    return true
  },

  async listAnnouncements({ userId, role } = {}) {
    await wait(80)
    let list = db.announcements
    if (role === 'mahasiswa' && userId) {
      const enrolled = db.enrollments.filter((e) => e.userId === userId).map((e) => e.courseId)
      list = list.filter((a) => enrolled.includes(a.courseId))
    }
    return list.map((a) => ({ ...clone(a), course: clone(courseById(a.courseId)), author: clone(userById(a.authorId)) }))
      .sort((a, b) => b.date.localeCompare(a.date))
  },

  async getGrades(userId) {
    await wait()
    return db.grades.filter((g) => g.userId === userId).map((g) => ({ ...clone(g), course: clone(courseById(g.courseId)) }))
  },

  async getAttendance(courseId) {
    await wait()
    const meetings = db.meetings.filter((m) => m.courseId === courseId)
    const roster = db.enrollments.filter((e) => e.courseId === courseId).map((e) => clone(userById(e.userId)))
    return { meetings: clone(meetings), roster, records: clone(db.attendance) }
  },

  async markAttendance(meetingId, userId, status) {
    await wait()
    let rec = db.attendance.find((a) => a.meetingId === meetingId && a.userId === userId)
    if (rec) rec.status = status
    else db.attendance.push({ id: uid('at'), meetingId, userId, status, at: '2026-07-11 08:00' })
    persist(db); return true
  },

  // ---- Live attendance (presensi) ----
  async listTodayMeetings({ userId, role } = {}) {
    await wait(80)
    let list = db.meetings.filter((m) => m.today)
    if (role === 'dosen' && userId) {
      const mine = db.courses.filter((c) => c.dosenId === userId).map((c) => c.id)
      list = list.filter((m) => mine.includes(m.courseId))
    }
    if (role === 'mahasiswa' && userId) {
      const enrolled = db.enrollments.filter((e) => e.userId === userId).map((e) => e.courseId)
      list = list.filter((m) => enrolled.includes(m.courseId))
    }
    return list.map((m) => {
      const course = courseById(m.courseId)
      const roster = db.enrollments.filter((e) => e.courseId === m.courseId).map((e) => clone(userById(e.userId)))
      const present = db.attendance.filter((a) => a.meetingId === m.id)
      const mine = userId ? present.find((a) => a.userId === userId) : null
      return {
        ...clone(m), course: clone(course), rosterCount: roster.length,
        roster: roster.map((s) => ({ ...s, status: (present.find((a) => a.userId === s.id) || {}).status || null, at: (present.find((a) => a.userId === s.id) || {}).at || null })),
        presentCount: present.filter((a) => a.status === 'hadir').length,
        myStatus: mine ? mine.status : null, myAt: mine ? mine.at : null,
      }
    }).sort((a, b) => a.time.localeCompare(b.time))
  },

  async openAttendance(meetingId) {
    await wait(120)
    const m = db.meetings.find((x) => x.id === meetingId)
    if (!m) throw new Error('Pertemuan tidak ditemukan')
    m.sessionOpen = true
    m.code = String(Math.floor(1000 + Math.random() * 9000))
    m.openedAt = nowStr()
    persist(db)
    return clone(m)
  },

  async closeAttendance(meetingId) {
    await wait(100)
    const m = db.meetings.find((x) => x.id === meetingId)
    if (m) { m.sessionOpen = false; persist(db) }
    return clone(m)
  },

  async checkIn(meetingId, userId, code = null) {
    await wait(140)
    const m = db.meetings.find((x) => x.id === meetingId)
    if (!m) throw new Error('Pertemuan tidak ditemukan')
    if (!m.sessionOpen) throw new Error('Sesi presensi belum dibuka dosen')
    if (code != null && String(code) !== String(m.code)) throw new Error('Kode presensi salah')
    let rec = db.attendance.find((a) => a.meetingId === meetingId && a.userId === userId)
    const at = nowStr()
    if (rec) { rec.status = 'hadir'; rec.at = at }
    else db.attendance.push({ id: uid('at'), meetingId, userId, status: 'hadir', at })
    // reward xp
    const p = db.points.find((x) => x.userId === userId)
    if (p) p.xp += 15
    persist(db)
    return { status: 'hadir', at }
  },

  // ---- Discussions / forum ----
  async listDiscussions({ userId, role } = {}) {
    await wait(80)
    let list = db.discussions
    if (role === 'mahasiswa' && userId) {
      const enrolled = db.enrollments.filter((e) => e.userId === userId).map((e) => e.courseId)
      list = list.filter((d) => enrolled.includes(d.courseId))
    }
    return list.map((d) => ({ ...clone(d), course: clone(courseById(d.courseId)), author: clone(userById(d.authorId)), replyCount: d.replies.length }))
      .sort((a, b) => b.date.localeCompare(a.date))
  },

  async getDiscussion(id) {
    await wait(80)
    const d = db.discussions.find((x) => x.id === id)
    if (!d) throw new Error('Diskusi tidak ditemukan')
    return { ...clone(d), course: clone(courseById(d.courseId)), author: clone(userById(d.authorId)),
      replies: d.replies.map((r) => ({ ...clone(r), author: clone(userById(r.authorId)) })) }
  },

  async addReply(discussionId, userId, body) {
    await wait(120)
    const d = db.discussions.find((x) => x.id === discussionId)
    d.replies.push({ id: uid('r'), authorId: userId, body, date: '2026-07-11' })
    const p = db.points.find((x) => x.userId === userId); if (p) p.xp += 10
    persist(db)
    return { ...clone(d.replies.at(-1)), author: clone(userById(userId)) }
  },

  async newDiscussion(courseId, userId, title, body, tag = 'Diskusi') {
    await wait(120)
    const d = { id: uid('d'), courseId, authorId: userId, title, body, date: '2026-07-11', tag, likes: 0, replies: [] }
    db.discussions.unshift(d); persist(db)
    return clone(d)
  },

  // ---- Leaderboard ----
  async leaderboard() {
    await wait(80)
    return db.points.map((p) => ({ ...clone(p), user: clone(userById(p.userId)) }))
      .sort((a, b) => b.xp - a.xp)
  },

  async listCertificates(userId) {
    await wait(80)
    return db.certificates.filter((c) => !userId || c.userId === userId)
      .map((c) => ({ ...clone(c), course: clone(courseById(c.courseId)), user: clone(userById(c.userId)) }))
  },

  // Aggregate stats for dashboards
  async stats({ userId, role }) {
    await wait(80)
    if (role === 'mahasiswa') {
      const en = db.enrollments.filter((e) => e.userId === userId)
      const courses = en.length
      const avgProgress = courses ? Math.round(en.reduce((s, e) => s + (computeProgress(e.courseId, userId) ?? e.progress), 0) / courses) : 0
      const enrolled = en.map((e) => e.courseId)
      const tugasOpen = db.assignments.filter((a) => enrolled.includes(a.courseId) && a.status === 'open' && !a.submitted).length
      const u = userById(userId)
      return { courses, avgProgress, tugasOpen, ipk: u?.ipk ?? null, certs: db.certificates.filter((c) => c.userId === userId).length }
    }
    if (role === 'dosen') {
      const mine = db.courses.filter((c) => c.dosenId === userId)
      const courseIds = mine.map((c) => c.id)
      const students = new Set(db.enrollments.filter((e) => courseIds.includes(e.courseId)).map((e) => e.userId)).size
      const toGrade = db.assignments.filter((a) => courseIds.includes(a.courseId) && a.submitted && (a.grade === null || a.grade === undefined) && a.status !== 'graded').length
      const meetings = db.meetings.filter((m) => courseIds.includes(m.courseId) && m.status === 'upcoming').length
      return { courses: mine.length, students, toGrade, meetings }
    }
    // admin
    return {
      users: db.users.length,
      mahasiswa: db.users.filter((u) => u.role === 'mahasiswa').length,
      dosen: db.users.filter((u) => u.role === 'dosen').length,
      courses: db.courses.length,
    }
  },
}
