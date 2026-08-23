<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h5 class="text-h5 text-weight-bold q-my-none text-primary">
          <q-icon name="tune" class="q-mr-sm" />
          Administración y Configuración de Evaluaciones
        </h5>
        <div class="text-caption text-grey-8">
          Configuración de parámetros globales, número de preguntas, tiempos límites y encabezados oficiales.
        </div>
      </div>

      <q-btn
        label="Guardar Configuración"
        color="primary"
        icon="save"
        :loading="guardando"
        @click="guardarConfiguracion"
      />
    </div>

    <q-card flat bordered class="bg-white">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
      >
        <q-tab name="parametros" icon="settings" label="Parámetros Generales" no-caps />
        <q-tab name="encabezado" icon="subtitles" label="Instrucciones & Encabezado" no-caps />
        <q-tab name="fechas" icon="date_range" label="Ventanas de Evaluación" no-caps />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <!-- TAB 1: PARÁMETROS GENERALES -->
        <q-tab-panel name="parametros" class="q-pa-md">
          <div class="text-subtitle1 text-weight-bold text-primary q-mb-sm">
            Parámetros Estándar de Generación por Gestión (2-2026)
          </div>

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="config.preguntasPorExamen"
                type="number"
                label="Cantidad de Preguntas por Examen *"
                hint="Ej: 30 preguntas de selección múltiple"
                outlined
                dense
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                v-model.number="config.tiempoLimiteMinutos"
                type="number"
                label="Tiempo Límite de la Prueba (Minutos) *"
                hint="Ej: 90 minutos"
                outlined
                dense
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                v-model.number="config.variantesRequeridas"
                type="number"
                label="Variantes Requeridas por Examen *"
                hint="Ej: 3 variantes (A, B, C)"
                outlined
                dense
              />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="row items-center justify-between">
            <div>
              <div class="text-subtitle2 text-weight-bold">Impresión de Cartillas Ópticas por Defecto</div>
              <div class="text-caption text-grey-7">Genera automáticamente la hoja de respuestas con código de barras.</div>
            </div>
            <q-toggle v-model="config.conCartillaPorDefecto" color="primary" icon="style" size="lg" />
          </div>
        </q-tab-panel>

        <!-- TAB 2: INSTRUCCIONES Y ENCABEZADO -->
        <q-tab-panel name="encabezado" class="q-pa-md">
          <div class="text-subtitle1 text-weight-bold text-primary q-mb-sm">
            Texto Oficial de Encabezado de Exámenes UNITEPC
          </div>

          <q-input
            v-model="config.instruccionesHeader"
            type="textarea"
            label="Instrucciones Oficiales para el Estudiante *"
            outlined
            rows="6"
            placeholder="Escriba las reglas generales impresas en la primera hoja del examen..."
          />

          <div class="bg-grey-2 q-pa-sm rounded-borders q-mt-sm text-caption text-grey-8">
            <strong>Vista previa del encabezado:</strong><br/>
            UNIVERSIDAD TÉCNICA PRIVADA COSMOS - UNITEPC<br/>
            {{ config.instruccionesHeader }}
          </div>
        </q-tab-panel>

        <!-- TAB 3: VENTANAS DE FECHAS -->
        <q-tab-panel name="fechas" class="q-pa-md">
          <div class="text-subtitle1 text-weight-bold text-primary q-mb-sm">
            Fechas Límite para Recepción de Bancos por Gestión
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input v-model="config.fechaAperturaRecepcion" type="datetime-local" label="Apertura Recepción Excel *" outlined dense />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="config.fechaCierreRecepcion" type="datetime-local" label="Cierre Límite Recepción Excel *" outlined dense />
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const tab = ref('parametros')
const guardando = ref(false)

const config = ref({
  preguntasPorExamen: 30,
  tiempoLimiteMinutos: 90,
  variantesRequeridas: 3,
  conCartillaPorDefecto: true,
  instruccionesHeader: 'Lea atentamente cada pregunta antes de marcar su respuesta. Use bolígrafo azul o negro. Toda marca doble o borrón anulará la pregunta correspondiente.',
  fechaAperturaRecepcion: '2026-08-01T08:00',
  fechaCierreRecepcion: '2026-08-18T23:59'
})

const guardarConfiguracion = () => {
  guardando.value = true
  setTimeout(() => {
    guardando.value = false
    $q.notify({
      type: 'positive',
      message: 'Configuración global de evaluaciones guardada correctamente.',
      icon: 'check_circle',
      position: 'top-right'
    })
  }, 400)
}
</script>
