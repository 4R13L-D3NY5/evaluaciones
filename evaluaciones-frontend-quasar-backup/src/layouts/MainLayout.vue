<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-weight-bold row items-center">
          <q-icon name="quiz" size="md" class="q-mr-sm" />
          Sistema de Evaluaciones Independiente
          <q-badge color="amber-9" text-color="black" class="q-ml-sm text-weight-bold">
            XpertiFlow (SISA)
          </q-badge>
        </q-toolbar-title>

        <q-space />

        <!-- Toggle Mock / API Mode -->
        <div class="row items-center q-mr-md bg-blue-10 q-px-sm rounded-borders">
          <span class="text-caption text-grey-3 q-mr-xs">Modo Mock:</span>
          <q-toggle
            v-model="mockStore.useMock"
            color="amber"
            keep-color
            dense
          />
        </div>

        <!-- Selector Interactivo de Actores -->
        <q-btn-dropdown
          flat
          no-caps
          class="bg-blue-9 text-white rounded-borders"
        >
          <template v-slot:label>
            <div class="row items-center q-gutter-x-xs">
              <q-avatar size="28px" :color="authStore.currentRole.color" text-color="white">
                <q-icon :name="authStore.currentRole.icon" size="xs" />
              </q-avatar>
              <div class="text-left q-ml-xs">
                <div class="text-weight-bold leading-none">{{ authStore.currentRole.userName }}</div>
                <div class="text-caption leading-none text-blue-2">{{ authStore.currentRole.label }}</div>
              </div>
            </div>
          </template>

          <q-list class="bg-white text-dark" style="min-width: 280px">
            <q-item-label header class="text-weight-bold text-uppercase text-grey-8">
              Cambiar Actor Simulado
            </q-item-label>

            <q-item
              v-for="role in authStore.availableRoles"
              :key="role.id"
              clickable
              v-close-popup
              :active="authStore.currentRole.id === role.id"
              active-class="bg-blue-1 text-primary text-weight-bold"
              @click="seleccionarActor(role.id)"
            >
              <q-item-section avatar>
                <q-avatar :color="role.color" text-color="white">
                  <q-icon :name="role.icon" size="sm" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">{{ role.userName }}</q-item-label>
                <q-item-label caption class="text-weight-medium">{{ role.label }}</q-item-label>
                <q-item-label caption class="text-grey-7" style="font-size: 11px">
                  {{ role.description }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <!-- Sidebar Drawer -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1">
      <q-list class="q-pt-sm">
        <!-- Banner del Actor Activo en Sidebar -->
        <q-item class="bg-blue-1 q-ma-sm rounded-borders border-blue">
          <q-item-section avatar>
            <q-avatar :color="authStore.currentRole.color" text-color="white" size="40px">
              <q-icon :name="authStore.currentRole.icon" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold text-primary">
              {{ authStore.currentRole.userName }}
            </q-item-label>
            <q-item-label caption class="text-weight-bold">
              {{ authStore.currentRole.label }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-xs" />

        <!-- GRUPO 1: PRINCIPAL -->
        <q-item-label header class="text-weight-bold text-uppercase text-grey-8">
          Módulos Principales (SIDOPA)
        </q-item-label>

        <q-item clickable v-ripple to="/dashboard" active-class="bg-blue-1 text-primary text-weight-bold">
          <q-item-section avatar>
            <q-icon name="dashboard" color="primary" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Dashboard General</q-item-label>
            <q-item-label caption>Resumen de estados KPI</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/evaluaciones/rol-examenes" active-class="bg-blue-1 text-primary text-weight-bold">
          <q-item-section avatar>
            <q-icon name="event_note" color="secondary" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Rol de Exámenes</q-item-label>
            <q-item-label caption>Programación, cartillas y estados</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/evaluaciones/gestion" active-class="bg-blue-1 text-primary text-weight-bold">
          <q-item-section avatar>
            <q-icon name="assignment" color="accent" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Gestión de Evaluaciones</q-item-label>
            <q-item-label caption>Recepción Excel, PDF, Auditoría</q-item-label>
          </q-item-section>

          <q-chip size="xs" color="amber-9" text-color="black" class="text-weight-bold">
            Excel
          </q-chip>
        </q-item>

        <q-separator class="q-my-xs" />

        <!-- GRUPO 2: ADMINISTRACIÓN & REPORTES -->
        <q-item-label header class="text-weight-bold text-uppercase text-grey-8">
          Administración & Analítica
        </q-item-label>

        <q-item clickable v-ripple to="/admin/evaluaciones-config" active-class="bg-blue-1 text-primary text-weight-bold">
          <q-item-section avatar>
            <q-icon name="tune" color="indigo" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Administración Evaluaciones</q-item-label>
            <q-item-label caption>Parámetros, tiempos e instrucciones</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/admin/reportes-evaluaciones" active-class="bg-blue-1 text-primary text-weight-bold">
          <q-item-section avatar>
            <q-icon name="query_stats" color="teal" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Reportes de Evaluaciones</q-item-label>
            <q-item-label caption>Cobertura nacional y porcentajes</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-xs" />

        <!-- GRUPO 3: SSO -->
        <q-item clickable v-ripple to="/login">
          <q-item-section avatar>
            <q-icon name="vpn_key" color="dark" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Keycloak SSO (Mock)</q-item-label>
            <q-item-label caption>Simulador de Autenticación SEA</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Content Container -->
    <q-page-container class="bg-grey-2">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useMockStorageStore } from '../stores/mockStorage'
import { useAuthStore } from '../stores/authStore'

const $q = useQuasar()
const mockStore = useMockStorageStore()
const authStore = useAuthStore()

const leftDrawerOpen = ref(false)

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const seleccionarActor = (roleId) => {
  authStore.setActor(roleId)
  $q.notify({
    type: 'info',
    message: `Actor cambiado a: ${authStore.currentRole.userName} (${authStore.currentRole.label})`,
    icon: authStore.currentRole.icon,
    position: 'top-right'
  })
}
</script>

<style scoped>
.leading-none {
  line-height: 1.2;
}
.border-blue {
  border: 1px solid #bfdbfe;
}
</style>
