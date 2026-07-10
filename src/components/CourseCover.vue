<script setup>
import { computed } from 'vue'
import { icons } from '@/lib/icons'

const props = defineProps({
  color: { type: String, default: '#5145e5' },
  cover: { type: String, default: 'web' },
  height: { type: [Number, String], default: 96 },
  code: { type: String, default: '' },
})
const iconMap = { web: 'Globe', db: 'Database', ux: 'PenTool', ai: 'BrainCircuit', default: 'BookOpen' }
const IconCmp = computed(() => icons[iconMap[props.cover] || iconMap.default] || icons.BookOpen)
</script>

<template>
  <div class="relative overflow-hidden" :style="{ height: typeof height === 'number' ? height + 'px' : height, background: color }">
    <!-- geometric texture -->
    <svg class="absolute inset-0 h-full w-full opacity-[0.16]" preserveAspectRatio="none" viewBox="0 0 200 100">
      <defs>
        <pattern :id="'p' + cover" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
          <circle cx="2" cy="2" r="1.4" fill="white" />
        </pattern>
      </defs>
      <rect width="200" height="100" :fill="'url(#p' + cover + ')'" />
    </svg>
    <div class="absolute -right-6 -top-8 h-32 w-32 rounded-full" style="background: rgba(255,255,255,.12)"></div>
    <div class="absolute right-8 bottom-2 opacity-90 text-white">
      <component :is="IconCmp" :size="52" :stroke-width="1.4" />
    </div>
    <div v-if="code" class="absolute left-4 top-3 label-eyebrow text-white/80" style="color: rgba(255,255,255,.85)">{{ code }}</div>
  </div>
</template>
