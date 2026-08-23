<template>
  <q-card flat bordered class="q-pa-md bg-grey-1">
    <div class="row items-center q-mb-md">
      <q-icon name="history" color="primary" size="md" class="q-mr-sm" />
      <span class="text-h6 text-weight-bold text-primary">Historial de Trazabilidad y Auditoría</span>
      <q-space />
      <q-chip color="blue-2" text-color="primary" icon="verified_user">
        Transiciones Inmutables
      </q-chip>
    </div>

    <q-timeline color="secondary" layout="dense">
      <q-timeline-entry
        v-for="item in trazabilidad"
        :key="item.id"
        :color="getTimelineColor(item.estado_nuevo)"
        :icon="getTimelineIcon(item.estado_nuevo)"
      >
        <template v-slot:title>
          <div class="row items-center q-gutter-x-sm">
            <span class="text-weight-bold">{{ item.estado_nuevo }}</span>
            <q-badge color="grey-3" text-color="dark" class="q-px-xs">
              Previo: {{ item.estado_anterior }}
            </q-badge>
          </div>
        </template>

        <template v-slot:subtitle>
          <div class="text-caption text-grey-8">
            <q-icon name="person" size="xs" class="q-mr-xs" />
            <strong class="text-dark">{{ item.user_nombre }}</strong> ({{ item.user_rol }})
            <span class="q-ml-sm">•</span>
            <q-icon name="schedule" size="xs" class="q-ml-sm q-mr-xs" />
            {{ formatDate(item.created_at) }}
          </div>
        </template>

        <div class="text-body2 q-mt-xs q-pa-sm bg-white rounded-borders border-grey">
          {{ item.motivo_comentario || 'Sin observaciones registradas.' }}
        </div>
      </q-timeline-entry>
    </q-timeline>
  </q-card>
</template>

<script setup>
import { date } from 'quasar'

defineProps({
  trazabilidad: {
    type: Array,
    default: () => []
  }
})

const getTimelineColor = (estado) => {
  switch (estado) {
    case 'PROGRAMADO': return 'info'
    case 'BANCO_RECIBIDO': return 'warning'
    case 'GENERADO': return 'secondary'
    case 'IMPRESO': return 'accent'
    case 'ENTREGADO': return 'primary'
    case 'EJECUTADO': return 'positive'
    case 'SUBIDO': return 'green-9'
    case 'SUSPENDIDO': return 'negative'
    default: return 'grey-7'
  }
}

const getTimelineIcon = (estado) => {
  switch (estado) {
    case 'PROGRAMADO': return 'event_note'
    case 'BANCO_RECIBIDO': return 'description'
    case 'GENERADO': return 'auto_awesome'
    case 'IMPRESO': return 'print'
    case 'ENTREGADO': return 'mark_email_read'
    case 'EJECUTADO': return 'task_alt'
    case 'SUBIDO': return 'cloud_upload'
    case 'SUSPENDIDO': return 'block'
    default: return 'label'
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return date.formatDate(dateStr, 'DD/MM/YYYY - HH:mm:ss')
}
</script>

<style scoped>
.border-grey {
  border: 1px solid #e2e8f0;
}
</style>
