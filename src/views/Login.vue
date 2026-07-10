<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/stores/auth.js'
import { useUI } from '@/stores/ui.js'
import { sound } from '@/lib/sound.js'
import AtomicBackground from '@/components/AtomicBackground.vue'
import AuroraBackground from '@/components/AuroraBackground.vue'
import * as icons from 'lucide-vue-next'

const auth = useAuth()
const ui = useUI()
const router = useRouter()
const route = useRoute()

const email = ref('rangga@student.cendekia.ac.id')
const password = ref('demo')
const showPass = ref(false)

async function submit() {
  try {
    await auth.login(email.value)
    sound.play('login')
    router.push(route.query.r || '/dashboard')
  } catch (e) { sound.play('error') }
}

const demos = [
  { role: 'Mahasiswa', email: 'rangga@student.cendekia.ac.id', icon: 'GraduationCap', color: 'var(--brand-600)' },
  { role: 'Dosen', email: 'bagus@cendekia.ac.id', icon: 'Presentation', color: 'var(--success)' },
  { role: 'Admin', email: 'admin@cendekia.ac.id', icon: 'ShieldCheck', color: 'var(--gold)' },
]
async function quick(d) { email.value = d.email; await submit() }

const highlights = [
  { icon: 'BookOpen', t: 'Kelola mata kuliah, materi & pertemuan dalam satu tempat.' },
  { icon: 'FileQuestion', t: 'Kuis otomatis ternilai dengan analitik hasil.' },
  { icon: 'Award', t: 'Sertifikat & transkrip digital saat mahasiswa lulus.' },
]
const Icon = (n) => icons[n] || icons.Circle
</script>

