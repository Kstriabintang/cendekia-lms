import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/stores/auth.js'

const routes = [
  { path: '/login', name: 'login', component: () => import('@/views/Login.vue'), meta: { public: true } },
  {
    path: '/',
    component: () => import('@/layouts/AppShell.vue'),
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'dashboard', component: () => import('@/views/Dashboard.vue'), meta: { title: 'Dashboard', icon: 'LayoutDashboard' } },
      { path: 'courses', name: 'courses', component: () => import('@/views/Courses.vue'), meta: { title: 'Mata Kuliah', icon: 'BookOpen' } },
      { path: 'courses/:id', name: 'course', component: () => import('@/views/CourseDetail.vue'), meta: { title: 'Detail Mata Kuliah', hide: true } },
      { path: 'schedule', name: 'schedule', component: () => import('@/views/Schedule.vue'), meta: { title: 'Jadwal Kuliah', icon: 'CalendarDays' } },
      { path: 'attendance', name: 'attendance', component: () => import('@/views/Attendance.vue'), meta: { title: 'Presensi Langsung', icon: 'ScanLine', roles: ['mahasiswa', 'dosen'] } },
      { path: 'assignments', name: 'assignments', component: () => import('@/views/Assignments.vue'), meta: { title: 'Tugas', icon: 'ClipboardList' } },
      { path: 'discussions', name: 'discussions', component: () => import('@/views/Discussions.vue'), meta: { title: 'Diskusi', icon: 'MessagesSquare' } },
      { path: 'announcements', name: 'announcements', component: () => import('@/views/Announcements.vue'), meta: { title: 'Pengumuman', icon: 'Megaphone' } },
      { path: 'leaderboard', name: 'leaderboard', component: () => import('@/views/Leaderboard.vue'), meta: { title: 'Papan Peringkat', icon: 'Trophy', roles: ['mahasiswa', 'dosen'] } },
      { path: 'quizzes', name: 'quizzes', component: () => import('@/views/Quizzes.vue'), meta: { title: 'Kuis', icon: 'FileQuestion' } },
      { path: 'quizzes/new', name: 'quiz-new', component: () => import('@/views/QuizBuilder.vue'), meta: { title: 'Buat Kuis', hide: true, roles: ['dosen'] } },
      { path: 'quizzes/:id/edit', name: 'quiz-edit', component: () => import('@/views/QuizBuilder.vue'), meta: { title: 'Edit Kuis', hide: true, roles: ['dosen'] } },
      { path: 'quizzes/:id', name: 'quiz', component: () => import('@/views/QuizPlayer.vue'), meta: { title: 'Kerjakan Kuis', hide: true } },
      { path: 'grades', name: 'grades', component: () => import('@/views/Grades.vue'), meta: { title: 'Nilai', icon: 'GraduationCap', roles: ['mahasiswa', 'dosen'] } },
      { path: 'certificates', name: 'certificates', component: () => import('@/views/Certificates.vue'), meta: { title: 'Sertifikat', icon: 'Award', roles: ['mahasiswa'] } },
      { path: 'users', name: 'users', component: () => import('@/views/Users.vue'), meta: { title: 'Manajemen Pengguna', icon: 'Users', roles: ['admin'] } },
      { path: 'profile', name: 'profile', component: () => import('@/views/Profile.vue'), meta: { title: 'Profil Saya', hide: true } },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } },
})

router.beforeEach((to) => {
  const auth = useAuth()
  if (!to.meta.public && !auth.isAuthed) return { name: 'login', query: { r: to.fullPath } }
  if (to.name === 'login' && auth.isAuthed) return { name: 'dashboard' }
  if (to.meta.roles && auth.role && !to.meta.roles.includes(auth.role)) return { name: 'dashboard' }
  return true
})

export default router
