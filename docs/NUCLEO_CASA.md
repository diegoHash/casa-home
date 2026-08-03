# Núcleo CASA

El Núcleo es la fuente única de información compartida por todos los espacios de trabajo de CASA. Su unidad de aislamiento es el condominio (`communityId`). Ningún usuario puede consultar o modificar información de otra comunidad sin una asignación explícita.

## Modelo fundamental

- **Comunidad:** identidad operativa y legal del condominio.
- **Ubicación inmobiliaria:** contenedor opcional como edificio o centro comercial. No es una unidad cobrable.
- **Inmueble:** unidad identificada por código y clasificada como apartamento, townhouse o local comercial.
- **Persona:** identidad única por tipo y número de documento.
- **Propiedad:** relación histórica independiente que conecta una persona con un inmueble, porcentaje y vigencia.
- **Relación operativa:** conecta una persona con una comunidad como residente, representante o trabajadora.
- **Junta:** designación temporal de una persona, con cargo, inmueble representado y período.
- **Administración:** puede recaer sobre la junta, un equipo interno o una organización externa.
- **Cuenta bancaria:** cuenta receptora perteneciente a una comunidad.
- **Método de pago:** transferencia, pago móvil o efectivo habilitado para los propietarios.
- **Aplicación contable:** cruce de cuenta o anticipo aplicado sobre saldos; no constituye un método de pago.
- **Auditoría:** registro inmutable de cada operación relevante.

## Alta integral

Un cliente CASA y una comunidad representan el mismo contrato operativo, pero
no son la misma entidad técnica. El alta desde Super Admin crea de forma
coordinada e idempotente:

1. el cliente comercial;
2. la licencia integral;
3. la comunidad en estado `draft`;
4. el expediente de incorporación.

La comunidad conserva `clientId` y `licenseId`. Esto evita comunidades huérfanas
y permite que la operación, la licencia y la migración evolucionen sin mezclar
sus responsabilidades.

## Reglas que no deben romperse

1. Todas las entidades operativas deben llevar `communityId` y todas las consultas deben filtrarlo en el servidor.
2. Una persona no se duplica para representar distintos roles; se agregan relaciones y designaciones.
3. Una relación de propiedad admite copropietarios, porcentajes y múltiples inmuebles.
4. Los cargos de junta tienen vigencia; nunca deben sobrescribirse períodos anteriores.
5. Los inmuebles se desactivan, no se eliminan, si poseen movimientos o relaciones históricas.
6. Las cuentas bancarias y operaciones financieras requieren cifrado, control de acceso y auditoría.
7. La auditoría es de solo escritura para usuarios operativos y debe conservar actor, fecha, origen y diferencias del cambio.
8. La pertenencia a una comunidad no equivale a un permiso. Los permisos se conceden por rol y alcance.
9. Una comunidad no pasa de `draft` a `active` hasta superar identidad legal, inventario, titularidad, gobierno, banca y métodos de pago.
10. Una transferencia de propiedad cierra la vigencia anterior y crea una nueva; nunca reemplaza ni elimina al propietario histórico.

## Estado de la implementación web

La interfaz actual permite validar el modelo y los flujos usando un repositorio local reemplazable. No constituye todavía persistencia de producción. El siguiente paso técnico es implementar la API multi-tenant y una base de datos transaccional, conservando los contratos definidos en `src/domain/core.ts`.

Para producción, la API debe incluir como mínimo:

- autenticación y autorización por comunidad;
- restricciones únicas de RIF, documento y códigos de inmueble según su alcance;
- transacciones para altas y cambios relacionados;
- borrado lógico y control de concurrencia;
- cifrado de información bancaria y archivos en almacenamiento privado;
- bitácora inmutable generada en el servidor;
- exportación y portabilidad de datos por comunidad.

## Flujo de inmueble y propiedad

El inmueble y la persona son entidades independientes. La relación de propiedad
solo puede crearse cuando ambos existen y debe conservar porcentaje, inicio,
fin y estado histórico.

El orden recomendado durante la incorporación es:

1. Registrar ubicaciones opcionales.
2. Registrar inmuebles.
3. Registrar personas.
4. Vincular propietarios e inmuebles.

Las únicas categorías de inmueble cobrable en esta etapa son:

- apartamento;
- townhouse;
- local comercial.

Un edificio y una torre representan el mismo tipo de ubicación: `building`. Un
centro comercial es una ubicación `shopping-center` que puede contener locales.
Las ubicaciones no son inmuebles, no tienen propietario y no reciben cargos.

Las concesiones se modelan por separado. No tienen alícuota ni derechos de
copropiedad y pueden generar un canon fijo mensual según su contrato.

## Personal y junta

La relación laboral es independiente de la propiedad. Una persona puede:

- ser trabajadora sin poseer un inmueble;
- ser propietaria y trabajadora simultáneamente;
- ser propietaria e integrante de junta.

Dentro de una misma comunidad no puede mantener al mismo tiempo una relación
laboral vigente y una designación vigente en la junta. CASA debe validar la
incompatibilidad en ambos sentidos y conservar las relaciones terminadas como
historia.

