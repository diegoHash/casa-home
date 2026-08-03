# Mapeo del sistema legacy hacia CASA

## 1. Regla central

El mapeo no debe ser “una tabla antigua → una tabla nueva”. Debe ser:

```text
origen inmutable
→ fila raw identificable
→ transformación versionada
→ entidad canónica
→ validación
→ inserción idempotente
→ conciliación
```

Una fila legacy puede:

- crear varias entidades CASA;
- actualizar una entidad ya creada por otra fuente;
- quedar en excepción;
- conservarse solo como histórico;
- descartarse del modelo operativo con una justificación auditable.

## 2. Tablas de control de migración necesarias

| Tabla CASA | Propósito |
|---|---|
| `migration_sources` | MDB/dump recibido, custodio, hash y fechas |
| `migration_batches` | Ejecución concreta y estado |
| `migration_raw_rows` | Tabla, clave, número de fila, JSON original cifrado y hash |
| `migration_table_mappings` | Destino y decisión por tabla |
| `migration_field_mappings` | Campo, transformación, versión y obligatoriedad |
| `legacy_key_maps` | `(source, table, legacy_key) → (entity_type, entity_id)` |
| `migration_issues` | Error, severidad, evidencia, responsable y resolución |
| `migration_reconciliation_results` | Control, valor origen, valor CASA y diferencia |
| `migration_approvals` | Quién aprobó cada compuerta y cuándo |

El `ImportBatch`, `ImportTable` e `ImportColumnMapping` actuales son una buena
base de interfaz, pero deben ampliarse con estas capacidades antes de ejecutar
la carga definitiva.

## 3. Mapa maestro

| Origen legacy | Destino CASA | Regla |
|---|---|---|
| `CONDOMINIO` | `Community`, `CommunityPolicy`, `FiscalPeriod`, `AccountingPostingConfig` | Dividir identidad, políticas, período y cuentas contables |
| `PROPIETARIO` | `Party`, `Property`, `Ownership`, `PartyContact`, `PropertyAliquotPeriod` | Resolver nombres/razón social; no crear una persona única a partir de texto ambiguo |
| `Alicuotas` | `AliquotRule` o tabla de referencia | Migrar solo tras confirmar si es catálogo o regla |
| `BANCO` | `FinancialInstitution` | Normalizar banco y código nacional |
| `CUENTA_BANC` | `BankAccount`, `AccountingPostingConfig` | Separar cuenta bancaria de cuentas contables asociadas |
| `BENEFICIARIO` | `Party`, `VendorProfile` | Clasificar persona/empresa; crear payee incluso si no es proveedor formal |
| `PLAN` | `LedgerAccount` | Conservar código por comunidad y jerarquía inferida/confirmada |
| `TIPO_COMPROBANTE` | `JournalEntryType` | Catálogo |
| `Comprobante` | `JournalEntry` | Cabecera; validar balance y estado |
| `Comprobante_Detalle` | `JournalLine` | Resolver cuenta y cabecera |
| `TIPO_GASTO` | `ExpenseCategory` | Catálogo visible en el aviso |
| `CONCEPTO_FACT` | `ChargeConcept`, `AllocationPolicy`, `PostingRule` | Dividir presentación, distribución y contabilidad |
| `Aviso` | `BillingPeriod`, `BillingRun` | Una corrida por comunidad/período o excepción |
| `Detalle_Aviso` | `BillingRunLine` | Clasificar gasto, reintegro, fondo y uso |
| `DetAvisoPropt` | `ChargeTarget` | Resolver propietarios legacy a inmuebles |
| `Doc_De_Cobro` | `ReceivableType` | Catálogo y reglas de mora/impresión |
| `CargaDocs` | `Receivable` + saldo de control | Importe original inmutable; saldo se reproduce desde movimientos |
| `CargaDocsDetalle` | `ReceivableEntry` / `PaymentAllocation` | Clasificar por `CodTrans` y naturaleza |
| `Recibos` | `Payment`, `PaymentReceipt` | Separar dinero y documento |
| `RecibosDetalle` | `PaymentAllocation` | Resolver recibo y receivable sin ambigüedad |
| `RecibosOtrosing` | `PaymentRevenueLine` | Resolver concepto de ingreso |
| `InteresesMora` | `LateFeeAssessment` | Migrar si aparece en otras fuentes |
| `ControlDNI` | `UnidentifiedPayment` | Conservar ciclo de identificación y asociación |
| `Tipo_TransBanc` | `BankTransactionType`, `PostingRule` | Separar naturaleza bancaria y cuenta contable |
| `Transaccion_Bancaria` | `BankTransaction` | Moneda, importe, dirección, referencia y conciliación |
| `Transaccion_Divisas` | `BankTransaction` | Mismo destino con moneda/tasa explícitas |
| `EmisionCheque` | `Disbursement` | El nombre nuevo no se limita a cheques |
| `EmisionChequeDeta` | `DisbursementLine` | Concepto, importe y cuenta |
| `Factura` | `VendorInvoice` | Tabla vacía: no crear datos ficticios |
| `ConcOtrosIng` | `RevenueConcept` | Catálogo |
| `Tasas` | `ExchangeRate` | Migrar BCV con fuente legacy y revisar paralelo |
| `USUARIO` | `AppUser` | Identidad solamente; invitación y contraseña nueva |
| `Perfil_User` | `Role`, `Permission`, `RolePermission`, `CommunityAccess` | Agrupar perfiles equivalentes, no copiar columnas |
| `AuditoriaU` | `LegacyAuditEvent` | Histórico de solo consulta |

