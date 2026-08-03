# Plan de desarrollo CASA

Este documento conserva la ruta activa del producto. Un punto no se considera
completado únicamente porque exista una pantalla: debe tener persistencia,
validaciones, autorización, auditoría y pruebas.

## Completado

- Autenticación independiente para ROOT y personal.
- Selección contextual de comunidad.
- Acceso único por usuario y comunidad.
- Roles operativos y permisos explícitos.
- Protección de los endpoints del núcleo y tesorería por alcance.
- Espacio operativo inicial conectado con datos reales.
- Catálogo inicial de ocho espacios de trabajo.
- Asignación múltiple de espacios al crear o editar accesos desde ROOT.
- Vigencia e historial de asignaciones sin eliminación de registros anteriores.
- Portal del personal filtrado por espacios vigentes y permisos técnicos.
- Revocación de sesiones activas cuando cambia una asignación.
- Administración delegada del personal dentro de la comunidad activa.
- Protección contra escalamiento de permisos y espacios de trabajo.
- Bloqueo de autoedición y de accesos superiores a la autoridad del operador.
- Auditoría obligatoria y cierre de sesiones al modificar una autoridad.
- Contraseña temporal del personal con mínimo de ocho caracteres y validación visual.
- Barra lateral operativa adaptable a la altura completa del espacio de trabajo.
- Núcleo financiero I: categorías de gasto, períodos mensuales y tasa BCV.
- Registro de gastos por período, moneda y método de distribución.
- Permisos financieros independientes `billing.read` y `billing.write`.
- Base contable por comunidad con moneda funcional y consecutivo de asientos.
- Plan de cuentas jerárquico y vinculación opcional con cuentas bancarias.
- Períodos contables abiertos, cerrados o bloqueados.
- Asientos de doble partida en borrador, contabilizados y reversados.
- Validación estricta de débitos y créditos antes de contabilizar.
- Reversión mediante contraasiento, trazabilidad y auditoría.
- Permisos contables independientes `accounting.read`, `accounting.write` y
  `accounting.post`.
- Fechas de vigencia presentadas sin hora en las relaciones de personas.
- Redirección automática de ROOT hacia CASA Control.
- Inventario real de inmuebles visible en la ficha integral del cliente.
- Descarte confirmado y auditado de fuentes legacy que todavía no hayan sido
  importadas.
- Capacidad máxima de personas y cupos de brazaletes configurables por
  inmueble.
- Formas de contacto secundarias por persona y comunidad.

## Pendiente prioritario

### Núcleo contable I: libro mayor de doble partida — en desarrollo

Antes de emitir obligaciones o aplicar pagos, CASA debe incorporar un núcleo
contable transaccional por comunidad. Ningún movimiento financiero definitivo
podrá modificar saldos directamente: deberá originar un asiento cuya suma de
débitos sea exactamente igual a su suma de créditos.

Debe incluir:

- [x] Plan de cuentas configurable por comunidad.
- [ ] Versionado del plan de cuentas y plantilla inicial CASA.
- [x] Asientos en estado borrador, contabilizado o reversado.
- [x] Líneas de débito y crédito con cuenta, moneda, tasa y referencia al
  documento de origen.
- [ ] Dimensiones auxiliares directas para tercero, inmueble y fondo.
- [x] Períodos contables con apertura y cierre.
- [ ] Bloqueo irreversible del período y flujo formal de reapertura.
- [x] Numeración consecutiva, trazabilidad y auditoría.
- [x] Reversos mediante contraasientos.
- [ ] Libro diario, mayor general, balance de comprobación y auxiliares.
- [x] Moneda funcional y monedas transaccionales con tasa conservada.
- [ ] Diferencias cambiarias automáticas.
- [ ] Integración con propietarios, cuentas por cobrar, anticipos, fondos,
  proveedores y cuentas por pagar.

La plantilla CASA deberá permitir partir de un catálogo recomendado sin
impedir que cada comunidad adapte su política contable. Los asientos
contabilizados no podrán editarse ni eliminarse.

### Anticipos de propietarios

El anticipo no será un método de pago ni una opción configurable. Representará
un saldo a favor individual del propietario, originado cuando paga antes de que
exista una obligación o cuando entrega más dinero que su deuda exigible.

Reglas:

- Mantener auxiliar por propietario, inmueble, comunidad y moneda.
- Al recibirlo, debitar banco o caja y acreditar la cuenta contable de
  anticipos de propietarios definida por la política contable.
