<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/services/api.js'
import { useAuth } from '@/stores/auth.js'
import { sound } from '@/lib/sound.js'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import Avatar from '@/components/Avatar.vue'
import * as icons from 'lucide-vue-next'

const auth = useAuth()
const threads = ref([])
const active = ref(null)
const reply = ref('')
const loading = ref(true)
const tagTone = { Pertanyaan: 'warning', Diskusi: 'info', Info: 'brand' }

async function load() { threads.value = await api.listDiscussions({ userId: auth.user.id, role: auth.role }); loading.value = false }
async function openThread(t) { sound.play('tick'); active.value = await api.getDiscussion(t.id) }
async function send() {
  if (!reply.value.trim()) return
  sound.play('send')
  await api.addReply(active.value.id, auth.user.id, reply.value.trim())
  active.value = await api.getDiscussion(active.value.id)
  reply.value = ''
  await load()
}
onMounted(load)
</script>

<template>
  <div>
    <PageHeader eyebrow="Ruang diskusi" title="Diskusi"
      subtitle="Tanya, jawab, dan berbagi dengan teman sekelas & dosen.">
      <template #actions><button class="btn btn-primary"><icons.Plus :size="16"/> Topik Baru</button></template>
    </PageHeader>

    <div class="grid lg:grid-cols-5 gap-5">
      <!-- Thread list -->
      <div class="lg:col-span-2 flex flex-col gap-3">
        <button v-for="t in threads" :key="t.id" @click="openThread(t)"
          class="card card-hover p-4 text-left transition-all"
          :class="active?.id === t.id ? 'ring-2' : ''" :style="active?.id === t.id ? 'box-shadow: 0 0 0 2px var(--brand-600)' : ''">
          <div class="flex items-center gap-2 mb-2">
            <Chip :tone="tagTone[t.tag] || 'neutral'">{{ t.tag }}</Chip>
            <span class="text-[0.7rem] text-faint">{{ t.course.code }}</span>
          </div>
          <h3 class="font-semibold text-[0.95rem] leading-snug">{{ t.title }}</h3>
          <p class="text-[0.8rem] text-muted line-clamp-2 mt-1">{{ t.body }}</p>
          <div class="flex items-center gap-3 mt-3 text-[0.72rem] text-faint">
            <span class="flex items-center gap-1"><Avatar :name="t.author.name" :size="18"/> {{ t.author.name.split(' ')[0] }}</span>
            <span class="flex items-center gap-1"><icons.MessageCircle :size="12"/> {{ t.replyCount }}</span>
            <span class="flex items-center gap-1"><icons.Heart :size="12"/> {{ t.likes }}</span>
            <span class="ml-auto">{{ t.date.slice(5) }}</span>
          </div>
        </button>
      </div>

      <!-- Thread detail -->
      <div class="lg:col-span-3">
        <div v-if="active" class="card p-6 flex flex-col" style="min-height: 60vh">
          <div class="flex items-center gap-2 mb-3">
            <Chip :tone="tagTone[active.tag] || 'neutral'">{{ active.tag }}</Chip>
            <span class="text-xs text-faint">{{ active.course.code }} · {{ active.course.title }}</span>
          </div>
          <h2 class="text-xl font-bold" style="font-family: var(--font-serif)">{{ active.title }}</h2>
          <div class="flex items-center gap-2 mt-3 pb-4 border-b border-border">
            <Avatar :name="active.author.name" :size="36" />
            <div><div class="text-sm font-semibold">{{ active.author.name }}</div><div class="text-xs text-faint">{{ active.date }}</div></div>
          </div>
          <p class="text-[0.95rem] text-muted leading-relaxed py-4">{{ active.body }}</p>

          <div class="flex-1 flex flex-col gap-4">
            <div class="label-eyebrow">{{ active.replies.length }} balasan</div>
            <div v-for="r in active.replies" :key="r.id" class="flex gap-3">
              <Avatar :name="r.author.name" :size="34" />
              <div class="flex-1 rounded-xl bg-surface-2 p-3">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[0.82rem] font-semibold">{{ r.author.name }}</span>
                  <Chip v-if="r.author.role === 'dosen'" tone="success">Dosen</Chip>
                  <span class="text-[0.68rem] text-faint ml-auto">{{ r.date.slice(5) }}</span>
                </div>
                <p class="text-[0.86rem] text-ink">{{ r.body }}</p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 mt-4 pt-4 border-t border-border">
            <Avatar :name="auth.user.name" :size="34" />
            <input v-model="reply" @keyup.enter="send" class="input" placeholder="Tulis balasan…" />
            <button class="btn btn-primary shrink-0" @click="send"><icons.Send :size="16"/></button>
          </div>
        </div>
        <div v-else class="card p-12 text-center text-muted grid place-items-center" style="min-height: 60vh">
          <div><icons.MessagesSquare :size="40" class="mx-auto mb-3 text-faint"/> Pilih sebuah topik untuk membaca &amp; membalas.</div>
        </div>
      </div>
    </div>
  </div>
</template>