## 4. Transformaciones críticas

### 4.1 `CONDOMINIO`

| Campo o grupo | Destino | Tratamiento |
|---|---|---|
| `CODIGO_COND` | `legacy_key_maps` | No usar como PK final |
| `NOMBRE`, `DIRECCION`, `TELEFONO`, `Email`, `RIF` | `Community` | Limpiar encoding, normalizar RIF y contactos |
| `PORC_FOND` | `CommunityPolicy` | Porcentaje versionado |
| `DIASVENCIM`, `PORCINTM`, `ImpIntsAviso` | `LateFeePolicy` | Confirmar fórmula y fecha efectiva |
| `FECHA_INICIAL`, `FECHA_FINAL`, `MES`, `ANO` | `FiscalPeriod` | No conservar “mes actual” como estado global |
| `CodCta*` | `AccountingPostingConfig` | Resolver cada código contra `LedgerAccount` |
| `NUM_COMP`, `NUM_PRO`, `NRORECIBO`, `NroTransBanc` | `NumberingSequence` | Secuencias por comunidad y documento |
| `TIPOCAMBIO`, símbolos | configuración/archivo | Tasa operativa no debe vivir en Community |
| `OBSERVACION` | `PaymentInstruction` + nota legacy | Extraer cuentas solo como evidencia; la cuenta maestra manda |

**Excepción de alto riesgo:** hay dos filas de `CONDOMINIO`. Una se denomina
como la comunidad y otra como concesiones, comparte RIF y ciertos datos. La
segunda probablemente es un libro auxiliar, no otro cliente CASA. No debe
activarse como comunidad independiente sin confirmación.

### 4.2 `PROPIETARIO`

Proceso de resolución:

1. crear `Property` desde `APTO` y `CODIGO_COND`;
2. clasificar `REPRESENTANTE` como persona natural, persona jurídica, múltiples
   titulares o texto insuficiente;
3. normalizar documento sin puntos, guiones ni espacios, preservando el valor
   original;
4. buscar Party existente por tipo/número de documento;
5. si no existe documento confiable, enviar a revisión, no deduplicar por
   nombre;
6. crear `Ownership` con porcentaje únicamente si existe evidencia;
7. crear `PropertyAliquotPeriod` para `ALICUOTAT`/`ALICUOTAC` después de
   confirmar su semántica;
8. conservar `CODIGO_PRO` como código legacy de cuenta/unidad.

Casos que requieren cola humana:

- dos o más nombres unidos por `/`, `Y`, comas u otros separadores;
- razón social sin RIF;
- documento compartido por varias filas;
- inmueble repetido dentro de la comunidad;
- alícuota cero o fuera de rango;
- registros de la entidad de concesiones;
- titular vacío, “sucesión”, “herederos” u otra representación jurídica.

### 4.3 Dinero y moneda

No convertir `DOUBLE` directamente sin reglas.

| Uso | Tipo CASA recomendado |
|---|---|
| Importes operativos | `DECIMAL(19,4)` |
| Alícuotas/porcentajes | `DECIMAL(12,8)` |
| Tasas de cambio | `DECIMAL(20,10)` |
| Totales publicados | redondeo explícito por moneda |

Cada hecho monetario debe registrar:

- importe y moneda transaccional;
- moneda funcional de la comunidad;
- tasa aplicada;
- fecha y fuente de tasa;
- importe funcional calculado;
- política de redondeo;
- valor legacy original para trazabilidad.