- Aplicarlo únicamente contra obligaciones emitidas, debitando anticipos y
  acreditando cuentas por cobrar.
- Permitir aplicación total o parcial, devolución autorizada y transferencia
  entre inmuebles solo mediante un flujo formal y auditable.
- Mostrar saldo inicial, movimientos, aplicaciones y saldo disponible.
- Impedir que el anticipo se reconozca automáticamente como ingreso.

### Fondos con destino específico

CASA distinguirá el dinero físico de su destino contable. Cada fondo —por
ejemplo reserva, obras, emergencia o uno creado por la comunidad— tendrá un
auxiliar y cuentas contables independientes dentro del libro de la comunidad.

Cada fondo deberá conservar:

- código, nombre, propósito, tipo, moneda y estado;
- regla de aportación, meta y vigencia;
- cuentas contables asociadas;
- saldo inicial, aportes, usos, transferencias y saldo disponible;
- presupuesto, autorizaciones y documentos de soporte;
- vinculación opcional con una cuenta bancaria exclusiva.

Una cuenta bancaria independiente por fondo será soportada y puede exigirse por
política de la comunidad, pero no será técnicamente obligatoria. Si varios
fondos comparten una cuenta bancaria, CASA conciliará el saldo bancario físico
y mantendrá por separado el saldo contable de cada fondo. Ningún fondo podrá
consumir recursos de otro sin una transferencia aprobada y contabilizada.

La expresión “provisión” no se tratará automáticamente como sinónimo de fondo:
una provisión contable corresponde a una obligación de importe o vencimiento
incierto y requiere una política de reconocimiento distinta. La clasificación
definitiva será validada durante la incorporación con el contador responsable
de cada comunidad.

### Núcleo financiero II: emisión del aviso de cobro

Después de habilitar el libro mayor, la estructura del período y sus gastos se
convertirá en avisos de cobro por inmueble, congelando la alícuota, la tasa BCV
y los conceptos aplicados. La emisión deberá generar sus asientos y auxiliares
de cuentas por cobrar en una sola transacción.

Debe incluir:

- Validación previa de que las alícuotas aplicables estén completas.
- Cálculo del gasto comunitario y de la participación por inmueble.
- Fondos, provisiones y cuotas especiales únicamente cuando existan.
- Créditos, ingresos y cruces de cuenta únicamente cuando correspondan.
- Totales de la comunidad y del inmueble.
- Emisión inmutable, versión imprimible y auditoría.

### Secuencia financiera de implementación

1. Plan de cuentas y períodos contables.
2. Libro diario y asientos de doble partida.
3. Auxiliares de propietarios, anticipos, bancos y fondos.
4. Emisión contable del aviso de cobro.
5. Cuentas por cobrar y estado de cuenta por inmueble.
6. Registro y aplicación de pagos.
7. Conciliación bancaria.
8. Proveedores, cuentas por pagar, compras y egresos.
9. Estados financieros, cierres y reportes de auditoría.

### Verificación funcional de identidades

La administración desde ROOT y la administración delegada de cada comunidad
están operativas. Se mantienen pruebas manuales con varias identidades reales
para validar la experiencia completa de inicio de sesión y cambio de contexto.

- **Rol operativo:** explica qué función cumple la persona.
- **Espacio de trabajo:** determina qué áreas de CASA aparecen en su portal.
- **Permiso:** autoriza cada operación concreta de lectura o modificación.

Espacios iniciales previstos:

- Administración.
- Contabilidad y tesorería.
- Compras.
- Atención al propietario.
- Gestión de cobranza.
- Control principal y accesos.
- Brazaletes.
- Junta de condominio.

Estado de los requisitos:

- [x] El ROOT puede asignar uno o varios espacios al crear o editar un acceso.
- [x] La comunidad puede administrar las asignaciones dentro del alcance autorizado.
- [x] Cada asignación tiene estado, fecha de inicio y fecha de finalización opcional.
- [x] El personal solo ve los espacios vigentes que le fueron asignados.
- [x] Cambiar un rol no concede espacios ni permisos automáticamente.
- [x] Revocar un espacio no elimina el historial.
- [x] Toda modificación o revocación queda registrada en auditoría.
- [x] Añadir pruebas automáticas de aislamiento y denegación de escalamiento.

## Verificación pendiente de la etapa actual

- Probar dos usuarios con roles distintos dentro de una misma comunidad.
- Probar una persona vinculada a dos comunidades.
- Verificar visualmente el selector de roles y espacios en móvil.
- Probar que los permisos no autorizados sean rechazados también desde la API.
