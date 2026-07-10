<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { api } from '@/services/api.js'
import { useAuth } from '@/stores/auth.js'
import { sound } from '@/lib/sound.js'
import { toast } from '@/lib/toast.js'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import Avatar from '@/components/Avatar.vue'
import { icons } from '@/lib/icons'

const auth = useAuth()
const meetings = ref([])
const loading = ref(true)
const busy = ref(null)
const err = ref('')
const clock = ref('')
let poll, ticker

function fmtClock() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  clock.value = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}
async function refresh() {
  meetings.value = await api.listTodayMeetings({ userId: auth.user.id, role: auth.role })
  loading.value = false
}

async function open(m) {
  busy.value = m.id
  await api.openAttendance(m.id); sound.play('success')
  toast('Presensi ' + m.course.code + ' dibuka. Mahasiswa kini bisa check-in.', { type: 'success', title: 'Sesi dibuka' })
  await refresh(); busy.value = null
}
async function close(m) {
  busy.value = m.id
  await api.closeAttendance(m.id); sound.play('click')
  await refresh(); busy.value = null
}
async function checkIn(m) {
  err.value = ''; busy.value = m.id
  try {
    await api.checkIn(m.id, auth.user.id)
    sound.play('success')
    toast('Kehadiranmu di ' + m.course.code + ' tercatat.', { type: 'success', title: 'Check-in berhasil' })
    await refresh()
  } catch (e) { err.value = e.message; sound.play('error'); toast(e.message, { type: 'error' }) }
  busy.value = null
}

onMounted(() => {
  fmtClock(); refresh()
  ticker = setInterval(fmtClock, 1000)
  poll = setInterval(refresh, 4000) // auto-sync sesi yang dibuka dosen
})
onBeforeUnmount(() => { clearInterval(poll); clearInterval(ticker) })

const anyToday = computed(() => meetings.value.length > 0)
</script>

