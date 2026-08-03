# Perfil de calidad de datos

## 1. Resultado general

El dump fue parseado línea por línea y cargado en una base de auditoría
independiente de `casa`. Los conteos exactos del archivo son:

| Métrica | Resultado |
|---|---:|
| Tablas | 120 |
| Columnas | 1.747 |
| Registros | 316.645 |
| Tablas vacías | 29 |
| Tablas sin PK | 76 |
| Foreign keys | 0 |
| Vistas/triggers/procedimientos/funciones | 0 |

La carga estricta del dump **no es posible sin ajustes de auditoría**:

- `Detalle_Aviso` declara tres importes alternos como obligatorios, pero
  contiene respectivamente 1.274, 1.274 y 1.306 valores `NULL`;
- `Comprobante_Detalle.DESCRIPCION` alcanza 51 caracteres sobre `VARCHAR(50)`;
- `Libro_Mayor.Descripcion_Detalle` alcanza 52 sobre `VARCHAR(50)`;
- `EmisionChequeDeta.Concepto` alcanza 201 sobre `VARCHAR(200)`.

CASA no debe truncar. Debe ampliar el destino, preservar el original y registrar
la corrección.

## 2. Estructura inmobiliaria y titulares

### 2.1 Volumen

| Código legacy | Filas `PROPIETARIO` | Alícuota general total | Alícuota comercial total |
|---|---:|---:|---:|
| `001` | 731 | 100,005368 | 0 |
| `002` | 11 | 0 | 0 |

En `001`, el código de inmueble permite una clasificación preliminar:

| Categoría inferida | Filas |
|---|---:|
| Apartamentos | 600 |
| Townhouses | 78 |
| Locales comerciales | 51 |
| Casos especiales (`HOTEL`, `EDIFADM`) | 2 |

Los primeros tres totales coinciden exactamente con el inventario funcional
informado: 600 apartamentos, 78 townhouses y 51 locales. Los dos casos
especiales no deben forzarse a una categoría sin decidir si son inmuebles
cobrables, áreas operativas o cuentas auxiliares.

**Inferencia fuerte:** el código `002`, denominado concesiones en
`CONDOMINIO`, con 11 registros y alícuota cero, representa un auxiliar de
concesionarios y no una segunda comunidad. Debe confirmarse antes de mapear.

### 2.2 Calidad de identidad

| Hallazgo | Resultado |
|---|---:|
| Filas sin cédula/documento útil | 526 de 742 (70,9%) |
| Filas sin correo | 41 |
| Filas sin teléfono | 18 |
| Textos que parecen contener varios nombres | 74 |
| Grupos con documento normalizado repetido | 13 |
| Grupos con código de inmueble repetido | 1 |

El inmueble duplicado es `LOCAL 4` dentro del auxiliar `002`. Un documento
repetido no implica necesariamente duplicidad: puede ser una misma persona con
varios inmuebles. Precisamente por eso CASA debe crear una Party y varias
relaciones de propiedad, no duplicar personas.

La suma de alícuotas de `001` excede 100 en `0,005368`. Puede ser precisión
acumulada o una regla especial; requiere conciliación antes de emitir el primer
aviso en CASA.

## 3. Cuentas por cobrar y pagos

### 3.1 Documentos por cobrar

| Comunidad legacy | Documentos | Saldo abierto almacenado* |
|---|---:|---:|
| `001` | 51.755 | 2.026.876,21 |
| `002` | 204 | 10.139,07 |

\* La moneda no puede afirmarse a partir de este total: el esquema usa campos
principales/alternos y tasas de forma inconsistente.

Rango de emisión: **16-11-2020 a 08-06-2026**. Por tanto, existe historia
anterior a 2021 y debe aclararse si es saldo de apertura o transacción real.

`CargaDocsDetalle` contiene 61.445 movimientos. Hay:

- 10 movimientos huérfanos;
- distribuidos entre 7 documentos inexistentes;
- algunos documentos acumulan más de un movimiento.

No deben descartarse: podrían ser pagos aplicados a documentos eliminados o
claves renumeradas.

### 3.2 Recibos

| Métrica | Resultado |
|---|---:|
| Cabeceras | 19.633 |
| Detalles | 42.892 |
| Detalles sin cabecera | 32 |
| Números de recibo ambiguos dentro de comunidad | 0 |
| Recibos marcados eliminados | 114 |
| Recibos eliminados con monto distinto de cero | 114 |

Los 32 detalles huérfanos se agrupan en 15 números de recibo. Deben resolverse
antes de calcular saldos.

La comparación simple `MontoRec` contra aplicaciones produce 162 diferencias.
Al descontar otros ingresos y considerar ajustes, la mejor fórmula probada aún
deja **16 recibos sin cuadrar**. Esto confirma que:

- `MontoRec`, `MAjuste` y `Monto_OI` tienen responsabilidades distintas;
- la regla debe validarse con el código/pantalla original;
- CASA no debe “hacer cuadrar” mediante redondeo silencioso.

Rango de pagos: **01-01-2023 a 09-06-2026**. La historia de cobro previa puede
estar solo en `CargaDocsDetalle`, copias originales o saldos de apertura.

## 4. Tesorería

