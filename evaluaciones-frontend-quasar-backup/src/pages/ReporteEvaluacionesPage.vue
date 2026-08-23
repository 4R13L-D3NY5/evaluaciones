<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h5 class="text-h5 text-weight-bold q-my-none text-primary">
          <q-icon name="query_stats" class="q-mr-sm" />
          Reporte de Evaluaciones y Cobertura Nacional
        </h5>
        <div class="text-caption text-grey-8">
          Estadísticas operativas de avance, recepción de planillas Excel y efectividad de impresión.
        </div>
      </div>

      <div class="row q-gutter-sm">
        <q-btn flat round dense icon="refresh" color="grey-8" @click="cargarReporte">
          <q-tooltip>Actualizar Datos</q-tooltip>
        </q-btn>
        <q-btn label="Exportar Reporte PDF" color="teal" icon="picture_as_pdf" @click="exportarPdf" />
      </div>
    </div>

    <!-- Filtros de Alcance -->
    <q-card flat bordered class="q-mb-md bg-white q-pa-sm">
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-3">
          <q-select
            v-model="filtros.alcance"
            :options="['Nacional (Todas las Sedes)', 'Cochabamba', 'Cobija', 'Guayaramerín']"
            label="Alcance del Reporte"
            outlined
            dense
          />
        </div>
        <div class="col-12 col-md-3">
          <q-select
            v-model="filtros.carrera"
            :options="['Todas las Carreras', 'Medicina', 'Ingeniería Comercial', 'Bioquímica y Farmacia']"
            label="Carrera"
            outlined
            dense
          />
        </div>
        <div class="col-12 col-md-3">
          <q-input v-model="filtros.gestion" label="Gestión Académica" outlined dense readonly />
        </div>
      </div>
    </q-card>

    <!-- KPI Summary Cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-white">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-caption text-grey-7">Total Exámenes Programados</div>
              <div class="text-h4 text-weight-bolder text-primary">128</div>
            </div>
            <q-avatar color="blue-1" text-color="primary" icon="event_note" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-white">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-caption text-grey-7">Bancos Excel Recepcionados</div>
              <div class="text-h4 text-weight-bolder text-warning">115</div>
              <div class="text-caption text-positive">89.8% Cobertura</div>
            </div>
            <q-avatar color="amber-1" text-color="amber-10" icon="description" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-white">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-caption text-grey-7">PDFs Generados & Impresos</div>
              <div class="text-h4 text-weight-bolder text-secondary">98</div>
              <div class="text-caption text-grey-8">76.5% Impreso</div>
            </div>
            <q-avatar color="teal-1" text-color="teal-10" icon="print" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="bg-white">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-caption text-grey-7">Exámenes Suspendidos</div>
              <div class="text-h4 text-weight-bolder text-negative">2</div>
              <div class="text-caption text-negative">1.5% Justificados</div>
            </div>
            <q-avatar color="red-1" text-color="negative" icon="block" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Tabla Detallada de Cobertura por Carrera -->
    <q-card flat bordered class="bg-white">
      <q-card-section>
        <div class="text-subtitle1 text-weight-bold text-primary q-mb-sm">
          Detalle de Cobertura y Avance por Sede y Carrera
        </div>
        <q-table
          :rows="reporteRows"
          :columns="reporteCols"
          row-key="carrera"
          flat
          bordered
          dense
        >
          <template v-slot:body-cell-cobertura="props">
            <q-td :props="props">
              <q-linear-progress :value="props.row.porcentaje / 100" color="primary" height="10px" rounded />
              <div class="text-caption text-right q-mt-xs">{{ props.row.porcentaje }}%</div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const filtros = ref({
  alcance: 'Nacional (Todas las Sedes)',
  carrera: 'Todas las Carreras',
  gestion: '2-2026'
})

const reporteCols = [
  { name: 'sede', label: 'Sede', field: 'sede', align: 'left' },
  { name: 'carrera', label: 'Carrera', field: 'carrera', align: 'left' },
  { name: 'programados', label: 'Programados', field: 'programados', align: 'center' },
  { name: 'recibidos', label: 'Bancos Excel Recibidos', field: 'recibidos', align: 'center' },
  { name: 'generados', label: 'Generados PDF', field: 'generados', align: 'center' },
  { name: 'cobertura', label: 'Efectividad', field: 'porcentaje', align: 'center', style: 'width: 160px' }
]

const reporteRows = ref([
  { sede: 'Cochabamba', carrera: 'Medicina', programados: 60, recibidos: 58, generados: 52, porcentaje: 96.6 },
  { sede: 'Cochabamba', carrera: 'Ingeniería Comercial', programados: 35, recibidos: 32, generados: 28, porcentaje: 91.4 },
  { sede: 'Guayaramerín', carrera: 'Bioquímica y Farmacia', programados: 20, recibidos: 16, generados: 12, porcentaje: 80.0 },
  { sede: 'Cobija', carrera: 'Medicina', programados: 13, recibidos: 9, generados: 6, porcentaje: 69.2 }
])

const cargarReporte = () => {
  $q.notify({
    type: 'info',
    message: 'Datos de reportes actualizados.',
    icon: 'refresh'
  })
}

const exportarPdf = () => {
  $q.notify({
    type: 'positive',
    message: 'Generando archivo PDF del reporte consolidado...',
    icon: 'picture_as_pdf'
  })
}
</script>
