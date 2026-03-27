<template>
  <svg v-if="name === 'logo'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="6" cy="12" r="2" fill="currentColor"/>
    <circle cx="18" cy="6" r="2" />
    <circle cx="18" cy="18" r="2" />
    <path d="M8 11L16 7" />
    <path d="M8 13L16 17" />
    <path d="M4 12 C 10 20, 14 4, 20 12" stroke="#0070F3" stroke-width="2" stroke-dasharray="3 3"/>
  </svg>

  <svg v-else-if="name === 'dashboard'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8" cy="12" r="1.5" />
    <circle cx="16" cy="12" r="1.5" />
    <path d="M3 10 L 21 10" stroke-dasharray="2 4" stroke-opacity="0.5"/>
    <path d="M8 12 Q 12 6, 16 12 Q 20 18, 21 12" stroke="#0070F3" stroke-width="1.5" />
  </svg>

  <svg v-else-if="name === 'data-sim'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 4h16M4 10h16M4 16h16" stroke-opacity="0.3" stroke-dasharray="2 2" />
    <path d="M8 4v16M16 4v16" stroke-opacity="0.3" stroke-dasharray="2 2" />
    <circle cx="6" cy="14" r="1.5" fill="currentColor" />
    <path d="M6 14 C 10 14, 12 8, 18 8" stroke="#111111" />
    <polyline points="15 5 18 8 15 11" stroke="#111111" />
  </svg>

  <svg v-else-if="name === 'privacy'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3 L 4 6 V 11 C 4 16 7 20 12 22 C 17 20 20 16 20 11 V 6 Z" fill="#FAFAFA" />
    <path d="M3 12 Q 12 0, 21 12" stroke-width="1.5" stroke-dasharray="1 3" stroke-opacity="0.4" />
    <text x="12" y="15" font-family="serif" font-size="12" font-weight="bold" font-style="italic" text-anchor="middle" fill="#0070F3" stroke="none">ε</text>
  </svg>

  <svg v-else-if="name === 'model'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="5" y="6" width="14" height="12" rx="2" fill="#FAFAFA" />
    <path d="M5 6 L 8 3 M 19 6 L 22 3 M 8 3 L 22 3 M 22 3 V 15 L 19 18" stroke-opacity="0.4" />
    <circle cx="9" cy="12" r="1.5" />
    <circle cx="15" cy="12" r="1.5" />
    <path d="M9 12 L 15 12" />
    <path d="M12 9 V 15" stroke="#0070F3" />
  </svg>

  <svg v-else-if="name === 'eval'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 20 L 20 20" />
    <path d="M4 20 L 4 4" />
    <path d="M4 14 L 10 8 L 14 12 L 20 6" stroke="#111111" />
    <path d="M4 16 C 8 16, 12 10, 16 14 C 18 16, 19 12, 20 10" stroke="#0070F3" stroke-dasharray="3 3" />
  </svg>
  
  <span v-else></span>
</template>

<script setup lang="ts">
defineProps<{ name: string }>()
</script>
