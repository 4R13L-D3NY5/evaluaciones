<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h5 class="text-h5 text-weight-bold q-my-none text-primary">
          <q-icon name="assignment" class="q-mr-sm" />
          Gestión de Evaluaciones y Trazabilidad
        </h5>
        <div class="text-caption text-grey-8">
          Departamento de Evaluaciones: Control de recepción de Excel, generación, impresión, suspensión y versiones.
        </div>
      </div>

      <q-btn
        label="Nueva Programación"
        color="primary"
        icon="add"
        to="/programacion-director"
      />
    </div>

    <!-- Filtros de Estado -->
    <q-card flat bordered class="q-mb-md bg-white">
      <q-card-section class="q-pa-sm row items-center q-gutter-sm">
        <span class="text-subtitle2 text-grey-8 q-ml-sm">Filtrar por Estado:</span>
        <q-btn
          v-for="est in ['TODOS', 'PROGRAMADO', 'BANCO_RECIBIDO', 'GENERADO', 'IMPRESO', 'ENTREGADO', 'EJECUTADO', 'SUBIDO', 'SUSPENDIDO']"
          :key="est"
          :label="est"
          :color="filtroEstado === est ? 'primary' : 'grey-4'"
          :text-color="filtroEstado === est ? 'white' : 'dark'"
          size="sm"
          flat
          dense
          class="q-px-sm"
          @click="filtroEstado = est"
        />
      </q-card-section>
    </q-card>

    <!-- Lista de Exámenes -->
    <div class="row q-col-gutter-md">
      <div
        v-for="rol in rolesFiltrados"
        :key="rol.id"
        class="col-12 col-md-6"
      >
        <q-card flat bordered class="bg-white full-height column justify-between">
          <q-card-section>
            <div class="row items-center justify-between q-mb-sm">
              <q-badge :color="getEstadoColor(rol.estado)" text-color="white" class="text-subtitle2 q-pa-xs">
                <q-icon :name="getEstadoIcon(rol.estado)" size="xs" class="q-mr-xs" />
                {{ rol.estado }}
              </q-badge>

              <q-badge v-if="rol.con_cartilla" color="blue-9" text-color="white">
                <q-icon name="style" size="xs" class="q-mr-xs" /> CON CARTILLA
              </q-badge>
              <q-badge v-else color="grey-7" text-color="white">
                SIN CARTILLA
              </q-badge>
            </div>

            <div class="text-h6 text-weight-bold text-dark q-mt-xs">
              {{ rol.asignatura_nombre }} ({{ rol.asignatura_codigo }})
            </div>

            <div class="text-body2 text-grey-8">
              <strong>Grupo:</strong> {{ rol.grupo_nombre }} | <strong>Sede:</strong> {{ rol.sede_nombre }}<br/>
              <strong>Docente:</strong> {{ rol.docente_nombre }}<br/>
              <strong>Fecha:</strong> {{ rol.fecha_examen }} ({{ rol.hora_inicio }} - {{ rol.hora_fin }}) | <strong>Aula:</strong> {{ rol.aula }}
            </div>

            <!-- Banner de Suspensión si aplica -->
            <div v-if="rol.estado === 'SUSPENDIDO'" class="bg-red-1 border-red q-pa-sm rounded-borders q-mt-sm">
              <div class="text-weight-bold text-negative">
                <q-icon name="block" /> EXAMEN SUSPENDIDO
              </div>
              <div class="text-caption text-grey-9">
                <strong>Motivo:</strong> {{ rol.motivo_suspension }}
              </div>
            </div>

            <!-- Versiones Generadas si existen -->
            <div v-if="rol.examenesGenerados && rol.examenesGenerados.length" class="q-mt-sm">
              <div class="text-caption text-weight-bold text-grey-8">Paquetes / Versiones Generadas:</div>
              <div class="row q-gutter-xs q-mt-xs">
                <q-chip
                  v-for="(ex, idx) in rol.examenesGenerados"
                  :key="idx"
                  size="sm"
                  color="teal-1"
                  text-color="teal-10"
                  icon="picture_as_pdf"
                >
                  Var {{ ex.variante }} ({{ ex.version_codigo }})
                </q-chip>
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="bg-grey-1 q-pa-sm justify-between">
            <q-btn
              label="Auditoría"
              icon="history"
              color="primary"
              flat
              size="sm"
              @click="abrirTrazabilidad(rol)"
            />

            <div class="row q-gutter-xs">
              <!-- Acción Cargar Excel -->
              <q-btn
                v-if="rol.estado === 'PROGRAMADO'"
                label="Cargar Excel"
                icon="upload_file"
                color="secondary"
                size="sm"
                @click="abrirCargaExcel(rol)"
              />

              <!-- Acción Generar Examen -->
              <q-btn
                v-if="rol.estado === 'BANCO_RECIBIDO' || rol.estado === 'GENERADO'"
                label="Generar (PDF)"
                icon="auto_awesome"
                color="positive"
                size="sm"
                @click="generarExamenRegular(rol)"
              />

              <!-- Acción Nueva Versión Especial -->
              <q-btn
                v-if="rol.estado === 'GENERADO' || rol.estado === 'IMPRESO'"
                label="+ Versión Especial"
                icon="difference"
                color="accent"
                size="sm"
                flat
                @click="abrirNuevaVersion(rol)"
              />

              <!-- Acción Avanzar Estado -->
              <q-btn
                v-if="['GENERADO', 'IMPRESO', 'ENTREGADO', 'EJECUTADO'].includes(rol.estado)"
                :label="getSiguienteEstadoLabel(rol.estado)"
                icon="navigate_next"
                color="blue-9"
                size="sm"
                @click="avanzarEstado(rol)"
              />

              <!-- Acción Suspender (Habilitado en CUALQUIER estado excepto SUSPENDIDO) -->
              <q-btn
                v-if="rol.estado !== 'SUSPENDIDO' && rol.estado !== 'SUBIDO'"
                label="Suspender"
                icon="block"
                color="negative"
                flat
                size="sm"
                @click="abrirModalSuspender(rol)"
              />
            </div>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Modal Trazabilidad Dialog -->
    <q-dialog v-model="modalTrazabilidadOpen" style="width: 700px; max-width: 90vw;">
      <q-card style="width: 700px; max-width: 90vw;">
        <q-card-section class="bg-primary text-white row items-center">
          <q-icon name="history" size="md" class="q-mr-sm" />
          <div class="text-h6">Auditoría: {{ rolSeleccionado?.asignatura_nombre }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <TimelineTrazabilidad :trazabilidad="rolSeleccionado?.trazabilidad || []" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Modales Auxiliares -->
    <ModalCargaExcel
      v-model="modalExcelOpen"
      :rolExamen="rolSeleccionado"
    />

    <ModalSuspenderExamen
      v-model="modalSuspenderOpen"
      :rolExamen="rolSeleccionado"
    />

    <ModalNuevaVersionExamen
      v-model="modalNuevaVersionOpen"
      :rolExamen="rolSeleccionado"
    />
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useMockStorageStore } from '../stores/mockStorage'
import TimelineTrazabilidad from '../components/TimelineTrazabilidad.vue'
import ModalCargaExcel from '../components/ModalCargaExcel.vue'
import ModalSuspenderExamen from '../components/ModalSuspenderExamen.vue'
import ModalNuevaVersionExamen from '../components/ModalNuevaVersionExamen.vue'

