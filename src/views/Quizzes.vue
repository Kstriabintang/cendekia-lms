<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api.js'
import { useAuth } from '@/stores/auth.js'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import { icons } from '@/lib/icons'
import { toast } from '@/lib/toast.js'

const auth = useAuth()
const quizzes = ref([])
const loading = ref(true)
const confirmId = ref(null)
const deleting = ref(false)

async function load() {
  const list = []
  const cs = await api.listCourses({ userId: auth.user.id, role: auth.role })
  for (const c of cs) {
    const full = await api.getCourse(c.id, auth.user.id)
    full.quizzes.forEach((q) => list.push({ ...q, course: c }))
  }
  quizzes.value = list
  loading.value = false
}

async function doDelete(id) {
  deleting.value = true
  try {
    await api.deleteQuiz(id)
    quizzes.value = quizzes.value.filter((q) => q.id !== id)
    toast('Kuis dihapus', { type: 'success' })
  } catch (e) {
    toast(e.message || 'Gagal menghapus', { type: 'error' })
  } finally {
    deleting.value = false
    confirmId.value = null
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader eyebrow="Evaluasi" title="Kuis"
      :subtitle="auth.role === 'dosen' ? 'Kuis di kelas yang kamu ampu.' : 'Kerjakan kuis dan lihat hasilmu langsung.'">
      <template #actions>
        <RouterLink v-if="auth.role === 'dosen'" to="/quizzes/new" class="btn btn-primary"><icons.Plus :size="16"/> Buat Kuis</RouterLink>
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="q in quizzes" :key="q.id" class="card card-hover p-5 flex flex-col">
        <div class="flex items-start justify-between mb-3">
          <span class="grid h-12 w-12 place-items-center rounded-xl" :style="{ background: 'color-mix(in oklab,' + q.course.color + ' 12%, transparent)', color: q.course.color }">
            <icons.FileQuestion :size="22" />
          </span>
          <Chip tone="neutral">{{ q.questions.length }} soal</Chip>
        </div>
        <div class="label-eyebrow mb-1" :style="{ color: q.course.color }">{{ q.course.code }}</div>
        <h3 class="font-semibold leading-snug flex-1">{{ q.title }}</h3>
        <div class="flex items-center gap-3 text-[0.78rem] text-faint mt-2 mb-4">
          <span class="flex items-center gap-1"><icons.Clock :size="13"/> {{ q.duration }} menit</span>
          <span class="flex items-center gap-1"><icons.Target :size="13"/> Lulus ≥ {{ q.passMark }}</span>
          <span class="flex items-center gap-1"><icons.RefreshCw :size="13"/> {{ q.attemptsAllowed }}×</span>
        </div>

        <!-- dosen: inline delete confirmation -->
        <div v-if="confirmId === q.id" class="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-[0.82rem]">
          <p class="mb-2 font-medium">Hapus kuis ini? Tindakan tak bisa dibatalkan.</p>
          <div class="flex gap-2">
            <button class="btn btn-primary flex-1 !bg-[var(--danger)] hover:!bg-[var(--danger)]" :disabled="deleting" @click="doDelete(q.id)">
              <icons.Loader2 v-if="deleting" :size="14" class="animate-spin" /><icons.Trash2 v-else :size="14" /> Hapus
            </button>
            <button class="btn btn-ghost flex-1" :disabled="deleting" @click="confirmId = null">Batal</button>
          </div>
        </div>

        <template v-else>
          <RouterLink :to="'/quizzes/' + q.id" class="btn btn-primary w-full">
            <icons.Play :size="15"/> {{ auth.role === 'dosen' ? 'Pratinjau' : 'Kerjakan' }}
          </RouterLink>
          <div v-if="auth.role === 'dosen'" class="flex gap-2 mt-2">
            <RouterLink :to="'/quizzes/' + q.id + '/edit'" class="btn btn-outline flex-1"><icons.Pencil :size="14"/> Edit</RouterLink>
            <button class="btn btn-outline text-[var(--danger)] hover:!border-[var(--danger)]" @click="confirmId = q.id"><icons.Trash2 :size="14"/></button>
          </div>
        </template>
      </div>
    </div>
    <div v-if="!loading && !quizzes.length" class="card p-12 text-center text-muted">
      {{ auth.role === 'dosen' ? 'Belum ada kuis. Klik “Buat Kuis” untuk memulai.' : 'Belum ada kuis.' }}
    </div>
  </div>
</template>
