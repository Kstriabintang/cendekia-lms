<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api.js'
import { useAuth } from '@/stores/auth.js'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import Avatar from '@/components/Avatar.vue'
import { icons } from '@/lib/icons'

const auth = useAuth()
const items = ref([])
const loading = ref(true)
const tagTone = { Tugas: 'brand', Jadwal: 'info', Nilai: 'gold', Info: 'neutral' }
const tagIcon = { Tugas: 'ClipboardList', Jadwal: 'CalendarClock', Nilai: 'GraduationCap', Info: 'Info' }
const Icon = (n) => icons[n] || icons.Megaphone

onMounted(async () => { items.value = await api.listAnnouncements({ userId: auth.user.id, role: auth.role }); loading.value = false })
</script>

<template>
  <div>
    <PageHeader eyebrow="Kabar terbaru" title="Pengumuman"
      subtitle="Informasi resmi dari dosen & akademik.">
      <template #actions><button v-if="auth.role !== 'mahasiswa'" class="btn btn-primary"><icons.Plus :size="16"/> Buat Pengumuman</button></template>
    </PageHeader>

    <div class="relative max-w-3xl">
      <!-- timeline line -->
      <div class="absolute left-[19px] top-2 bottom-2 w-px bg-border hidden sm:block"></div>
      <div class="flex flex-col gap-4">
        <article v-for="a in items" :key="a.id" class="relative sm:pl-12">
          <div class="hidden sm:grid absolute left-0 top-1 h-10 w-10 place-items-center rounded-full border-2 border-border bg-card"
               :style="{ color: 'var(--' + (tagTone[a.tag] === 'gold' ? 'gold' : tagTone[a.tag] === 'info' ? 'info' : tagTone[a.tag] === 'brand' ? 'brand-600' : 'muted') + ')' }">
            <component :is="Icon(tagIcon[a.tag])" :size="18" />
          </div>
          <div class="card card-hover p-5">
            <div class="flex items-center gap-2 mb-2">
              <Chip :tone="tagTone[a.tag] || 'neutral'" dot>{{ a.tag }}</Chip>
              <span class="text-xs text-faint">{{ a.course.code }} · {{ a.course.title }}</span>
              <span class="text-xs text-faint ml-auto">{{ a.date }}</span>
            </div>
            <h3 class="font-semibold text-[1.05rem]">{{ a.title }}</h3>
            <p class="text-[0.9rem] text-muted mt-1 leading-relaxed">{{ a.body }}</p>
            <div class="flex items-center gap-2 mt-4 pt-3 border-t border-border">
              <Avatar :name="a.author?.name" :size="26" />
              <span class="text-xs text-muted">{{ a.author?.name }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>
