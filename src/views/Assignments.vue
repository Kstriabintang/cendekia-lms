<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '@/services/api.js'
import { useAuth } from '@/stores/auth.js'
import { sound } from '@/lib/sound.js'
import { toast } from '@/lib/toast.js'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import { icons } from '@/lib/icons'

const auth = useAuth()
const items = ref([])
const tab = ref('semua')
const loading = ref(true)

const tone = { open: 'warning', submitted: 'info', graded: 'success' }
const label = { open: 'Belum', submitted: 'Menunggu nilai', graded: 'Dinilai' }
const filtered = computed(() => {
  if (tab.value === 'semua') return items.value
  if (tab.value === 'aktif') return items.value.filter((a) => a.status === 'open' && !a.submitted)
  if (tab.value === 'terkumpul') return items.value.filter((a) => a.submitted && a.status !== 'graded')
  return items.value.filter((a) => a.status === 'graded')
})
const counts = computed(() => ({
  aktif: items.value.filter((a) => a.status === 'open' && !a.submitted).length,
  dinilai: items.value.filter((a) => a.status === 'graded').length,
}))

onMounted(async () => { items.value = await api.listAssignments({ userId: auth.user.id, role: auth.role }); loading.value = false })
async function submit(a) {
  sound.play('send'); await api.submitAssignment(a.id); a.submitted = true; a.status = 'submitted'
  toast(a.title + ' berhasil dikumpulkan.', { type: 'success', title: 'Tugas terkirim' })
}
</script>

<template>
  <div>
    <PageHeader eyebrow="Penilaian" title="Tugas"
      :subtitle="auth.role === 'dosen' ? 'Kelola dan nilai pengumpulan tugas.' : 'Pantau tenggat dan kumpulkan tugasmu.'">
      <template #actions>
        <button v-if="auth.role === 'dosen'" class="btn btn-primary"><icons.Plus :size="16"/> Buat Tugas</button>
      </template>
    </PageHeader>

    <div class="flex gap-1.5 p-1 rounded-xl bg-surface-2 w-fit mb-5">
      <button v-for="t in ['semua', 'aktif', 'terkumpul', 'dinilai']" :key="t" @click="tab = t"
        class="px-3.5 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors"
        :class="tab === t ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink'">{{ t }}</button>
    </div>

    <div class="grid gap-3">
      <div v-for="a in filtered" :key="a.id" class="card card-hover p-4 sm:p-5 flex items-center gap-4">
        <span class="grid h-12 w-12 place-items-center rounded-xl shrink-0" :style="{ background: 'color-mix(in oklab,' + a.course.color + ' 12%, transparent)', color: a.course.color }">
          <icons.FileText :size="20" />
        </span>
        <div class="min-w-0 flex-1">
          <div class="font-semibold truncate">{{ a.title }}</div>
          <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.76rem] text-faint mt-0.5">
            <span>{{ a.course.code }} · {{ a.course.title }}</span>
            <span class="flex items-center gap-1"><icons.CalendarClock :size="12"/> {{ a.due }}</span>
            <span class="flex items-center gap-1"><icons.Star :size="12"/> {{ a.points }} poin</span>
          </div>
        </div>
        <div class="text-right shrink-0 flex flex-col items-end gap-1.5">
          <span v-if="a.grade" class="num text-lg font-bold" style="font-family: var(--font-serif); color: var(--success)">{{ a.grade }}</span>
          <Chip :tone="tone[a.status]" dot>{{ label[a.status] }}</Chip>
        </div>
        <button v-if="auth.role === 'mahasiswa' && a.status === 'open' && !a.submitted" class="btn btn-primary shrink-0" @click="submit(a)">
          <icons.Upload :size="15"/> Kumpul
        </button>
        <button v-else-if="auth.role === 'dosen' && a.submitted && a.status !== 'graded'" class="btn btn-outline shrink-0">
          <icons.PenLine :size="15"/> Nilai
        </button>
      </div>
      <div v-if="!loading && !filtered.length" class="card p-12 text-center text-muted">
        <icons.CheckCircle2 :size="34" class="mx-auto mb-3" style="color: var(--success)" /> Tidak ada tugas di kategori ini.
      </div>
    </div>
  </div>
</template>
