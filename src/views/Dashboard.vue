<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth.js'
import { api } from '@/services/api.js'
import { toast } from '@/lib/toast.js'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import BarChart from '@/components/BarChart.vue'
import Donut from '@/components/Donut.vue'
import Chip from '@/components/Chip.vue'
import Avatar from '@/components/Avatar.vue'
import CourseCover from '@/components/CourseCover.vue'
import { icons } from '@/lib/icons'

const auth = useAuth()
const router = useRouter()
const role = computed(() => auth.role)
const firstName = computed(() => {
  const parts = (auth.user?.name || '').split(' ').filter(Boolean)
  // lewati gelar depan seperti "Dr.", "Prof."
  const skip = /^(dr|prof|ir|drs|dra)\.?$/i
  const first = parts.find((p) => !skip.test(p)) || parts[0] || ''
  return first.replace(/,$/, '')
})

const stats = ref({})
const courses = ref([])
const meetings = ref([])
const assignments = ref([])
const announcements = ref([])
const loading = ref(true)

const greeting = computed(() => {
  const h = 9 // demo fixed morning
  return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : 'Selamat malam'
})

const activityData = [
  { label: 'Sen', value: 3 }, { label: 'Sel', value: 5 }, { label: 'Rab', value: 2 },
  { label: 'Kam', value: 6, highlight: true }, { label: 'Jum', value: 4 },
  { label: 'Sab', value: 1 }, { label: 'Min', value: 0 },
]
const Icon = (n) => icons[n] || icons.Circle
const tagTone = { Tugas: 'brand', Jadwal: 'info', Nilai: 'gold' }

onMounted(async () => {
  const ctx = { userId: auth.user.id, role: role.value }
  const [s, c, m, a, an] = await Promise.all([
    api.stats(ctx),
    api.listCourses(ctx),
    api.listMeetings({ upcoming: true }),
    api.listAssignments(ctx),
    api.listAnnouncements(ctx),
  ])
  stats.value = s; courses.value = c
  meetings.value = m.slice(0, 4)
  assignments.value = a.filter((x) => x.status !== 'graded').slice(0, 4)
  announcements.value = an.slice(0, 4)
  loading.value = false
})
</script>