<template>
  <div>
    <PageHeader eyebrow="Kelas hari ini · 11 Juli 2026" title="Presensi Langsung"
      :subtitle="auth.role === 'dosen' ? 'Buka sesi presensi saat kelas dimulai — mahasiswa hanya bisa absen setelah kamu membukanya.' : 'Absen kehadiranmu saat dosen membuka sesi presensi.'">
      <template #actions>
        <div class="flex items-center gap-2 card px-4 py-2">
          <icons.Clock :size="18" class="text-brand-700 dark:text-brand-600" />
          <span class="num font-bold tracking-wider tabular-nums" style="font-family: var(--font-serif)">{{ clock }}</span>
          <span class="text-xs text-faint">WIB</span>
        </div>
      </template>
    </PageHeader>

    <div v-if="!anyToday && !loading" class="card p-12 text-center text-muted">
      <icons.CalendarOff :size="36" class="mx-auto mb-3 text-faint" />
      Tidak ada kelas terjadwal hari ini.
    </div>

    <div class="grid gap-5 lg:grid-cols-2">
      <div v-for="m in meetings" :key="m.id" class="card overflow-hidden">
        <!-- header strip -->
        <div class="p-5 flex items-start gap-4 border-b border-border" :style="{ background: 'color-mix(in oklab,' + m.course.color + ' 7%, transparent)' }">
          <div class="grid h-12 w-12 place-items-center rounded-xl shrink-0 text-white" :style="{ background: m.course.color }">
            <icons.ScanLine :size="22" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="label-eyebrow" :style="{ color: m.course.color }">{{ m.course.code }}</div>
            <h3 class="font-semibold leading-snug">{{ m.title }}</h3>
            <div class="flex items-center gap-3 text-[0.76rem] text-faint mt-0.5">
              <span class="flex items-center gap-1"><icons.Clock :size="12"/> {{ m.time }}</span>
              <span class="flex items-center gap-1"><icons.MapPin :size="12"/> {{ m.room }}</span>
            </div>
          </div>
          <Chip :tone="m.sessionOpen ? 'success' : 'neutral'" dot>{{ m.sessionOpen ? 'Sesi Dibuka' : 'Tertutup' }}</Chip>
        </div>

        <!-- DOSEN view -->
        <div v-if="auth.role === 'dosen'" class="p-5">
          <template v-if="!m.sessionOpen">
            <div class="text-center py-3">
              <div class="grid h-14 w-14 mx-auto place-items-center rounded-2xl mb-3" style="background: var(--surface-2)"><icons.Lock :size="24" class="text-faint"/></div>
              <p class="text-sm text-muted mb-4 max-w-xs mx-auto">Presensi belum dibuka. Mahasiswa <b>tidak bisa</b> absen sampai kamu membuka sesi.</p>
              <button class="btn btn-primary" :disabled="busy === m.id" @click="open(m)">
                <icons.Radio v-if="busy !== m.id" :size="17"/><icons.Loader2 v-else :size="17" class="animate-spin"/> Buka Sesi Presensi
              </button>
            </div>
          </template>
          <template v-else>
            <div class="flex items-center justify-between gap-4 mb-4">
              <div>
                <div class="label-eyebrow mb-1">Kode presensi</div>
                <div class="num text-3xl font-bold tracking-[0.2em]" style="font-family: var(--font-serif); color: var(--brand-600)">{{ m.code }}</div>
              </div>
              <div class="text-right">
                <div class="num text-2xl font-bold">{{ m.presentCount }}<span class="text-faint text-lg">/{{ m.rosterCount }}</span></div>
                <div class="text-xs text-faint">mahasiswa hadir</div>
              </div>
            </div>
            <div class="h-2 rounded-full bg-surface-2 overflow-hidden mb-4">
              <div class="h-full rounded-full transition-all duration-500" :style="{ width: (m.presentCount / m.rosterCount * 100) + '%', background: 'var(--success)' }"></div>
            </div>
            <div class="flex flex-col gap-1.5 max-h-52 overflow-y-auto mb-4 pr-1">
              <div v-for="s in m.roster" :key="s.id" class="flex items-center gap-2.5 rounded-lg p-1.5">
                <Avatar :name="s.name" :size="30" />
                <div class="min-w-0 flex-1"><div class="text-[0.82rem] font-medium truncate">{{ s.name }}</div><div class="text-[0.68rem] text-faint">{{ s.nim }}</div></div>
                <Chip v-if="s.status === 'hadir'" tone="success" dot>Hadir · {{ (s.at || '').slice(11) }}</Chip>
                <Chip v-else tone="neutral">Belum</Chip>
              </div>
            </div>
            <button class="btn btn-outline w-full text-danger" :disabled="busy === m.id" @click="close(m)"><icons.Square :size="15"/> Tutup Sesi</button>
          </template>
        </div>

        <!-- MAHASISWA view -->
        <div v-else class="p-5">
          <template v-if="m.myStatus === 'hadir'">
            <div class="text-center py-4">
              <div class="grid h-16 w-16 mx-auto place-items-center rounded-full mb-3" style="background: var(--success-soft)"><icons.CheckCheck :size="30" style="color: var(--success)"/></div>
              <h4 class="font-bold text-lg" style="font-family: var(--font-serif)">Kamu Hadir 🎉</h4>
              <p class="text-sm text-muted">Tercatat pukul <b class="num">{{ (m.myAt || '').slice(11) }}</b> WIB</p>
            </div>
          </template>
          <template v-else-if="m.sessionOpen">
            <div class="text-center py-3">
              <div class="relative mx-auto w-fit mb-3">
                <span class="absolute inset-0 rounded-2xl animate-ping" style="background: color-mix(in oklab, var(--success) 30%, transparent)"></span>
                <div class="relative grid h-14 w-14 place-items-center rounded-2xl" style="background: var(--success-soft)"><icons.Fingerprint :size="26" style="color: var(--success)"/></div>
              </div>
              <p class="text-sm text-muted mb-4">Sesi presensi <b style="color: var(--success)">dibuka</b>. Tekan untuk mencatat kehadiranmu.</p>
              <button class="btn btn-primary" :disabled="busy === m.id" @click="checkIn(m)">
                <icons.Fingerprint v-if="busy !== m.id" :size="17"/><icons.Loader2 v-else :size="17" class="animate-spin"/> Check-in Sekarang
              </button>
            </div>
          </template>
          <template v-else>
            <div class="text-center py-4 opacity-80">
              <div class="grid h-14 w-14 mx-auto place-items-center rounded-2xl mb-3" style="background: var(--surface-2)"><icons.Hourglass :size="24" class="text-faint"/></div>
              <p class="text-sm text-muted mb-3">Menunggu dosen membuka sesi presensi…</p>
              <button class="btn btn-outline" disabled><icons.Lock :size="15"/> Belum bisa absen</button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <p v-if="err" class="chip text-danger mt-4" style="background: var(--danger-soft)"><icons.AlertCircle :size="14"/> {{ err }}</p>
  </div>
</template>
