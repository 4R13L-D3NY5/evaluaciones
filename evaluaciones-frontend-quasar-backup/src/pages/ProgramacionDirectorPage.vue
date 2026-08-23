<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div>
        <h5 class="text-h5 text-weight-bold q-my-none text-primary">
          <q-icon name="edit_calendar" class="q-mr-sm" />
          Programación de Exámenes (Director de Carrera)
        </h5>
        <div class="text-caption text-grey-8">
          Registro inicial de roles de evaluación definiendo el uso de cartillas de lectura óptica.
        </div>
      </div>
    </div>

    <q-card flat bordered class="q-pa-md bg-white">
      <q-card-section>
        <q-form @submit="guardarProgramacion" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.sede_nombre"
                :options="['Cochabamba', 'Cobija', 'Guayaramerín']"
                label="Sede Académica *"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.carrera_nombre"
                :options="['Medicina', 'Ingeniería Comercial', 'Bioquímica y Farmacia']"
                label="Carrera *"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.gestion_codigo"
                label="Gestión Académica"
                outlined
                dense
                readonly
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.asignatura_nombre"
                label="Nombre de Asignatura *"
                placeholder="Ej: Anatomía Humana II"
                outlined
                dense
                :rules="[val => !!val || 'Requerido']"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="form.asignatura_codigo"
                label="Código Asignatura *"
                placeholder="Ej: MED-212"
                outlined
                dense
                :rules="[val => !!val || 'Requerido']"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="form.grupo_nombre"
                label="Grupo *"
                placeholder="Ej: Grupo 1"
                outlined
                dense
                :rules="[val => !!val || 'Requerido']"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.docente_nombre"
                label="Nombre del Docente *"
                placeholder="Ej: Dr. Carlos Mendoza"
                outlined
                dense
                :rules="[val => !!val || 'Requerido']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.tipo_evaluacion"
                :options="['1ER_PARCIAL', '2DO_PARCIAL', 'EXAMEN_FINAL', '2DA_INSTANCIA', 'EXTRAORDINARIO']"
                label="Tipo de Evaluación *"
                outlined
                dense
              />
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-3">
              <q-input v-model="form.fecha_examen" type="date" label="Fecha de Examen *" outlined dense />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model="form.hora_inicio" type="time" label="Hora Inicio *" outlined dense />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model="form.hora_fin" type="time" label="Hora Fin *" outlined dense />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model="form.aula" label="Aula / Recinto *" outlined dense />
            </div>
          </div>

          <!-- Requisito: Opción explícita si usa cartillas ópticas -->
          <div class="q-pa-sm bg-blue-1 rounded-borders border-blue row items-center">
            <q-icon name="style" color="primary" size="md" class="q-mr-md" />
            <div>
              <div class="text-subtitle2 text-weight-bold text-primary">¿Requiere Cartillas de Lectura Óptica?</div>
              <div class="text-caption text-grey-8">Si se marca, el sistema generará plantillas de respuestas para escáner.</div>
            </div>
            <q-space />
            <q-toggle v-model="form.con_cartilla" color="primary" icon="document_scanner" size="lg" />
          </div>

          <div class="row justify-end q-mt-md">
            <q-btn
              label="Registrar Programación de Examen"
              color="primary"
              icon="save"
              size="md"
              type="submit"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useMockStorageStore } from '../stores/mockStorage'

const $q = useQuasar()
const router = useRouter()
const mockStore = useMockStorageStore()

const form = ref({
  gestion_codigo: '2-2026',
  sede_nombre: 'Cochabamba',
  carrera_nombre: 'Medicina',
  asignatura_nombre: '',
  asignatura_codigo: '',
  grupo_nombre: 'Grupo 1',
  docente_nombre: '',
  tipo_evaluacion: '1ER_PARCIAL',
  fecha_examen: '2026-08-25',
  hora_inicio: '08:00',
  hora_fin: '09:30',
  aula: 'Aula 101',
  con_cartilla: true
})

const guardarProgramacion = () => {
  mockStore.agregarRol(form.value)

  $q.notify({
    type: 'positive',
    message: 'Programación creada exitosamente por la Dirección de Carrera.',
    icon: 'check_circle',
    position: 'top-right'
  })

  router.push('/roles-examenes')
}
</script>

<style scoped>
.border-blue {
  border: 1px solid #93c5fd;
}
</style>
