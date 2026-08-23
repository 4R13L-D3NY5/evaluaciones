<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="width: 500px; max-width: 90vw;">
      <q-card-section class="bg-negative text-white row items-center">
        <q-icon name="warning" size="md" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">Suspender Examen de Evaluación</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="text-body2 text-grey-9 q-mb-md">
          Atención: Está a punto de <strong>SUSPENDER</strong> el proceso de evaluación para:
          <div class="bg-grey-2 q-pa-sm rounded-borders q-mt-xs">
            <strong>{{ rolExamen?.asignatura_nombre }}</strong> ({{ rolExamen?.grupo_nombre }})<br/>
            Fecha: {{ rolExamen?.fecha_examen }} | Estado Actual: {{ rolExamen?.estado }}
          </div>
        </div>

        <q-form @submit="confirmarSuspension" class="q-gutter-md">
          <q-input
            v-model="motivo"
            type="textarea"
            label="Motivo Obligatorio de Suspensión *"
            placeholder="Escriba detalladamente el motivo de la suspensión (mínimo 5 caracteres)..."
            outlined
            rows="4"
            :rules="[val => (val && val.trim().length >= 5) || 'El motivo es estrictamente obligatorio (mínimo 5 caracteres)']"
          />

          <div class="row justify-end q-gutter-sm">
            <q-btn label="Cancelar" color="grey-7" flat v-close-popup />
            <q-btn
              label="Confirmar Suspensión"
              color="negative"
              icon="block"
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

const emit = defineEmits(['update:modelValue', 'suspendido'])

const $q = useQuasar()
const mockStore = useMockStorageStore()

const motivo = ref('')
const loading = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const confirmarSuspension = () => {
  if (!motivo.value || motivo.value.trim().length < 5) return

  loading.value = true

  setTimeout(() => {
    mockStore.suspenderExamen(props.rolExamen.id, motivo.value.trim())

    $q.notify({
      type: 'negative',
      message: 'El examen ha sido SUSPENDIDO y registrado en el historial de trazabilidad.',
      icon: 'block',
      position: 'top-right'
    })

    loading.value = false
    motivo.value = ''
    isOpen.value = false
    emit('suspendido')
  }, 400)
}
</script>
