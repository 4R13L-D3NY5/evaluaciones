<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div>
        <h5 class="text-h5 text-weight-bold q-my-none text-primary">
          <q-icon name="picture_as_pdf" class="q-mr-sm" />
          Visor de Paquetes PDF Generados
        </h5>
        <div class="text-caption text-grey-8">
          Vista previa y descarga de variantes A, B, C y versiones especiales de examen.
        </div>
      </div>
    </div>

    <q-card flat bordered class="q-pa-md bg-white">
      <div class="text-body1 text-grey-8 text-center q-pa-lg">
        <q-icon name="cloud_download" size="64px" color="secondary" />
        <div class="text-h6 text-weight-bold q-mt-md">Descarga Directa de Paquetes de Impresión</div>
        <div class="text-caption text-grey-7 q-mb-md">
          Los paquetes generados incluyen el examen en PDF por variantes, la hoja de firmas del grupo y la cartilla de claves para calificación.
        </div>
        <q-btn label="Volver a Gestión de Evaluaciones" color="primary" icon="arrow_back" to="/roles-examenes" />
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
</script>
