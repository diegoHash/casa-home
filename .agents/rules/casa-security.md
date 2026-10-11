---
trigger: always_on
---

# CASA Home — Seguridad del frontend

Esta rule aplica a toda autenticación, sesión, autorización, comunicación HTTP, dato personal, archivo, variable de entorno y funcionalidad protegida de `casa-home`.

## 1. Principio de seguridad

El frontend nunca es una fuente autoritativa de seguridad.

Ocultar botones, proteger rutas, comprobar roles o leer scopes en React mejora la experiencia, pero no sustituye las validaciones del backend.

Ante una duda de seguridad:

* No improvisar.
* No reducir validaciones.
* No crear accesos temporales ocultos.
* No confiar en datos almacenados por el navegador.
* Detener el cambio e informar el riesgo.

## 2. Credenciales, secretos y variables de entorno

Nunca colocar en el frontend:

* Contraseñas.
* API keys privadas.
* Secretos JWT.
* Tokens permanentes.
* Credenciales de bases de datos.
* Claves privadas.
* Cuentas de servicio.
* URLs con usuario y contraseña.
* Secretos de proveedores.

Toda variable que comience con `VITE_` queda expuesta al navegador y solo puede contener configuración pública.

`.env.example` debe contener únicamente nombres de variables y valores vacíos o claramente ficticios.

No leer, mostrar, registrar, copiar ni modificar archivos `.env` reales sin autorización expresa.

El repositorio debe ignorar:

* `.env`
* `.env.*`
* Archivos locales de credenciales.

Puede conservarse explícitamente `.env.example`.

Si `.gitignore` no protege correctamente estos archivos, informar el riesgo antes de incorporar nuevas variables.

No introducir nuevas URLs de producción directamente en componentes o servicios. Las configuraciones por entorno deben usar variables públicas documentadas.

## 3. Sistemas de autenticación separados

CASA Home contiene actualmente flujos diferentes:

* `CasaAuthService`, `RootSession` y `StaffSession` para CASA API.
* `AuthService` y la sesión del propietario para la integración existente del portal.

No mezclar:

* Tokens.
* Refresh tokens.
* Usuarios.
* Roles.
* Claves de almacenamiento.
* Endpoints.
* Respuestas de autenticación.

Un token de propietario nunca debe utilizarse como token de personal o ROOT, ni viceversa.

Una transición de rol solo puede realizarse después de una respuesta validada del backend. No promover privilegios utilizando únicamente información guardada en el navegador o extraída localmente de un JWT.

## 4. Tokens y sesiones

Nunca enviar ni recibir access tokens o refresh tokens mediante:

* Query parameters.
* Fragmentos de URL.
* Rutas.
* Mensajes visibles.
* Logs.
* Errores.
* Portapapeles.
* Eventos de analítica.

No implementar accesos como `?sso=TOKEN`.

Los tokens de recuperación de contraseña solo pueden utilizarse cuando el contrato del backend lo requiera. Deben ser temporales, de un solo uso y eliminarse de la barra de direcciones inmediatamente después de ser leídos.

No guardar nuevos tokens en `localStorage`.

Las sesiones existentes en `sessionStorage` no deben trasladarse a un almacenamiento más persistente. Cualquier cambio en el transporte o almacenamiento de refresh tokens requiere coordinación con `casa-api` y autorización expresa.

Decodificar un JWT en el navegador solo permite orientar la interfaz. Nunca demuestra que el token sea válido ni autoriza una operación.

Al cerrar sesión, fallar una renovación o detectar una identidad inválida:

* Limpiar access token.
* Limpiar refresh token.
* Limpiar usuario.
* Limpiar comunidad.
* Limpiar espacio de trabajo.
* Eliminar datos sensibles temporales.
* Redirigir al acceso correspondiente.

## 5. Renovación de sesión

No crear otro mecanismo de refresh si ya existe uno para el tipo de sesión correspondiente.

La renovación debe:

* Ejecutarse únicamente con el refresh token correcto.
* Rotar y guardar los nuevos tokens.
* Reintentarse una sola vez después de un `401`.
* Evitar ciclos infinitos.
* Cerrar la sesión si la renovación falla.
* Evitar renovaciones simultáneas duplicadas.

No reintentar automáticamente operaciones de escritura después de errores de red ambiguos. Una solicitud pudo haber sido procesada aunque el navegador no recibiera respuesta.

## 6. Rutas protegidas

Las rutas de ROOT, personal y propietarios deben tener guards independientes.

Todo guard debe validar la sesión contra el backend cuando corresponda. La existencia de un token en el navegador no es suficiente.

El portal del propietario no puede conectarse a datos reales hasta contar con:

* Guard específico de propietario.
* Sesión validada por el backend.
* Comunidad autorizada.
* Relación verificada entre persona e inmueble.
* Control de acceso aplicado por la API.

Nunca convertir una ruta demo o públicamente accesible en una ruta con datos reales sin implementar primero estas protecciones.

## 7. Modo demo y datos simulados

El modo demo solo puede activarse:

* En desarrollo mediante `import.meta.env.DEV`.
* En un entorno no productivo expresamente configurado.
* Mediante una autorización temporal aprobada.

No habilitar demos de áreas privadas en producción mediante parámetros como `?demo=1`.

Los datos demo deben ser completamente ficticios. No utilizar:

