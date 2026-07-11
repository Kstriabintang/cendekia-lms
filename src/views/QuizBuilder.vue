<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/services/api.js'
import { useAuth } from '@/stores/auth.js'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import { icons } from '@/lib/icons'
import { toast } from '@/lib/toast.js'

const auth = useAuth()
const route = useRoute()
const router = useRouter()

const editId = computed(() => (route.name === 'quiz-edit' ? route.params.id : null))
const isEdit = computed(() => !!editId.value)

const loading = ref(true)
const saving = ref(false)
const courses = ref([])

// local key generator for stable v-for keys while editing
let seq = 0
const key = () => `k${++seq}`

const form = ref({ courseId: '', title: '', duration: 20, passMark: 70, attemptsAllowed: 1, questions: [] })

function blankMcq() {
  return { key: key(), type: 'mcq', text: '', points: 10, options: ['', '', '', ''], answer: 0 }
}
function blankEssay() {
  return { key: key(), type: 'essay', text: '', points: 10 }
}

onMounted(async () => {
  courses.value = await api.listCourses({ userId: auth.user.id, role: auth.role })
  if (isEdit.value) {
    try {
      const q = await api.getQuiz(editId.value)
      // guard: a dosen may only edit quizzes in courses they teach
      if (auth.role === 'dosen' && !courses.value.some((c) => c.id === q.courseId)) {
        toast('Kamu tidak mengampu kelas kuis ini.', { type: 'error' })
        return router.replace('/quizzes')
      }
      form.value = {
        courseId: q.courseId,
        title: q.title,
        duration: q.duration,
        passMark: q.passMark,
        attemptsAllowed: q.attemptsAllowed,
        questions: q.questions.map((qq) =>
          qq.type === 'essay'
            ? { key: key(), type: 'essay', text: qq.text, points: qq.points }
            : { key: key(), type: 'mcq', text: qq.text, points: qq.points, options: [...qq.options], answer: qq.answer },
        ),
      }
    } catch (e) {
      toast(e.message || 'Gagal memuat kuis', { type: 'error' })
      return router.replace('/quizzes')
    }
  } else {
    form.value.courseId = courses.value[0]?.id || ''
    form.value.questions = [blankMcq()]
  }
  loading.value = false
})

const activeCourse = computed(() => courses.value.find((c) => c.id === form.value.courseId) || null)
const totalPoints = computed(() => form.value.questions.reduce((s, q) => s + (Number(q.points) || 0), 0))

// per-question validity, surfaced inline so the user knows exactly what to fix
function questionIssues(q) {
  const issues = []
  if (!q.text.trim()) issues.push('Teks soal masih kosong')
  if (q.type === 'mcq') {
    const filled = q.options.filter((o) => o.trim())
    if (filled.length < 2) issues.push('Minimal 2 opsi terisi')
    if (!q.options[q.answer] || !q.options[q.answer].trim()) issues.push('Pilih jawaban benar')
  }
  return issues
}
const problems = computed(() => {
  const p = []
  if (!form.value.courseId) p.push('Pilih mata kuliah')
  if (!form.value.title.trim()) p.push('Isi judul kuis')
  if (!form.value.questions.length) p.push('Tambahkan minimal satu soal')
  form.value.questions.forEach((q, i) => {
    if (questionIssues(q).length) p.push(`Soal ${i + 1} belum lengkap`)
  })
  return p
})
const valid = computed(() => problems.value.length === 0)

function addMcq() { form.value.questions.push(blankMcq()) }
function addEssay() { form.value.questions.push(blankEssay()) }
function removeQuestion(i) { form.value.questions.splice(i, 1) }
function duplicate(i) {
  const src = form.value.questions[i]
  const copy = JSON.parse(JSON.stringify(src))
  copy.key = key()
  form.value.questions.splice(i + 1, 0, copy)
}
function move(i, dir) {
  const j = i + dir
  if (j < 0 || j >= form.value.questions.length) return
  const arr = form.value.questions
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
}
function setType(q, type) {
  if (q.type === type) return
  q.type = type
  if (type === 'mcq' && !q.options) { q.options = ['', '', '', '']; q.answer = 0 }
}
function addOption(q) { if (q.options.length < 8) q.options.push('') }
function removeOption(q, oi) {
  if (q.options.length <= 2) return
  q.options.splice(oi, 1)
  if (q.answer >= q.options.length) q.answer = q.options.length - 1
  else if (q.answer > oi) q.answer -= 1
}

