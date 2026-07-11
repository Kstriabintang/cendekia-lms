<script setup>
import { ref, computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth.js'
import { useUI } from '@/stores/ui.js'
import { IS_MOCK } from '@/services/api.js'
import { sound } from '@/lib/sound.js'
import Avatar from '@/components/Avatar.vue'
import AtomicBackground from '@/components/AtomicBackground.vue'
import AuroraBackground from '@/components/AuroraBackground.vue'
import Toasts from '@/components/Toasts.vue'
import PwaInstall from '@/components/PwaInstall.vue'
import { icons } from '@/lib/icons'

const auth = useAuth()
const ui = useUI()
const route = useRoute()
const router = useRouter()

const mobileOpen = ref(false)
const profileOpen = ref(false)
const notifOpen = ref(false)

const roleLabel = { admin: 'Administrator', dosen: 'Dosen', mahasiswa: 'Mahasiswa' }

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { to: '/courses', label: 'Mata Kuliah', icon: 'BookOpen' },
  { to: '/schedule', label: 'Jadwal Kuliah', icon: 'CalendarDays' },
  { to: '/attendance', label: 'Presensi Langsung', icon: 'ScanLine', roles: ['mahasiswa', 'dosen'] },
  { to: '/assignments', label: 'Tugas', icon: 'ClipboardList' },
  { to: '/quizzes', label: 'Kuis', icon: 'FileQuestion' },
  { to: '/discussions', label: 'Diskusi', icon: 'MessagesSquare' },
  { to: '/grades', label: 'Nilai', icon: 'GraduationCap', roles: ['mahasiswa', 'dosen'] },
  { to: '/leaderboard', label: 'Peringkat', icon: 'Trophy', roles: ['mahasiswa', 'dosen'] },
  { to: '/certificates', label: 'Sertifikat', icon: 'Award', roles: ['mahasiswa'] },
  { to: '/announcements', label: 'Pengumuman', icon: 'Megaphone' },
  { to: '/users', label: 'Pengguna', icon: 'Users', roles: ['admin'] },
]
const visibleNav = computed(() => nav.filter((n) => !n.roles || n.roles.includes(auth.role)))
const Icon = (n) => icons[n] || icons.Circle
const pageTitle = computed(() => route.meta.title || 'Cendekia')

const notifs = [
  { icon: 'FileText', tone: 'var(--warning)', title: 'Tugas 3 — Mini SPA Katalog', desc: 'Tenggat 2 hari lagi · IF3201', time: '2j' },
  { icon: 'CheckCircle2', tone: 'var(--success)', title: 'Nilai UTS keluar', desc: 'Basis Data Lanjut · IF3105', time: '5j' },
  { icon: 'CalendarClock', tone: 'var(--info)', title: 'Kuliah daring besok', desc: 'IMK · 10:00 via Zoom', time: '1h' },
]

function navClick() { sound.play('tick') }
function toggleNotif() { notifOpen.value = !notifOpen.value; if (notifOpen.value) sound.play('notify') }
function go(to) { sound.play('click'); router.push(to); mobileOpen.value = false; profileOpen.value = false }
function logout() { sound.play('click'); auth.logout(); router.push('/login') }
</script>