* Nombres reales.
* Cédulas reales.
* Correos reales.
* Teléfonos reales.
* Referencias bancarias reales.
* Números de cuenta reales.
* Saldos o deudas de personas reales.
* Información copiada de una comunidad.

La interfaz demo debe identificarse claramente como demostración y nunca debe ejecutar operaciones contra datos reales.

## 8. LocalStorage y datos provisionales

`CoreRepository` y `OnboardingRepository` son mecanismos provisionales del frontend.

Nunca guardar allí información real de:

* Propietarios.
* Personal.
* Documentos de identidad.
* Contactos.
* Inmuebles.
* Cuentas bancarias.
* Pagos.
* Deudas.
* Contabilidad.
* Auditoría.
* Archivos de importación.

`localStorage` no puede ser fuente de verdad para permisos, roles, comunidades, auditoría ni información operativa.

No mezclar silenciosamente datos locales con respuestas de CASA API.

Cuando una funcionalidad pase a utilizar datos reales, eliminar o desactivar expresamente su fallback local. No conservar una copia paralela sin autorización.

Nunca usar una identidad hardcodeada como actor de auditoría. El actor real debe provenir del backend autenticado.

## 9. Permisos y comunidades

Los catálogos de roles, scopes y espacios de trabajo del frontend sirven para representación visual.

La autorización real corresponde a CASA API.

No asumir permisos por:

* Nombre del rol.
* Botón visible.
* Ruta actual.
* Comunidad guardada.
* Scope calculado localmente.
* Workspace seleccionado.
* JWT decodificado sin validación.

No ampliar permisos por semejanza. Un permiso de escritura no implica automáticamente contabilizar, aprobar, firmar, reversar, cerrar o conciliar.

El contexto mostrado debe coincidir con la comunidad validada por el backend.

Al cambiar de usuario o comunidad:

* Limpiar el espacio de trabajo anterior.
* Descartar solicitudes pendientes.
* Descartar respuestas tardías del contexto anterior.
* No mostrar temporalmente información de otra comunidad.

## 10. Servicios HTTP

Las llamadas deben realizarse mediante los servicios existentes:

* `CasaAuthService`
* `CasaPlatformService`
* `CommunityWorkspaceService`
* `CasaImportService`
* El servicio autorizado para propietarios

No introducir llamadas Axios o Fetch directamente en componentes si existe una capa de servicio.

No crear por iniciativa propia:

* Otro cliente HTTP.
* Otro sistema de refresh.
* Otro formato de sesión.
* Otro mecanismo de autorización.

El header `Authorization` debe agregarse dentro de la capa de servicio correspondiente, nunca construirse repetidamente dentro de componentes.

No mostrar al usuario:

* Stack traces.
* Respuestas completas de Axios.
* JSON interno.
* Rutas privadas.
* Consultas de base de datos.
* Mensajes de Prisma.
* Tokens o headers.

## 11. Datos personales y financieros

Aplicar minimización de datos: solicitar, conservar y mostrar únicamente lo necesario.

En listados y vistas generales, ocultar o enmascarar cuando corresponda:

* Cédulas.
* Números de cuenta.
* Teléfonos.
* Correos.
* Referencias bancarias.
* Identificadores internos.

No registrar en `console.log`, errores o analítica:

* Formularios completos.
* Snapshots de comunidades.
* Datos de propietarios.
* Credenciales.
* Tokens.
* Archivos.
* Respuestas financieras.

No incluir información real en fixtures, capturas, documentación, pruebas o ejemplos versionados.

## 12. Importaciones y archivos

Las contraseñas utilizadas para archivos MDB o equivalentes deben permanecer únicamente en memoria durante la operación.

Nunca almacenarlas en:

* Estado persistente.
* LocalStorage.
* SessionStorage.
* Logs.
* Nombres de archivos.
* Mensajes de error.

La validación de extensión y tamaño en el frontend es solo una ayuda. El backend debe validar nuevamente el archivo.

No procesar, copiar ni conservar en el navegador más información legacy de la necesaria para mostrar el resultado autorizado.

No subir un archivo sin una acción explícita del usuario.

## 13. Git y documentación

Nunca incorporar al repositorio:

* `.env` reales.
* Dumps de bases de datos.
* Respaldos.
* Exportaciones.
* Archivos MDB reales.
* Listados de propietarios.
* Estados de cuenta.
* Credenciales.
* Tokens.
* Inventarios sensibles de producción.
* Resultados de perfilado con datos identificables.

Las auditorías legacy deben versionarse únicamente como documentación sanitizada y sin información que permita reconstruir datos personales, credenciales o saldos reales.

Si se detecta un secreto posiblemente comprometido:

* No repetirlo en la respuesta.
* No publicarlo.
* Detener la tarea.
* Identificar el archivo afectado.
* Informar que eliminarlo del último commit no borra el historial.
* Recomendar su revocación o rotación inmediata.

## 14. Validación antes de finalizar

En cambios relacionados con seguridad, comprobar:

* Que ninguna ruta privada quede públicamente accesible.
* Que no se introduzcan secretos.
* Que los tokens no aparezcan en URLs o logs.
* Que las sesiones se limpien correctamente.
* Que demo y producción permanezcan separados.
* Que no se use localStorage para datos reales.
* Que un usuario no vea información de otra comunidad.
* Que la interfaz no conceda privilegios inexistentes.
* Que los errores visibles no filtren información interna.

No declarar una implementación segura sin haber verificado estos puntos.
