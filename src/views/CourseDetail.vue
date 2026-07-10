<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth.js'
import { api } from '@/services/api.js'
import { sound } from '@/lib/sound.js'
import CourseCover from '@/components/CourseCover.vue'
import Chip from '@/components/Chip.vue'
import Avatar from '@/components/Avatar.vue'
import Donut from '@/components/Donut.vue'
import { icons } from '@/lib/icons'

const route = useRoute()
const router = useRouter()
const auth = useAuth()
const c = ref(null)
const tab = ref(route.query.tab || 'ikhtisar')
const loading = ref(true)

const tabs = [
  { id: 'ikhtisar', label: 'Ikhtisar', icon: 'LayoutList' },
  { id: 'materi', label: 'Pelajaran', icon: 'GraduationCap' },
  { id: 'pertemuan', label: 'Pertemuan', icon: 'CalendarDays' },
  { id: 'tugas', label: 'Tugas', icon: 'ClipboardList' },
  { id: 'kuis', label: 'Kuis', icon: 'FileQuestion' },
  { id: 'peserta', label: 'Peserta', icon: 'Users' },
]
const matIcon = { pdf: 'FileText', video: 'PlayCircle', slide: 'Presentation', doc: 'FileType' }
const Icon = (n) => icons[n] || icons.Circle
const asgTone = { open: 'warning', submitted: 'info', graded: 'success' }
const asgLabel = { open: 'Belum dikumpulkan', submitted: 'Menunggu nilai', graded: 'Dinilai' }

const openCh = ref({})
const isOpen = (id) => openCh.value[id] !== false
const toggleCh = (id) => { openCh.value[id] = openCh.value[id] === false ? true : false }
const lessonIcon = { video: 'PlayCircle', reading: 'FileText' }

onMounted(async () => {
  c.value = await api.getCourse(route.params.id, auth.user.id)
  loading.value = false
})
async function submit(a) { sound.play('send'); await api.submitAssignment(a.id); a.submitted = true; a.status = 'submitted'; sound.play('success') }
async function toggleLesson(l) {
  const r = await api.toggleLesson(l.id, auth.user.id)
  l.done = r.done
  c.value.progress = r.progress
  c.value.doneLessons += r.done ? 1 : -1
  sound.play(r.done ? 'success' : 'tick')
}
</script>