La vinculación laboral registra cargo, departamento, modalidad, inicio y fin.
La modalidad puede ser relación laboral, honorarios profesionales o contratista.

La interfaz de la etapa 2 permite finalizar propiedad, empleo, junta y
concesiones mediante fecha efectiva y motivo obligatorio. Las relaciones
cerradas se consultan en **Historial**.

La transferencia de propiedad conserva el porcentaje del vínculo seleccionado,
cierra al titular anterior y crea la nueva titularidad en una sola operación.

Las alícuotas también tienen vigencia. Cada modificación exige fecha y motivo,
cierra el período anterior y registra los valores antes/después en auditoría.

## Activación y auditoría

La sección **Validación** funciona como compuerta de activación. La comunidad
permanece en borrador mientras falte cualquiera de los controles obligatorios.

Las operaciones de alto impacto registran actor, fecha, entidad, acción, motivo,
estado anterior y estado posterior. En el prototipo, la bitácora vive en
`localStorage`; en producción deberá generarse en el servidor y ser inmutable
para usuarios operativos.

## Tesorería

Las cuentas bancarias y los métodos de pago son entidades separadas. Una misma
cuenta puede recibir transferencias y pago móvil, mientras que el efectivo no
requiere una cuenta asociada.

Los métodos configurables en esta etapa son:

- transferencia bancaria en VES, USD o EUR;
- pago móvil en VES;
- efectivo en VES, USD o EUR.

Los cruces de cuenta compensan obligaciones recíprocas documentadas. No son una
preferencia configurable: aparecen únicamente cuando se registra una operación
autorizada y auditable.

Un anticipo es el saldo a favor que resulta cuando un pago supera el aviso de
cobro o el saldo pendiente del propietario. Se calcula automáticamente en el
libro de movimientos, permanece disponible por defecto y no puede activarse o
desactivarse como configuración. Ninguno de estos conceptos debe registrarse
como método de pago.

## Arquitectura contable

CASA operará con contabilidad de doble partida. Toda operación financiera
contabilizada generará un asiento compuesto por dos o más líneas y deberá
cumplir que el total debitado sea idéntico al total acreditado. Los saldos serán
consecuencia del libro mayor; no podrán mantenerse como números editables
desconectados de sus movimientos.

El plan de cuentas pertenece a una comunidad. CASA ofrecerá una plantilla
inicial, pero cada cuenta conservará su identidad dentro del condominio y podrá
vincularse con auxiliares de:

- propietarios e inmuebles;
- cuentas por cobrar;
- bancos y cajas;
- anticipos;
- fondos;
- proveedores y cuentas por pagar;
- ingresos, gastos y resultados.

Los asientos contabilizados serán inmutables. Una corrección se realizará
mediante reverso y nuevo asiento, conservando actor, motivo, fecha, documento de
origen y valores anteriores.

### Tratamiento de los anticipos

Desde la perspectiva de la comunidad, el pago recibido sin una obligación
exigible equivalente no debe convertirse automáticamente en ingreso. CASA lo
mantendrá como saldo a favor del propietario en una cuenta auxiliar.

Ejemplos simplificados:

1. **Recepción anticipada:** débito a banco/caja y crédito a anticipos de
   propietarios.
2. **Aplicación futura:** débito a anticipos de propietarios y crédito a
   cuentas por cobrar.
3. **Pago que excede la deuda:** la porción exigible cancela cuentas por cobrar
   y el excedente se acredita a anticipos.
4. **Devolución autorizada:** débito a anticipos y crédito a banco/caja.

La clasificación contable exacta y sus cuentas serán parte de la política
contable aprobada para la comunidad, sin alterar la regla operativa de que el
saldo pertenece individualmente al propietario hasta su aplicación o
devolución.

### Tratamiento de los fondos

Cada fondo tendrá independencia contable mediante un auxiliar y cuentas
asociadas. Esto permite conocer cuánto posee y en qué se utilizó el fondo de
reserva, el fondo de obras o cualquier fondo especial aunque compartan una
misma cuenta bancaria.

CASA soportará dos configuraciones:

1. **Fondo con cuenta bancaria exclusiva:** el efectivo y el saldo del fondo
   se concilian directamente.
2. **Fondos compartiendo banco:** existe un único saldo bancario físico, pero
   el sistema conserva saldos contables separados por destino.

Por tanto, cada fondo necesita cuentas contables independientes, pero no
necesariamente una cuenta bancaria independiente. La comunidad podrá exigirla
como política. Las transferencias entre fondos deberán aprobarse, documentarse
y producir sus respectivos asientos.

Un fondo para obras también podrá vincularse a un proyecto, presupuesto,
contratos, compromisos y ejecuciones. Así CASA diferenciará el dinero reservado,
el dinero comprometido y el dinero efectivamente gastado.

El término cotidiano “provisión” será revisado durante la incorporación. No
todo dinero apartado constituye una provisión contable: una provisión representa
una obligación con importe o vencimiento incierto y requiere reglas propias de
reconocimiento y medición.
