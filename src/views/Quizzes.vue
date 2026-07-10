<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api.js'
import { useAuth } from '@/stores/auth.js'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import { icons } from '@/lib/icons'

const auth = useAuth()
const quizzes = ref([])
const loading = ref(true)

onMounted(async () => {
  const list = []
  const cs = await api.listCourses({ userId: auth.user.id, role: auth.role })
  for (const c of cs) {
    const full = await api.getCourse(c.id, auth.user.id)
    full.quizzes.forEach((q) => list.push({ ...q, course: c }))
  }
  quizzes.value = list
  loading.value = false
})
</script>

<template>
  <div>
    <PageHeader eyebrow="Evaluasi" title="Kuis"
      :subtitle="auth.role === 'dosen' ? 'Kuis di kelas yang kamu ampu.' : 'Kerjakan kuis dan lihat hasilmu langsung.'">
      <template #actions>
        <button v-if="auth.role === 'dosen'" class="btn btn-primary"><icons.Plus :size="16"/> Buat Kuis</button>
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
        <RouterLink :to="'/quizzes/' + q.id" class="btn btn-primary w-full">
          <icons.Play :size="15"/> {{ auth.role === 'dosen' ? 'Pratinjau' : 'Kerjakan' }}
        </RouterLink>
      </div>
    </div>
    <div v-if="!loading && !quizzes.length" class="card p-12 text-center text-muted">Belum ada kuis.</div>
  </div>
</template>