<template>
  <div v-if="c">
    <button class="btn btn-ghost mb-3 -ml-2" @click="router.back()"><icons.ChevronLeft :size="18"/> Kembali</button>

    <!-- hero -->
    <div class="card overflow-hidden mb-6">
      <CourseCover :color="c.color" :cover="c.cover" :height="130" />
      <div class="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="label-eyebrow" :style="{ color: c.color }">{{ c.code }}</span>
            <Chip :tone="c.category === 'Wajib' ? 'brand' : 'gold'">{{ c.category }}</Chip>
          </div>
          <h1 class="text-2xl font-bold tracking-tight" style="font-family: var(--font-serif)">{{ c.title }}</h1>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted">
            <span class="flex items-center gap-1.5"><Avatar :name="c.dosen?.name" :size="22"/> {{ c.dosen?.name }}</span>
            <span class="flex items-center gap-1.5"><icons.BookMarked :size="15"/> {{ c.sks }} SKS</span>
            <span class="flex items-center gap-1.5"><icons.Users :size="15"/> {{ c.roster.length }} peserta</span>
            <span class="flex items-center gap-1.5"><icons.CalendarRange :size="15"/> {{ c.semester }}</span>
          </div>
        </div>
        <div v-if="auth.role === 'mahasiswa'" class="flex items-center gap-3">
          <Donut :value="c.progress || 0" :size="60" :color="c.color" />
          <div class="text-sm"><div class="font-semibold">Progres kamu</div><div class="text-faint text-xs">Terus lanjutkan!</div></div>
        </div>
      </div>
    </div>

    <!-- tabs -->
    <div class="flex gap-1 overflow-x-auto border-b border-border mb-5">
      <button v-for="t in tabs" :key="t.id" @click="tab = t.id"
        class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors"
        :class="tab === t.id ? 'border-brand-600 text-brand-700 dark:text-brand-600' : 'border-transparent text-muted hover:text-ink'"
        :style="tab === t.id ? 'border-color: var(--brand-600)' : ''">
        <component :is="Icon(t.icon)" :size="16" /> {{ t.label }}
      </button>
    </div>

    <!-- Ikhtisar -->
    <div v-if="tab === 'ikhtisar'" class="grid lg:grid-cols-3 gap-5">
      <div class="lg:col-span-2 card p-5">
        <h3 class="font-semibold mb-2">Deskripsi</h3>
        <p class="text-muted text-[0.92rem] leading-relaxed">{{ c.desc }}</p>
        <h3 class="font-semibold mt-6 mb-3">Pengumuman Terbaru</h3>
        <div class="flex flex-col gap-3">
          <div v-for="an in c.announcements" :key="an.id" class="flex gap-3 p-3 rounded-xl bg-surface-2">
            <span class="grid h-9 w-9 place-items-center rounded-lg shrink-0" style="background: var(--brand-50); color: var(--brand-600)"><icons.Megaphone :size="16"/></span>
            <div><div class="text-[0.88rem] font-semibold">{{ an.title }}</div><p class="text-[0.8rem] text-muted">{{ an.body }}</p></div>
          </div>
          <p v-if="!c.announcements.length" class="text-sm text-faint">Belum ada pengumuman.</p>
        </div>
      </div>
      <div class="card p-5 h-fit">
        <h3 class="font-semibold mb-4">Ringkasan</h3>
        <div class="flex flex-col gap-3 text-sm">
          <div class="flex justify-between"><span class="text-muted">Pelajaran</span><span class="font-semibold num">{{ c.doneLessons }}/{{ c.totalLessons }}</span></div>
          <div class="flex justify-between"><span class="text-muted">Pertemuan</span><span class="font-semibold num">{{ c.meetings.length }}</span></div>
          <div class="flex justify-between"><span class="text-muted">Tugas</span><span class="font-semibold num">{{ c.assignments.length }}</span></div>
          <div class="flex justify-between"><span class="text-muted">Kuis</span><span class="font-semibold num">{{ c.quizzes.length }}</span></div>
        </div>
      </div>
    </div>

    <!-- Pelajaran (Bab → Pelajaran) -->
    <div v-else-if="tab === 'materi'" class="grid lg:grid-cols-3 gap-5">
      <div class="lg:col-span-2 flex flex-col gap-4">
        <div v-for="ch in c.chapters" :key="ch.id" class="card overflow-hidden">
          <button class="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-2/60 transition-colors" @click="toggleCh(ch.id)">
            <span class="grid h-9 w-9 place-items-center rounded-lg shrink-0 text-white text-sm font-bold" :style="{ background: c.color }">
              {{ ch.lessons.filter(l => l.done).length }}/{{ ch.lessons.length }}
            </span>
            <div class="flex-1 min-w-0"><div class="font-semibold truncate">{{ ch.title }}</div>
              <div class="text-[0.74rem] text-faint">{{ ch.lessons.length }} pelajaran</div></div>
            <component :is="isOpen(ch.id) ? icons.ChevronUp : icons.ChevronDown" :size="18" class="text-faint" />
          </button>
          <div v-show="isOpen(ch.id)" class="border-t border-border divide-y divide-border">
            <div v-for="l in ch.lessons" :key="l.id" class="flex items-center gap-3 p-3.5 pl-5 hover:bg-surface-2/40 transition-colors">
              <button @click="auth.role === 'mahasiswa' && toggleLesson(l)"
                class="grid place-items-center h-6 w-6 rounded-full border-2 shrink-0 transition-all"
                :style="l.done ? 'background: var(--success); border-color: var(--success)' : 'border-color: var(--border-strong)'"
                :class="auth.role === 'mahasiswa' ? 'cursor-pointer' : 'cursor-default'">
                <icons.Check v-if="l.done" :size="14" class="text-white" :stroke-width="3" />
              </button>
              <span class="grid h-8 w-8 place-items-center rounded-lg shrink-0" :style="{ background: 'color-mix(in oklab,' + c.color + ' 10%, transparent)', color: c.color }">
                <component :is="Icon(lessonIcon[l.type])" :size="16" />
              </span>
              <div class="flex-1 min-w-0">
                <div class="text-[0.9rem] font-medium truncate" :class="l.done && 'text-muted line-through decoration-1'">{{ l.title }}</div>
                <div class="text-[0.7rem] text-faint capitalize">{{ l.type === 'video' ? 'Video' : 'Bacaan' }} · {{ l.duration }}</div>
              </div>
              <button class="btn btn-ghost px-2.5 shrink-0"><icons.Play :size="15"/></button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <div class="card p-5 text-center">
          <Donut :value="c.progress || 0" :size="96" :stroke="9" :color="c.color" class="mx-auto" />
          <div class="mt-3 font-semibold">{{ c.doneLessons }} dari {{ c.totalLessons }} pelajaran</div>
          <p class="text-sm text-muted">{{ c.progress >= 100 ? 'Selesai! 🎉' : 'Terus lanjutkan belajarmu.' }}</p>
        </div>
        <div v-if="c.materials.length" class="card p-5">
          <h3 class="font-semibold text-[0.95rem] mb-3">Berkas Pendukung</h3>
          <div class="flex flex-col gap-1.5">
            <a v-for="m in c.materials" :key="m.id" class="flex items-center gap-2.5 rounded-lg p-2 hover:bg-surface-2 transition-colors cursor-pointer">
              <component :is="Icon(matIcon[m.type])" :size="16" class="text-faint shrink-0"/>
              <span class="text-[0.82rem] truncate flex-1">{{ m.title }}</span>
              <icons.Download :size="14" class="text-faint shrink-0"/>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Pertemuan -->
    <div v-else-if="tab === 'pertemuan'" class="flex flex-col gap-2.5">
      <div v-for="m in c.meetings" :key="m.id" class="card p-4 flex items-center gap-4">
        <div class="grid place-items-center h-12 w-12 rounded-xl shrink-0 font-bold num" :style="{ background: 'var(--surface-2)' }">
          <span class="text-[0.6rem] text-faint uppercase font-semibold">Minggu</span><span>{{ m.week }}</span>
        </div>
        <div class="min-w-0 flex-1"><div class="font-medium truncate">{{ m.title }}</div>
          <div class="text-[0.76rem] text-faint">{{ m.date }} · {{ m.time }} · {{ m.room }}</div></div>
        <Chip :tone="m.status === 'done' ? 'success' : m.mode === 'Daring' ? 'info' : 'neutral'" dot>
          {{ m.status === 'done' ? 'Selesai' : m.mode }}</Chip>
      </div>
    </div>

    <!-- Tugas -->
    <div v-else-if="tab === 'tugas'" class="flex flex-col gap-2.5">
      <div v-for="a in c.assignments" :key="a.id" class="card p-4 flex items-center gap-4">
        <span class="grid h-11 w-11 place-items-center rounded-xl shrink-0" style="background: var(--warning-soft); color: var(--warning)"><icons.FileText :size="18"/></span>
        <div class="min-w-0 flex-1"><div class="font-medium truncate">{{ a.title }}</div>
          <div class="text-[0.76rem] text-faint">Tenggat {{ a.due }} · {{ a.points }} poin</div></div>
        <Chip :tone="asgTone[a.status]">{{ asgLabel[a.status] }}<template v-if="a.grade"> · {{ a.grade }}</template></Chip>
        <button v-if="auth.role === 'mahasiswa' && !a.submitted" class="btn btn-primary" @click="submit(a)"><icons.Upload :size="15"/> Kumpul</button>
      </div>
    </div>

    <!-- Kuis -->
    <div v-else-if="tab === 'kuis'" class="grid sm:grid-cols-2 gap-4">
      <div v-for="qz in c.quizzes" :key="qz.id" class="card card-hover p-5">
        <div class="flex items-start justify-between mb-3">
          <span class="grid h-11 w-11 place-items-center rounded-xl" style="background: var(--brand-50); color: var(--brand-600)"><icons.FileQuestion :size="20"/></span>
          <Chip tone="neutral">{{ qz.questions.length }} soal</Chip>
        </div>
        <h3 class="font-semibold">{{ qz.title }}</h3>
        <div class="flex items-center gap-3 text-[0.76rem] text-faint mt-1.5">
          <span class="flex items-center gap-1"><icons.Clock :size="13"/> {{ qz.duration }} mnt</span>
          <span class="flex items-center gap-1"><icons.Target :size="13"/> Lulus ≥ {{ qz.passMark }}</span>
        </div>
        <button class="btn btn-primary w-full mt-4" @click="router.push('/quizzes/' + qz.id)"><icons.Play :size="15"/> Kerjakan</button>
      </div>
      <p v-if="!c.quizzes.length" class="text-sm text-faint">Belum ada kuis.</p>
    </div>

    <!-- Peserta -->
    <div v-else-if="tab === 'peserta'" class="card divide-y divide-border">
      <div v-for="s in c.roster" :key="s.id" class="p-4 flex items-center gap-3">
        <Avatar :name="s.name" :size="38" />
        <div class="min-w-0 flex-1"><div class="font-medium text-[0.9rem] truncate">{{ s.name }}</div>
          <div class="text-[0.74rem] text-faint">{{ s.nim || s.email }}</div></div>
        <div v-if="s.progress != null" class="w-28 hidden sm:block">
          <div class="h-1.5 rounded-full bg-surface-2 overflow-hidden"><div class="h-full rounded-full" :style="{ width: s.progress + '%', background: c.color }"></div></div>
        </div>
        <span v-if="s.progress != null" class="num text-sm font-semibold w-10 text-right">{{ s.progress }}%</span>
      </div>
    </div>
  </div>
</template>
