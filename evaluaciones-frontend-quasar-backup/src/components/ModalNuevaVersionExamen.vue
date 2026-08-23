<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="width: 520px; max-width: 90vw;">
      <q-card-section class="bg-primary text-white row items-center">
        <q-icon name="difference" size="md" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">Generar Nueva Versión / Caso Especial</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="text-body2 text-grey-8 q-mb-md">
          Esta función permite generar un paquete de examen adicional o especial (versión secundaria, rezagados, exámenes adaptados) sin modificar el paquete regular previamente creado.
        </div>

        <q-form @submit="confirmarGeneracion" class="q-gutter-md">
          <q-input
            v-model="versionCodigo"
            label="Código de Versión *"
            placeholder="Ej: v2.0-REZAGADOS, v2.1-ADAPTADO"
            outlined
            dense
            :rules="[val => !!val || 'El código de versión es requerido']"
          />

          <q-toggle
            v-model="esCasoEspecial"
            label="¿Es una versión para caso especial / adaptado?"
            color="accent"
          />

          <q-input
            v-model="descripcionVersion"
            type="textarea"
            label="Descripción / Justificación de la Versión *"
            placeholder="Ej: Examen adaptado con mayor tiempo límite para estudiante con permiso especial..."
            outlined
            rows="3"
            :rules="[val => !!val || 'La justificación es requerida']"
          />

          <div class="row justify-end q-gutter-sm">
            <q-btn label="Cancelar" color="grey-7" flat v-close-popup />
            <q-btn
              label="Gatillar Generación"
              color="primary"
              icon="auto_awesome"
              type="submit"
              :loading="loading"
            />
          </div>
        </q-form>
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

const emit = defineEmits(['update:modelValue', 'versionGenerada'])

const $q = useQuasar()
const mockStore = useMockStorageStore()

const versionCodigo = ref('v2.0-CASO_ESPECIAL')
const esCasoEspecial = ref(true)
const descripcionVersion = ref('')
const loading = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const confirmarGeneracion = () => {
  loading.value = true

  setTimeout(() => {
    mockStore.generarExamen(props.rolExamen.id, versionCodigo.value, esCasoEspecial.value)

    $q.notify({
      type: 'positive',
      message: `Nueva versión '${versionCodigo.value}' generada con éxito y registrada en trazabilidad.`,
      icon: 'check_circle',
      position: 'top-right'
    })

    loading.value = false
    isOpen.value = false
    emit('versionGenerada')
  }, 500)
}
</script>
