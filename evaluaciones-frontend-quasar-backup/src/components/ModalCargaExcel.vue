<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="width: 480px; max-width: 90vw;">
      <q-card-section class="bg-secondary text-white row items-center">
        <q-icon name="upload_file" size="md" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">Recepción de Planilla Excel de Preguntas</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="text-body2 text-grey-8 q-mb-md">
          Cargue la planilla en formato Excel (`.xlsx` / `.tsv`) enviada por el docente para el examen de:
          <div class="bg-grey-2 q-pa-sm rounded-borders q-mt-xs text-weight-bold">
            {{ rolExamen?.asignatura_nombre }} ({{ rolExamen?.grupo_nombre }}) - {{ rolExamen?.docente_nombre }}
          </div>
        </div>

        <q-file
          v-model="archivoExcel"
          label="Seleccionar archivo Excel *"
          outlined
          accept=".xlsx, .xls, .tsv, .csv"
          counter
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>

        <div class="row justify-end q-gutter-sm q-mt-lg">
          <q-btn label="Cancelar" color="grey-7" flat v-close-popup />
          <q-btn
            label="Vincular y Guardar"
            color="secondary"
            icon="cloud_upload"
            :disable="!archivoExcel"
            :loading="loading"
            @click="confirmarCarga"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useMockStorageStore } from '../stores/mockStorage'

const props = defineProps({
  modelValue: Boolean,
  rolExamen: Object
})

const emit = defineEmits(['update:modelValue', 'excelCargado'])

const $q = useQuasar()
const mockStore = useMockStorageStore()

const archivoExcel = ref(null)
const loading = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const confirmarCarga = () => {
  if (!archivoExcel.value) return
  loading.value = true

  setTimeout(() => {
    mockStore.cargarExcel(props.rolExamen.id, archivoExcel.value.name)

    $q.notify({
      type: 'positive',
      message: `Planilla '${archivoExcel.value.name}' vinculada. Estado actualizado a BANCO_RECIBIDO.`,
      icon: 'check_circle',
      position: 'top-right'
    })

    loading.value = false
    archivoExcel.value = null
    isOpen.value = false
    emit('excelCargado')
  }, 400)
}
</script>
