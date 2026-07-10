<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth.js'
import { api } from '@/services/api.js'
import { sound } from '@/lib/sound.js'
import Chip from '@/components/Chip.vue'
import Donut from '@/components/Donut.vue'
import { icons } from '@/lib/icons'

const route = useRoute()
const router = useRouter()
const auth = useAuth()

const quiz = ref(null)
const answers = ref({})
const current = ref(0)
const result = ref(null)
const submitting = ref(false)

const total = computed(() => quiz.value?.questions.length || 0)
const q = computed(() => quiz.value?.questions[current.value])
const answered = computed(() => Object.keys(answers.value).length)
const progress = computed(() => (total.value ? Math.round((answered.value / total.value) * 100) : 0))

onMounted(async () => { quiz.value = await api.getQuiz(route.params.id) })

function pick(qid, i) { answers.value[qid] = i; sound.play('tick') }
function setEssay(qid, e) { answers.value[qid] = e.target.value }
async function finish() {
  submitting.value = true
  sound.play('send')
  result.value = await api.submitQuiz(quiz.value.id, answers.value, auth.user.id)
  submitting.value = false
  sound.play(result.value.passed ? 'success' : 'error')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div v-if="quiz" class="max-w-3xl mx-auto">
    <!-- Result screen -->
    <div v-if="result" class="card p-8 text-center">
      <div class="mx-auto w-fit mb-4">
        <div class="grid place-items-center h-20 w-20 rounded-full mx-auto"
             :style="{ background: result.passed ? 'var(--success-soft)' : 'var(--danger-soft)' }">
          <component :is="result.passed ? icons.PartyPopper : icons.RotateCcw" :size="34"
            :style="{ color: result.passed ? 'var(--success)' : 'var(--danger)' }" />
        </div>
      </div>
      <h2 class="text-2xl font-bold" style="font-family: var(--font-serif)">{{ result.passed ? 'Selamat, kamu lulus!' : 'Belum lulus' }}</h2>
      <p class="text-muted mt-1 mb-6">Skor otomatis (pilihan ganda) dari kuis <b>{{ quiz.title }}</b>.</p>
      <div class="flex items-center justify-center gap-8 mb-8">
        <Donut :value="result.autoScore" :size="120" :stroke="10" :color="result.passed ? 'var(--success)' : 'var(--danger)'" />
        <div class="text-left">
          <div class="text-sm text-muted">Batas lulus</div>
          <div class="num text-2xl font-bold">{{ quiz.passMark }}</div>
          <Chip :tone="result.passed ? 'success' : 'danger'" dot class="mt-2">{{ result.passed ? 'LULUS' : 'MENGULANG' }}</Chip>
        </div>
      </div>
      <p class="text-xs text-faint mb-6">Soal esai dinilai manual oleh dosen dan tidak termasuk skor otomatis.</p>
      <div class="flex gap-3 justify-center">
        <button class="btn btn-outline" @click="router.push('/quizzes')"><icons.List :size="16"/> Daftar Kuis</button>
        <button class="btn btn-primary" @click="router.push('/courses/' + quiz.courseId)"><icons.ArrowRight :size="16"/> Ke Mata Kuliah</button>
      </div>
    </div>

    <!-- Quiz screen -->
    <template v-else>
      <button class="btn btn-ghost mb-3 -ml-2" @click="router.back()"><icons.ChevronLeft :size="18"/> Keluar</button>
      <div class="card p-5 mb-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="label-eyebrow mb-0.5">{{ quiz.course.code }}</div>
            <h1 class="text-xl font-bold" style="font-family: var(--font-serif)">{{ quiz.title }}</h1>
          </div>
          <div class="flex items-center gap-4 text-sm">
            <span class="flex items-center gap-1.5 text-muted"><icons.Clock :size="16"/> {{ quiz.duration }}:00</span>
            <Chip tone="brand">{{ answered }}/{{ total }} terjawab</Chip>
          </div>
        </div>
        <div class="h-1.5 rounded-full bg-surface-2 mt-4 overflow-hidden">
          <div class="h-full rounded-full transition-all duration-500" :style="{ width: progress + '%', background: 'var(--brand-600)' }"></div>
        </div>
      </div>

      <!-- Question -->
      <div class="card p-6 mb-4">
        <div class="flex items-center gap-2 mb-4">
          <span class="grid place-items-center h-7 w-7 rounded-lg text-sm font-bold num" style="background: var(--brand-50); color: var(--brand-600)">{{ current + 1 }}</span>
          <Chip :tone="q.type === 'essay' ? 'gold' : 'neutral'">{{ q.type === 'essay' ? 'Esai' : 'Pilihan Ganda' }}</Chip>
          <span class="ml-auto text-xs text-faint num">{{ q.points }} poin</span>
        </div>
        <p class="text-[1.05rem] font-medium mb-5">{{ q.text }}</p>

        <div v-if="q.type === 'mcq'" class="flex flex-col gap-2.5">
          <button v-for="(opt, i) in q.options" :key="i" @click="pick(q.id, i)"
            class="flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all"
            :class="answers[q.id] === i ? 'border-brand-600' : 'border-border hover:border-border-strong'"
            :style="answers[q.id] === i ? 'border-color: var(--brand-600); background: var(--brand-50)' : ''">
            <span class="grid place-items-center h-6 w-6 rounded-full border-2 shrink-0 text-xs font-bold"
              :style="answers[q.id] === i ? 'background: var(--brand-600); border-color: var(--brand-600); color: #fff' : 'border-color: var(--border-strong)'">
              {{ String.fromCharCode(65 + i) }}
            </span>
            <span class="text-[0.92rem]">{{ opt }}</span>
          </button>
        </div>
        <textarea v-else rows="5" class="input" placeholder="Tulis jawabanmu…"
          :value="answers[q.id] || ''" @input="setEssay(q.id, $event)"></textarea>
      </div>

      <!-- Nav -->
      <div class="flex items-center justify-between gap-3">
        <button class="btn btn-outline" :disabled="current === 0" @click="current--"><icons.ChevronLeft :size="16"/> Sebelumnya</button>
        <div class="flex gap-1.5">
          <button v-for="(qq, i) in quiz.questions" :key="i" @click="current = i"
            class="h-2.5 w-2.5 rounded-full transition-all"
            :style="{ background: i === current ? 'var(--brand-600)' : answers[qq.id] !== undefined ? 'color-mix(in oklab, var(--brand-600) 45%, transparent)' : 'var(--border-strong)' }"></button>
        </div>
        <button v-if="current < total - 1" class="btn btn-primary" @click="current++">Berikutnya <icons.ChevronRight :size="16"/></button>
        <button v-else class="btn btn-primary" :disabled="submitting" @click="finish">
          <icons.Loader2 v-if="submitting" :size="16" class="animate-spin"/><icons.Send v-else :size="16"/> Kumpulkan
        </button>
      </div>
    </template>
  </div>
</template>
