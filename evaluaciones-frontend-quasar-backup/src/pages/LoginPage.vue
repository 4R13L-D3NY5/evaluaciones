<template>
  <q-page class="row items-center justify-center bg-blue-10 q-pa-md">
    <q-card style="width: 440px; max-width: 90vw;" class="q-pa-md shadow-10 rounded-borders">
      <q-card-section class="text-center">
        <q-avatar size="72px" color="primary" text-color="white" icon="vpn_key" class="q-mb-sm" />
        <div class="text-h5 text-weight-bold text-primary">Autenticación Keycloak SSO</div>
        <div class="text-caption text-grey-7">Simulador de Single Sign-On (SEA / XpertiFlow)</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="email" label="Correo Institucional" outlined dense />
        <q-input v-model="password" type="password" label="Contraseña" outlined dense />
        
        <q-select
          v-model="rolSimulado"
          :options="['DIRECTOR (Director de Carrera)', 'DEPT_EVALUACIONES (Departamento de Evaluaciones)']"
          label="Rol Simulado *"
          outlined
          dense
        />

        <q-btn
          label="Iniciar Sesión con Keycloak"
          color="primary"
          icon="login"
          class="full-width q-mt-md"
          size="lg"
          @click="login"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()

const email = ref('director@unitepc.edu.bo')
const password = ref('••••••••')
const rolSimulado = ref('DEPT_EVALUACIONES (Departamento de Evaluaciones)')

const login = () => {
  $q.notify({
    type: 'positive',
    message: 'Sesión SSO Keycloak iniciada correctamente.',
    icon: 'verified'
  })
  router.push('/dashboard')
}
</script>