| Elemento | Resultado |
|---|---:|
| Bancos | 12 |
| Cuentas bancarias | 14 |
| Movimientos bancarios | 2.599 |
| Movimientos de divisas | 1.870 |
| Cuentas/movimientos con padre bancario huérfano | 0 |

Los 2.599 movimientos bancarios tienen `CONCILIADA=1`. Esto puede significar
que la tabla conserva únicamente movimientos procesados o que el indicador se
usa como estado final; no prueba por sí solo una conciliación completa.

Los códigos de moneda observados son `0` y `1`, con distribuciones distintas por
tabla. No existe catálogo que defina su significado.

Existe un movimiento de divisas fechado **02-11-2026**, posterior a la fecha de
esta auditoría (24-07-2026), por 235,25 en moneda no confirmada. Debe
clasificarse como programación válida o fecha errónea.

Cobertura temporal:

- movimientos bancarios: 01-01-2022 a 29-05-2024;
- divisas: 01-08-2024 a 02-11-2026.

La separación temporal sugiere un cambio de módulo o estrategia de moneda.

## 5. Contabilidad

| Métrica | Resultado |
|---|---:|
| Cuentas en `PLAN` | 660 |
| Cuentas en `PLAN_old` | 640 |
| Comprobantes | 67 |
| Partidas | 2.457 |
| Asientos descuadrados por partidas (moneda base) | 0 |
| Asientos descuadrados por partidas (alterno) | 0 |
| Cabeceras cuyo total no coincide con sus partidas | 1 |
| Partidas cuya cuenta falta en `PLAN` | 1.176 |
| Cuentas faltantes distintas | 59 |
| Partidas faltantes resueltas en `PLAN_old` | 1.176 |

Conclusión: `PLAN_old` no es prescindible. El plan vigente eliminó o sustituyó
59 cuentas que todavía explican el historial. CASA debe migrar un plan
versionado o cuentas inactivas históricas.

La contabilidad transaccional disponible en `Comprobante` cubre únicamente
31-07-2024 a 31-12-2024. No representa toda la historia financiera.

### 5.1 Contaminación entre comunidades

`Libro_Mayor` contiene 9.149 filas:

- 1.868 pertenecen al código `001`;
- 7.281 pertenecen a **12 códigos que no existen en `CONDOMINIO`**:
  `003`, `005`, `007`, `008`, `010`, `011`, `013`, `028`, `042`, `047`,
  `105` y `110`.

`ImpAnaXCta` también contiene códigos ajenos: `007`, `008`, `028`, `042`,
`047`, `101` y `105`.

**Hallazgo crítico:** tablas de reporte fueron reutilizadas o quedaron
contaminadas con datos de otros condominios. Importar `Libro_Mayor` completo
expondría información de terceros y alteraría saldos. Debe filtrarse por
comunidad y tratarse como evidencia de conciliación, no como libro fuente.

Además, 5.821 filas de `Libro_Mayor` son anteriores a 2020 y se concentran en
2007, 2015 y 2016. Parte importante corresponde a códigos ajenos. Esto explica
por qué no puede usarse el rango global como historia de Caribbean.

## 6. Copias y evolución

| Comparación | Resultado |
|---|---:|
| Propietarios actuales no presentes en `_OLD` | 2 |
| Propietarios `_OLD` no presentes en actual | 0 |
| Filas comunes de propietario con diferencias | 134 |
| Beneficiarios actuales no presentes en `_OLD` | 296 |
| Beneficiarios `_OLD` no presentes en actual | 1 |

Las copias `_OLD` capturan estados parciales, no un historial normalizado. Las
134 diferencias de propietario deben utilizarse para detectar cambios de
contacto, nombre, alícuota o titular, pero no permiten asignar fechas efectivas
por sí solas.

## 7. Seguridad y auditoría

| Hallazgo | Resultado |
|---|---:|
| Usuarios con contraseña legacy almacenada | 12 |
| Usuarios marcados activos/no eliminados | 9 |
| Eventos de auditoría | 29.601 |
| Eventos cuya “hora” usa fecha Access 30-12-1899 | 29.601 |

La fecha 30-12-1899 no es una operación histórica; es la representación de
Access para un valor de solo hora. En CASA debe combinarse `AFecha` + hora de
`AHora` con zona `America/Caracas`, conservando ambos valores originales.

Las 12 contraseñas deben considerarse comprometidas y no migrarse. También debe
revisarse si los mismos secretos se reutilizaron en otros servicios.

## 8. Severidad y bloqueo

### Bloqueantes

- identificar qué representa `CONDOMINIO 002`;
- separar las 2 filas especiales de la estructura cobrable;
- resolver 10 movimientos de CxC y 32 detalles de recibo huérfanos;
- explicar 16 recibos aún no conciliados;
- migrar las 59 cuentas históricas que solo aparecen en `PLAN_old`;
- excluir datos de otras comunidades en tablas de reporte;
- reemplazar todas las credenciales.

### Altos

- resolver identidades sin documento y nombres múltiples;
- cuadrar alícuotas;
- validar la operación futura;
- explicar el comprobante cuya cabecera no coincide;
- definir moneda/tasa de cada campo.

### Medios

- reparar mojibake;
- ampliar textos;
- decidir retención de copias y reportes;
- documentar estados booleanos.

La activación de CASA debe bloquearse automáticamente mientras exista un
hallazgo crítico abierto.
