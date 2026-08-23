<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div>
        <h5 class="text-h5 text-weight-bold q-my-none text-primary">
          <q-icon name="dashboard" class="q-mr-sm" />
          Dashboard Ejecutivo de Evaluaciones
        </h5>
        <div class="text-caption text-grey-8">
          Métricas consolidadas de la gestión de exámenes 2-2026.
        </div>
      </div>
    </div>

    <!-- Cards KPI -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="kpi in kpis" :key="kpi.estado" class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered :class="`bg-${kpi.bg} text-dark`">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle2 text-grey-8 text-weight-bold">{{ kpi.label }}</div>
              <div class="text-h3 text-weight-bolder text-primary q-my-xs">{{ kpi.count }}</div>
              <div class="text-caption text-grey-7">{{ kpi.subtitle }}</div>
            </div>
            <q-avatar :color="kpi.color" text-color="white" :icon="kpi.icon" size="56px" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Banner Informativo Paradigma -->
    <q-card flat bordered class="bg-blue-1 border-blue q-pa-md">
      <div class="row items-center">
        <q-icon name="info" color="primary" size="lg" class="q-mr-md" />
        <div>
          <div class="text-subtitle1 text-weight-bold text-primary">
            Modelo Operativo Independiente de Evaluaciones (Ecosistema XpertiFlow)
          </div>
          <div class="text-body2 text-grey-8">
            • Los docentes envían la planilla Excel con el banco de preguntas por correo electrónico.<br/>
            • El Departamento de Evaluaciones recepciona, valida y genera paquetes en PDF (A, B, C) e impresiones especiales.<br/>
            • Trazabilidad inmutable activada para cada cambio de estado, versión y suspensión obligando justificación.
          </div>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useMockStorageStore } from '../stores/mockStorage'

const mockStore = useMockStorageStore()

const counts = computed(() => {
  const list = mockStore.rolesExamenes
  return {
    PROGRAMADO: list.filter(r => r.estado === 'PROGRAMADO').length,
    BANCO_RECIBIDO: list.filter(r => r.estado === 'BANCO_RECIBIDO').length,
    GENERADO: list.filter(r => r.estado === 'GENERADO').length,
    IMPRESO: list.filter(r => r.estado === 'IMPRESO').length,
    ENTREGADO: list.filter(r => r.estado === 'ENTREGADO').length,
    EJECUTADO: list.filter(r => r.estado === 'EJECUTADO').length,
    SUBIDO: list.filter(r => r.estado === 'SUBIDO').length,
    SUSPENDIDO: list.filter(r => r.estado === 'SUSPENDIDO').length
  }
})

const kpis = computed(() => [
  { label: 'Programados', count: counts.value.PROGRAMADO, subtitle: 'Pendiente recepción Excel', icon: 'event_note', color: 'info', bg: 'white' },
  { label: 'Bancos Recibidos', count: counts.value.BANCO_RECIBIDO, subtitle: 'Listos para generación', icon: 'description', color: 'warning', bg: 'white' },
  { label: 'PDFs Generados', count: counts.value.GENERADO, subtitle: 'Variantes A/B/C listas', icon: 'auto_awesome', color: 'secondary', bg: 'white' },
  { label: 'Impresos / En Sobre', count: counts.value.IMPRESO, subtitle: 'Listos para distribución', icon: 'print', color: 'accent', bg: 'white' },
  { label: 'Entregados a Aplicador', count: counts.value.ENTREGADO, subtitle: 'En proceso de toma', icon: 'mark_email_read', color: 'primary', bg: 'white' },
  { label: 'Exámenes Ejecutados', count: counts.value.EJECUTADO, subtitle: 'Prueba tomada en aula', icon: 'task_alt', color: 'positive', bg: 'white' },
  { label: 'Notas/Cartillas Subidas', count: counts.value.SUBIDO, subtitle: 'Evaluación finalizada', icon: 'cloud_upload', color: 'green-9', bg: 'white' },
  { label: 'Suspendidos', count: counts.value.SUSPENDIDO, subtitle: 'Con motivo registrado', icon: 'block', color: 'negative', bg: 'white' }
])
</script>

<style scoped>
.border-blue {
  border: 1px solid #93c5fd;
}
</style>
