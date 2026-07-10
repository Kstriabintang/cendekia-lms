<script setup>
import { computed } from 'vue'
import { useAuth } from '@/stores/auth.js'
import { useUI } from '@/stores/ui.js'
import { api } from '@/services/api.js'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import Avatar from '@/components/Avatar.vue'
import Chip from '@/components/Chip.vue'
import { icons } from '@/lib/icons'

const auth = useAuth()
const ui = useUI()
const router = useRouter()
const roleLabel = { admin: 'Administrator', dosen: 'Dosen', mahasiswa: 'Mahasiswa' }

const fields = computed(() => {
  const u = auth.user || {}
  const base = [
    { label: 'Nama lengkap', value: u.name, icon: 'User' },
    { label: 'Email', value: u.email, icon: 'Mail' },
    { label: 'Peran', value: roleLabel[u.role], icon: 'ShieldCheck' },
  ]
  if (u.nim) base.push({ label: 'NIM', value: u.nim, icon: 'Hash' }, { label: 'Program studi', value: u.prodi, icon: 'GraduationCap' })
  if (u.nidn) base.push({ label: 'NIDN', value: u.nidn, icon: 'Hash' }, { label: 'Jabatan', value: u.title, icon: 'Briefcase' })
  return base
})

function resetDemo() {
  api.resetDemo?.()
  location.reload()
}
</script>

<template>
  <div>
    <PageHeader eyebrow="Akun" title="Profil Saya" subtitle="Kelola informasi akun dan preferensi tampilan." />

    <div class="grid lg:grid-cols-3 gap-5">
      <div class="card p-6 text-center h-fit">
        <Avatar :name="auth.user?.name" :size="88" class="mx-auto" />
        <h2 class="text-xl font-bold mt-4" style="font-family: var(--font-serif)">{{ auth.user?.name }}</h2>
        <p class="text-sm text-faint">{{ auth.user?.title || auth.user?.email }}</p>
        <Chip tone="brand" dot class="mt-3">{{ roleLabel[auth.role] }}</Chip>
        <div v-if="auth.user?.ipk" class="mt-5 pt-5 border-t border-border flex justify-around">
          <div><div class="num text-2xl font-bold" style="font-family: var(--font-serif); color: var(--gold)">{{ auth.user.ipk }}</div><div class="text-xs text-faint">IPK</div></div>
        </div>
      </div>

      <div class="lg:col-span-2 flex flex-col gap-5">
        <div class="card p-6">
          <h3 class="font-semibold mb-4">Informasi Pribadi</h3>
          <div class="grid sm:grid-cols-2 gap-4">
            <div v-for="f in fields" :key="f.label" class="flex items-center gap-3">
              <span class="grid h-10 w-10 place-items-center rounded-xl shrink-0 text-muted bg-surface-2"><component :is="icons[f.icon] || icons.Circle" :size="18"/></span>
              <div class="min-w-0"><div class="text-xs text-faint">{{ f.label }}</div><div class="font-medium truncate">{{ f.value }}</div></div>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <h3 class="font-semibold mb-4">Preferensi</h3>
          <div class="flex items-center justify-between py-2">
            <div class="flex items-center gap-3"><span class="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-muted"><component :is="ui.dark ? icons.Moon : icons.Sun" :size="18"/></span>
              <div><div class="font-medium">Mode gelap</div><div class="text-xs text-faint">Sesuaikan tampilan dengan seleramu.</div></div></div>
            <button @click="ui.toggleTheme()" class="relative h-6 w-11 rounded-full transition-colors" :style="{ background: ui.dark ? 'var(--brand-600)' : 'var(--border-strong)' }">
              <span class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform" :style="{ transform: ui.dark ? 'translateX(20px)' : 'none' }"></span>
            </button>
          </div>
          <div class="flex items-center justify-between py-2 border-t border-border">
            <div class="flex items-center gap-3"><span class="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-muted"><component :is="ui.soundOn ? icons.Volume2 : icons.VolumeX" :size="18"/></span>
              <div><div class="font-medium">Efek suara</div><div class="text-xs text-faint">Bunyi halus saat berinteraksi & notifikasi.</div></div></div>
            <button @click="ui.toggleSound()" class="relative h-6 w-11 rounded-full transition-colors" :style="{ background: ui.soundOn ? 'var(--brand-600)' : 'var(--border-strong)' }">
              <span class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform" :style="{ transform: ui.soundOn ? 'translateX(20px)' : 'none' }"></span>
            </button>
          </div>
        </div>

        <div class="card p-6 border-dashed">
          <h3 class="font-semibold mb-1">Data Demo</h3>
          <p class="text-sm text-muted mb-4">Aplikasi memakai data contoh tersimpan di browser. Reset untuk mengembalikan ke kondisi awal.</p>
          <div class="flex gap-3">
            <button class="btn btn-outline" @click="resetDemo"><icons.RotateCcw :size="16"/> Reset data demo</button>
            <button class="btn btn-ghost text-danger" @click="auth.logout(); router.push('/login')"><icons.LogOut :size="16"/> Keluar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
