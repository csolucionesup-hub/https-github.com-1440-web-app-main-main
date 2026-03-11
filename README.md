# 1440 - Gestor de Energía, Tiempo y Metas

Bienvenido al Ecosistema **1440**. Una plataforma premium construida para alinear tu tiempo diario (los 1440 minutos críticos) con la ejecución táctica de tu plan de acción y tus metas de vida.

## Arquitectura y Stack Tecnológico
Esta aplicación es un frontend robusto y sin servidor enfocado en la privacidad (Local-First):
* **Framework:** React 18 + Vite
* **Lenguaje:** TypeScript estricto
* **Estilos:** TailwindCSS v4 + Glassmorphism Premium (CSS)
* **Estado Global:** Zustand con persistencia en localStorage
* **Iconografía:** Lucide React

## Estructura del Módulo Estratégico (Metas)
El sistema está construido en base a un modelo jerárquico estricto:

1. **Metas:** El norte. Sólo se permiten **3 metas activas simultáneamente** para forzar el enfoque. Las demás quedan pausadas o pendientes.
2. **Objetivos:** Hitos medibles que componen a una meta.
3. **Tareas (Plan de Acción):** Acciones semanales o mensuales dirigidas al objetivo. Las tareas pueden ser arrastradas al dashboard 1440 para ejecutarlas inmediatamente.
4. **Subtareas:** Tareas atómicas y pasos diarios.

Todo puede ser marcado como `completado` o `completado_anticipado`, preservando visualmente el historial de avance.

## Integración con el Ecosistema Core (Dashboard 1440)
En la vista principal de la aplicación (*Daily1440View*), construimos el puente vital entre lo teórico (las metas) y lo práctico (tu día).
Utilizando **Drag & Drop** nativo, los usuarios pueden arrastrar sus Tareas Pendientes hacia los bloques horarios libres del día. Esto resuelve el requerimiento crítico: *No quiero una función aislada, quiero medir a qué le dedico mi tiempo.* 

## Cómo escalar el sistema de metas hacia un motor de ejecución y logro personal

Para las próximas fases del proyecto en miras de convertirlo en una herramienta analítica, el ecosistema cuenta con un modelo de datos robusto (interfaces `Task`, `TimeBlock`, `Goal`) que ya almacenan fechas de creación (`createdAt`) e `id`s relacionales.

**Próximos Pasos (Hoja de Ruta):**
1. **Analítica de Cumplimiento:** Crear un dashboard de estadísticas (Chart.js / Recharts) que cruce la cantidad de `TimeBlocks` asignados a una `Task` perteneciente a una `Goal`, indicándonos *cuánto tiempo real están absorbiendo tus metas actuales.*
2. **Sistema de Bloqueo Inteligente:** Si una tarea tiene deadline hoy pero no ha sido arrastrada al 1440-Timeline, el sistema emitirá notificaciones (Frases proactivas).
3. **Persistencia Backend:** Migrar o sincronizar el `1440-storage` de Zustand desde el LocalStorage hacia un Backend (Supabase / Firebase) para analítica centralizada, manteniendo el funcionamiento offline-first.

## ¿Cómo iniciar?
```bash
# 1. Instalar dependencias
npm install

# 2. Correr el servidor local Vite
npm run dev
```

Desarrollado con alto estándar funcional y estético.