<template>
  <div class="relative min-h-screen bg-surface text-ink flex">
    <Toasts />
    <PwaInstall />
    <!-- Living aurora background (drifting color blobs) — different mood per theme -->
    <AuroraBackground class="!fixed" style="z-index:0" :dark="ui.dark" />
    <!-- Faint atomic net on top for the scientific identity -->
    <AtomicBackground class="!fixed" style="z-index:0" :opacity="ui.dark ? 0.32 : 0.10" :density="0.5" :atoms="2" :neurons="8"
      :primary="ui.dark ? [140, 138, 245] : [116, 110, 222]" :accent="ui.dark ? [80, 205, 230] : [88, 160, 200]" />

    <!-- Sidebar (desktop) -->
    <aside class="relative z-10 hidden lg:flex flex-col border-r border-border bg-card/95 backdrop-blur-sm transition-all duration-300"
           :class="ui.sidebarCollapsed ? 'w-[76px]' : 'w-[264px]'">
      <div class="h-16 flex items-center gap-2.5 px-4 border-b border-border">
        <div class="grid h-9 w-9 place-items-center rounded-xl shrink-0" style="background: var(--brand-600)">
          <svg viewBox="0 0 32 32" class="h-5 w-5"><path d="M16 6 L27 11 L16 16 L5 11 Z" fill="white"/><path d="M9 14 L9 20 Q16 24 23 20 L23 14" fill="none" stroke="white" stroke-width="1.8"/></svg>
        </div>
        <div v-if="!ui.sidebarCollapsed" class="leading-tight">
          <div class="font-bold tracking-tight" style="font-family: var(--font-serif)">Cendekia</div>
          <div class="text-[0.62rem] text-faint font-medium tracking-wide uppercase">LMS Kampus</div>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        <p v-if="!ui.sidebarCollapsed" class="label-eyebrow px-3 pt-2 pb-1">Menu</p>
        <RouterLink v-for="n in visibleNav" :key="n.to" :to="n.to" @click="navClick"
          class="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9rem] font-medium transition-colors"
          :class="route.path.startsWith(n.to) ? 'text-brand-700 dark:text-brand-600' : 'text-muted hover:text-ink hover:bg-surface-2'"
          :style="route.path.startsWith(n.to) ? 'background: var(--brand-50)' : ''"
          :title="ui.sidebarCollapsed ? n.label : ''">
          <span v-if="route.path.startsWith(n.to)" class="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full" style="background: var(--brand-600)"></span>
          <component :is="Icon(n.icon)" :size="20" :stroke-width="route.path.startsWith(n.to) ? 2.3 : 2" class="shrink-0" />
          <span v-if="!ui.sidebarCollapsed">{{ n.label }}</span>
        </RouterLink>
      </nav>

      <div class="p-3 border-t border-border">
        <RouterLink to="/profile" @click="navClick" class="flex items-center gap-2.5 rounded-xl p-2 hover:bg-surface-2 transition-colors" :class="ui.sidebarCollapsed && 'justify-center'">
          <Avatar :name="auth.user?.name" :size="34" />
          <div v-if="!ui.sidebarCollapsed" class="min-w-0 leading-tight">
            <div class="text-[0.82rem] font-semibold truncate">{{ auth.user?.name }}</div>
            <div class="text-[0.7rem] text-faint truncate">{{ roleLabel[auth.role] }}</div>
          </div>
        </RouterLink>
        <button class="btn btn-ghost w-full mt-1" :class="ui.sidebarCollapsed && 'px-0'" @click="ui.toggleSidebar()">
          <component :is="ui.sidebarCollapsed ? icons.PanelLeftOpen : icons.PanelLeftClose" :size="18" />
          <span v-if="!ui.sidebarCollapsed" class="text-[0.8rem]">Ciutkan</span>
        </button>
      </div>
    </aside>

    <!-- Mobile drawer -->
    <transition name="fade">
      <div v-if="mobileOpen" class="fixed inset-0 z-40 lg:hidden">
        <div class="absolute inset-0 bg-black/40" @click="mobileOpen = false"></div>
        <aside class="absolute left-0 top-0 h-full w-[280px] bg-card border-r border-border p-3 flex flex-col gap-1 overflow-y-auto safe-top safe-x">
          <div class="flex items-center gap-2.5 px-2 py-3 mb-1">
            <div class="grid h-9 w-9 place-items-center rounded-xl" style="background: var(--brand-600)">
              <svg viewBox="0 0 32 32" class="h-5 w-5"><path d="M16 6 L27 11 L16 16 L5 11 Z" fill="white"/></svg>
            </div>
            <span class="font-bold" style="font-family: var(--font-serif)">Cendekia</span>
          </div>
          <RouterLink v-for="n in visibleNav" :key="n.to" :to="n.to" @click="() => { navClick(); mobileOpen = false }"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.9rem] font-medium"
            :class="route.path.startsWith(n.to) ? 'text-brand-700 dark:text-brand-600' : 'text-muted'"
            :style="route.path.startsWith(n.to) ? 'background: var(--brand-50)' : ''">
            <component :is="Icon(n.icon)" :size="20" /> {{ n.label }}
          </RouterLink>
        </aside>
      </div>
    </transition>

    <!-- Main -->
    <div class="relative z-10 flex-1 min-w-0 flex flex-col">
      <header class="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 sm:px-6 border-b border-border bg-card/95 backdrop-blur-none sm:bg-card/80 sm:backdrop-blur-md safe-top safe-x">
        <button class="btn btn-ghost lg:hidden px-2" @click="mobileOpen = true"><icons.Menu :size="20" /></button>
        <h2 class="font-semibold text-[1.05rem] truncate">{{ pageTitle }}</h2>

        <div class="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div class="hidden md:flex items-center gap-2 rounded-xl border border-border-strong bg-surface px-3 py-2 w-56 text-muted">
            <icons.Search :size="16" />
            <input placeholder="Cari…" class="bg-transparent outline-none text-sm w-full text-ink placeholder:text-faint" />
            <kbd class="text-[0.6rem] font-mono text-faint border border-border rounded px-1">⌘K</kbd>
          </div>

          <span v-if="IS_MOCK" class="chip text-gold hidden sm:inline-flex" style="background: var(--gold-soft)" title="Menjalankan data contoh — hubungkan Supabase untuk data nyata">
            <icons.FlaskConical :size="13" /> Demo
          </span>

          <button class="btn btn-ghost px-2.5" @click="ui.toggleSound()" :title="ui.soundOn ? 'Matikan suara' : 'Nyalakan suara'">
            <component :is="ui.soundOn ? icons.Volume2 : icons.VolumeX" :size="19" />
          </button>
          <button class="btn btn-ghost px-2.5" @click="ui.toggleTheme()" :title="ui.dark ? 'Mode terang' : 'Mode gelap'">
            <component :is="ui.dark ? icons.Sun : icons.Moon" :size="19" />
          </button>

          <!-- Notifications -->
          <div class="relative">
            <button class="btn btn-ghost px-2.5 relative" @click="toggleNotif">
              <icons.Bell :size="19" />
              <span class="absolute top-1.5 right-2 h-2 w-2 rounded-full" style="background: var(--danger)"></span>
            </button>
            <transition name="fade">
              <div v-if="notifOpen" class="absolute right-0 mt-2 w-80 card p-2 z-40">
                <div class="flex items-center justify-between px-2 py-1.5">
                  <span class="font-semibold text-sm">Notifikasi</span>
                  <span class="chip text-brand-700 dark:text-brand-600" style="background: var(--brand-50)">{{ notifs.length }} baru</span>
                </div>
                <div class="flex flex-col">
                  <button v-for="(n, i) in notifs" :key="i" class="flex gap-3 items-start text-left rounded-xl p-2.5 hover:bg-surface-2 transition-colors" @click="notifOpen = false">
                    <span class="grid h-9 w-9 place-items-center rounded-lg shrink-0" :style="{ background: 'color-mix(in oklab,' + n.tone + ' 14%, transparent)', color: n.tone }">
                      <component :is="Icon(n.icon)" :size="16" />
                    </span>
                    <div class="min-w-0 flex-1">
                      <div class="text-[0.83rem] font-medium truncate">{{ n.title }}</div>
                      <div class="text-[0.74rem] text-faint truncate">{{ n.desc }}</div>
                    </div>
                    <span class="text-[0.68rem] text-faint shrink-0">{{ n.time }}</span>
                  </button>
                </div>
              </div>
            </transition>
          </div>

          <div class="relative">
            <button class="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-surface-2 transition-colors" @click="profileOpen = !profileOpen; sound.play('click')">
              <Avatar :name="auth.user?.name" :size="32" />
              <icons.ChevronDown :size="15" class="text-faint" />
            </button>
            <transition name="fade">
              <div v-if="profileOpen" class="absolute right-0 mt-2 w-52 card p-1.5 z-40">
                <div class="px-3 py-2 border-b border-border mb-1">
                  <div class="text-sm font-semibold truncate">{{ auth.user?.name }}</div>
                  <div class="text-[0.72rem] text-faint truncate">{{ auth.user?.email }}</div>
                </div>
                <button class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-ink" @click="go('/profile')">
                  <icons.User :size="16" /> Profil Saya
                </button>
                <button class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger hover:bg-surface-2" @click="logout">
                  <icons.LogOut :size="16" /> Keluar
                </button>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <main class="flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto safe-x safe-bottom">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>
