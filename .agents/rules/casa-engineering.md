---
trigger: always_on
---

# CASA — Reglas obligatorias del proyecto

Estas reglas son permanentes y deben aplicarse en toda tarea realizada dentro de CASA.

## 1. Principio general

No basta con que el código funcione. Toda solución debe ser correcta, segura, visualmente coherente, mantenible y validada.

Aplicar siempre el cambio mínimo necesario. No convertir una corrección puntual en una refactorización amplia.

Antes de modificar:
- Leer el archivo afectado y sus imports.
- Buscar patrones equivalentes.
- Revisar tipos, servicios, endpoints y dependencias relacionadas.
- Revisar el estado de Git.
- Identificar la causa real antes de editar.

## 2. Referencia visual oficial

La referencia visual principal de CASA es:

`src/pages/SuperAdmin.tsx`

Toda interfaz nueva o modificada debe conservar su lenguaje visual:
- Paleta azul marino, dorado y fondos cálidos.
- Tipografía sobria.
- Tarjetas, inputs, botones, tablas, modales y badges coherentes.
- Bordes, radios, sombras y espaciados consistentes.
- Iconografía mediante `lucide-react`.

Todo CASA comparte un único sistema visual. No crear una identidad distinta para el portal del propietario, contabilidad, tesorería, facturación, autenticación u otros espacios de trabajo.

## 3. Prioridad responsive

Áreas administrativas:
- Prioridad desktop.
- Deben funcionar correctamente en laptops y tablets.
- No deben romperse en móvil.

Portal del propietario:
- Prioridad mobile first.
- Las acciones principales deben ser táctiles, claras y cómodas en teléfono.
- Debe conservar el mismo sistema visual de CASA.

## 4. Prohibiciones visuales

Nunca representar estados, categorías, roles o prioridades con texto rudimentario como:

`[Pendiente]`
`(Activo)`
`- Vencido -`
`{Pagado}`

Nunca usar corchetes, paréntesis, guiones, barras, símbolos o emojis como sustituto de:
- Badges.
- Pills.
- Chips.
- Íconos.
- Componentes visuales reales.

Siempre evaluar si un estado requiere badge, pill o chip.

No introducir:
- Colores arbitrarios.
- Nuevas tipografías.
- Otra librería de íconos.
- Sombras, radios o espacios arbitrarios sin revisar patrones existentes.
- Texto técnico visible para el usuario.
- Elementos sin estados de carga, error, vacío o deshabilitado cuando correspondan.

## 5. Sticky, fixed y elementos pegados al scroll

No usar ni introducir por iniciativa propia:

- `position: sticky`
- `position: fixed`
- `sticky`
- `fixed`
- Cabeceras pegadas.
- Barras flotantes.
- Paneles que sigan el scroll.
- Contenedores que se mantengan visibles mientras el contenido se desplaza.

Estos comportamientos solo pueden implementarse cuando el propietario lo solicite expresamente.

Antes de usar `sticky` o `fixed`, comprobar:
- Que no exista un ancestro con `overflow`.
- Que no tape contenido.
- Que no genere saltos de layout.
- Que no se desprenda visualmente de su sección.
- Que no acompañe accidentalmente el scroll.
- Que funcione en desktop, tablet y móvil.
- Que tenga `z-index` justificado.
- Que no bloquee controles o formularios.

Al corregir un elemento que se queda pegado al scroll sin ser solicitado, eliminar la causa mínima. Revisar clases Tailwind, estilos inline, contenedores padres, `overflow`, `top`, `z-index`, `position` y alturas.

## 6. Componentes reutilizables

Antes de crear un componente, buscar implementaciones existentes, incluso dentro de páginas y archivos locales.

Buscar como mínimo:
- Button.
- Badge.
- StatusBadge.
- Pill.
- Tag.
- Chip.
- Modal.
- Dialog.
- Drawer.
- Input.
- Select.
- Card.
- Table.
- Toast.
- Tabs.
- Dropdown.
- EmptyState.
- Loader.
- Pagination.

No crear una implementación nueva si existe una adecuada.

No centralizar componentes por iniciativa propia. La centralización, extracción o unificación solo puede realizarse cuando el propietario la solicite expresamente.

Detectar duplicación permite reportarla, no corregirla automáticamente.

## 7. Refactorización

Prohibidas sin autorización:
- Refactorizaciones grandes.
- División de archivos monolíticos.
- Reorganización de carpetas.
- Renombrado masivo.
- Cambio de contratos de props.
- Cambio de endpoints o respuestas.
- Migración del sistema de estilos.
- Sustitución de librerías.
- Cambio de arquitectura.
- Centralización masiva.
- Modificaciones fuera del alcance solicitado.

Separar siempre:
1. Corrección solicitada.
2. Refactorización recomendada.
3. Mejoras opcionales.

Ejecutar únicamente la corrección solicitada salvo autorización expresa.

## 8. Frontend

Stack principal:
- React.
- TypeScript.
- Vite.
- Tailwind CSS v4.
- React Router.
- Axios.
- Lucide React.

No crear llamadas HTTP directas dentro de componentes si existe un servicio o repositorio.

Flujo recomendado:

`Componente → servicio/repositorio → cliente HTTP → API`

Los formularios deben respetar los DTO del backend y mostrar errores humanos. Nunca mostrar:
- Stack traces.
- Errores internos de Prisma.
- Mensajes técnicos de Axios.
- JSON crudo.
- Rutas internas.

No usar `alert()` del navegador salvo necesidad excepcional.

## 9. Backend

Stack principal:
- NestJS.
- TypeScript.
- Prisma.
- MySQL.
- class-validator.
- Vitest.

