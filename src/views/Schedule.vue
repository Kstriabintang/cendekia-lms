<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '@/services/api.js'
import { useAuth } from '@/stores/auth.js'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import { icons } from '@/lib/icons'

const auth = useAuth()
const meetings = ref([])
const checkedIn = ref({})
const loading = ref(true)

const grouped = computed(() => {
  const g = {}
  for (const m of meetings.value) (g[m.date] ??= []).push(m)
  return Object.entries(g).sort((a, b) => a[0].localeCompare(b[0]))
})
const dayName = (d) => ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][new Date(d).getDay()]

onMounted(async () => { meetings.value = await api.listMeetings({}); loading.value = false })
function checkin(m) { checkedIn.value[m.id] = true }
</script>

<template>
  <div>
    <PageHeader eyebrow="Kalender akademik" title="Jadwal & Presensi"
      :subtitle="auth.role === 'dosen' ? 'Buka sesi presensi dan pantau kehadiran.' : 'Jadwal kuliahmu dan check-in kehadiran.'" />

    <div class="flex flex-col gap-6">
      <div v-for="[date, list] in grouped" :key="date">
        <div class="flex items-center gap-3 mb-3">
          <div class="grid place-items-center h-12 w-12 rounded-xl bg-card border border-border shrink-0">
            <span class="num text-lg font-bold leading-none">{{ date.slice(8) }}</span>
            <span class="text-[0.55rem] uppercase text-faint font-semibold">Jul</span>
          </div>
          <div><div class="font-semibold">{{ dayName(date) }}</div><div class="text-xs text-faint">{{ list.length }} kegiatan</div></div>
        </div>
        <div class="flex flex-col gap-2.5 sm:pl-15">
          <div v-for="m in list" :key="m.id" class="card p-4 flex items-center gap-4 border-l-4" :style="{ borderLeftColor: m.course.color }">
            <div class="text-center shrink-0 w-14">
              <div class="num font-semibold text-sm">{{ m.time }}</div>
              <div class="text-[0.62rem] text-faint">WIB</div>
            </div>
            <div class="min-w-0 flex-1">
              <div class="font-medium truncate">{{ m.title }}</div>
              <div class="text-[0.76rem] text-faint truncate">{{ m.course.code }} · {{ m.course.title }} · {{ m.room }}</div>
            </div>
            <Chip :tone="m.mode === 'Daring' ? 'info' : 'neutral'" dot>{{ m.mode }}</Chip>
            <template v-if="auth.role === 'mahasiswa' && m.status === 'upcoming'">
              <button v-if="!checkedIn[m.id]" class="btn btn-primary" @click="checkin(m)"><icons.MapPin :size="15"/> Check-in</button>
              <Chip v-else tone="success" dot>Hadir</Chip>
            </template>
            <button v-else-if="auth.role === 'dosen'" class="btn btn-outline"><icons.UserCheck :size="15"/> Presensi</button>
            <Chip v-else-if="m.status === 'done'" tone="success" dot>Selesai</Chip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
