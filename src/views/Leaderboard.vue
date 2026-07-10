<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '@/services/api.js'
import { useAuth } from '@/stores/auth.js'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import Avatar from '@/components/Avatar.vue'
import * as icons from 'lucide-vue-next'

const auth = useAuth()
const board = ref([])
const loading = ref(true)
const podium = computed(() => board.value.slice(0, 3))
const rest = computed(() => board.value.slice(3))
const myRank = computed(() => board.value.findIndex((b) => b.userId === auth.user.id) + 1)
const medal = ['var(--gold)', '#9aa0b4', '#c98a4b']

onMounted(async () => { board.value = await api.leaderboard(); loading.value = false })
</script>

<template>
  <div>
    <PageHeader eyebrow="Gamifikasi belajar" title="Papan Peringkat"
      subtitle="Kumpulkan XP dari presensi, kuis, tugas, dan keaktifan diskusi.">
      <template #actions>
        <div v-if="myRank" class="card px-4 py-2 flex items-center gap-2">
          <icons.Sparkles :size="16" class="text-gold"/><span class="text-sm">Peringkatmu <b class="num">#{{ myRank }}</b></span>
        </div>
      </template>
    </PageHeader>

    <!-- Podium -->
    <div class="grid grid-cols-3 gap-3 sm:gap-5 mb-6 items-end">
      <div v-for="(p, i) in [podium[1], podium[0], podium[2]]" :key="i" v-show="p"
           class="card p-4 sm:p-5 text-center relative overflow-hidden"
           :class="p && podium[0] && p.userId === podium[0].userId ? 'order-2' : ''"
           :style="{ paddingTop: (p && podium[0] && p.userId === podium[0].userId) ? '2rem' : '1.25rem' }">
        <div class="absolute inset-x-0 top-0 h-1" :style="{ background: medal[p && podium[0] && p.userId === podium[0].userId ? 0 : (i === 0 ? 1 : 2)] }"></div>
        <div class="relative w-fit mx-auto">
          <Avatar :name="p?.user.name" :size="p && podium[0] && p.userId === podium[0].userId ? 66 : 52" class="mx-auto" />
          <span class="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full text-white text-xs font-bold num"
                :style="{ background: medal[p && podium[0] && p.userId === podium[0].userId ? 0 : (i === 0 ? 1 : 2)] }">
            {{ p && podium[0] && p.userId === podium[0].userId ? 1 : (i === 0 ? 2 : 3) }}
          </span>
        </div>
        <div class="font-semibold text-[0.9rem] mt-3 truncate">{{ p?.user.name }}</div>
        <div class="num font-bold text-lg" style="font-family: var(--font-serif); color: var(--brand-600)">{{ p?.xp.toLocaleString() }} XP</div>
        <div class="flex items-center justify-center gap-1 text-[0.72rem] text-faint mt-1"><icons.Flame :size="12" class="text-warning"/> {{ p?.streak }} hari</div>
      </div>
    </div>

    <!-- Full list -->
    <div class="card divide-y divide-border">
      <div v-for="(p, i) in rest" :key="p.userId" class="p-4 flex items-center gap-4"
           :class="p.userId === auth.user.id ? '' : ''" :style="p.userId === auth.user.id ? 'background: var(--brand-50)' : ''">
        <span class="num font-bold text-muted w-8 text-center">{{ i + 4 }}</span>
        <Avatar :name="p.user.name" :size="40" />
        <div class="min-w-0 flex-1">
          <div class="font-medium truncate">{{ p.user.name }}<Chip v-if="p.userId === auth.user.id" tone="brand" class="ml-2">Kamu</Chip></div>
          <div class="flex items-center gap-2 mt-0.5 flex-wrap">
            <Chip v-for="b in p.badges.slice(0,2)" :key="b" tone="gold">{{ b }}</Chip>
          </div>
        </div>
        <div class="text-right">
          <div class="num font-bold" style="font-family: var(--font-serif)">{{ p.xp.toLocaleString() }}</div>
          <div class="text-[0.68rem] text-faint flex items-center gap-1 justify-end"><icons.Flame :size="11" class="text-warning"/> {{ p.streak }}h</div>
        </div>
      </div>
      <p v-if="!loading && !rest.length" class="p-6 text-center text-faint text-sm">Baru 3 peserta di papan peringkat.</p>
    </div>
  </div>
</template>