Todo endpoint nuevo debe:
- Usar DTO validado.
- Aplicar guards y scopes necesarios.
- Mantener controladores delgados.
- Delegar lógica a servicios.
- Usar excepciones nativas de NestJS.
- Respetar el filtro global de errores.
- Usar inyección de dependencias.
- Usar transacciones Prisma para operaciones relacionales múltiples.

No instanciar servicios manualmente con `new`.

## 10. Seguridad multi-comunidad


Toda operación relacionada con una comunidad debe verificar:

* Usuario autenticado.
* Comunidad seleccionada dentro del contexto autenticado.
* Acceso vigente del usuario a esa comunidad.
* Scope o permiso requerido.
* Espacio de trabajo autorizado cuando corresponda.
* Pertenencia del recurso a la comunidad seleccionada.

El `communityId` autoritativo debe obtenerse exclusivamente del contexto autenticado y validado por el backend.

Nunca confiar como fuente autoritativa en un `communityId` recibido mediante:

* Body.
* Query parameters.
* Route parameters.
* Headers personalizados.
* Local storage.
* Session storage.
* Estado del frontend.

Cuando una ruta, filtro o solicitud incluya un `communityId`, debe compararse contra el contexto autenticado antes de utilizarse. Una discrepancia debe rechazarse.

Nunca consultar, actualizar o eliminar un recurso únicamente por `id` cuando el recurso pertenezca a una comunidad. La consulta debe incluir también el `communityId` autenticado.

Ejemplo obligatorio:

`where: { id: resourceId, communityId: auth.communityId }`

No utilizar:

`where: { id: resourceId }`

cuando el recurso sea comunitario.

El frontend puede mostrar la comunidad seleccionada, pero no determina la autorización. Toda autorización debe ser aplicada nuevamente por la API.

Los usuarios de plataforma con privilegios globales también deben operar sobre una comunidad explícitamente seleccionada cuando accedan a datos comunitarios. Toda operación global o cambio de contexto debe quedar auditado.

Una fuga, consulta o modificación de información entre comunidades es un error crítico de seguridad y debe detener la tarea hasta corregirse.


## 11. Prisma y migraciones

Detenerse y pedir autorización antes de:
- Modificar `prisma/schema.prisma`.
- Modificar `prisma/migrations/`.
- Ejecutar `prisma migrate dev`.
- Ejecutar `prisma migrate deploy`.
- Ejecutar `prisma db push`.
- Ejecutar `prisma db pull`.
- Ejecutar `prisma migrate reset`.

Antes de solicitar autorización, presentar:
- Problema.
- Cambio exacto.
- Modelos y relaciones afectadas.
- Riesgo para datos.
- Migración requerida.
- Compatibilidad con frontend y API.
- Estrategia de respaldo y rollback.
- Pruebas necesarias.

Sí se permite leer y analizar Prisma, ejecutar `prisma validate` y proponer cambios sin aplicarlos.

## 12. Contabilidad, facturación y tesorería

No alterar reglas financieras por conveniencia técnica.

Contabilidad:
- Respetar partida doble.
- Débitos y créditos deben cuadrar.
- Respetar naturaleza de cuentas.
- Mantener trazabilidad e inmutabilidad cuando aplique.

Facturación:
- Respetar períodos, alícuotas, gastos, avisos de cobro, pagos y asientos.
- No duplicar emisiones.

Tesorería:
- No confundir movimientos bancarios con ingresos contables.
- Respetar conciliación, cuentas, fechas, referencias y comunidad.

## 13. Prohibiciones técnicas

No ocultar errores mediante:
- `any`
- `@ts-ignore`
- `@ts-expect-error`
- `eslint-disable`
- `catch {}` vacío
- Comentado de código funcional
- Eliminación de validaciones
- Datos falsos
- Mocks silenciosos

No instalar dependencias, actualizar paquetes, reescribir lockfiles, modificar `.env`, eliminar funcionalidades ni cambiar contratos públicos sin autorización.

## 14. Dependencias y configuración

No instalar, eliminar ni actualizar dependencias; modificar `package.json`, lockfiles, scripts, archivos `.env` o configuraciones del proyecto sin autorización expresa.

Antes de proponer un cambio, comprobar si la necesidad puede resolverse con el stack, las dependencias o las utilidades existentes.

Si `package.json` y el lockfile son inconsistentes o muestran cambios ajenos al proyecto, detenerse, revisar Git e informar sin sobrescribirlos.


## 15. Validación obligatoria

Frontend, cuando los scripts sean confiables:
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- Revisión visual de la pantalla afectada.
- Revisión de consola.
- Revisión responsive según el área.

Backend:
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `npm run prisma:validate`
- `npm run test`

No afirmar que las pruebas pasaron si alguna quedó bloqueada.

## 16. Criterio de finalización

Una tarea solo está terminada cuando:
- Resuelve la necesidad original.
- Compila.
- Pasa tipos y validaciones relevantes.
- No introduce errores nuevos.
- Mantiene seguridad y permisos.
- Conserva el diseño oficial.
- No rompe responsive.
- No modifica archivos no relacionados.
- Explica qué cambió y cómo se validó.

“Parece funcionar” no significa que esté terminado.

## 17. Terminología

Usar:
- Espacio de trabajo.
- Propietario.
- Comunidad.
- Inmueble.
- Junta Directiva.
- Aviso de cobro.
- Alícuota.
- Cuenta contable.
- Asiento contable.
- Tesorería.
- Licencia.

No usar “módulo” en textos visibles cuando corresponda “espacio de trabajo”.

CASA es el nombre oficial del producto. No inventar una expansión del nombre como acrónimo.

## 18. Honestidad

Distinguir siempre entre:
- Confirmado.
- Inferido.
- No comprobado.
- Bloqueado.
- Recomendado.

No declarar que algo está listo, seguro, responsive o sin errores sin haberlo verificado.