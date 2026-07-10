<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '@/services/api.js'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import Avatar from '@/components/Avatar.vue'
import { icons } from '@/lib/icons'

const users = ref([])
const q = ref('')
const roleFilter = ref('semua')
const loading = ref(true)

const roleTone = { admin: 'gold', dosen: 'success', mahasiswa: 'brand' }
const roleLabel = { admin: 'Admin', dosen: 'Dosen', mahasiswa: 'Mahasiswa' }
const filtered = computed(() => users.value.filter((u) => {
  const okQ = !q.value || (u.name + u.email).toLowerCase().includes(q.value.toLowerCase())
  const okR = roleFilter.value === 'semua' || u.role === roleFilter.value
  return okQ && okR
}))

onMounted(async () => { users.value = await api.listUsers(); loading.value = false })
</script>

<template>
  <div>
    <PageHeader eyebrow="Administrasi" title="Manajemen Pengguna"
      subtitle="Kelola akun mahasiswa, dosen, dan admin.">
      <template #actions><button class="btn btn-primary"><icons.UserPlus :size="16"/> Tambah Pengguna</button></template>
    </PageHeader>

    <div class="flex flex-col sm:flex-row gap-3 mb-5">
      <div class="relative flex-1 max-w-md">
        <icons.Search :size="17" class="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input v-model="q" class="input pl-10" placeholder="Cari nama atau email…" />
      </div>
      <div class="flex gap-1.5 p-1 rounded-xl bg-surface-2 w-fit">
        <button v-for="f in ['semua', 'mahasiswa', 'dosen', 'admin']" :key="f" @click="roleFilter = f"
          class="px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors"
          :class="roleFilter === f ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink'">{{ f }}</button>
      </div>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[640px]">
          <thead><tr class="text-left text-faint border-b border-border">
            <th class="p-4 font-medium">Pengguna</th><th class="p-4 font-medium">Peran</th>
            <th class="p-4 font-medium">Identitas</th><th class="p-4 font-medium">Program Studi</th>
            <th class="p-4 font-medium text-right">Aksi</th>
          </tr></thead>
          <tbody>
            <tr v-for="u in filtered" :key="u.id" class="border-b border-border last:border-0 hover:bg-surface-2/50">
              <td class="p-3.5"><div class="flex items-center gap-3"><Avatar :name="u.name" :size="38"/>
                <div class="min-w-0"><div class="font-medium truncate">{{ u.name }}</div><div class="text-xs text-faint truncate">{{ u.email }}</div></div></div></td>
              <td class="p-3.5"><Chip :tone="roleTone[u.role]" dot>{{ roleLabel[u.role] }}</Chip></td>
              <td class="p-3.5 num text-muted">{{ u.nim || u.nidn || '—' }}</td>
              <td class="p-3.5 text-muted">{{ u.prodi || u.title || '—' }}</td>
              <td class="p-3.5 text-right">
                <button class="btn btn-ghost px-2"><icons.Pencil :size="16"/></button>
                <button class="btn btn-ghost px-2 text-danger"><icons.Trash2 :size="16"/></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