async function save() {
  if (!valid.value) {
    toast(problems.value[0], { type: 'error' })
    return
  }
  saving.value = true
  const payload = {
    courseId: form.value.courseId,
    title: form.value.title,
    duration: form.value.duration,
    passMark: form.value.passMark,
    attemptsAllowed: form.value.attemptsAllowed,
    questions: form.value.questions.map((q) =>
      q.type === 'essay'
        ? { type: 'essay', text: q.text, points: q.points }
        : { type: 'mcq', text: q.text, points: q.points, options: q.options, answer: q.answer },
    ),
  }
  try {
    if (isEdit.value) {
      await api.updateQuiz(editId.value, payload)
      toast('Kuis berhasil diperbarui', { type: 'success' })
    } else {
      await api.createQuiz(payload)
      toast('Kuis berhasil dibuat', { type: 'success' })
    }
    router.push('/quizzes')
  } catch (e) {
    toast(e.message || 'Gagal menyimpan kuis', { type: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="loading" class="card p-12 text-center text-muted">
    <icons.Loader2 :size="22" class="animate-spin mx-auto mb-2" /> Memuat…
  </div>

  <div v-else>
    <PageHeader
      :eyebrow="isEdit ? 'Edit Evaluasi' : 'Susun Evaluasi'"
      :title="isEdit ? 'Edit Kuis' : 'Buat Kuis Baru'"
      subtitle="Rancang soal pilihan ganda (dinilai otomatis) dan esai (dinilai manual) untuk kelasmu.">
      <template #actions>
        <RouterLink to="/quizzes" class="btn btn-ghost"><icons.ChevronLeft :size="16" /> Kembali</RouterLink>
      </template>
    </PageHeader>

    <div class="grid gap-6 lg:grid-cols-[1fr_20rem] items-start">
      <!-- FORM COLUMN -->
      <div class="space-y-6 min-w-0">
        <!-- Meta -->
        <section class="card p-5 sm:p-6">
          <h2 class="label-eyebrow mb-4">Detail Kuis</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium mb-1.5">Judul Kuis</label>
              <input v-model="form.title" class="input" placeholder="mis. Kuis 3 — Komponen & Props" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium mb-1.5">Mata Kuliah</label>
              <select v-model="form.courseId" class="input" :disabled="isEdit">
                <option value="" disabled>Pilih mata kuliah…</option>
                <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.code }} — {{ c.title }}</option>
              </select>
              <p v-if="!courses.length" class="text-[0.78rem] text-danger mt-1">Kamu belum mengampu mata kuliah apa pun.</p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5">Durasi (menit)</label>
              <input v-model.number="form.duration" type="number" min="1" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5">Nilai Lulus (0–100)</label>
              <input v-model.number="form.passMark" type="number" min="0" max="100" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1.5">Kesempatan Mengerjakan</label>
              <input v-model.number="form.attemptsAllowed" type="number" min="1" class="input" />
            </div>
          </div>
        </section>

        <!-- Questions -->
        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="label-eyebrow">Daftar Soal · {{ form.questions.length }}</h2>
          </div>

          <TransitionGroup name="fade" tag="div" class="space-y-4">
            <article v-for="(q, i) in form.questions" :key="q.key" class="card p-5">
              <!-- question header -->
              <div class="flex items-center justify-between gap-3 mb-4">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--brand-50)] text-[var(--brand-600)] text-sm font-bold num">{{ i + 1 }}</span>
                  <div class="inline-flex rounded-lg border border-[var(--border-strong)] p-0.5 text-sm">
                    <button
                      class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition"
                      :class="q.type === 'mcq' ? 'bg-[var(--brand-600)] text-white dark:text-[#0c0e15]' : 'text-muted hover:text-ink'"
                      @click="setType(q, 'mcq')"><icons.ListChecks :size="14" /> Pilihan Ganda</button>
                    <button
                      class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition"
                      :class="q.type === 'essay' ? 'bg-[var(--brand-600)] text-white dark:text-[#0c0e15]' : 'text-muted hover:text-ink'"
                      @click="setType(q, 'essay')"><icons.AlignLeft :size="14" /> Esai</button>
                  </div>
                </div>
                <div class="flex items-center gap-0.5 shrink-0 text-muted">
                  <button class="grid h-8 w-8 place-items-center rounded-lg hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:hover:bg-transparent" :disabled="i === 0" title="Naikkan" @click="move(i, -1)"><icons.ChevronUp :size="16" /></button>
                  <button class="grid h-8 w-8 place-items-center rounded-lg hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:hover:bg-transparent" :disabled="i === form.questions.length - 1" title="Turunkan" @click="move(i, 1)"><icons.ChevronDown :size="16" /></button>
                  <button class="grid h-8 w-8 place-items-center rounded-lg hover:bg-[var(--surface-2)]" title="Duplikat" @click="duplicate(i)"><icons.Copy :size="15" /></button>
                  <button class="grid h-8 w-8 place-items-center rounded-lg text-[var(--danger)] hover:bg-[var(--danger-soft)]" title="Hapus" @click="removeQuestion(i)"><icons.Trash2 :size="15" /></button>
                </div>
              </div>

              <!-- question text -->
              <textarea v-model="q.text" rows="2" class="input resize-y" placeholder="Tulis pertanyaan…"></textarea>

              <!-- MCQ options -->
              <div v-if="q.type === 'mcq'" class="mt-4 space-y-2">
                <p class="text-[0.78rem] text-faint">Klik lingkaran untuk menandai jawaban benar.</p>
                <div v-for="(opt, oi) in q.options" :key="oi" class="flex items-center gap-2">
                  <button
                    class="grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition"
                    :class="q.answer === oi ? 'border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]' : 'border-[var(--border-strong)] text-faint hover:border-[var(--faint)]'"
                    :title="q.answer === oi ? 'Jawaban benar' : 'Tandai sebagai benar'"
                    @click="q.answer = oi">
                    <icons.CheckCircle2 v-if="q.answer === oi" :size="18" />
                    <icons.Circle v-else :size="18" />
                  </button>
                  <input v-model="q.options[oi]" class="input" :placeholder="`Opsi ${oi + 1}`" />
                  <button
                    class="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-faint hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-faint"
                    :disabled="q.options.length <= 2" title="Hapus opsi" @click="removeOption(q, oi)"><icons.X :size="16" /></button>
                </div>
                <button v-if="q.options.length < 8" class="btn btn-ghost text-sm" @click="addOption(q)"><icons.Plus :size="15" /> Tambah opsi</button>
              </div>
              <div v-else class="mt-3 rounded-lg border border-dashed border-[var(--border-strong)] p-3 text-[0.82rem] text-muted flex items-center gap-2">
                <icons.PenLine :size="15" /> Jawaban esai dinilai manual oleh dosen setelah dikumpulkan.
              </div>

              <!-- points -->
              <div class="mt-4 flex items-center gap-2">
                <label class="text-sm text-muted">Poin</label>
                <input v-model.number="q.points" type="number" min="1" class="input !w-24" />
                <span v-if="questionIssues(q).length" class="ml-auto text-[0.78rem] text-[var(--warning)] flex items-center gap-1 text-right">
                  <icons.AlertCircle :size="14" /> {{ questionIssues(q)[0] }}
                </span>
              </div>
            </article>
          </TransitionGroup>

          <div class="flex flex-wrap gap-2">
            <button class="btn btn-outline" @click="addMcq"><icons.ListChecks :size="16" /> Soal Pilihan Ganda</button>
            <button class="btn btn-outline" @click="addEssay"><icons.AlignLeft :size="16" /> Soal Esai</button>
          </div>
        </section>
      </div>

      <!-- SUMMARY / ACTIONS (sticky on desktop) -->
      <aside class="card p-5 lg:sticky lg:top-20 space-y-4">
        <h2 class="label-eyebrow">Ringkasan</h2>
        <div class="flex items-center gap-3">
          <span class="grid h-11 w-11 place-items-center rounded-xl"
            :style="activeCourse ? { background: 'color-mix(in oklab,' + activeCourse.color + ' 12%, transparent)', color: activeCourse.color } : {}">
            <icons.FileQuestion :size="22" />
          </span>
          <div class="min-w-0">
            <p class="font-semibold truncate">{{ form.title || 'Kuis tanpa judul' }}</p>
            <p class="text-[0.8rem] text-faint truncate">{{ activeCourse ? activeCourse.code + ' · ' + activeCourse.title : 'Belum ada mata kuliah' }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-center">
          <div class="rounded-xl bg-[var(--surface-2)] p-3">
            <div class="text-xl font-bold num">{{ form.questions.length }}</div>
            <div class="text-[0.7rem] text-faint uppercase tracking-wide">Soal</div>
          </div>
          <div class="rounded-xl bg-[var(--surface-2)] p-3">
            <div class="text-xl font-bold num">{{ totalPoints }}</div>
            <div class="text-[0.7rem] text-faint uppercase tracking-wide">Total Poin</div>
          </div>
        </div>

        <div class="flex flex-wrap gap-1.5">
          <Chip tone="neutral"><icons.Clock :size="13" /> {{ form.duration }} mnt</Chip>
          <Chip tone="neutral"><icons.Target :size="13" /> Lulus ≥ {{ form.passMark }}</Chip>
          <Chip tone="neutral"><icons.RefreshCw :size="13" /> {{ form.attemptsAllowed }}×</Chip>
        </div>

        <div v-if="!valid" class="rounded-xl border border-[var(--warning)] bg-[var(--warning-soft)] p-3 text-[0.8rem]">
          <p class="font-semibold flex items-center gap-1.5 mb-1"><icons.AlertCircle :size="14" /> Belum siap disimpan</p>
          <ul class="list-disc pl-4 space-y-0.5 text-muted">
            <li v-for="p in problems.slice(0, 4)" :key="p">{{ p }}</li>
          </ul>
        </div>

        <div class="flex flex-col gap-2 pt-1">
          <button class="btn btn-primary w-full" :disabled="!valid || saving" @click="save">
            <icons.Loader2 v-if="saving" :size="16" class="animate-spin" />
            <icons.Save v-else :size="16" />
            {{ isEdit ? 'Simpan Perubahan' : 'Simpan Kuis' }}
          </button>
          <RouterLink to="/quizzes" class="btn btn-ghost w-full">Batal</RouterLink>
        </div>
      </aside>
    </div>
  </div>
</template>