Los sufijos `Alt`, `D`, `Dolar` y `US$` deben mapearse después de perfilar sus
valores. No se asumirán equivalentes solo por el nombre.

### 4.4 Saldos

`CargaDocs.SaldoDoc` es un **valor de control**, no la fuente final de saldo en
CASA. El saldo debe reconstruirse:

```text
saldo = débitos
      - créditos
      - aplicaciones de pago
      - cruces
      - notas de crédito
      + reversos aplicables
```

Si el saldo reconstruido no coincide con el almacenado:

- no modificar silenciosamente;
- crear `MigrationIssue`;
- mostrar documento, movimientos, diferencia y moneda;
- resolver con asiento/corrección de apertura aprobado.

### 4.5 Contraseñas y permisos

- `USUARIO.CLAVE`: **prohibido migrar**.
- Crear `AppUser` solo para identidades vigentes confirmadas.
- Enviar invitación de activación.
- Traducir funciones de `Perfil_User` a permisos como
  `billing.read`, `billing.issue`, `payments.record`,
  `payments.reconcile`, `accounting.post`, `vendors.pay`.
- Crear roles a partir de combinaciones reales, no un rol distinto por usuario
  sin necesidad.
- Todo acceso debe quedar limitado por `community_id`.

## 5. Datos derivados y copias

### 5.1 No usar como fuente primaria

- `Acumulado`
- `Balance_Comprobacion`
- `Libro_Mayor`
- `CobranzaRes`
- `ContAvisoCobro`
- `Concpto_Estad`
- `Cuenta_BancSaldo`
- todas las `Imp*`
- todas las `Temp*`
- `TBLRComisiones`, `TBLRP01`, `TBLRP02`
- todas las `EmiTemp_*`

Se usan para controles. Si un reporte legacy no puede reproducirse desde los
hechos migrados, la diferencia se investiga.

### 5.2 Copias históricas

`*_OLD`, `CargaDocsORI` y `TIPO_GASTO_ORIGINAL` no deben:

- importarse como registros activos adicionales;
- reemplazar automáticamente al maestro vigente;
- eliminarse antes de comparar.

Se perfilan mediante:

- claves solo en actual;
- claves solo en copia;
- filas iguales;
- filas diferentes campo por campo;
- fechas/usuarios que expliquen el cambio.

## 6. Compuertas del asistente CASA

### Etapa A — Custodia

- archivo original;
- SHA-256;
- tamaño;
- custodio;
- fecha de recepción;
- cifrado;
- acceso de solo lectura.

### Etapa B — Descubrimiento

- 100% de tablas y columnas;
- volumen;
- muestras enmascaradas;
- PK/índices/FK;
- tipos incompatibles;
- clasificación inicial.

### Etapa C — Mapeo

Para cada tabla:

- decisión: migrar, dividir, archivar, recalcular o descartar;
- entidad(es) destino;
- clave natural y legacy;
- filtro (`DelReg`, comunidad, período);
- dependencias;
- regla por campo;
- responsable de aprobar.

### Etapa D — Simulación

La simulación debe mostrar:

- filas leídas;
- entidades a crear/actualizar;
- duplicados;
- huérfanos;
- errores;
- advertencias;
- ejemplos antes/después;
- controles financieros preliminares.

### Etapa E — Resolución

Interfaz de cola para:

- personas ambiguas;
- unidades duplicadas;
- documentos sin propietario;
- pagos sin deuda;
- movimientos sin cuenta;
- asientos descuadrados;
- tasas ausentes;
- diferencias de saldo.

### Etapa F — Importación

- transacción por bloque lógico;
- idempotency key;
- `LegacyKeyMap`;
- auditoría de actor/versión;
- reanudación segura;
- ningún botón “completar” si faltan controles críticos.

### Etapa G — Conciliación y aprobación

El modal de etapa debe mostrar el checklist, evidencia, diferencias, responsable
y enlace directo a la corrección. Solo el resultado de los validadores puede
habilitar la conclusión.

## 7. Criterios de “listo para producción”

No activar a Caribbean hasta que:

- estructura inmobiliaria y titulares estén aprobados;
- todas las relaciones financieras críticas tengan destino;
- el saldo por inmueble y global cuadre;
- bancos y movimientos al corte cuadren;
- avisos seleccionados se reproduzcan exactamente;
- asientos estén balanceados;
- no existan huérfanos críticos;
- las credenciales legacy estén invalidadas;
- exista respaldo cifrado y reversa;
- administración y contabilidad firmen la conciliación final.
