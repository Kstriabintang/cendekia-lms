<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/stores/auth.js'
import { api } from '@/services/api.js'
import PageHeader from '@/components/PageHeader.vue'
import CourseCover from '@/components/CourseCover.vue'
import Donut from '@/components/Donut.vue'
import Chip from '@/components/Chip.vue'
import Avatar from '@/components/Avatar.vue'
import * as icons from 'lucide-vue-next'

const auth = useAuth()
const courses = ref([])
const q = ref('')
const filter = ref('semua')
const loading = ref(true)

const filtered = computed(() =>
  courses.value.filter((c) => {
    const okQ = !q.value || (c.title + c.code).toLowerCase().includes(q.value.toLowerCase())
    const okF = filter.value === 'semua' || c.category.toLowerCase() === filter.value
    return okQ && okF
  })
)

onMounted(async () => {
  courses.value = await api.listCourses({ userId: auth.user.id, role: auth.role })
  loading.value = false
})
</script>

<template>
  <div>
    <PageHeader eyebrow="Semester Genap 2025/2026" title="Mata Kuliah"
      :subtitle="auth.role === 'mahasiswa' ? 'Mata kuliah yang kamu ambil semester ini.' : auth.role === 'dosen' ? 'Kelas yang kamu ampu.' : 'Seluruh mata kuliah terdaftar.'">
      <template #actions>
        <button v-if="auth.role !== 'mahasiswa'" class="btn btn-primary"><icons.Plus :size="16"/> Mata Kuliah</button>
      </template>
    </PageHeader>

    <div class="flex flex-col sm:flex-row gap-3 mb-5">
      <div class="relative flex-1 max-w-md">
        <icons.Search :size="17" class="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input v-model="q" class="input pl-10" placeholder="Cari mata kuliah atau kode…" />
      </div>
      <div class="flex gap-1.5 p-1 rounded-xl bg-surface-2 w-fit">
        <button v-for="f in ['semua', 'wajib', 'pilihan']" :key="f" @click="filter = f"
          class="px-3.5 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors"
          :class="filter === f ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink'">{{ f }}</button>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <RouterLink v-for="c in filtered" :key="c.id" :to="'/courses/' + c.id" class="card card-hover overflow-hidden group flex flex-col">
        <CourseCover :color="c.color" :cover="c.cover" :code="c.code" :height="110" />
        <div class="p-4 flex flex-col gap-3 flex-1">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <h3 class="font-semibold leading-snug group-hover:text-brand-700 dark:group-hover:text-brand-600 transition-colors">{{ c.title }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <Chip :tone="c.category === 'Wajib' ? 'brand' : 'gold'">{{ c.category }}</Chip>
                <span class="text-[0.72rem] text-faint">{{ c.sks }} SKS</span>
              </div>
            </div>
            <Donut v-if="auth.role === 'mahasiswa'" :value="c.progress || 0" :size="46" :stroke="5" :color="c.color" />
          </div>
          <p class="text-[0.82rem] text-muted line-clamp-2 flex-1">{{ c.desc }}</p>
          <div class="flex items-center justify-between pt-2 border-t border-border">
            <div class="flex items-center gap-2 min-w-0">
              <Avatar :name="c.dosen?.name || 'Dosen'" :size="26" />
              <span class="text-[0.76rem] text-muted truncate">{{ c.dosen?.name }}</span>
            </div>
            <span class="text-[0.72rem] text-faint flex items-center gap-1"><icons.Users :size="13"/> {{ c.students }}</span>
          </div>
        </div>
      </RouterLink>
    </div>

    <div v-if="!loading && !filtered.length" class="card p-12 text-center text-muted">
      <icons.SearchX :size="34" class="mx-auto mb-3 text-faint" />
      Tidak ada mata kuliah yang cocok.
    </div>
  </div>
</template>
