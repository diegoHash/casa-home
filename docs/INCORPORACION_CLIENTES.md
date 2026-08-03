# Incorporación de clientes CASA

La incorporación es un proceso separado de la operación cotidiana. Su objetivo
es construir y validar el expediente inicial de una comunidad antes de permitir
su activación.

## Etapas

1. Identidad y licencia.
2. Fuentes de información.
3. Estructura inmobiliaria.
4. Personas y relaciones.
5. Historia financiera.
6. Configuración operativa.
7. Conciliación y validación.
8. Activación.

Una etapa completada conserva su fecha. La activación queda bloqueada mientras
existan hallazgos críticos abiertos.

El alta realizada desde Super Admin crea inmediatamente la licencia, la
comunidad en borrador y su expediente de incorporación. Las operaciones de
sincronización son idempotentes: recargar un cliente no genera comunidades ni
expedientes duplicados.

## Fuentes y lotes

Cada archivo o sistema recibido se registra como un lote independiente. El
registro de una fuente no implica que su contenido haya sido extraído,
normalizado o importado.

Un lote definitivo deberá conservar:

- tipo y nombre de la fuente;
- período histórico;
- custodio y fecha de recepción;
- hash SHA-256;
- cantidad de tablas y registros extraídos;
- estado del procesamiento;
- reglas de transformación;
- excepciones y resultados de conciliación.

## Estado del prototipo

La interfaz utiliza `localStorage` mediante `OnboardingRepository`. El caso de
Caribbean Marina es una simulación de planificación y no representa una
extracción real del archivo Access.

La implementación de producción sustituirá el repositorio local por una API y
MySQL 8.4 LTS. La lectura de Access ocurrirá en un servicio de migración
controlado; el navegador no debe procesar ni custodiar la base histórica.

## Asistente de importación

El asistente de producción comienza con archivos `.mdb` y `.csv`. El archivo se
envía a la API, se almacena fuera del directorio público y recibe una huella
SHA-256. El backend detecta tablas, columnas, tipos, cantidad de filas y una
muestra limitada de cinco registros.

El flujo está separado en compuertas:

1. carga y custodia del archivo original;
2. escaneo de estructura sin modificar el origen;
3. mapeo manual de cada tabla hacia una entidad CASA;
4. mapeo manual de columnas y validación de campos obligatorios;
5. simulación futura de la importación;
6. conciliación y aprobación;
7. ejecución transaccional.

Completar el mapeo no importa registros. Una tabla puede marcarse como ignorada,
pero esa decisión queda explícita dentro del lote. Los conectores directos para
MySQL y PostgreSQL se incorporarán después usando usuarios de solo lectura y el
mismo contrato de inventario y mapeo.