const $q = useQuasar()
const mockStore = useMockStorageStore()

const filtroEstado = ref('TODOS')
const rolSeleccionado = ref(null)

const modalTrazabilidadOpen = ref(false)
const modalExcelOpen = ref(false)
const modalSuspenderOpen = ref(false)
const modalNuevaVersionOpen = ref(false)

const rolesFiltrados = computed(() => {
  if (filtroEstado.value === 'TODOS') return mockStore.rolesExamenes
  return mockStore.rolesExamenes.filter(r => r.estado === filtroEstado.value)
})

const getEstadoColor = (estado) => {
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

const getEstadoIcon = (estado) => {
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

const getSiguienteEstadoLabel = (estadoActual) => {
  switch (estadoActual) {
    case 'GENERADO': return 'Marcar Impreso'
    case 'IMPRESO': return 'Marcar Entregado'
    case 'ENTREGADO': return 'Marcar Ejecutado'
    case 'EJECUTADO': return 'Subir Notas/Cartillas'
    default: return 'Avanzar'
  }
}

const abrirTrazabilidad = (rol) => {
  rolSeleccionado.value = rol
  modalTrazabilidadOpen.value = true
}

const abrirCargaExcel = (rol) => {
  rolSeleccionado.value = rol
  modalExcelOpen.value = true
}

const abrirModalSuspender = (rol) => {
  rolSeleccionado.value = rol
  modalSuspenderOpen.value = true
}

const abrirNuevaVersion = (rol) => {
  rolSeleccionado.value = rol
  modalNuevaVersionOpen.value = true
}

const generarExamenRegular = (rol) => {
  mockStore.generarExamen(rol.id, 'v1.0-REGULAR', false)
  $q.notify({
    type: 'positive',
    message: 'Paquete de exámenes en PDF (Variantes A, B, C) generado con éxito.',
    icon: 'auto_awesome'
  })
}

const avanzarEstado = (rol) => {
  let sig = ''
  if (rol.estado === 'GENERADO') sig = 'IMPRESO'
  else if (rol.estado === 'IMPRESO') sig = 'ENTREGADO'
  else if (rol.estado === 'ENTREGADO') sig = 'EJECUTADO'
  else if (rol.estado === 'EJECUTADO') sig = 'SUBIDO'

  if (sig) {
    mockStore.cambiarEstado(rol.id, sig, `Estado avanzado manualmente a ${sig}`)
    $q.notify({
      type: 'info',
      message: `Examen avanzado a estado ${sig}`,
      icon: 'navigate_next'
    })
  }
}
</script>

<style scoped>
.border-red {
  border: 1px solid #fca5a5;
}
</style>
