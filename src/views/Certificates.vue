<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api.js'
import { useAuth } from '@/stores/auth.js'
import { sound } from '@/lib/sound.js'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import { icons } from '@/lib/icons'

const auth = useAuth()
const certs = ref([])
const active = ref(null)
const loading = ref(true)

function open(c) { active.value = c; sound.play('notify') }

onMounted(async () => { certs.value = await api.listCertificates(auth.user.id); loading.value = false })
</script>

<template>
  <div>
    <PageHeader eyebrow="Pencapaian" title="Sertifikat"
      subtitle="Sertifikat digital yang kamu peroleh setelah menuntaskan mata kuliah." />

    <div v-if="certs.length" class="grid gap-4 sm:grid-cols-2">
      <button v-for="c in certs" :key="c.id" @click="open(c)" class="card card-hover text-left overflow-hidden">
        <div class="p-5 flex items-center gap-4">
          <div class="grid h-14 w-14 place-items-center rounded-xl shrink-0" style="background: var(--gold-soft); color: var(--gold)"><icons.Award :size="28"/></div>
          <div class="min-w-0 flex-1">
            <div class="font-semibold truncate">{{ c.course.title }}</div>
            <div class="text-xs text-faint">{{ c.course.code }} · terbit {{ c.issued }}</div>
          </div>
          <Chip tone="gold" dot>Nilai {{ c.score }}</Chip>
        </div>
      </button>
    </div>
    <div v-else-if="!loading" class="card p-12 text-center text-muted">
      <icons.Award :size="36" class="mx-auto mb-3 text-faint"/> Belum ada sertifikat. Selesaikan mata kuliah untuk mendapatkannya.
    </div>

    <!-- Certificate modal -->
    <transition name="fade">
      <div v-if="active" class="fixed inset-0 z-50 grid place-items-center p-4" @click.self="active = null">
        <div class="absolute inset-0 bg-black/50"></div>
        <div class="relative w-full max-w-2xl">
          <div class="rounded-2xl overflow-hidden shadow-2xl border-[6px]" style="border-color: var(--gold); background: #fbfaf6">
            <div class="relative p-10 text-center" style="color: #2a2a2a">
              <svg class="absolute inset-0 h-full w-full opacity-[0.05]" viewBox="0 0 400 250"><circle cx="200" cy="125" r="120" fill="none" stroke="#5145e5" stroke-width="40"/></svg>
              <div class="relative">
                <div class="flex items-center justify-center gap-2 mb-1">
                  <svg viewBox="0 0 32 32" class="h-8 w-8"><path d="M16 6 L27 11 L16 16 L5 11 Z" fill="#5145e5"/></svg>
                  <span class="text-lg font-bold" style="font-family: var(--font-serif); color:#5145e5">Cendekia</span>
                </div>
                <p class="text-[0.7rem] tracking-[0.3em] uppercase text-neutral-500 mb-6">Sertifikat Penyelesaian</p>
                <p class="text-sm text-neutral-500">Diberikan kepada</p>
                <h2 class="text-3xl font-bold my-2" style="font-family: var(--font-serif)">{{ auth.user?.name }}</h2>
                <p class="text-sm text-neutral-500">atas keberhasilan menuntaskan mata kuliah</p>
                <h3 class="text-xl font-semibold mt-2 mb-6" style="color:#5145e5">{{ active.course.title }}</h3>
                <div class="flex items-center justify-center gap-10 text-sm">
                  <div><div class="font-bold num text-lg">{{ active.score }}</div><div class="text-[0.65rem] uppercase text-neutral-500">Predikat</div></div>
                  <div class="h-10 w-px bg-neutral-300"></div>
                  <div><div class="font-bold num text-lg">{{ active.issued }}</div><div class="text-[0.65rem] uppercase text-neutral-500">Tanggal</div></div>
                </div>
                <p class="mt-6 text-[0.62rem] font-mono text-neutral-400">No. {{ active.code }}</p>
              </div>
            </div>
          </div>
          <div class="flex justify-center gap-3 mt-4">
            <button class="btn btn-outline bg-card" @click="active = null"><icons.X :size="16"/> Tutup</button>
            <button class="btn btn-primary"><icons.Download :size="16"/> Unduh PDF</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