<template>
  <div>
    <PageHeader :eyebrow="greeting + ',' " :title="firstName + ' 👋'"
      :subtitle="role === 'mahasiswa' ? 'Ini ringkasan belajarmu pekan ini.' : role === 'dosen' ? 'Ringkasan kelas yang kamu ampu.' : 'Ringkasan aktivitas platform.'">
      <template #actions>
        <button class="btn btn-outline" @click="toast('Ringkasan belajarmu sedang disiapkan untuk diunduh.', { type: 'info', title: 'Ekspor dimulai' })">
          <icons.Download :size="16"/> Ekspor
        </button>
        <button class="btn btn-primary" @click="router.push('/courses')"><icons.ArrowUpRight :size="16"/> Buka Kelas</button>
      </template>
    </PageHeader>

    <!-- KPI row -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
      <template v-if="role === 'mahasiswa'">
        <StatCard to="/courses" label="Mata kuliah aktif" :value="stats.courses ?? '—'" icon="BookOpen" tone="brand" :spark="[2,3,3,4,4,4]" />
        <StatCard to="/courses" label="Rata-rata progres" :value="stats.avgProgress ?? 0" suffix="%" icon="TrendingUp" tone="success" delta="8%" :spark="[40,45,52,55,60,stats.avgProgress||60]" />
        <StatCard to="/assignments" label="Tugas belum selesai" :value="stats.tugasOpen ?? 0" icon="ClipboardList" tone="warning" />
        <StatCard to="/grades" label="IPK" :value="stats.ipk ?? '—'" icon="GraduationCap" tone="gold" :spark="[3.4,3.5,3.55,3.6,stats.ipk||3.6]" />
      </template>
      <template v-else-if="role === 'dosen'">
        <StatCard to="/courses" label="Kelas diampu" :value="stats.courses ?? 0" icon="BookOpen" tone="brand" />
        <StatCard to="/courses" label="Total mahasiswa" :value="stats.students ?? 0" icon="Users" tone="info" :spark="[10,12,14,15,16]" />
        <StatCard to="/assignments" label="Perlu dinilai" :value="stats.toGrade ?? 0" icon="ClipboardCheck" tone="warning" />
        <StatCard to="/attendance" label="Pertemuan mendatang" :value="stats.meetings ?? 0" icon="CalendarDays" tone="success" />
      </template>
      <template v-else>
        <StatCard to="/users" label="Total pengguna" :value="stats.users ?? 0" icon="Users" tone="brand" :spark="[6,6,7,8,8,8]" />
        <StatCard to="/users" label="Mahasiswa" :value="stats.mahasiswa ?? 0" icon="GraduationCap" tone="info" />
        <StatCard to="/users" label="Dosen" :value="stats.dosen ?? 0" icon="Presentation" tone="success" />
        <StatCard to="/courses" label="Mata kuliah" :value="stats.courses ?? 0" icon="BookOpen" tone="gold" />
      </template>
    </div>

    <div class="grid gap-5 lg:grid-cols-3">
      <!-- Left / main column -->
      <div class="lg:col-span-2 flex flex-col gap-5">
        <!-- Courses / progress -->
        <section class="card p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-[1.05rem]">{{ role === 'mahasiswa' ? 'Progres Belajar' : 'Kelas Aktif' }}</h3>
            <RouterLink to="/courses" class="text-sm text-brand-700 dark:text-brand-600 font-medium hover:underline">Lihat semua</RouterLink>
          </div>
          <div class="grid sm:grid-cols-2 gap-3">
            <RouterLink v-for="c in courses.slice(0, 4)" :key="c.id" :to="'/courses/' + c.id"
              class="card card-hover overflow-hidden group">
              <CourseCover :color="c.color" :cover="c.cover" :code="c.code" :height="72" />
              <div class="p-3.5">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <div class="font-semibold text-[0.92rem] truncate group-hover:text-brand-700 dark:group-hover:text-brand-600 transition-colors">{{ c.title }}</div>
                    <div class="text-[0.75rem] text-faint truncate">{{ c.dosen?.name || c.students + ' mahasiswa' }}</div>
                  </div>
                  <Donut v-if="role === 'mahasiswa'" :value="c.progress || 0" :size="42" :stroke="5" :color="c.color" />
                </div>
                <div v-if="role !== 'mahasiswa'" class="mt-3 flex items-center gap-3 text-[0.75rem] text-muted">
                  <span class="flex items-center gap-1"><icons.Users :size="13"/> {{ c.students }}</span>
                  <span class="flex items-center gap-1"><icons.BookMarked :size="13"/> {{ c.sks }} SKS</span>
                </div>
              </div>
            </RouterLink>
          </div>
        </section>

        <!-- Activity chart -->
        <section class="card p-5">
          <div class="flex items-center justify-between mb-1">
            <h3 class="font-semibold text-[1.05rem]">Aktivitas Mingguan</h3>
            <Chip tone="success" dot>+12% dari pekan lalu</Chip>
          </div>
          <p class="text-sm text-muted mb-5">Jumlah interaksi belajar per hari.</p>
          <BarChart :data="activityData" :height="150" />
        </section>
      </div>

      <!-- Right column -->
      <div class="flex flex-col gap-5">
        <!-- Upcoming schedule -->
        <section class="card p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-[1.05rem]">Jadwal Terdekat</h3>
            <RouterLink to="/schedule" class="text-brand-700 dark:text-brand-600"><icons.ArrowUpRight :size="16"/></RouterLink>
          </div>
          <div class="flex flex-col gap-1">
            <RouterLink v-for="m in meetings" :key="m.id" :to="m.today ? '/attendance' : '/schedule'"
              class="flex items-center gap-3 rounded-xl -mx-1.5 px-1.5 py-1.5 hover:bg-surface-2 transition-colors">
              <div class="grid place-items-center rounded-xl h-11 w-11 shrink-0 text-center leading-none"
                   :style="{ background: 'color-mix(in oklab,' + m.course.color + ' 12%, transparent)', color: m.course.color }">
                <span class="num text-[0.95rem] font-bold">{{ m.date.slice(8) }}</span>
                <span class="text-[0.55rem] uppercase font-semibold mt-0.5">Jul</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-[0.85rem] font-medium truncate">{{ m.title }}</div>
                <div class="text-[0.72rem] text-faint truncate">{{ m.course.code }} · {{ m.time }} · {{ m.room }}</div>
              </div>
              <Chip :tone="m.today ? 'success' : m.mode === 'Daring' ? 'info' : 'neutral'" :dot="m.today">{{ m.today ? 'Hari ini' : m.mode }}</Chip>
            </RouterLink>
            <p v-if="!meetings.length" class="text-sm text-faint text-center py-4">Tidak ada jadwal.</p>
          </div>
        </section>

        <!-- Assignments due -->
        <section v-if="role !== 'admin'" class="card p-5">
          <h3 class="font-semibold text-[1.05rem] mb-4">{{ role === 'dosen' ? 'Perlu Dinilai' : 'Tugas Mendatang' }}</h3>
          <div class="flex flex-col gap-2">
            <RouterLink v-for="a in assignments" :key="a.id" to="/assignments"
              class="flex items-center gap-3 rounded-xl p-2.5 hover:bg-surface-2 transition-colors">
              <span class="grid h-9 w-9 place-items-center rounded-lg shrink-0" style="background: var(--warning-soft); color: var(--warning)"><icons.FileText :size="16"/></span>
              <div class="min-w-0 flex-1">
                <div class="text-[0.84rem] font-medium truncate">{{ a.title }}</div>
                <div class="text-[0.72rem] text-faint">{{ a.course.code }} · tenggat {{ a.due.slice(5) }}</div>
              </div>
              <Chip :tone="a.submitted ? 'success' : 'warning'">{{ a.submitted ? 'Terkumpul' : 'Belum' }}</Chip>
            </RouterLink>
            <p v-if="!assignments.length" class="text-sm text-faint text-center py-4">Semua beres 🎉</p>
          </div>
        </section>

        <!-- Announcements -->
        <section class="card p-5">
          <h3 class="font-semibold text-[1.05rem] mb-4">Pengumuman</h3>
          <div class="flex flex-col gap-3.5">
            <div v-for="an in announcements" :key="an.id" class="flex gap-3">
              <Avatar :name="an.author?.name" :size="34" />
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-[0.83rem] font-semibold truncate">{{ an.title }}</span>
                  <Chip :tone="tagTone[an.tag] || 'neutral'">{{ an.tag }}</Chip>
                </div>
                <p class="text-[0.78rem] text-muted line-clamp-2 mt-0.5">{{ an.body }}</p>
                <div class="text-[0.68rem] text-faint mt-1">{{ an.course.code }} · {{ an.date.slice(5) }}</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