<template>
  <div class="min-h-screen grid lg:grid-cols-2 bg-surface">
    <!-- Brand panel -->
    <div class="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 text-white"
         style="background: linear-gradient(150deg, #241f5e, var(--brand-900) 55%, #0e0b2e)">
      <svg class="absolute inset-0 h-full w-full opacity-[0.08]" preserveAspectRatio="none" viewBox="0 0 400 400">
        <defs><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0 L0 0 0 28" fill="none" stroke="white" stroke-width="0.6"/></pattern></defs>
        <rect width="400" height="400" fill="url(#grid)"/>
      </svg>
      <AtomicBackground :opacity="0.9" :density="1.05" :atoms="3" :neurons="16"
        :primary="[150, 146, 255]" :accent="[95, 214, 238]" />
      <!-- legibility scrim: darkens the text side while keeping the art visible -->
      <div class="absolute inset-0" style="background: linear-gradient(100deg, rgba(9,7,34,0.62) 0%, rgba(9,7,34,0.28) 46%, rgba(9,7,34,0) 72%)"></div>
      <div class="absolute -right-24 -top-24 h-80 w-80 rounded-full" style="background: rgba(255,255,255,.05)"></div>

      <div class="relative flex items-center gap-3">
        <div class="grid h-11 w-11 place-items-center rounded-xl bg-white/15 backdrop-blur">
          <svg viewBox="0 0 32 32" class="h-6 w-6"><path d="M16 6 L27 11 L16 16 L5 11 Z" fill="white"/><path d="M9 14 L9 20 Q16 24 23 20 L23 14" fill="none" stroke="white" stroke-width="1.8"/></svg>
        </div>
        <div>
          <div class="text-xl font-bold" style="font-family: var(--font-serif)">Cendekia</div>
          <div class="text-[0.68rem] uppercase tracking-widest text-white/70">Learning Management System</div>
        </div>
      </div>

      <div class="relative max-w-md">
        <h1 class="text-[2.6rem] leading-[1.1] font-bold text-balance" style="font-family: var(--font-serif)">
          Ruang belajar kampus yang modern &amp; menyenangkan.
        </h1>
        <p class="mt-4 text-white/85 text-[1.02rem] leading-relaxed">
          Satu platform untuk mahasiswa, dosen, dan admin — dari presensi sampai sertifikat.
        </p>
        <ul class="mt-8 flex flex-col gap-3.5">
          <li v-for="h in highlights" :key="h.t" class="flex items-center gap-3">
            <span class="grid h-9 w-9 place-items-center rounded-lg bg-white/12 shrink-0">
              <component :is="Icon(h.icon)" :size="18" />
            </span>
            <span class="text-white/90 text-[0.95rem]">{{ h.t }}</span>
          </li>
        </ul>
      </div>

      <div class="relative text-white/55 text-sm">© 2026 Cendekia · Dibangun dengan Vue + Vite + Tailwind</div>
    </div>

    <!-- Form panel -->
    <div class="relative flex items-center justify-center p-6 sm:p-10 overflow-hidden bg-surface">
      <div class="absolute inset-0" :class="ui.dark ? 'opacity-70' : 'opacity-90'"><AuroraBackground :dark="ui.dark" /></div>
      <AtomicBackground :opacity="ui.dark ? 0.4 : 0.28" :density="0.55" :atoms="2" :neurons="9"
        :primary="ui.dark ? [140, 138, 245] : [116, 110, 222]" :accent="ui.dark ? [80, 205, 230] : [80, 165, 205]" />
      <div class="relative z-10 w-full max-w-sm">
        <div class="lg:hidden flex items-center gap-2.5 mb-8">
          <div class="grid h-10 w-10 place-items-center rounded-xl" style="background: var(--brand-600)">
            <svg viewBox="0 0 32 32" class="h-5 w-5"><path d="M16 6 L27 11 L16 16 L5 11 Z" fill="white"/></svg>
          </div>
          <span class="text-lg font-bold" style="font-family: var(--font-serif)">Cendekia</span>
        </div>

        <p class="label-eyebrow mb-2">Selamat datang kembali</p>
        <h2 class="text-2xl font-bold tracking-tight mb-1" style="font-family: var(--font-serif)">Masuk ke akunmu</h2>
        <p class="text-muted text-sm mb-7">Gunakan email kampus untuk mengakses ruang belajar.</p>

        <form @submit.prevent="submit" class="flex flex-col gap-4">
          <label class="block">
            <span class="text-[0.82rem] font-medium text-muted mb-1.5 block">Email</span>
            <div class="relative">
              <icons.Mail :size="17" class="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
              <input v-model="email" type="email" class="input pl-10" placeholder="nama@cendekia.ac.id" required />
            </div>
          </label>
          <label class="block">
            <span class="text-[0.82rem] font-medium text-muted mb-1.5 block">Kata sandi</span>
            <div class="relative">
              <icons.Lock :size="17" class="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
              <input v-model="password" :type="showPass ? 'text' : 'password'" class="input pl-10 pr-10" placeholder="••••••••" />
              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted" @click="showPass = !showPass">
                <component :is="showPass ? icons.EyeOff : icons.Eye" :size="17" />
              </button>
            </div>
          </label>

          <p v-if="auth.error" class="chip text-danger" style="background: var(--danger-soft)">
            <icons.AlertCircle :size="14" /> {{ auth.error }}
          </p>

          <button type="submit" class="btn btn-primary w-full mt-1" :disabled="auth.loading">
            <icons.Loader2 v-if="auth.loading" :size="18" class="animate-spin" />
            <span>{{ auth.loading ? 'Memproses…' : 'Masuk' }}</span>
            <icons.ArrowRight v-if="!auth.loading" :size="17" />
          </button>
        </form>

        <div class="my-6 flex items-center gap-3 text-faint text-xs">
          <div class="h-px flex-1 bg-border"></div>
          <span>atau coba sebagai</span>
          <div class="h-px flex-1 bg-border"></div>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <button v-for="d in demos" :key="d.role" @click="quick(d)"
            class="card card-hover flex flex-col items-center gap-1.5 py-3.5 px-1 text-xs font-semibold">
            <span class="grid h-9 w-9 place-items-center rounded-lg" :style="{ background: 'color-mix(in oklab,' + d.color + ' 14%, transparent)', color: d.color }">
              <component :is="Icon(d.icon)" :size="18" />
            </span>
            {{ d.role }}
          </button>
        </div>
        <p class="text-center text-[0.72rem] text-faint mt-4">Mode demo — sandi apa pun diterima.</p>
      </div>
    </div>
  </div>
</template>
