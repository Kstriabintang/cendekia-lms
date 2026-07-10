<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '@/services/api.js'
import { useAuth } from '@/stores/auth.js'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import * as icons from 'lucide-vue-next'

const auth = useAuth()
const rows = ref([])
const loading = ref(true)

const hurufTone = { A: 'success', 'A-': 'success', B: 'info', 'B+': 'info', C: 'warning', D: 'danger', E: 'danger' }
const done = computed(() => rows.value.filter((r) => r.akhir != null))
const avg = computed(() => done.value.length ? (done.value.reduce((s, r) => s + r.akhir, 0) / done.value.length).toFixed(1) : '—')

onMounted(async () => { rows.value = await api.getGrades(auth.user.id); loading.value = false })
</script>

<template>
  <div>
    <PageHeader eyebrow="Kartu Hasil Studi" title="Nilai"
      subtitle="Rekap komponen penilaian per mata kuliah semester ini.">
      <template #actions><button class="btn btn-outline"><icons.Printer :size="16"/> Cetak KHS</button></template>
    </PageHeader>

    <div class="grid sm:grid-cols-3 gap-4 mb-6">
      <div class="card p-5"><div class="text-sm text-muted">Rata-rata nilai akhir</div>
        <div class="num text-3xl font-bold mt-1" style="font-family: var(--font-serif)">{{ avg }}</div></div>
      <div class="card p-5"><div class="text-sm text-muted">Mata kuliah tuntas</div>
        <div class="num text-3xl font-bold mt-1" style="font-family: var(--font-serif)">{{ done.length }}<span class="text-lg text-faint">/{{ rows.length }}</span></div></div>
      <div class="card p-5"><div class="text-sm text-muted">IPK berjalan</div>
        <div class="num text-3xl font-bold mt-1" style="font-family: var(--font-serif); color: var(--gold)">{{ auth.user?.ipk ?? '—' }}</div></div>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[640px]">
          <thead><tr class="text-left text-faint border-b border-border">
            <th class="p-4 font-medium">Mata Kuliah</th>
            <th class="p-4 font-medium text-center">Tugas</th>
            <th class="p-4 font-medium text-center">Kuis</th>
            <th class="p-4 font-medium text-center">UTS</th>
            <th class="p-4 font-medium text-center">UAS</th>
            <th class="p-4 font-medium text-center">Akhir</th>
            <th class="p-4 font-medium text-center">Huruf</th>
          </tr></thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id" class="border-b border-border last:border-0 hover:bg-surface-2/50">
              <td class="p-4"><div class="font-medium">{{ r.course.title }}</div><div class="text-xs text-faint">{{ r.course.code }} · {{ r.course.sks }} SKS</div></td>
              <td class="p-4 text-center num">{{ r.tugas ?? '—' }}</td>
              <td class="p-4 text-center num">{{ r.kuis ?? '—' }}</td>
              <td class="p-4 text-center num">{{ r.uts ?? '—' }}</td>
              <td class="p-4 text-center num">{{ r.uas ?? '—' }}</td>
              <td class="p-4 text-center num font-bold">{{ r.akhir ?? '—' }}</td>
              <td class="p-4 text-center">
                <Chip v-if="r.huruf" :tone="hurufTone[r.huruf] || 'neutral'">{{ r.huruf }}</Chip>
                <span v-else class="text-faint text-xs">berjalan</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
