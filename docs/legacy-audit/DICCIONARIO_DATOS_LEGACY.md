# Diccionario de datos del sistema legacy

> Generado desde `dump.sql`. Los propósitos marcados como hipótesis deben validarse con Luis Venezuela y con las pantallas originales. `?` significa nullable; `!` significa obligatorio según DDL.
> La obligatoriedad describe el DDL, no garantiza cumplimiento: el perfil detectó valores NULL en campos declarados NOT NULL.

- Tablas: 120
- Columnas: 1747
- Registros: 316.645
- Claves foráneas declaradas: 0

## Acumulado

- **Propósito probable:** Saldos contables anuales desnormalizados por cuenta, mes y moneda.
- **Nivel de importancia:** Importante
- **Registros:** 113
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `AccountingBalanceSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Ano` | `VARCHAR(4) !` | Atributo legacy «Ano»; semántica exacta por validar con reglas y pantallas originales. | `AccountingBalanceSnapshot.Ano` |
| `Codigo_cue` | `VARCHAR(11) !` | Código funcional usado como referencia implícita. | `AccountingBalanceSnapshot.Codigo_cue` |
| `Saldo_Inicial` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Saldo_Inicial` |
| `Enero_Debe` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Enero_Debe` |
| `Enero_Haber` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Enero_Haber` |
| `Febrero_Debe` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Febrero_Debe` |
| `Febrero_Haber` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Febrero_Haber` |
| `Marzo_Debe` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Marzo_Debe` |
| `Marzo_Haber` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Marzo_Haber` |
| `Abril_Debe` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Abril_Debe` |
| `Abril_Haber` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Abril_Haber` |
| `Mayo_Debe` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Mayo_Debe` |
| `Mayo_Haber` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Mayo_Haber` |
| `Junio_Debe` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Junio_Debe` |
| `Junio_Haber` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Junio_Haber` |
| `Julio_Debe` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Julio_Debe` |
| `Julio_Haber` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Julio_Haber` |
| `Agosto_Debe` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Agosto_Debe` |
| `Agosto_Haber` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Agosto_Haber` |
| `Septiembre_Debe` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Septiembre_Debe` |
| `Septiembre_Haber` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Septiembre_Haber` |
| `Octubre_Debe` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Octubre_Debe` |
| `Octubre_Haber` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Octubre_Haber` |
| `Noviembre_Debe` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Noviembre_Debe` |
| `Noviembre_Haber` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Noviembre_Haber` |
| `Diciembre_Debe` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Diciembre_Debe` |
| `Diciembre_Haber` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Diciembre_Haber` |
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `AccountingBalanceSnapshot.communityId (resolver por LegacyKeyMap)` |
| `Saldo_InicialD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Saldo_InicialD` |
| `Enero_DebeD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Enero_DebeD` |
| `Enero_HaberD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Enero_HaberD` |
| `Febrero_DebeD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Febrero_DebeD` |
| `Febrero_HaberD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Febrero_HaberD` |
| `Marzo_DebeD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Marzo_DebeD` |
| `Marzo_HaberD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Marzo_HaberD` |
| `Abril_DebeD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Abril_DebeD` |
| `Abril_HaberD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Abril_HaberD` |
| `Mayo_DebeD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Mayo_DebeD` |
| `Mayo_HaberD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Mayo_HaberD` |
| `Junio_DebeD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Junio_DebeD` |
| `Junio_HaberD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Junio_HaberD` |
| `Julio_DebeD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Julio_DebeD` |
| `Julio_HaberD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Julio_HaberD` |
| `Agosto_DebeD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Agosto_DebeD` |
| `Agosto_HaberD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Agosto_HaberD` |
| `Septiembre_DebeD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Septiembre_DebeD` |
| `Septiembre_HaberD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Septiembre_HaberD` |
| `Octubre_DebeD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Octubre_DebeD` |
| `Octubre_HaberD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Octubre_HaberD` |
| `Noviembre_DebeD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Noviembre_DebeD` |
| `Noviembre_HaberD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Noviembre_HaberD` |
| `Diciembre_DebeD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Diciembre_DebeD` |
| `Diciembre_HaberD` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `AccountingBalanceSnapshot.Diciembre_HaberD` |

## Alicuotas

- **Propósito probable:** Catálogo de alícuotas o reglas reutilizables; no sustituye la alícuota grabada en PROPIETARIO.
- **Nivel de importancia:** Importante
- **Registros:** 3
- **Clave primaria declarada:** CodAlicuota, CODIGO_COND
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `VALIDATE_MIGRATE`
- **Destino conceptual:** `AliquotRule`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CodAlicuota` | `VARCHAR(3) !` | Atributo legacy «CodAlicuota»; semántica exacta por validar con reglas y pantallas originales. | `AliquotRule.CodAlicuota` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `AliquotRule.communityId (resolver por LegacyKeyMap)` |
| `Alicuota` | `DOUBLE ?` | Atributo legacy «Alicuota»; semántica exacta por validar con reglas y pantallas originales. | `AliquotRule.Alicuota` |
| `Observacion` | `VARCHAR(250) ?` | Texto descriptivo o concepto de negocio. | `AliquotRule.Observacion` |
| `Observacion2` | `VARCHAR(250) ?` | Texto descriptivo o concepto de negocio. | `AliquotRule.Observacion2` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `AliquotRule.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `AliquotRule.legacyDeleted/status` |

## AuditoriaU

- **Propósito probable:** Bitácora textual de operaciones de usuario.
- **Nivel de importancia:** Crítica
- **Registros:** 29.601
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_MIGRATE`
- **Destino conceptual:** `LegacyAuditEvent`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `UsuarioId` | `VARCHAR(50) ?` | Atributo legacy «UsuarioId»; semántica exacta por validar con reglas y pantallas originales. | `LegacyAuditEvent.UsuarioId` |
| `Modulo` | `VARCHAR(30) ?` | Atributo legacy «Modulo»; semántica exacta por validar con reglas y pantallas originales. | `LegacyAuditEvent.Modulo` |
| `Proceso` | `VARCHAR(200) ?` | Atributo legacy «Proceso»; semántica exacta por validar con reglas y pantallas originales. | `LegacyAuditEvent.Proceso` |
| `AFecha` | `DATETIME ?` | Fecha asociada al registro o proceso. | `LegacyAuditEvent.AFecha` |
| `AHora` | `DATETIME ?` | Atributo legacy «AHora»; semántica exacta por validar con reglas y pantallas originales. | `LegacyAuditEvent.AHora` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `LegacyAuditEvent.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `LegacyAuditEvent.legacyDeleted/status` |

## Aviso

- **Propósito probable:** Cabecera del aviso de cobro periódico de la comunidad.
- **Nivel de importancia:** Crítica
- **Registros:** 64
- **Clave primaria declarada:** ID_AVI
- **Índices secundarios:** 1
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `BillingRun`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_AVI` | `VARCHAR(15) !` | Código funcional usado como referencia implícita. | `BillingRun.legacyNumber` |
| `FECHA_EMISION` | `DATETIME !` | Fecha asociada al registro o proceso. | `BillingRun.issuedOn` |
| `FECHA_VENCIMIENTO` | `DATETIME !` | Fecha asociada al registro o proceso. | `BillingRun.dueOn` |
| `F_Elaboracion` | `DATETIME !` | Atributo legacy «F_Elaboracion»; semántica exacta por validar con reglas y pantallas originales. | `BillingRun.preparedOn` |
| `ANO` | `VARCHAR(4) !` | Año contable o de facturación. | `BillingPeriod.year` |
| `MES` | `VARCHAR(2) !` | Mes contable o de facturación. | `BillingPeriod.month` |
| `SALDO_ANT` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `BillingRun.openingReceivable` |
| `OBSERVACION` | `VARCHAR(250) ?` | Texto descriptivo o concepto de negocio. | `BillingRun.notes` |
| `TOTAL_CUOTA` | `DOUBLE ?` | Atributo legacy «TOTAL_CUOTA»; semántica exacta por validar con reglas y pantallas originales. | `BillingRun.communitySubtotal` |
| `MONTO_PAGAR` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `BillingRun.totalAmount` |
| `PORC_FON` | `DOUBLE ?` | Atributo legacy «PORC_FON»; semántica exacta por validar con reglas y pantallas originales. | `BillingRun.reservePercentage` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `BillingRun.communityId (resolver por LegacyKeyMap)` |
| `ID_AVI` | `VARCHAR(15) !` | Identificador compuesto o técnico del sistema legacy. | `LegacyKeyMap.sourceKey` |
| `MONTO_FONDO` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `BillingRun.reserveAmount` |
| `ACTCambio` | `DOUBLE ?` | Atributo legacy «ACTCambio»; semántica exacta por validar con reglas y pantallas originales. | `BillingRun.exchangeRate` |
| `AMontoUS$` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `BillingRun.amountUsd` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `BillingRun.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `BillingRun.legacyDeleted/status` |
| `Tasa` | `DOUBLE ?` | Tasa de conversión aplicada a la operación. | `BillingRun.exchangeRate` |

## Balance_Comprobacion

- **Propósito probable:** Resultado materializado de un balance de comprobación.
- **Nivel de importancia:** Secundaria
- **Registros:** 1
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `TrialBalanceSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Grupo1` | `VARCHAR(11) ?` | Código funcional usado como referencia implícita. | `TrialBalanceSnapshot.Codigo_Grupo1` |
| `Descripcion_Grupo1` | `VARCHAR(50) ?` | Texto descriptivo o concepto de negocio. | `TrialBalanceSnapshot.Descripcion_Grupo1` |
| `Codigo_Grupo2` | `VARCHAR(11) ?` | Código funcional usado como referencia implícita. | `TrialBalanceSnapshot.Codigo_Grupo2` |
| `Descripcion_Grupo2` | `VARCHAR(50) ?` | Texto descriptivo o concepto de negocio. | `TrialBalanceSnapshot.Descripcion_Grupo2` |
| `Codigo_Grupo3` | `VARCHAR(11) ?` | Código funcional usado como referencia implícita. | `TrialBalanceSnapshot.Codigo_Grupo3` |
| `Descripcion_Grupo3` | `VARCHAR(50) ?` | Texto descriptivo o concepto de negocio. | `TrialBalanceSnapshot.Descripcion_Grupo3` |
| `Codigo_Grupo4` | `VARCHAR(11) ?` | Código funcional usado como referencia implícita. | `TrialBalanceSnapshot.Codigo_Grupo4` |
| `Descripcion_Grupo4` | `VARCHAR(50) ?` | Texto descriptivo o concepto de negocio. | `TrialBalanceSnapshot.Descripcion_Grupo4` |
| `Codigo_cue` | `VARCHAR(11) ?` | Código funcional usado como referencia implícita. | `TrialBalanceSnapshot.Codigo_cue` |
| `Descripcion` | `VARCHAR(50) ?` | Texto descriptivo o concepto de negocio. | `TrialBalanceSnapshot.Descripcion` |
| `Saldo_Anterior` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `TrialBalanceSnapshot.Saldo_Anterior` |
| `Debe` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `TrialBalanceSnapshot.Debe` |
| `Haber` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `TrialBalanceSnapshot.Haber` |
| `Saldo` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `TrialBalanceSnapshot.Saldo` |
| `Saldo_AnteriorD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `TrialBalanceSnapshot.Saldo_AnteriorD` |
| `DebeD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `TrialBalanceSnapshot.DebeD` |
| `HaberD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `TrialBalanceSnapshot.HaberD` |
| `SaldoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `TrialBalanceSnapshot.SaldoD` |
| `Mes` | `VARCHAR(2) ?` | Atributo legacy «Mes»; semántica exacta por validar con reglas y pantallas originales. | `TrialBalanceSnapshot.Mes` |
| `Ano` | `VARCHAR(4) ?` | Atributo legacy «Ano»; semántica exacta por validar con reglas y pantallas originales. | `TrialBalanceSnapshot.Ano` |
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `TrialBalanceSnapshot.communityId (resolver por LegacyKeyMap)` |
| `CtaResult` | `VARCHAR(11) ?` | Atributo legacy «CtaResult»; semántica exacta por validar con reglas y pantallas originales. | `TrialBalanceSnapshot.CtaResult` |
| `MontoGoP` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `TrialBalanceSnapshot.MontoGoP` |
| `MontoGoPD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `TrialBalanceSnapshot.MontoGoPD` |

## BANCO

- **Propósito probable:** Catálogo de bancos.
- **Nivel de importancia:** Importante
- **Registros:** 12
- **Clave primaria declarada:** ID_BAN
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `Bank`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_BAN` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `Bank.CODIGO_BAN` |
| `NOMBRE` | `VARCHAR(50) !` | Atributo legacy «NOMBRE»; semántica exacta por validar con reglas y pantallas originales. | `Bank.NOMBRE` |
| `ID_BAN` | `VARCHAR(3) !` | Identificador compuesto o técnico del sistema legacy. | `Bank.ID_BAN` |
| `FormatChq` | `VARCHAR(50) ?` | Atributo legacy «FormatChq»; semántica exacta por validar con reglas y pantallas originales. | `Bank.FormatChq` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `Bank.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `Bank.legacyDeleted/status` |

## Basededatos

- **Propósito probable:** Configuración local de rutas de archivos Access por ejercicio.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** Id
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_ARCHIVE`
- **Destino conceptual:** `LegacySourceReference`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Id` | `INTEGER !` | Atributo legacy «Id»; semántica exacta por validar con reglas y pantallas originales. | `LegacySourceReference.Id` |
| `Campo1` | `VARCHAR(30) ?` | Atributo legacy «Campo1»; semántica exacta por validar con reglas y pantallas originales. | `LegacySourceReference.Campo1` |
| `Campo2` | `VARCHAR(50) ?` | Atributo legacy «Campo2»; semántica exacta por validar con reglas y pantallas originales. | `LegacySourceReference.Campo2` |

## BENEFICIARIO

- **Propósito probable:** Maestro de beneficiarios o proveedores a quienes se realizan pagos.
- **Nivel de importancia:** Crítica
- **Registros:** 755
- **Clave primaria declarada:** ID_BEN
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `Vendor`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_BEN` | `VARCHAR(4) !` | Código funcional usado como referencia implícita. | `Vendor.CODIGO_BEN` |
| `NOMBRE` | `VARCHAR(100) !` | Atributo legacy «NOMBRE»; semántica exacta por validar con reglas y pantallas originales. | `Vendor.NOMBRE` |
| `DIRECCION` | `VARCHAR(100) ?` | Atributo legacy «DIRECCION»; semántica exacta por validar con reglas y pantallas originales. | `Vendor.DIRECCION` |
| `TELEFONO` | `VARCHAR(50) ?` | Atributo legacy «TELEFONO»; semántica exacta por validar con reglas y pantallas originales. | `Vendor.TELEFONO` |
| `CONCEPTO` | `VARCHAR(50) ?` | Texto descriptivo o concepto de negocio. | `Vendor.CONCEPTO` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `Vendor.communityId (resolver por LegacyKeyMap)` |
| `CODIGO_CUE` | `VARCHAR(8) ?` | Código funcional usado como referencia implícita. | `Vendor.CODIGO_CUE` |
| `Codigo_Gasto` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `Vendor.Codigo_Gasto` |
| `ConcPago` | `VARCHAR(100) ?` | Atributo legacy «ConcPago»; semántica exacta por validar con reglas y pantallas originales. | `Vendor.ConcPago` |
| `ID_BEN` | `VARCHAR(8) !` | Identificador compuesto o técnico del sistema legacy. | `Vendor.ID_BEN` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `Vendor.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `Vendor.legacyDeleted/status` |

## BENEFICIARIO_OLD

- **Propósito probable:** Copia histórica del maestro de beneficiarios.
- **Nivel de importancia:** Secundaria
- **Registros:** 460
- **Clave primaria declarada:** ID_BEN
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_COMPARE`
- **Destino conceptual:** `LegacyVendorSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_BEN` | `VARCHAR(4) !` | Código funcional usado como referencia implícita. | `LegacyVendorSnapshot.CODIGO_BEN` |
| `NOMBRE` | `VARCHAR(100) !` | Atributo legacy «NOMBRE»; semántica exacta por validar con reglas y pantallas originales. | `LegacyVendorSnapshot.NOMBRE` |
| `DIRECCION` | `VARCHAR(100) ?` | Atributo legacy «DIRECCION»; semántica exacta por validar con reglas y pantallas originales. | `LegacyVendorSnapshot.DIRECCION` |
| `TELEFONO` | `VARCHAR(50) ?` | Atributo legacy «TELEFONO»; semántica exacta por validar con reglas y pantallas originales. | `LegacyVendorSnapshot.TELEFONO` |
| `CONCEPTO` | `VARCHAR(50) ?` | Texto descriptivo o concepto de negocio. | `LegacyVendorSnapshot.CONCEPTO` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `LegacyVendorSnapshot.communityId (resolver por LegacyKeyMap)` |
| `CODIGO_CUE` | `VARCHAR(8) ?` | Código funcional usado como referencia implícita. | `LegacyVendorSnapshot.CODIGO_CUE` |
| `Codigo_Gasto` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `LegacyVendorSnapshot.Codigo_Gasto` |
| `ConcPago` | `VARCHAR(100) ?` | Atributo legacy «ConcPago»; semántica exacta por validar con reglas y pantallas originales. | `LegacyVendorSnapshot.ConcPago` |
| `ID_BEN` | `VARCHAR(8) !` | Identificador compuesto o técnico del sistema legacy. | `LegacyVendorSnapshot.ID_BEN` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `LegacyVendorSnapshot.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `LegacyVendorSnapshot.legacyDeleted/status` |

## CargaDocs

- **Propósito probable:** Libro operativo de documentos por cobrar y saldos por inmueble/código de propietario.
- **Nivel de importancia:** Crítica
- **Registros:** 51.959
- **Clave primaria declarada:** Codigo_Cond, CodPropt, TipoDoc, NroDoc
- **Índices secundarios:** 4
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `Receivable`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `Receivable.communityId (resolver por LegacyKeyMap)` |
| `CodPropt` | `VARCHAR(4) !` | Atributo legacy «CodPropt»; semántica exacta por validar con reglas y pantallas originales. | `Receivable.propertyId (resolved)` |
| `TipoDoc` | `VARCHAR(2) !` | Atributo legacy «TipoDoc»; semántica exacta por validar con reglas y pantallas originales. | `Receivable.typeId (resolved)` |
| `NroDoc` | `VARCHAR(6) !` | Número o referencia funcional legacy. | `Receivable.documentNumber` |
| `FechaEmi` | `DATETIME ?` | Fecha asociada al registro o proceso. | `Receivable.issuedOn` |
| `FechaVen` | `DATETIME ?` | Fecha asociada al registro o proceso. | `Receivable.dueOn` |
| `MontoDoc` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `Receivable.originalAmount` |
| `SaldoDoc` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `Receivable.openAmount` |
| `MontoDocAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `Receivable.originalAmountAlternate` |
| `SaldoDocAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `Receivable.openAmountAlternate` |
| `NroRef` | `VARCHAR(6) ?` | Número o referencia funcional legacy. | `Receivable.NroRef` |
| `DebCre` | `VARCHAR(1) ?` | Naturaleza débito/crédito codificada. | `Receivable.direction` |
| `CTipoCambio` | `DOUBLE ?` | Atributo legacy «CTipoCambio»; semántica exacta por validar con reglas y pantallas originales. | `Receivable.exchangeRate` |
| `CMontoUS$` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `Receivable.amountUsd` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `Receivable.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `Receivable.legacyDeleted/status` |

## CargaDocsDetalle

- **Propósito probable:** Aplicaciones y movimientos que afectan documentos por cobrar.
- **Nivel de importancia:** Crítica
- **Registros:** 61.445
- **Clave primaria declarada:** NroTrans, NroDocD, CodProptD, Codigo_Cond
- **Índices secundarios:** 2
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `ReceivableApplication`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `NroTrans` | `VARCHAR(7) !` | Número o referencia funcional legacy. | `ReceivableApplication.NroTrans` |
| `NroDocD` | `VARCHAR(6) !` | Número o referencia funcional legacy. | `ReceivableApplication.NroDocD` |
| `CodProptD` | `VARCHAR(4) !` | Atributo legacy «CodProptD»; semántica exacta por validar con reglas y pantallas originales. | `ReceivableApplication.CodProptD` |
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReceivableApplication.communityId (resolver por LegacyKeyMap)` |
| `CodTrans` | `VARCHAR(2) ?` | Atributo legacy «CodTrans»; semántica exacta por validar con reglas y pantallas originales. | `ReceivableApplication.CodTrans` |
| `DebCred` | `VARCHAR(1) ?` | Naturaleza débito/crédito codificada. | `ReceivableApplication.DebCred` |
| `MontoDocD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReceivableApplication.MontoDocD` |
| `GenRec` | `TINYINT(1) ?` | Atributo legacy «GenRec»; semántica exacta por validar con reglas y pantallas originales. | `ReceivableApplication.GenRec` |
| `FechaPago` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReceivableApplication.FechaPago` |
| `CDTipoCambio` | `DOUBLE ?` | Atributo legacy «CDTipoCambio»; semántica exacta por validar con reglas y pantallas originales. | `ReceivableApplication.CDTipoCambio` |
| `CDMontoUS$` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReceivableApplication.CDMontoUS$` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `ReceivableApplication.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReceivableApplication.legacyDeleted/status` |

## CargaDocsORI

- **Propósito probable:** Copia original o base histórica de documentos por cobrar.
- **Nivel de importancia:** Crítica
- **Registros:** 33.886
- **Clave primaria declarada:** Codigo_Cond, CodPropt, TipoDoc, NroDoc
- **Índices secundarios:** 4
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECONCILE`
- **Destino conceptual:** `LegacyReceivableSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `LegacyReceivableSnapshot.communityId (resolver por LegacyKeyMap)` |
| `CodPropt` | `VARCHAR(4) !` | Atributo legacy «CodPropt»; semántica exacta por validar con reglas y pantallas originales. | `LegacyReceivableSnapshot.CodPropt` |
| `TipoDoc` | `VARCHAR(2) !` | Atributo legacy «TipoDoc»; semántica exacta por validar con reglas y pantallas originales. | `LegacyReceivableSnapshot.TipoDoc` |
| `NroDoc` | `VARCHAR(6) !` | Número o referencia funcional legacy. | `LegacyReceivableSnapshot.NroDoc` |
| `FechaEmi` | `DATETIME ?` | Fecha asociada al registro o proceso. | `LegacyReceivableSnapshot.FechaEmi` |
| `FechaVen` | `DATETIME ?` | Fecha asociada al registro o proceso. | `LegacyReceivableSnapshot.FechaVen` |
| `MontoDoc` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `LegacyReceivableSnapshot.MontoDoc` |
| `SaldoDoc` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `LegacyReceivableSnapshot.SaldoDoc` |
| `NroRef` | `VARCHAR(6) ?` | Número o referencia funcional legacy. | `LegacyReceivableSnapshot.NroRef` |
| `DebCre` | `VARCHAR(1) ?` | Naturaleza débito/crédito codificada. | `LegacyReceivableSnapshot.DebCre` |
| `CTipoCambio` | `DOUBLE ?` | Atributo legacy «CTipoCambio»; semántica exacta por validar con reglas y pantallas originales. | `LegacyReceivableSnapshot.CTipoCambio` |
| `CMontoUS$` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `LegacyReceivableSnapshot.CMontoUS$` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `LegacyReceivableSnapshot.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `LegacyReceivableSnapshot.legacyDeleted/status` |

## CobranzaRes

- **Propósito probable:** Resumen mensual desnormalizado de cobranza.
- **Nivel de importancia:** Secundaria
- **Registros:** 64
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 2
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `CollectionSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `AnhoP` | `VARCHAR(4) ?` | Atributo legacy «AnhoP»; semántica exacta por validar con reglas y pantallas originales. | `CollectionSnapshot.AnhoP` |
| `MesP` | `VARCHAR(7) ?` | Atributo legacy «MesP»; semántica exacta por validar con reglas y pantallas originales. | `CollectionSnapshot.MesP` |
| `Cod_Cond` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `CollectionSnapshot.Cod_Cond` |
| `Cod_ConJ` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `CollectionSnapshot.Cod_ConJ` |
| `MontoACP` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `CollectionSnapshot.MontoACP` |
| `01` | `DOUBLE ?` | Atributo legacy «01»; semántica exacta por validar con reglas y pantallas originales. | `CollectionSnapshot.01` |
| `02` | `DOUBLE ?` | Atributo legacy «02»; semántica exacta por validar con reglas y pantallas originales. | `CollectionSnapshot.02` |
| `03` | `DOUBLE ?` | Atributo legacy «03»; semántica exacta por validar con reglas y pantallas originales. | `CollectionSnapshot.03` |
| `04` | `DOUBLE ?` | Atributo legacy «04»; semántica exacta por validar con reglas y pantallas originales. | `CollectionSnapshot.04` |
| `05` | `DOUBLE ?` | Atributo legacy «05»; semántica exacta por validar con reglas y pantallas originales. | `CollectionSnapshot.05` |
| `06` | `DOUBLE ?` | Atributo legacy «06»; semántica exacta por validar con reglas y pantallas originales. | `CollectionSnapshot.06` |
| `07` | `DOUBLE ?` | Atributo legacy «07»; semántica exacta por validar con reglas y pantallas originales. | `CollectionSnapshot.07` |
| `08` | `DOUBLE ?` | Atributo legacy «08»; semántica exacta por validar con reglas y pantallas originales. | `CollectionSnapshot.08` |
| `09` | `DOUBLE ?` | Atributo legacy «09»; semántica exacta por validar con reglas y pantallas originales. | `CollectionSnapshot.09` |
| `10` | `DOUBLE ?` | Atributo legacy «10»; semántica exacta por validar con reglas y pantallas originales. | `CollectionSnapshot.10` |
| `11` | `DOUBLE ?` | Atributo legacy «11»; semántica exacta por validar con reglas y pantallas originales. | `CollectionSnapshot.11` |
| `12` | `DOUBLE ?` | Atributo legacy «12»; semántica exacta por validar con reglas y pantallas originales. | `CollectionSnapshot.12` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `CollectionSnapshot.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `CollectionSnapshot.legacyDeleted/status` |

## Comprobante

- **Propósito probable:** Cabecera de comprobante o asiento contable.
- **Nivel de importancia:** Crítica
- **Registros:** 67
- **Clave primaria declarada:** ID_COMP
- **Índices secundarios:** 1
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `JournalEntry`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_COMP` | `VARCHAR(8) !` | Código funcional usado como referencia implícita. | `JournalEntry.CODIGO_COMP` |
| `CODIGO_TCOM` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `JournalEntry.CODIGO_TCOM` |
| `FECHA_COMP` | `DATETIME ?` | Fecha asociada al registro o proceso. | `JournalEntry.FECHA_COMP` |
| `MES` | `VARCHAR(2) !` | Mes contable o de facturación. | `JournalEntry.MES` |
| `ANO` | `VARCHAR(4) !` | Año contable o de facturación. | `JournalEntry.ANO` |
| `MONTO_DEBE` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `JournalEntry.MONTO_DEBE` |
| `MONTO_HABER` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `JournalEntry.MONTO_HABER` |
| `OBSERVACION` | `VARCHAR(50) ?` | Texto descriptivo o concepto de negocio. | `JournalEntry.OBSERVACION` |
| `STATUS` | `TINYINT(1) ?` | Atributo legacy «STATUS»; semántica exacta por validar con reglas y pantallas originales. | `JournalEntry.STATUS` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `JournalEntry.communityId (resolver por LegacyKeyMap)` |
| `ID_COMP` | `VARCHAR(17) !` | Identificador compuesto o técnico del sistema legacy. | `JournalEntry.ID_COMP` |
| `ID_TCOM` | `VARCHAR(3) !` | Identificador compuesto o técnico del sistema legacy. | `JournalEntry.ID_TCOM` |
| `ContADept` | `TINYINT(1) ?` | Atributo legacy «ContADept»; semántica exacta por validar con reglas y pantallas originales. | `JournalEntry.ContADept` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `JournalEntry.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `JournalEntry.legacyDeleted/status` |
| `MONTO_DEBEDolar` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `JournalEntry.MONTO_DEBEDolar` |
| `MONTO_HABERDolar` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `JournalEntry.MONTO_HABERDolar` |

## Comprobante_Detalle

- **Propósito probable:** Partidas de débito y crédito de cada comprobante.
- **Nivel de importancia:** Crítica
- **Registros:** 2.457
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 2
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `JournalLine`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_DET` | `VARCHAR(8) !` | Código funcional usado como referencia implícita. | `JournalLine.CODIGO_DET` |
| `CODIGO_COMP` | `VARCHAR(8) !` | Código funcional usado como referencia implícita. | `JournalLine.CODIGO_COMP` |
| `CODIGO_CUE` | `VARCHAR(8) !` | Código funcional usado como referencia implícita. | `JournalLine.CODIGO_CUE` |
| `DESCRIPCION` | `VARCHAR(50) ?` | Texto descriptivo o concepto de negocio. | `JournalLine.DESCRIPCION` |
| `DEBE` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `JournalLine.DEBE` |
| `HABER` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `JournalLine.HABER` |
| `MES` | `VARCHAR(2) !` | Mes contable o de facturación. | `JournalLine.MES` |
| `ANO` | `VARCHAR(4) !` | Año contable o de facturación. | `JournalLine.ANO` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `JournalLine.communityId (resolver por LegacyKeyMap)` |
| `ID_CUE` | `VARCHAR(11) !` | Identificador compuesto o técnico del sistema legacy. | `JournalLine.ID_CUE` |
| `ID_COMP` | `VARCHAR(17) !` | Identificador compuesto o técnico del sistema legacy. | `JournalLine.ID_COMP` |
| `DEBEDolar` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `JournalLine.DEBEDolar` |
| `HABERDolar` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `JournalLine.HABERDolar` |

## CONCEPTO_FACT

- **Propósito probable:** Catálogo de conceptos de gasto/cobro y sus cuentas contables y reglas de distribución.
- **Nivel de importancia:** Crítica
- **Registros:** 262
- **Clave primaria declarada:** ID_CON
- **Índices secundarios:** 5
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `ChargeConcept`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_CON` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ChargeConcept.CODIGO_CON` |
| `CODIGO_TIP` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ChargeConcept.CODIGO_TIP` |
| `CODIGO_CUE` | `VARCHAR(8) ?` | Código funcional usado como referencia implícita. | `ChargeConcept.CODIGO_CUE` |
| `CODIGO_CUEG` | `VARCHAR(8) !` | Código funcional usado como referencia implícita. | `ChargeConcept.CODIGO_CUEG` |
| `DESCRIPCION` | `VARCHAR(80) !` | Texto descriptivo o concepto de negocio. | `ChargeConcept.DESCRIPCION` |
| `IND_ACUM` | `VARCHAR(2) !` | Atributo legacy «IND_ACUM»; semántica exacta por validar con reglas y pantallas originales. | `ChargeConcept.IND_ACUM` |
| `APL_CUOT` | `VARCHAR(2) !` | Atributo legacy «APL_CUOT»; semántica exacta por validar con reglas y pantallas originales. | `ChargeConcept.APL_CUOT` |
| `APL_RES` | `VARCHAR(2) !` | Atributo legacy «APL_RES»; semántica exacta por validar con reglas y pantallas originales. | `ChargeConcept.APL_RES` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `ChargeConcept.communityId (resolver por LegacyKeyMap)` |
| `CODIGO_CONJ` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `ChargeConcept.CODIGO_CONJ` |
| `MontoFijo` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ChargeConcept.MontoFijo` |
| `ID_CON` | `VARCHAR(7) !` | Identificador compuesto o técnico del sistema legacy. | `ChargeConcept.ID_CON` |
| `ID_CUE` | `VARCHAR(11) !` | Identificador compuesto o técnico del sistema legacy. | `ChargeConcept.ID_CUE` |
| `ID_CUEG` | `VARCHAR(11) !` | Identificador compuesto o técnico del sistema legacy. | `ChargeConcept.ID_CUEG` |
| `ID_TIP` | `VARCHAR(3) !` | Identificador compuesto o técnico del sistema legacy. | `ChargeConcept.ID_TIP` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `ChargeConcept.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ChargeConcept.legacyDeleted/status` |

## ConcOtrosIng

- **Propósito probable:** Catálogo de conceptos de otros ingresos.
- **Nivel de importancia:** Importante
- **Registros:** 4
- **Clave primaria declarada:** CodConcOI
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `RevenueConcept`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CodConcOI` | `VARCHAR(4) !` | Atributo legacy «CodConcOI»; semántica exacta por validar con reglas y pantallas originales. | `RevenueConcept.CodConcOI` |
| `DescCOI` | `VARCHAR(50) !` | Atributo legacy «DescCOI»; semántica exacta por validar con reglas y pantallas originales. | `RevenueConcept.DescCOI` |
| `CtaContbCOI` | `VARCHAR(8) ?` | Atributo legacy «CtaContbCOI»; semántica exacta por validar con reglas y pantallas originales. | `RevenueConcept.CtaContbCOI` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `RevenueConcept.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `RevenueConcept.legacyDeleted/status` |

## Concpto_Estad

- **Propósito probable:** Acumulado mensual por concepto de gasto.
- **Nivel de importancia:** Secundaria
- **Registros:** 741
- **Clave primaria declarada:** Anho, Id_Con
- **Índices secundarios:** 3
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ExpenseAnalyticsSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Anho` | `VARCHAR(4) !` | Año contable o de facturación. | `ExpenseAnalyticsSnapshot.Anho` |
| `Id_Con` | `VARCHAR(7) !` | Identificador compuesto o técnico del sistema legacy. | `ExpenseAnalyticsSnapshot.Id_Con` |
| `Cod_Cond` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `ExpenseAnalyticsSnapshot.Cod_Cond` |
| `Cod_ConJ` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `ExpenseAnalyticsSnapshot.Cod_ConJ` |
| `Cod_Conc` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `ExpenseAnalyticsSnapshot.Cod_Conc` |
| `SaldoInicial` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ExpenseAnalyticsSnapshot.SaldoInicial` |
| `01` | `DOUBLE ?` | Atributo legacy «01»; semántica exacta por validar con reglas y pantallas originales. | `ExpenseAnalyticsSnapshot.01` |
| `02` | `DOUBLE ?` | Atributo legacy «02»; semántica exacta por validar con reglas y pantallas originales. | `ExpenseAnalyticsSnapshot.02` |
| `03` | `DOUBLE ?` | Atributo legacy «03»; semántica exacta por validar con reglas y pantallas originales. | `ExpenseAnalyticsSnapshot.03` |
| `04` | `DOUBLE ?` | Atributo legacy «04»; semántica exacta por validar con reglas y pantallas originales. | `ExpenseAnalyticsSnapshot.04` |
| `05` | `DOUBLE ?` | Atributo legacy «05»; semántica exacta por validar con reglas y pantallas originales. | `ExpenseAnalyticsSnapshot.05` |
| `06` | `DOUBLE ?` | Atributo legacy «06»; semántica exacta por validar con reglas y pantallas originales. | `ExpenseAnalyticsSnapshot.06` |
| `07` | `DOUBLE ?` | Atributo legacy «07»; semántica exacta por validar con reglas y pantallas originales. | `ExpenseAnalyticsSnapshot.07` |
| `08` | `DOUBLE ?` | Atributo legacy «08»; semántica exacta por validar con reglas y pantallas originales. | `ExpenseAnalyticsSnapshot.08` |
| `09` | `DOUBLE ?` | Atributo legacy «09»; semántica exacta por validar con reglas y pantallas originales. | `ExpenseAnalyticsSnapshot.09` |
| `10` | `DOUBLE ?` | Atributo legacy «10»; semántica exacta por validar con reglas y pantallas originales. | `ExpenseAnalyticsSnapshot.10` |
| `11` | `DOUBLE ?` | Atributo legacy «11»; semántica exacta por validar con reglas y pantallas originales. | `ExpenseAnalyticsSnapshot.11` |
| `12` | `DOUBLE ?` | Atributo legacy «12»; semántica exacta por validar con reglas y pantallas originales. | `ExpenseAnalyticsSnapshot.12` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `ExpenseAnalyticsSnapshot.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ExpenseAnalyticsSnapshot.legacyDeleted/status` |

## CONDOMINIO

- **Propósito probable:** Maestro y configuración financiera de entidades administradas.
- **Nivel de importancia:** Crítica
- **Registros:** 2
- **Clave primaria declarada:** CODIGO_COND
- **Índices secundarios:** 1
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE_WITH_SPLIT`
- **Destino conceptual:** `Community`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `Community.legacyCode` |
| `NOMBRE` | `VARCHAR(50) !` | Atributo legacy «NOMBRE»; semántica exacta por validar con reglas y pantallas originales. | `Community.name` |
| `DIRECCION` | `VARCHAR(100) ?` | Atributo legacy «DIRECCION»; semántica exacta por validar con reglas y pantallas originales. | `Community.address` |
| `TELEFONO` | `VARCHAR(50) ?` | Atributo legacy «TELEFONO»; semántica exacta por validar con reglas y pantallas originales. | `Community.phone` |
| `CONTACTO` | `VARCHAR(50) ?` | Atributo legacy «CONTACTO»; semántica exacta por validar con reglas y pantallas originales. | `Client.contactName` |
| `FECHA_ING` | `DATETIME ?` | Fecha asociada al registro o proceso. | `Community.legacyStartedAt` |
| `PORC_FOND` | `DOUBLE ?` | Atributo legacy «PORC_FOND»; semántica exacta por validar con reglas y pantallas originales. | `BillingPolicy.reserveFundPercentage` |
| `REDONDEO` | `VARCHAR(2) ?` | Atributo legacy «REDONDEO»; semántica exacta por validar con reglas y pantallas originales. | `Community.REDONDEO` |
| `CODIGO_CUE` | `VARCHAR(8) ?` | Código funcional usado como referencia implícita. | `Community.CODIGO_CUE` |
| `IMPRIME` | `VARCHAR(2) ?` | Atributo legacy «IMPRIME»; semántica exacta por validar con reglas y pantallas originales. | `Community.IMPRIME` |
| `PROX_REC` | `DOUBLE ?` | Atributo legacy «PROX_REC»; semántica exacta por validar con reglas y pantallas originales. | `Community.PROX_REC` |
| `TIPO` | `VARCHAR(10) ?` | Atributo legacy «TIPO»; semántica exacta por validar con reglas y pantallas originales. | `Community.TIPO` |
| `DIASVENCIM` | `DOUBLE ?` | Atributo legacy «DIASVENCIM»; semántica exacta por validar con reglas y pantallas originales. | `BillingPolicy.dueDays` |
| `CALCULA` | `VARCHAR(5) ?` | Atributo legacy «CALCULA»; semántica exacta por validar con reglas y pantallas originales. | `Community.CALCULA` |
| `PORCINTM` | `DOUBLE ?` | Atributo legacy «PORCINTM»; semántica exacta por validar con reglas y pantallas originales. | `LateFeePolicy.rate` |
| `FECHA_INICIAL` | `DATETIME ?` | Fecha asociada al registro o proceso. | `FiscalPeriod.startsOn` |
| `FECHA_FINAL` | `DATETIME ?` | Fecha asociada al registro o proceso. | `FiscalPeriod.endsOn` |
| `MES` | `INTEGER ?` | Mes contable o de facturación. | `FiscalPeriod.currentMonth` |
| `ANO` | `INTEGER ?` | Año contable o de facturación. | `FiscalPeriod.currentYear` |
| `CONJUNTOR` | `VARCHAR(3) ?` | Atributo legacy «CONJUNTOR»; semántica exacta por validar con reglas y pantallas originales. | `Community.CONJUNTOR` |
| `NUM_COMP` | `VARCHAR(8) ?` | Número o referencia funcional legacy. | `Community.NUM_COMP` |
| `NUM_PRO` | `VARCHAR(4) ?` | Número o referencia funcional legacy. | `Community.NUM_PRO` |
| `OBSERVACION` | `LONGTEXT ?` | Texto descriptivo o concepto de negocio. | `Community.OBSERVACION` |
| `RIF` | `VARCHAR(15) ?` | Atributo legacy «RIF»; semántica exacta por validar con reglas y pantallas originales. | `Community.rif` |
| `CodCtaResAAct` | `VARCHAR(8) ?` | Atributo legacy «CodCtaResAAct»; semántica exacta por validar con reglas y pantallas originales. | `Community.CodCtaResAAct` |
| `CodCtaResAAnt` | `VARCHAR(8) ?` | Atributo legacy «CodCtaResAAnt»; semántica exacta por validar con reglas y pantallas originales. | `Community.CodCtaResAAnt` |
| `CodCtaCtasXCob` | `VARCHAR(8) ?` | Atributo legacy «CodCtaCtasXCob»; semántica exacta por validar con reglas y pantallas originales. | `Community.CodCtaCtasXCob` |
| `CodCtaAjusteDAC` | `VARCHAR(8) ?` | Atributo legacy «CodCtaAjusteDAC»; semántica exacta por validar con reglas y pantallas originales. | `Community.CodCtaAjusteDAC` |
| `CodCtaIngresos` | `VARCHAR(8) ?` | Atributo legacy «CodCtaIngresos»; semántica exacta por validar con reglas y pantallas originales. | `Community.CodCtaIngresos` |
| `CodCtaAjusteCxCP` | `VARCHAR(8) ?` | Atributo legacy «CodCtaAjusteCxCP»; semántica exacta por validar con reglas y pantallas originales. | `Community.CodCtaAjusteCxCP` |
| `CodCtaRelProp` | `VARCHAR(8) ?` | Atributo legacy «CodCtaRelProp»; semántica exacta por validar con reglas y pantallas originales. | `Community.CodCtaRelProp` |
| `CodCtaEfectrans` | `VARCHAR(50) ?` | Atributo legacy «CodCtaEfectrans»; semántica exacta por validar con reglas y pantallas originales. | `Community.CodCtaEfectrans` |
| `NroTransBanc` | `VARCHAR(8) ?` | Número o referencia funcional legacy. | `Community.NroTransBanc` |
| `AvisoMesAS` | `TINYINT(1) ?` | Atributo legacy «AvisoMesAS»; semántica exacta por validar con reglas y pantallas originales. | `Community.AvisoMesAS` |
| `ImpIntsAviso` | `TINYINT(1) ?` | Atributo legacy «ImpIntsAviso»; semántica exacta por validar con reglas y pantallas originales. | `Community.ImpIntsAviso` |
| `TIPOCAMBIO` | `DOUBLE ?` | Atributo legacy «TIPOCAMBIO»; semántica exacta por validar con reglas y pantallas originales. | `LegacyExchangeRateReference` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `Community.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `Community.legacyDeleted/status` |
| `NRORECIBO` | `DOUBLE ?` | Número o referencia funcional legacy. | `Community.NRORECIBO` |
| `READONLY` | `DOUBLE ?` | Atributo legacy «READONLY»; semántica exacta por validar con reglas y pantallas originales. | `Community.READONLY` |
| `Moneda` | `TINYINT(3) UNSIGNED ?` | Atributo legacy «Moneda»; semántica exacta por validar con reglas y pantallas originales. | `Community.Moneda` |
| `Email` | `VARCHAR(255) ?` | Atributo legacy «Email»; semántica exacta por validar con reglas y pantallas originales. | `Community.email` |
| `DirLogo` | `VARCHAR(255) ?` | Atributo legacy «DirLogo»; semántica exacta por validar con reglas y pantallas originales. | `Community.branding.logoAssetId` |
| `SimboloAC` | `VARCHAR(5) ?` | Atributo legacy «SimboloAC»; semántica exacta por validar con reglas y pantallas originales. | `Community.SimboloAC` |
| `SimboloALT` | `VARCHAR(5) ?` | Atributo legacy «SimboloALT»; semántica exacta por validar con reglas y pantallas originales. | `Community.SimboloALT` |

## CONDOMINIO_OLD

- **Propósito probable:** Copia histórica del maestro de condominios.
- **Nivel de importancia:** Secundaria
- **Registros:** 2
- **Clave primaria declarada:** CODIGO_COND
- **Índices secundarios:** 1
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_COMPARE`
- **Destino conceptual:** `LegacyCommunitySnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `LegacyCommunitySnapshot.communityId (resolver por LegacyKeyMap)` |
| `NOMBRE` | `VARCHAR(50) !` | Atributo legacy «NOMBRE»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.NOMBRE` |
| `DIRECCION` | `VARCHAR(100) ?` | Atributo legacy «DIRECCION»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.DIRECCION` |
| `TELEFONO` | `VARCHAR(50) ?` | Atributo legacy «TELEFONO»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.TELEFONO` |
| `CONTACTO` | `VARCHAR(50) ?` | Atributo legacy «CONTACTO»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.CONTACTO` |
| `FECHA_ING` | `DATETIME ?` | Fecha asociada al registro o proceso. | `LegacyCommunitySnapshot.FECHA_ING` |
| `PORC_FOND` | `DOUBLE ?` | Atributo legacy «PORC_FOND»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.PORC_FOND` |
| `REDONDEO` | `VARCHAR(2) ?` | Atributo legacy «REDONDEO»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.REDONDEO` |
| `CODIGO_CUE` | `VARCHAR(8) ?` | Código funcional usado como referencia implícita. | `LegacyCommunitySnapshot.CODIGO_CUE` |
| `IMPRIME` | `VARCHAR(2) ?` | Atributo legacy «IMPRIME»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.IMPRIME` |
| `PROX_REC` | `DOUBLE ?` | Atributo legacy «PROX_REC»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.PROX_REC` |
| `TIPO` | `VARCHAR(10) ?` | Atributo legacy «TIPO»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.TIPO` |
| `DIASVENCIM` | `DOUBLE ?` | Atributo legacy «DIASVENCIM»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.DIASVENCIM` |
| `CALCULA` | `VARCHAR(5) ?` | Atributo legacy «CALCULA»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.CALCULA` |
| `PORCINTM` | `DOUBLE ?` | Atributo legacy «PORCINTM»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.PORCINTM` |
| `FECHA_INICIAL` | `DATETIME ?` | Fecha asociada al registro o proceso. | `LegacyCommunitySnapshot.FECHA_INICIAL` |
| `FECHA_FINAL` | `DATETIME ?` | Fecha asociada al registro o proceso. | `LegacyCommunitySnapshot.FECHA_FINAL` |
| `MES` | `INTEGER ?` | Mes contable o de facturación. | `LegacyCommunitySnapshot.MES` |
| `ANO` | `INTEGER ?` | Año contable o de facturación. | `LegacyCommunitySnapshot.ANO` |
| `CONJUNTOR` | `VARCHAR(3) ?` | Atributo legacy «CONJUNTOR»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.CONJUNTOR` |
| `NUM_COMP` | `VARCHAR(8) ?` | Número o referencia funcional legacy. | `LegacyCommunitySnapshot.NUM_COMP` |
| `NUM_PRO` | `VARCHAR(4) ?` | Número o referencia funcional legacy. | `LegacyCommunitySnapshot.NUM_PRO` |
| `OBSERVACION` | `LONGTEXT ?` | Texto descriptivo o concepto de negocio. | `LegacyCommunitySnapshot.OBSERVACION` |
| `RIF` | `VARCHAR(15) ?` | Atributo legacy «RIF»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.RIF` |
| `CodCtaResAAct` | `VARCHAR(8) ?` | Atributo legacy «CodCtaResAAct»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.CodCtaResAAct` |
| `CodCtaResAAnt` | `VARCHAR(8) ?` | Atributo legacy «CodCtaResAAnt»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.CodCtaResAAnt` |
| `CodCtaCtasXCob` | `VARCHAR(8) ?` | Atributo legacy «CodCtaCtasXCob»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.CodCtaCtasXCob` |
| `CodCtaAjusteDAC` | `VARCHAR(8) ?` | Atributo legacy «CodCtaAjusteDAC»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.CodCtaAjusteDAC` |
| `CodCtaIngresos` | `VARCHAR(8) ?` | Atributo legacy «CodCtaIngresos»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.CodCtaIngresos` |
| `CodCtaAjusteCxCP` | `VARCHAR(8) ?` | Atributo legacy «CodCtaAjusteCxCP»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.CodCtaAjusteCxCP` |
| `CodCtaRelProp` | `VARCHAR(8) ?` | Atributo legacy «CodCtaRelProp»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.CodCtaRelProp` |
| `CodCtaEfectrans` | `VARCHAR(50) ?` | Atributo legacy «CodCtaEfectrans»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.CodCtaEfectrans` |
| `NroTransBanc` | `VARCHAR(8) ?` | Número o referencia funcional legacy. | `LegacyCommunitySnapshot.NroTransBanc` |
| `AvisoMesAS` | `TINYINT(1) ?` | Atributo legacy «AvisoMesAS»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.AvisoMesAS` |
| `ImpIntsAviso` | `TINYINT(1) ?` | Atributo legacy «ImpIntsAviso»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.ImpIntsAviso` |
| `TIPOCAMBIO` | `DOUBLE ?` | Atributo legacy «TIPOCAMBIO»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.TIPOCAMBIO` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `LegacyCommunitySnapshot.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `LegacyCommunitySnapshot.legacyDeleted/status` |
| `NRORECIBO` | `DOUBLE ?` | Número o referencia funcional legacy. | `LegacyCommunitySnapshot.NRORECIBO` |
| `READONLY` | `DOUBLE ?` | Atributo legacy «READONLY»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.READONLY` |
| `Moneda` | `TINYINT(3) UNSIGNED ?` | Atributo legacy «Moneda»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.Moneda` |
| `Email` | `VARCHAR(255) ?` | Atributo legacy «Email»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.Email` |
| `DirLogo` | `VARCHAR(255) ?` | Atributo legacy «DirLogo»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.DirLogo` |
| `SimboloAC` | `VARCHAR(5) ?` | Atributo legacy «SimboloAC»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.SimboloAC` |
| `SimboloALT` | `VARCHAR(5) ?` | Atributo legacy «SimboloALT»; semántica exacta por validar con reglas y pantallas originales. | `LegacyCommunitySnapshot.SimboloALT` |

## Conjuntos

- **Propósito probable:** Maestro previsto para agrupaciones de condominios; está vacío en este dump.
- **Nivel de importancia:** Secundaria
- **Registros:** 0
- **Clave primaria declarada:** CODIGO_CONJ
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `VALIDATE_DISCARD`
- **Destino conceptual:** `CommunityGroup`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_CONJ` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `CommunityGroup.CODIGO_CONJ` |
| `NOMBRE` | `VARCHAR(50) !` | Atributo legacy «NOMBRE»; semántica exacta por validar con reglas y pantallas originales. | `CommunityGroup.NOMBRE` |
| `DIRECCION` | `VARCHAR(100) ?` | Atributo legacy «DIRECCION»; semántica exacta por validar con reglas y pantallas originales. | `CommunityGroup.DIRECCION` |
| `TELEFONO` | `VARCHAR(50) ?` | Atributo legacy «TELEFONO»; semántica exacta por validar con reglas y pantallas originales. | `CommunityGroup.TELEFONO` |
| `CONTACTO` | `VARCHAR(50) ?` | Atributo legacy «CONTACTO»; semántica exacta por validar con reglas y pantallas originales. | `CommunityGroup.CONTACTO` |
| `FECHA_ING` | `DATETIME ?` | Fecha asociada al registro o proceso. | `CommunityGroup.FECHA_ING` |
| `PORC_FOND` | `DOUBLE ?` | Atributo legacy «PORC_FOND»; semántica exacta por validar con reglas y pantallas originales. | `CommunityGroup.PORC_FOND` |
| `REDONDEO` | `VARCHAR(2) ?` | Atributo legacy «REDONDEO»; semántica exacta por validar con reglas y pantallas originales. | `CommunityGroup.REDONDEO` |
| `CODIGO_CUE` | `VARCHAR(8) ?` | Código funcional usado como referencia implícita. | `CommunityGroup.CODIGO_CUE` |
| `IMPRIME` | `VARCHAR(2) ?` | Atributo legacy «IMPRIME»; semántica exacta por validar con reglas y pantallas originales. | `CommunityGroup.IMPRIME` |
| `PROX_REC` | `DOUBLE ?` | Atributo legacy «PROX_REC»; semántica exacta por validar con reglas y pantallas originales. | `CommunityGroup.PROX_REC` |
| `TIPO` | `VARCHAR(10) ?` | Atributo legacy «TIPO»; semántica exacta por validar con reglas y pantallas originales. | `CommunityGroup.TIPO` |
| `VALOR` | `DOUBLE ?` | Atributo legacy «VALOR»; semántica exacta por validar con reglas y pantallas originales. | `CommunityGroup.VALOR` |
| `CALCULA` | `VARCHAR(5) ?` | Atributo legacy «CALCULA»; semántica exacta por validar con reglas y pantallas originales. | `CommunityGroup.CALCULA` |
| `MONTO_MAYOR` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `CommunityGroup.MONTO_MAYOR` |
| `FECHA_INICIAL` | `DATETIME ?` | Fecha asociada al registro o proceso. | `CommunityGroup.FECHA_INICIAL` |
| `FECHA_FINAL` | `DATETIME ?` | Fecha asociada al registro o proceso. | `CommunityGroup.FECHA_FINAL` |
| `MES` | `INTEGER ?` | Mes contable o de facturación. | `CommunityGroup.MES` |
| `ANO` | `INTEGER ?` | Año contable o de facturación. | `CommunityGroup.ANO` |
| `NUM_COMP` | `VARCHAR(8) ?` | Número o referencia funcional legacy. | `CommunityGroup.NUM_COMP` |
| `NUM_PRO` | `VARCHAR(4) ?` | Número o referencia funcional legacy. | `CommunityGroup.NUM_PRO` |
| `OBSERVACION` | `LONGTEXT ?` | Texto descriptivo o concepto de negocio. | `CommunityGroup.OBSERVACION` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `CommunityGroup.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `CommunityGroup.legacyDeleted/status` |

## ContAvisoCobro

- **Propósito probable:** Totales mensuales materializados de avisos de cobro.
- **Nivel de importancia:** Secundaria
- **Registros:** 64
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `BillingRunSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Anho` | `VARCHAR(4) ?` | Año contable o de facturación. | `BillingRunSnapshot.Anho` |
| `Mes` | `VARCHAR(2) ?` | Atributo legacy «Mes»; semántica exacta por validar con reglas y pantallas originales. | `BillingRunSnapshot.Mes` |
| `MontoAviso` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `BillingRunSnapshot.MontoAviso` |
| `MontoAvisoDist` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `BillingRunSnapshot.MontoAvisoDist` |
| `Codigo_Cond` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `BillingRunSnapshot.communityId (resolver por LegacyKeyMap)` |

## ControlDNI

- **Propósito probable:** Control de depósitos no identificados y su posterior asociación a recibos/propietarios.
- **Nivel de importancia:** Crítica
- **Registros:** 38
- **Clave primaria declarada:** Codigo_Cueb, NroDepDNI
- **Índices secundarios:** 3
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `UnidentifiedPayment`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Ban` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `UnidentifiedPayment.Codigo_Ban` |
| `Codigo_Cueb` | `VARCHAR(30) !` | Código funcional usado como referencia implícita. | `UnidentifiedPayment.Codigo_Cueb` |
| `PeriodoDNI` | `VARCHAR(6) ?` | Atributo legacy «PeriodoDNI»; semántica exacta por validar con reglas y pantallas originales. | `UnidentifiedPayment.PeriodoDNI` |
| `NroDepDNI` | `VARCHAR(7) !` | Número o referencia funcional legacy. | `UnidentifiedPayment.NroDepDNI` |
| `FechaCDNI` | `DATETIME ?` | Fecha asociada al registro o proceso. | `UnidentifiedPayment.FechaCDNI` |
| `MontoDNI` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `UnidentifiedPayment.MontoDNI` |
| `NroRecibo` | `VARCHAR(6) ?` | Número o referencia funcional legacy. | `UnidentifiedPayment.NroRecibo` |
| `FechaRecDNI` | `DATETIME ?` | Fecha asociada al registro o proceso. | `UnidentifiedPayment.FechaRecDNI` |
| `MontoDepR` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `UnidentifiedPayment.MontoDepR` |
| `Anho` | `VARCHAR(4) ?` | Año contable o de facturación. | `UnidentifiedPayment.Anho` |
| `Mes` | `VARCHAR(2) ?` | Atributo legacy «Mes»; semántica exacta por validar con reglas y pantallas originales. | `UnidentifiedPayment.Mes` |
| `Codigo_Pro` | `VARCHAR(4) ?` | Código funcional usado como referencia implícita. | `UnidentifiedPayment.Codigo_Pro` |
| `GenEnProcs` | `TINYINT(1) ?` | Atributo legacy «GenEnProcs»; semántica exacta por validar con reglas y pantallas originales. | `UnidentifiedPayment.GenEnProcs` |
| `Codigo_Cond` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `UnidentifiedPayment.communityId (resolver por LegacyKeyMap)` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `UnidentifiedPayment.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `UnidentifiedPayment.legacyDeleted/status` |

## CUENTA_BANC

- **Propósito probable:** Cuentas bancarias de las entidades administradas y sus cuentas contables asociadas.
- **Nivel de importancia:** Crítica
- **Registros:** 14
- **Clave primaria declarada:** ID_CUEB
- **Índices secundarios:** 3
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `BankAccount`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_CUEB` | `VARCHAR(30) !` | Código funcional usado como referencia implícita. | `BankAccount.CODIGO_CUEB` |
| `CODIGO_BAN` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `BankAccount.CODIGO_BAN` |
| `CODIGO_CUE` | `VARCHAR(8) ?` | Código funcional usado como referencia implícita. | `BankAccount.CODIGO_CUE` |
| `CtaContDNI` | `VARCHAR(8) ?` | Atributo legacy «CtaContDNI»; semántica exacta por validar con reglas y pantallas originales. | `BankAccount.CtaContDNI` |
| `TIPO_CUENTA` | `VARCHAR(10) !` | Atributo legacy «TIPO_CUENTA»; semántica exacta por validar con reglas y pantallas originales. | `BankAccount.TIPO_CUENTA` |
| `CIUDAD` | `VARCHAR(50) ?` | Atributo legacy «CIUDAD»; semántica exacta por validar con reglas y pantallas originales. | `BankAccount.CIUDAD` |
| `CONTACTO` | `VARCHAR(50) ?` | Atributo legacy «CONTACTO»; semántica exacta por validar con reglas y pantallas originales. | `BankAccount.CONTACTO` |
| `DIRECCION` | `VARCHAR(100) ?` | Atributo legacy «DIRECCION»; semántica exacta por validar con reglas y pantallas originales. | `BankAccount.DIRECCION` |
| `TELEFONO` | `VARCHAR(50) ?` | Atributo legacy «TELEFONO»; semántica exacta por validar con reglas y pantallas originales. | `BankAccount.TELEFONO` |
| `DEBITO_BAN` | `DOUBLE ?` | Atributo legacy «DEBITO_BAN»; semántica exacta por validar con reglas y pantallas originales. | `BankAccount.DEBITO_BAN` |
| `PROX_CHEQUE` | `DOUBLE ?` | Atributo legacy «PROX_CHEQUE»; semántica exacta por validar con reglas y pantallas originales. | `BankAccount.PROX_CHEQUE` |
| `FECHA_APER` | `DATETIME ?` | Fecha asociada al registro o proceso. | `BankAccount.FECHA_APER` |
| `FAX` | `VARCHAR(50) ?` | Atributo legacy «FAX»; semántica exacta por validar con reglas y pantallas originales. | `BankAccount.FAX` |
| `Email` | `VARCHAR(50) ?` | Atributo legacy «Email»; semántica exacta por validar con reglas y pantallas originales. | `BankAccount.Email` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `BankAccount.communityId (resolver por LegacyKeyMap)` |
| `ID_CUEB` | `VARCHAR(33) !` | Identificador compuesto o técnico del sistema legacy. | `BankAccount.ID_CUEB` |
| `ID_CUE` | `VARCHAR(11) ?` | Identificador compuesto o técnico del sistema legacy. | `BankAccount.ID_CUE` |
| `ID_BAN` | `VARCHAR(3) !` | Identificador compuesto o técnico del sistema legacy. | `BankAccount.ID_BAN` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `BankAccount.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `BankAccount.legacyDeleted/status` |
| `MONEDA` | `TINYINT(3) UNSIGNED ?` | Código numérico de moneda sin catálogo relacional. | `BankAccount.MONEDA` |

## Cuenta_BancSaldo

- **Propósito probable:** Saldos bancarios mensuales desnormalizados por cuenta.
- **Nivel de importancia:** Importante
- **Registros:** 30
- **Clave primaria declarada:** Anho, ID_CUEB
- **Índices secundarios:** 4
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECONCILE`
- **Destino conceptual:** `BankBalanceSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Anho` | `VARCHAR(4) !` | Año contable o de facturación. | `BankBalanceSnapshot.Anho` |
| `ID_CUEB` | `VARCHAR(33) !` | Identificador compuesto o técnico del sistema legacy. | `BankBalanceSnapshot.ID_CUEB` |
| `CODIGO_CUEB` | `VARCHAR(30) !` | Código funcional usado como referencia implícita. | `BankBalanceSnapshot.CODIGO_CUEB` |
| `Cod_Cond` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `BankBalanceSnapshot.Cod_Cond` |
| `Cod_ConJ` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `BankBalanceSnapshot.Cod_ConJ` |
| `SaldoInicial` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `BankBalanceSnapshot.SaldoInicial` |
| `01` | `DOUBLE ?` | Atributo legacy «01»; semántica exacta por validar con reglas y pantallas originales. | `BankBalanceSnapshot.01` |
| `02` | `DOUBLE ?` | Atributo legacy «02»; semántica exacta por validar con reglas y pantallas originales. | `BankBalanceSnapshot.02` |
| `03` | `DOUBLE ?` | Atributo legacy «03»; semántica exacta por validar con reglas y pantallas originales. | `BankBalanceSnapshot.03` |
| `04` | `DOUBLE ?` | Atributo legacy «04»; semántica exacta por validar con reglas y pantallas originales. | `BankBalanceSnapshot.04` |
| `05` | `DOUBLE ?` | Atributo legacy «05»; semántica exacta por validar con reglas y pantallas originales. | `BankBalanceSnapshot.05` |
| `06` | `DOUBLE ?` | Atributo legacy «06»; semántica exacta por validar con reglas y pantallas originales. | `BankBalanceSnapshot.06` |
| `07` | `DOUBLE ?` | Atributo legacy «07»; semántica exacta por validar con reglas y pantallas originales. | `BankBalanceSnapshot.07` |
| `08` | `DOUBLE ?` | Atributo legacy «08»; semántica exacta por validar con reglas y pantallas originales. | `BankBalanceSnapshot.08` |
| `09` | `DOUBLE ?` | Atributo legacy «09»; semántica exacta por validar con reglas y pantallas originales. | `BankBalanceSnapshot.09` |
| `10` | `DOUBLE ?` | Atributo legacy «10»; semántica exacta por validar con reglas y pantallas originales. | `BankBalanceSnapshot.10` |
| `11` | `DOUBLE ?` | Atributo legacy «11»; semántica exacta por validar con reglas y pantallas originales. | `BankBalanceSnapshot.11` |
| `12` | `DOUBLE ?` | Atributo legacy «12»; semántica exacta por validar con reglas y pantallas originales. | `BankBalanceSnapshot.12` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `BankBalanceSnapshot.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `BankBalanceSnapshot.legacyDeleted/status` |

## ChqDevOtrosCarg

- **Propósito probable:** Cheques devueltos y otros cargos aplicables a cuentas por cobrar.
- **Nivel de importancia:** Importante
- **Registros:** 0
- **Clave primaria declarada:** CodCDOC
- **Índices secundarios:** 5
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE_IF_PRESENT`
- **Destino conceptual:** `ReturnedPaymentCharge`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CodCDOC` | `INTEGER !` | Atributo legacy «CodCDOC»; semántica exacta por validar con reglas y pantallas originales. | `ReturnedPaymentCharge.CodCDOC` |
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReturnedPaymentCharge.communityId (resolver por LegacyKeyMap)` |
| `CodProptCDOC` | `VARCHAR(4) !` | Atributo legacy «CodProptCDOC»; semántica exacta por validar con reglas y pantallas originales. | `ReturnedPaymentCharge.CodProptCDOC` |
| `TipoDocCDOC` | `VARCHAR(2) ?` | Atributo legacy «TipoDocCDOC»; semántica exacta por validar con reglas y pantallas originales. | `ReturnedPaymentCharge.TipoDocCDOC` |
| `NroDocCDOC` | `VARCHAR(6) ?` | Número o referencia funcional legacy. | `ReturnedPaymentCharge.NroDocCDOC` |
| `FechaE` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReturnedPaymentCharge.FechaE` |
| `FechaV` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReturnedPaymentCharge.FechaV` |
| `Mes` | `VARCHAR(2) ?` | Atributo legacy «Mes»; semántica exacta por validar con reglas y pantallas originales. | `ReturnedPaymentCharge.Mes` |
| `Anho` | `VARCHAR(4) ?` | Año contable o de facturación. | `ReturnedPaymentCharge.Anho` |
| `MontoCDOC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReturnedPaymentCharge.MontoCDOC` |
| `SaldoDoc` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReturnedPaymentCharge.SaldoDoc` |
| `NroRefCDOC` | `VARCHAR(14) ?` | Número o referencia funcional legacy. | `ReturnedPaymentCharge.NroRefCDOC` |
| `CODIGO_BAN` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `ReturnedPaymentCharge.CODIGO_BAN` |
| `CODIGO_CUEB` | `VARCHAR(30) ?` | Código funcional usado como referencia implícita. | `ReturnedPaymentCharge.CODIGO_CUEB` |
| `Banco` | `VARCHAR(50) ?` | Atributo legacy «Banco»; semántica exacta por validar con reglas y pantallas originales. | `ReturnedPaymentCharge.Banco` |
| `Observacion` | `VARCHAR(250) ?` | Texto descriptivo o concepto de negocio. | `ReturnedPaymentCharge.Observacion` |
| `DebCre` | `VARCHAR(1) ?` | Naturaleza débito/crédito codificada. | `ReturnedPaymentCharge.DebCre` |
| `NroReciboOC` | `VARCHAR(9) ?` | Número o referencia funcional legacy. | `ReturnedPaymentCharge.NroReciboOC` |
| `FechaDeptOC` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReturnedPaymentCharge.FechaDeptOC` |
| `MontoPagoOC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReturnedPaymentCharge.MontoPagoOC` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `ReturnedPaymentCharge.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReturnedPaymentCharge.legacyDeleted/status` |

## ChqDevOtrosCargold

- **Propósito probable:** Versión anterior de cheques devueltos y otros cargos.
- **Nivel de importancia:** Secundaria
- **Registros:** 0
- **Clave primaria declarada:** CodCDOC
- **Índices secundarios:** 5
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_COMPARE`
- **Destino conceptual:** `LegacyReturnedPaymentCharge`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CodCDOC` | `INTEGER !` | Atributo legacy «CodCDOC»; semántica exacta por validar con reglas y pantallas originales. | `LegacyReturnedPaymentCharge.CodCDOC` |
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `LegacyReturnedPaymentCharge.communityId (resolver por LegacyKeyMap)` |
| `CodProptCDOC` | `VARCHAR(4) !` | Atributo legacy «CodProptCDOC»; semántica exacta por validar con reglas y pantallas originales. | `LegacyReturnedPaymentCharge.CodProptCDOC` |
| `TipoDocCDOC` | `VARCHAR(2) ?` | Atributo legacy «TipoDocCDOC»; semántica exacta por validar con reglas y pantallas originales. | `LegacyReturnedPaymentCharge.TipoDocCDOC` |
| `NroDocCDOC` | `VARCHAR(6) ?` | Número o referencia funcional legacy. | `LegacyReturnedPaymentCharge.NroDocCDOC` |
| `FechaE` | `DATETIME ?` | Fecha asociada al registro o proceso. | `LegacyReturnedPaymentCharge.FechaE` |
| `FechaV` | `DATETIME ?` | Fecha asociada al registro o proceso. | `LegacyReturnedPaymentCharge.FechaV` |
| `Mes` | `VARCHAR(2) ?` | Atributo legacy «Mes»; semántica exacta por validar con reglas y pantallas originales. | `LegacyReturnedPaymentCharge.Mes` |
| `Anho` | `VARCHAR(4) ?` | Año contable o de facturación. | `LegacyReturnedPaymentCharge.Anho` |
| `MontoCDOC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `LegacyReturnedPaymentCharge.MontoCDOC` |
| `SaldoDoc` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `LegacyReturnedPaymentCharge.SaldoDoc` |
| `NroRefCDOC` | `VARCHAR(14) ?` | Número o referencia funcional legacy. | `LegacyReturnedPaymentCharge.NroRefCDOC` |
| `Banco` | `VARCHAR(50) ?` | Atributo legacy «Banco»; semántica exacta por validar con reglas y pantallas originales. | `LegacyReturnedPaymentCharge.Banco` |
| `Observacion` | `VARCHAR(250) ?` | Texto descriptivo o concepto de negocio. | `LegacyReturnedPaymentCharge.Observacion` |
| `DebCre` | `VARCHAR(1) ?` | Naturaleza débito/crédito codificada. | `LegacyReturnedPaymentCharge.DebCre` |
| `NroReciboOC` | `VARCHAR(9) ?` | Número o referencia funcional legacy. | `LegacyReturnedPaymentCharge.NroReciboOC` |
| `FechaDeptOC` | `DATETIME ?` | Fecha asociada al registro o proceso. | `LegacyReturnedPaymentCharge.FechaDeptOC` |
| `MontoPagoOC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `LegacyReturnedPaymentCharge.MontoPagoOC` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `LegacyReturnedPaymentCharge.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `LegacyReturnedPaymentCharge.legacyDeleted/status` |

## Detalle_Aviso

- **Propósito probable:** Detalle de conceptos, gastos, reintegros y usos incluidos en un aviso.
- **Nivel de importancia:** Crítica
- **Registros:** 1.800
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 2
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `BillingRunLine`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_DET` | `VARCHAR(8) !` | Código funcional usado como referencia implícita. | `BillingRunLine.CODIGO_DET` |
| `CODIGO_AVI` | `VARCHAR(15) !` | Código funcional usado como referencia implícita. | `BillingRunLine.CODIGO_AVI` |
| `CODIGO_CON` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `BillingRunLine.CODIGO_CON` |
| `DETALLE` | `VARCHAR(250) ?` | Texto descriptivo o concepto de negocio. | `BillingRunLine.DETALLE` |
| `MONTO_Gasto` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `BillingRunLine.MONTO_Gasto` |
| `MONTO_Reintegro` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `BillingRunLine.MONTO_Reintegro` |
| `MONTO_Utiliz` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `BillingRunLine.MONTO_Utiliz` |
| `ID_AVI` | `VARCHAR(15) !` | Identificador compuesto o técnico del sistema legacy. | `BillingRunLine.ID_AVI` |
| `ID_CON` | `VARCHAR(7) !` | Identificador compuesto o técnico del sistema legacy. | `BillingRunLine.ID_CON` |
| `AplicaT` | `TINYINT(1) ?` | Atributo legacy «AplicaT»; semántica exacta por validar con reglas y pantallas originales. | `BillingRunLine.AplicaT` |
| `GeneChq` | `TINYINT(1) ?` | Atributo legacy «GeneChq»; semántica exacta por validar con reglas y pantallas originales. | `BillingRunLine.GeneChq` |
| `MONTO_GastoAlt` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `BillingRunLine.MONTO_GastoAlt` |
| `MONTO_ReintegroAlt` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `BillingRunLine.MONTO_ReintegroAlt` |
| `MONTO_UtilizAlt` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `BillingRunLine.MONTO_UtilizAlt` |

## DetAvisoPropt

- **Propósito probable:** Asignación de conceptos específicos del aviso a determinados propietarios/inmuebles.
- **Nivel de importancia:** Crítica
- **Registros:** 61
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 2
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `ChargeTarget`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_DET` | `VARCHAR(8) !` | Código funcional usado como referencia implícita. | `ChargeTarget.CODIGO_DET` |
| `CODIGO_AVI` | `VARCHAR(15) !` | Código funcional usado como referencia implícita. | `ChargeTarget.CODIGO_AVI` |
| `CODIGO_CON` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ChargeTarget.CODIGO_CON` |
| `CODIGO_PRO` | `VARCHAR(4) !` | Código funcional usado como referencia implícita. | `ChargeTarget.CODIGO_PRO` |
| `ID_AVI` | `VARCHAR(15) !` | Identificador compuesto o técnico del sistema legacy. | `ChargeTarget.ID_AVI` |
| `ID_CON` | `VARCHAR(7) !` | Identificador compuesto o técnico del sistema legacy. | `ChargeTarget.ID_CON` |
| `AplicaP` | `TINYINT(1) ?` | Atributo legacy «AplicaP»; semántica exacta por validar con reglas y pantallas originales. | `ChargeTarget.AplicaP` |

## Doc_De_Cobro

- **Propósito probable:** Catálogo de tipos de documentos por cobrar y reglas contables.
- **Nivel de importancia:** Importante
- **Registros:** 22
- **Clave primaria declarada:** ID_DocC
- **Índices secundarios:** 3
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `ReceivableType`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `COD_DocC` | `VARCHAR(2) !` | Código funcional usado como referencia implícita. | `ReceivableType.COD_DocC` |
| `CODIGO_CUED` | `VARCHAR(8) ?` | Código funcional usado como referencia implícita. | `ReceivableType.CODIGO_CUED` |
| `CODIGO_CUEH` | `VARCHAR(8) ?` | Código funcional usado como referencia implícita. | `ReceivableType.CODIGO_CUEH` |
| `DescDocC` | `VARCHAR(50) !` | Atributo legacy «DescDocC»; semántica exacta por validar con reglas y pantallas originales. | `ReceivableType.DescDocC` |
| `DescAbrev` | `VARCHAR(8) ?` | Atributo legacy «DescAbrev»; semántica exacta por validar con reglas y pantallas originales. | `ReceivableType.DescAbrev` |
| `Deb_Cre` | `VARCHAR(1) !` | Atributo legacy «Deb_Cre»; semántica exacta por validar con reglas y pantallas originales. | `ReceivableType.Deb_Cre` |
| `APL_Ints` | `VARCHAR(2) ?` | Atributo legacy «APL_Ints»; semántica exacta por validar con reglas y pantallas originales. | `ReceivableType.APL_Ints` |
| `Imp_EnRec` | `VARCHAR(2) ?` | Atributo legacy «Imp_EnRec»; semántica exacta por validar con reglas y pantallas originales. | `ReceivableType.Imp_EnRec` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReceivableType.communityId (resolver por LegacyKeyMap)` |
| `ID_DocC` | `VARCHAR(6) !` | Identificador compuesto o técnico del sistema legacy. | `ReceivableType.ID_DocC` |
| `ID_CUED` | `VARCHAR(11) ?` | Identificador compuesto o técnico del sistema legacy. | `ReceivableType.ID_CUED` |
| `ID_CUEH` | `VARCHAR(11) ?` | Identificador compuesto o técnico del sistema legacy. | `ReceivableType.ID_CUEH` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `ReceivableType.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReceivableType.legacyDeleted/status` |

## EmisionCheque

- **Propósito probable:** Cabecera de egresos, cheques o transferencias a beneficiarios.
- **Nivel de importancia:** Crítica
- **Registros:** 7.149
- **Clave primaria declarada:** ID_Emi
- **Índices secundarios:** 1
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `Disbursement`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Emi` | `VARCHAR(7) !` | Código funcional usado como referencia implícita. | `Disbursement.Codigo_Emi` |
| `CodBanco` | `VARCHAR(3) ?` | Atributo legacy «CodBanco»; semántica exacta por validar con reglas y pantallas originales. | `Disbursement.CodBanco` |
| `CodCtaBan` | `VARCHAR(30) ?` | Atributo legacy «CodCtaBan»; semántica exacta por validar con reglas y pantallas originales. | `Disbursement.CodCtaBan` |
| `CodBenef` | `VARCHAR(4) ?` | Atributo legacy «CodBenef»; semántica exacta por validar con reglas y pantallas originales. | `Disbursement.CodBenef` |
| `NroCheque` | `DOUBLE ?` | Número o referencia funcional legacy. | `Disbursement.NroCheque` |
| `NroFactura` | `VARCHAR(20) ?` | Número o referencia funcional legacy. | `Disbursement.NroFactura` |
| `Monto` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `Disbursement.Monto` |
| `MontoALT` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `Disbursement.MontoALT` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `Disbursement.Concepto` |
| `Anho` | `VARCHAR(4) ?` | Año contable o de facturación. | `Disbursement.Anho` |
| `Mes` | `VARCHAR(2) ?` | Atributo legacy «Mes»; semántica exacta por validar con reglas y pantallas originales. | `Disbursement.Mes` |
| `FechaE` | `DATETIME ?` | Fecha asociada al registro o proceso. | `Disbursement.FechaE` |
| `AplicaGasto` | `VARCHAR(3) ?` | Atributo legacy «AplicaGasto»; semántica exacta por validar con reglas y pantallas originales. | `Disbursement.AplicaGasto` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `Disbursement.communityId (resolver por LegacyKeyMap)` |
| `Anulado` | `TINYINT(1) ?` | Atributo legacy «Anulado»; semántica exacta por validar con reglas y pantallas originales. | `Disbursement.Anulado` |
| `CobTra` | `TINYINT(1) ?` | Atributo legacy «CobTra»; semántica exacta por validar con reglas y pantallas originales. | `Disbursement.CobTra` |
| `AplicaG` | `TINYINT(1) ?` | Atributo legacy «AplicaG»; semántica exacta por validar con reglas y pantallas originales. | `Disbursement.AplicaG` |
| `ID_Emi` | `VARCHAR(12) !` | Identificador compuesto o técnico del sistema legacy. | `Disbursement.ID_Emi` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `Disbursement.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `Disbursement.legacyDeleted/status` |
| `FACTOR` | `DOUBLE ?` | Atributo legacy «FACTOR»; semántica exacta por validar con reglas y pantallas originales. | `Disbursement.FACTOR` |
| `MONEDA` | `DOUBLE ?` | Código numérico de moneda sin catálogo relacional. | `Disbursement.MONEDA` |

## EmisionCheque_OLD

- **Propósito probable:** Copia histórica de egresos emitidos.
- **Nivel de importancia:** Importante
- **Registros:** 3.413
- **Clave primaria declarada:** ID_Emi
- **Índices secundarios:** 1
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECONCILE`
- **Destino conceptual:** `LegacyDisbursementSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Emi` | `VARCHAR(7) !` | Código funcional usado como referencia implícita. | `LegacyDisbursementSnapshot.Codigo_Emi` |
| `CodBanco` | `VARCHAR(3) ?` | Atributo legacy «CodBanco»; semántica exacta por validar con reglas y pantallas originales. | `LegacyDisbursementSnapshot.CodBanco` |
| `CodCtaBan` | `VARCHAR(30) ?` | Atributo legacy «CodCtaBan»; semántica exacta por validar con reglas y pantallas originales. | `LegacyDisbursementSnapshot.CodCtaBan` |
| `CodBenef` | `VARCHAR(4) ?` | Atributo legacy «CodBenef»; semántica exacta por validar con reglas y pantallas originales. | `LegacyDisbursementSnapshot.CodBenef` |
| `NroCheque` | `DOUBLE ?` | Número o referencia funcional legacy. | `LegacyDisbursementSnapshot.NroCheque` |
| `NroFactura` | `VARCHAR(20) ?` | Número o referencia funcional legacy. | `LegacyDisbursementSnapshot.NroFactura` |
| `Monto` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `LegacyDisbursementSnapshot.Monto` |
| `MontoALT` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `LegacyDisbursementSnapshot.MontoALT` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `LegacyDisbursementSnapshot.Concepto` |
| `Anho` | `VARCHAR(4) ?` | Año contable o de facturación. | `LegacyDisbursementSnapshot.Anho` |
| `Mes` | `VARCHAR(2) ?` | Atributo legacy «Mes»; semántica exacta por validar con reglas y pantallas originales. | `LegacyDisbursementSnapshot.Mes` |
| `FechaE` | `DATETIME ?` | Fecha asociada al registro o proceso. | `LegacyDisbursementSnapshot.FechaE` |
| `AplicaGasto` | `VARCHAR(3) ?` | Atributo legacy «AplicaGasto»; semántica exacta por validar con reglas y pantallas originales. | `LegacyDisbursementSnapshot.AplicaGasto` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `LegacyDisbursementSnapshot.communityId (resolver por LegacyKeyMap)` |
| `Anulado` | `TINYINT(1) ?` | Atributo legacy «Anulado»; semántica exacta por validar con reglas y pantallas originales. | `LegacyDisbursementSnapshot.Anulado` |
| `CobTra` | `TINYINT(1) ?` | Atributo legacy «CobTra»; semántica exacta por validar con reglas y pantallas originales. | `LegacyDisbursementSnapshot.CobTra` |
| `AplicaG` | `TINYINT(1) ?` | Atributo legacy «AplicaG»; semántica exacta por validar con reglas y pantallas originales. | `LegacyDisbursementSnapshot.AplicaG` |
| `ID_Emi` | `VARCHAR(12) !` | Identificador compuesto o técnico del sistema legacy. | `LegacyDisbursementSnapshot.ID_Emi` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `LegacyDisbursementSnapshot.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `LegacyDisbursementSnapshot.legacyDeleted/status` |
| `FACTOR` | `DOUBLE ?` | Atributo legacy «FACTOR»; semántica exacta por validar con reglas y pantallas originales. | `LegacyDisbursementSnapshot.FACTOR` |
| `MONEDA` | `DOUBLE ?` | Código numérico de moneda sin catálogo relacional. | `LegacyDisbursementSnapshot.MONEDA` |

## EmisionChequeDeta

- **Propósito probable:** Detalle por concepto de los egresos emitidos.
- **Nivel de importancia:** Crítica
- **Registros:** 13.370
- **Clave primaria declarada:** Codigo_EmiD, Codigo_Emi, CODIGO_COND
- **Índices secundarios:** 2
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `DisbursementLine`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) !` | Código funcional usado como referencia implícita. | `DisbursementLine.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) !` | Código funcional usado como referencia implícita. | `DisbursementLine.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementLine.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementLine.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementLine.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementLine.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementLine.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `DisbursementLine.communityId (resolver por LegacyKeyMap)` |
| `ID_EmiD` | `VARCHAR(12) !` | Identificador compuesto o técnico del sistema legacy. | `DisbursementLine.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementLine.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementLine.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementLine.Factor` |

## EmisionChequeDeta_OLD

- **Propósito probable:** Copia histórica del detalle de egresos.
- **Nivel de importancia:** Importante
- **Registros:** 5.870
- **Clave primaria declarada:** Codigo_EmiD, Codigo_Emi, CODIGO_COND
- **Índices secundarios:** 2
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECONCILE`
- **Destino conceptual:** `LegacyDisbursementLineSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) !` | Código funcional usado como referencia implícita. | `LegacyDisbursementLineSnapshot.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) !` | Código funcional usado como referencia implícita. | `LegacyDisbursementLineSnapshot.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `LegacyDisbursementLineSnapshot.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `LegacyDisbursementLineSnapshot.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `LegacyDisbursementLineSnapshot.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `LegacyDisbursementLineSnapshot.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `LegacyDisbursementLineSnapshot.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `LegacyDisbursementLineSnapshot.communityId (resolver por LegacyKeyMap)` |
| `ID_EmiD` | `VARCHAR(12) !` | Identificador compuesto o técnico del sistema legacy. | `LegacyDisbursementLineSnapshot.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `LegacyDisbursementLineSnapshot.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `LegacyDisbursementLineSnapshot.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `LegacyDisbursementLineSnapshot.Factor` |

## EmiTemp_001

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 001; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_002

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 002; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_003

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 003; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_004

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 004; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_005

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 005; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_006

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 006; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_007

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 007; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_008

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 008; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_009

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 009; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_010

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 010; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_011

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 011; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_012

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 012; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_013

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 013; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_014

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 014; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_015

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 015; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_016

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 016; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_017

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 017; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_018

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 018; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_019

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 019; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_020

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 020; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_021

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 021; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_022

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 022; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_023

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 023; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_024

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 024; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_025

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 025; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_026

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 026; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_027

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 027; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_028

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 028; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_029

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 029; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_030

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 030; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_031

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 031; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_032

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 032; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_033

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 033; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## EmiTemp_034

- **Propósito probable:** Área temporal de detalle de egresos asociada al slot o entidad 034; replica EmisionChequeDeta.
- **Nivel de importancia:** Obsoleta
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `DisbursementStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_EmiD` | `VARCHAR(9) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_EmiD` |
| `Codigo_Emi` | `VARCHAR(7) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.Codigo_Emi` |
| `CodConc` | `VARCHAR(3) ?` | Atributo legacy «CodConc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CodConc` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `DisbursementStaging.legacy.Concepto` |
| `MontoD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoD` |
| `MontoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoC` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.CtaBanc` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `DisbursementStaging.legacy.CODIGO_COND` |
| `ID_EmiD` | `VARCHAR(12) ?` | Identificador compuesto o técnico del sistema legacy. | `DisbursementStaging.legacy.ID_EmiD` |
| `MontoDAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoDAlt` |
| `MontoCAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `DisbursementStaging.legacy.MontoCAlt` |
| `Factor` | `DOUBLE ?` | Atributo legacy «Factor»; semántica exacta por validar con reglas y pantallas originales. | `DisbursementStaging.legacy.Factor` |

## Empresa

- **Propósito probable:** Identidad de la empresa operadora del software legacy, no necesariamente del condominio.
- **Nivel de importancia:** Importante
- **Registros:** 1
- **Clave primaria declarada:** Codigo_Empresa
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `VALIDATE_ARCHIVE`
- **Destino conceptual:** `LegacyOperator`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Empresa` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `LegacyOperator.Codigo_Empresa` |
| `Nombre_Empresa` | `VARCHAR(70) ?` | Atributo legacy «Nombre_Empresa»; semántica exacta por validar con reglas y pantallas originales. | `LegacyOperator.Nombre_Empresa` |
| `Direccion_Empresa` | `VARCHAR(250) ?` | Atributo legacy «Direccion_Empresa»; semántica exacta por validar con reglas y pantallas originales. | `LegacyOperator.Direccion_Empresa` |
| `Telefono_1` | `VARCHAR(50) ?` | Atributo legacy «Telefono_1»; semántica exacta por validar con reglas y pantallas originales. | `LegacyOperator.Telefono_1` |
| `Telefono_2` | `VARCHAR(50) ?` | Atributo legacy «Telefono_2»; semántica exacta por validar con reglas y pantallas originales. | `LegacyOperator.Telefono_2` |
| `RIF` | `VARCHAR(15) ?` | Atributo legacy «RIF»; semántica exacta por validar con reglas y pantallas originales. | `LegacyOperator.RIF` |
| `NIT` | `VARCHAR(15) ?` | Atributo legacy «NIT»; semántica exacta por validar con reglas y pantallas originales. | `LegacyOperator.NIT` |
| `Nombre_Representante` | `VARCHAR(50) ?` | Atributo legacy «Nombre_Representante»; semántica exacta por validar con reglas y pantallas originales. | `LegacyOperator.Nombre_Representante` |
| `Email` | `VARCHAR(50) ?` | Atributo legacy «Email»; semántica exacta por validar con reglas y pantallas originales. | `LegacyOperator.Email` |
| `CN_Cond` | `VARCHAR(2) ?` | Atributo legacy «CN_Cond»; semántica exacta por validar con reglas y pantallas originales. | `LegacyOperator.CN_Cond` |
| `CM_Rec` | `VARCHAR(255) ?` | Atributo legacy «CM_Rec»; semántica exacta por validar con reglas y pantallas originales. | `LegacyOperator.CM_Rec` |
| `CM_Chq` | `VARCHAR(7) ?` | Atributo legacy «CM_Chq»; semántica exacta por validar con reglas y pantallas originales. | `LegacyOperator.CM_Chq` |
| `ActReg` | `VARCHAR(2) ?` | Metadato legacy de modificación; semántica no confirmada. | `LegacyOperator.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `LegacyOperator.legacyDeleted/status` |

## Factura

- **Propósito probable:** Modelo previsto para facturas/gastos; no tiene registros en el dump.
- **Nivel de importancia:** Importante
- **Registros:** 0
- **Clave primaria declarada:** ID_FAC
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `VALIDATE_DISCARD`
- **Destino conceptual:** `VendorInvoice`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_FAC` | `VARCHAR(20) !` | Código funcional usado como referencia implícita. | `VendorInvoice.CODIGO_FAC` |
| `CODIGO_CON` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `VendorInvoice.CODIGO_CON` |
| `FECHA` | `DATETIME !` | Fecha asociada al registro o proceso. | `VendorInvoice.FECHA` |
| `DETALLE` | `VARCHAR(150) ?` | Texto descriptivo o concepto de negocio. | `VendorInvoice.DETALLE` |
| `DOCUMENTO` | `VARCHAR(50) ?` | Atributo legacy «DOCUMENTO»; semántica exacta por validar con reglas y pantallas originales. | `VendorInvoice.DOCUMENTO` |
| `MONTO_GASTO` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `VendorInvoice.MONTO_GASTO` |
| `MONTO_REINTEGRO` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `VendorInvoice.MONTO_REINTEGRO` |
| `APLICA_ALI` | `VARCHAR(2) !` | Atributo legacy «APLICA_ALI»; semántica exacta por validar con reglas y pantallas originales. | `VendorInvoice.APLICA_ALI` |
| `APLICA_PRO` | `VARCHAR(2) !` | Atributo legacy «APLICA_PRO»; semántica exacta por validar con reglas y pantallas originales. | `VendorInvoice.APLICA_PRO` |
| `APLICA_RES` | `VARCHAR(2) !` | Atributo legacy «APLICA_RES»; semántica exacta por validar con reglas y pantallas originales. | `VendorInvoice.APLICA_RES` |
| `INDIVIDUAL` | `VARCHAR(2) !` | Atributo legacy «INDIVIDUAL»; semántica exacta por validar con reglas y pantallas originales. | `VendorInvoice.INDIVIDUAL` |
| `MES` | `VARCHAR(2) !` | Mes contable o de facturación. | `VendorInvoice.MES` |
| `ANO` | `VARCHAR(4) !` | Año contable o de facturación. | `VendorInvoice.ANO` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `VendorInvoice.communityId (resolver por LegacyKeyMap)` |
| `ID_FAC` | `VARCHAR(23) !` | Identificador compuesto o técnico del sistema legacy. | `VendorInvoice.ID_FAC` |
| `ID_CON` | `VARCHAR(7) !` | Identificador compuesto o técnico del sistema legacy. | `VendorInvoice.ID_CON` |
| `FECHA_VENC` | `DATETIME !` | Fecha asociada al registro o proceso. | `VendorInvoice.FECHA_VENC` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `VendorInvoice.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `VendorInvoice.legacyDeleted/status` |

## ImpAnaXCta

- **Propósito probable:** Reporte materializado de analítico por cuenta.
- **Nivel de importancia:** Secundaria
- **Registros:** 318
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_cue` | `VARCHAR(11) ?` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_cue` |
| `Descripcion` | `VARCHAR(50) ?` | Texto descriptivo o concepto de negocio. | `ReportingSnapshot.legacy.Descripcion` |
| `Saldo_Anterior` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.Saldo_Anterior` |
| `Saldo_AnteriorD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.Saldo_AnteriorD` |
| `Codigo_Comp` | `VARCHAR(8) ?` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Comp` |
| `Codigo_Det` | `VARCHAR(8) ?` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Det` |
| `Descripcion_Detalle` | `VARCHAR(50) ?` | Texto descriptivo o concepto de negocio. | `ReportingSnapshot.legacy.Descripcion_Detalle` |
| `Debe` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.Debe` |
| `DebeD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.DebeD` |
| `Haber` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.Haber` |
| `HaberD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.HaberD` |
| `Fecha` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.Fecha` |
| `Mes` | `VARCHAR(2) ?` | Atributo legacy «Mes»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.Mes` |
| `Ano` | `VARCHAR(4) ?` | Atributo legacy «Ano»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.Ano` |
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Cond` |
| `Periodo` | `VARCHAR(50) ?` | Atributo legacy «Periodo»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.Periodo` |

## ImpAvisoCV

- **Propósito probable:** Detalle expandido del aviso de cobro para impresión/verificación.
- **Nivel de importancia:** Secundaria
- **Registros:** 22
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_Avi` | `VARCHAR(20) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_Avi` |
| `CODIGO_CON` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_CON` |
| `CondConj` | `VARCHAR(1) ?` | Atributo legacy «CondConj»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CondConj` |
| `CODIGO_PRO` | `VARCHAR(4) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_PRO` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_COND` |
| `CodTipo` | `VARCHAR(3) ?` | Atributo legacy «CodTipo»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CodTipo` |
| `FECHA_Emi` | `DATETIME !` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FECHA_Emi` |
| `FECHA_Venc` | `DATETIME !` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FECHA_Venc` |
| `DESCRIPCION` | `VARCHAR(80) ?` | Texto descriptivo o concepto de negocio. | `ReportingSnapshot.legacy.DESCRIPCION` |
| `DETALLE` | `VARCHAR(250) ?` | Texto descriptivo o concepto de negocio. | `ReportingSnapshot.legacy.DETALLE` |
| `MONTO_GASTO` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MONTO_GASTO` |
| `MONTO_REINTEGRO` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MONTO_REINTEGRO` |
| `MONTO_ALICUOTA` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MONTO_ALICUOTA` |
| `MONTO_GASTOAlt` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MONTO_GASTOAlt` |
| `MONTO_REINTEGROAlt` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MONTO_REINTEGROAlt` |
| `MONTO_ALICUOTAAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MONTO_ALICUOTAAlt` |
| `FondoResProp` | `DOUBLE ?` | Atributo legacy «FondoResProp»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.FondoResProp` |
| `InteresesM` | `DOUBLE ?` | Atributo legacy «InteresesM»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.InteresesM` |
| `Redondeo` | `DOUBLE ?` | Atributo legacy «Redondeo»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.Redondeo` |
| `OBSERVACION` | `VARCHAR(250) ?` | Texto descriptivo o concepto de negocio. | `ReportingSnapshot.legacy.OBSERVACION` |
| `MES` | `VARCHAR(2) !` | Mes contable o de facturación. | `ReportingSnapshot.legacy.MES` |
| `ANO` | `VARCHAR(4) !` | Año contable o de facturación. | `ReportingSnapshot.legacy.ANO` |
| `AplAlict` | `VARCHAR(2) ?` | Atributo legacy «AplAlict»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.AplAlict` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReportingSnapshot.legacy.DelReg` |

## ImpAvisoRes

- **Propósito probable:** Resumen del aviso por propietario.
- **Nivel de importancia:** Secundaria
- **Registros:** 731
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 3
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_Avi` | `VARCHAR(15) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_Avi` |
| `CODIGO_PRO` | `VARCHAR(4) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_PRO` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_COND` |
| `MES` | `VARCHAR(2) !` | Mes contable o de facturación. | `ReportingSnapshot.legacy.MES` |
| `ANO` | `VARCHAR(4) !` | Año contable o de facturación. | `ReportingSnapshot.legacy.ANO` |
| `MONTO_AvisoC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MONTO_AvisoC` |
| `DifRedondeo` | `DOUBLE ?` | Atributo legacy «DifRedondeo»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.DifRedondeo` |
| `MONTO_AvisoCN` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MONTO_AvisoCN` |
| `InteresesMora` | `DOUBLE ?` | Atributo legacy «InteresesMora»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.InteresesMora` |
| `Monto_Transf` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.Monto_Transf` |
| `FECHA_Emi` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FECHA_Emi` |
| `FECHA_Venc` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FECHA_Venc` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReportingSnapshot.legacy.DelReg` |
| `Monto_TransfALT` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.Monto_TransfALT` |

## ImpAvisoVerif

- **Propósito probable:** Área de verificación del aviso antes de imprimir.
- **Nivel de importancia:** Secundaria
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_Avi` | `VARCHAR(15) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_Avi` |
| `CODIGO_CON` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_CON` |
| `CondConj` | `VARCHAR(1) ?` | Atributo legacy «CondConj»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CondConj` |
| `CODIGO_PRO` | `VARCHAR(4) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_PRO` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_COND` |
| `CodTipo` | `VARCHAR(3) ?` | Atributo legacy «CodTipo»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CodTipo` |
| `FECHA_Emi` | `DATETIME !` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FECHA_Emi` |
| `FECHA_Venc` | `DATETIME !` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FECHA_Venc` |
| `DESCRIPCION` | `VARCHAR(80) ?` | Texto descriptivo o concepto de negocio. | `ReportingSnapshot.legacy.DESCRIPCION` |
| `DETALLE` | `VARCHAR(250) ?` | Texto descriptivo o concepto de negocio. | `ReportingSnapshot.legacy.DETALLE` |
| `MONTO_GASTO` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MONTO_GASTO` |
| `MONTO_REINTEGRO` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MONTO_REINTEGRO` |
| `MONTO_ALICUOTA` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MONTO_ALICUOTA` |
| `FondoResProp` | `DOUBLE ?` | Atributo legacy «FondoResProp»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.FondoResProp` |
| `OBSERVACION` | `VARCHAR(250) ?` | Texto descriptivo o concepto de negocio. | `ReportingSnapshot.legacy.OBSERVACION` |
| `MES` | `VARCHAR(2) !` | Mes contable o de facturación. | `ReportingSnapshot.legacy.MES` |
| `ANO` | `VARCHAR(4) !` | Año contable o de facturación. | `ReportingSnapshot.legacy.ANO` |
| `AplAlict` | `VARCHAR(2) ?` | Atributo legacy «AplAlict»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.AplAlict` |
| `APL_RES` | `VARCHAR(2) ?` | Atributo legacy «APL_RES»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.APL_RES` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReportingSnapshot.legacy.DelReg` |

## ImpCompEgreso

- **Propósito probable:** Comprobante de egreso preparado para impresión.
- **Nivel de importancia:** Secundaria
- **Registros:** 2
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 1
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Emi` | `VARCHAR(7) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Emi` |
| `CodCtaBan` | `VARCHAR(30) ?` | Atributo legacy «CodCtaBan»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CodCtaBan` |
| `NomBanco` | `VARCHAR(50) ?` | Atributo legacy «NomBanco»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.NomBanco` |
| `NomBenef` | `VARCHAR(100) ?` | Atributo legacy «NomBenef»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.NomBenef` |
| `NroCheque` | `DOUBLE ?` | Número o referencia funcional legacy. | `ReportingSnapshot.legacy.NroCheque` |
| `NroFactura` | `VARCHAR(20) ?` | Número o referencia funcional legacy. | `ReportingSnapshot.legacy.NroFactura` |
| `CodCtaCont` | `VARCHAR(30) ?` | Atributo legacy «CodCtaCont»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CodCtaCont` |
| `DescCtaCont` | `VARCHAR(50) ?` | Atributo legacy «DescCtaCont»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.DescCtaCont` |
| `Monto` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.Monto` |
| `MontoDC` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MontoDC` |
| `Concepto` | `VARCHAR(200) ?` | Texto descriptivo o concepto de negocio. | `ReportingSnapshot.legacy.Concepto` |
| `ConcDet` | `VARCHAR(50) ?` | Atributo legacy «ConcDet»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.ConcDet` |
| `Anho` | `VARCHAR(4) ?` | Año contable o de facturación. | `ReportingSnapshot.legacy.Anho` |
| `Mes` | `VARCHAR(2) ?` | Atributo legacy «Mes»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.Mes` |
| `FechaE` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FechaE` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_COND` |
| `CtaBanc` | `TINYINT(1) ?` | Atributo legacy «CtaBanc»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CtaBanc` |
| `Anulado` | `TINYINT(1) ?` | Atributo legacy «Anulado»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.Anulado` |
| `Ciudad` | `VARCHAR(50) ?` | Atributo legacy «Ciudad»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.Ciudad` |
| `Moneda` | `DOUBLE ?` | Atributo legacy «Moneda»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.Moneda` |

## ImpConcilBanc

- **Propósito probable:** Reporte de conciliación bancaria.
- **Nivel de importancia:** Secundaria
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 4
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Ban` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Ban` |
| `Codigo_Cueb` | `VARCHAR(30) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Cueb` |
| `Codigo_TTB` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_TTB` |
| `DescTTB` | `VARCHAR(50) ?` | Atributo legacy «DescTTB»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.DescTTB` |
| `Nro_Doc` | `VARCHAR(15) ?` | Número o referencia funcional legacy. | `ReportingSnapshot.legacy.Nro_Doc` |
| `FechaTB` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FechaTB` |
| `MontoTB` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MontoTB` |
| `DebCre` | `VARCHAR(1) ?` | Naturaleza débito/crédito codificada. | `ReportingSnapshot.legacy.DebCre` |
| `Anho` | `VARCHAR(4) ?` | Año contable o de facturación. | `ReportingSnapshot.legacy.Anho` |
| `Mes` | `VARCHAR(2) ?` | Atributo legacy «Mes»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.Mes` |
| `Concepto` | `VARCHAR(100) ?` | Texto descriptivo o concepto de negocio. | `ReportingSnapshot.legacy.Concepto` |
| `Beneficiario` | `VARCHAR(50) ?` | Atributo legacy «Beneficiario»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.Beneficiario` |
| `CONCILIADA` | `TINYINT(1) ?` | Atributo legacy «CONCILIADA»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CONCILIADA` |
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Cond` |

## ImpDocsPendP

- **Propósito probable:** Documentos pendientes por propietario.
- **Nivel de importancia:** Secundaria
- **Registros:** 15.116
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 3
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Cond` |
| `CodPropt` | `VARCHAR(4) !` | Atributo legacy «CodPropt»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CodPropt` |
| `TipoDoc` | `VARCHAR(2) ?` | Atributo legacy «TipoDoc»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.TipoDoc` |
| `NroDoc` | `VARCHAR(6) ?` | Número o referencia funcional legacy. | `ReportingSnapshot.legacy.NroDoc` |
| `FechaEmi` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FechaEmi` |
| `FechaVen` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FechaVen` |
| `SaldoDoc` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.SaldoDoc` |
| `DiasVen` | `INTEGER ?` | Atributo legacy «DiasVen»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.DiasVen` |
| `DebCre` | `VARCHAR(1) ?` | Naturaleza débito/crédito codificada. | `ReportingSnapshot.legacy.DebCre` |
| `MES` | `VARCHAR(2) ?` | Mes contable o de facturación. | `ReportingSnapshot.legacy.MES` |
| `ANO` | `VARCHAR(4) ?` | Año contable o de facturación. | `ReportingSnapshot.legacy.ANO` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `ReportingSnapshot.legacy.ActReg` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReportingSnapshot.legacy.DelReg` |
| `NombreEquipo` | `VARCHAR(10) ?` | Atributo legacy «NombreEquipo»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.NombreEquipo` |

## ImpDocsPendPCart

- **Propósito probable:** Antigüedad mensual de deuda para cartelera.
- **Nivel de importancia:** Secundaria
- **Registros:** 204
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 2
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Cond` |
| `CodPropt` | `VARCHAR(4) !` | Atributo legacy «CodPropt»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CodPropt` |
| `NroDoc` | `VARCHAR(6) ?` | Número o referencia funcional legacy. | `ReportingSnapshot.legacy.NroDoc` |
| `FechaEmi` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FechaEmi` |
| `FechaVen` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FechaVen` |
| `SaldoAAnt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.SaldoAAnt` |
| `01` | `DOUBLE ?` | Atributo legacy «01»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.01` |
| `02` | `DOUBLE ?` | Atributo legacy «02»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.02` |
| `03` | `DOUBLE ?` | Atributo legacy «03»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.03` |
| `04` | `DOUBLE ?` | Atributo legacy «04»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.04` |
| `05` | `DOUBLE ?` | Atributo legacy «05»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.05` |
| `06` | `DOUBLE ?` | Atributo legacy «06»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.06` |
| `07` | `DOUBLE ?` | Atributo legacy «07»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.07` |
| `08` | `DOUBLE ?` | Atributo legacy «08»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.08` |
| `09` | `DOUBLE ?` | Atributo legacy «09»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.09` |
| `10` | `DOUBLE ?` | Atributo legacy «10»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.10` |
| `11` | `DOUBLE ?` | Atributo legacy «11»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.11` |
| `12` | `DOUBLE ?` | Atributo legacy «12»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.12` |
| `DiasVen` | `INTEGER ?` | Atributo legacy «DiasVen»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.DiasVen` |
| `DebCre` | `VARCHAR(1) ?` | Naturaleza débito/crédito codificada. | `ReportingSnapshot.legacy.DebCre` |
| `MES` | `VARCHAR(2) ?` | Mes contable o de facturación. | `ReportingSnapshot.legacy.MES` |
| `ANO` | `VARCHAR(4) ?` | Año contable o de facturación. | `ReportingSnapshot.legacy.ANO` |

## ImpEdoCtaProp

- **Propósito probable:** Estado de cuenta materializado del propietario.
- **Nivel de importancia:** Secundaria
- **Registros:** 82
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 5
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Cond` |
| `CodPropt` | `VARCHAR(4) !` | Atributo legacy «CodPropt»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CodPropt` |
| `TipoDoc` | `VARCHAR(2) ?` | Atributo legacy «TipoDoc»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.TipoDoc` |
| `NroDoc` | `VARCHAR(6) ?` | Número o referencia funcional legacy. | `ReportingSnapshot.legacy.NroDoc` |
| `NroRecibo` | `VARCHAR(7) ?` | Número o referencia funcional legacy. | `ReportingSnapshot.legacy.NroRecibo` |
| `NroDept` | `VARCHAR(50) ?` | Número o referencia funcional legacy. | `ReportingSnapshot.legacy.NroDept` |
| `NroCheque` | `VARCHAR(8) ?` | Número o referencia funcional legacy. | `ReportingSnapshot.legacy.NroCheque` |
| `BancoChq` | `VARCHAR(20) ?` | Atributo legacy «BancoChq»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.BancoChq` |
| `FechaEmi` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FechaEmi` |
| `FechaVen` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FechaVen` |
| `SaldoAnt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.SaldoAnt` |
| `MontoDeb` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MontoDeb` |
| `MontoCre` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MontoCre` |
| `DiasVen` | `INTEGER ?` | Atributo legacy «DiasVen»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.DiasVen` |
| `DebCre` | `VARCHAR(1) ?` | Naturaleza débito/crédito codificada. | `ReportingSnapshot.legacy.DebCre` |
| `MES` | `VARCHAR(2) ?` | Mes contable o de facturación. | `ReportingSnapshot.legacy.MES` |
| `ANO` | `VARCHAR(4) ?` | Año contable o de facturación. | `ReportingSnapshot.legacy.ANO` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `ReportingSnapshot.legacy.ActReg` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReportingSnapshot.legacy.DelReg` |

## ImpFGIniFin

- **Propósito probable:** Resumen de fondo/gasto inicial y final del período.
- **Nivel de importancia:** Secundaria
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 1
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_COND` |
| `MES` | `VARCHAR(2) ?` | Mes contable o de facturación. | `ReportingSnapshot.legacy.MES` |
| `ANO` | `VARCHAR(4) ?` | Año contable o de facturación. | `ReportingSnapshot.legacy.ANO` |
| `FechaIni` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FechaIni` |
| `FechaFin` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FechaFin` |
| `SaldoAnterior` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.SaldoAnterior` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReportingSnapshot.legacy.DelReg` |

## ImpReciboCajaDet

- **Propósito probable:** Detalle imprimible de recibo de caja.
- **Nivel de importancia:** Secundaria
- **Registros:** 1
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Cond` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Cond` |
| `NroRecD` | `VARCHAR(6) ?` | Número o referencia funcional legacy. | `ReportingSnapshot.legacy.NroRecD` |
| `NroDoc` | `VARCHAR(50) ?` | Número o referencia funcional legacy. | `ReportingSnapshot.legacy.NroDoc` |
| `TipoTrans` | `VARCHAR(4) ?` | Atributo legacy «TipoTrans»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.TipoTrans` |
| `DescTipoTrans` | `VARCHAR(40) ?` | Atributo legacy «DescTipoTrans»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.DescTipoTrans` |
| `DescConcOI` | `VARCHAR(40) ?` | Atributo legacy «DescConcOI»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.DescConcOI` |
| `DebCred` | `VARCHAR(1) ?` | Naturaleza débito/crédito codificada. | `ReportingSnapshot.legacy.DebCred` |
| `MontoPagado` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MontoPagado` |
| `GenRec` | `TINYINT(1) ?` | Atributo legacy «GenRec»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.GenRec` |
| `OtrosIng` | `TINYINT(1) ?` | Atributo legacy «OtrosIng»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.OtrosIng` |

## ImpReciboResOI

- **Propósito probable:** Resumen imprimible de recibos y otros ingresos.
- **Nivel de importancia:** Secundaria
- **Registros:** 521
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 1
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Cond` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Cond` |
| `MesRec` | `VARCHAR(2) ?` | Atributo legacy «MesRec»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.MesRec` |
| `AnhoRec` | `VARCHAR(4) ?` | Atributo legacy «AnhoRec»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.AnhoRec` |
| `NroRecibo` | `VARCHAR(7) ?` | Número o referencia funcional legacy. | `ReportingSnapshot.legacy.NroRecibo` |
| `FechaPago` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FechaPago` |
| `CodPropt` | `VARCHAR(4) ?` | Atributo legacy «CodPropt»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CodPropt` |
| `FechaDept` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FechaDept` |
| `NroDeptBan` | `VARCHAR(15) ?` | Número o referencia funcional legacy. | `ReportingSnapshot.legacy.NroDeptBan` |
| `CodBanRec` | `VARCHAR(3) ?` | Atributo legacy «CodBanRec»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CodBanRec` |
| `CtaBanRec` | `VARCHAR(30) ?` | Atributo legacy «CtaBanRec»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CtaBanRec` |
| `TipoDept` | `VARCHAR(1) ?` | Atributo legacy «TipoDept»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.TipoDept` |
| `MontoDep` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MontoDep` |
| `MMesAnt` | `DOUBLE ?` | Atributo legacy «MMesAnt»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.MMesAnt` |
| `MMesAct` | `DOUBLE ?` | Atributo legacy «MMesAct»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.MMesAct` |
| `MTrans` | `DOUBLE ?` | Atributo legacy «MTrans»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.MTrans` |
| `MAjuste` | `DOUBLE ?` | Atributo legacy «MAjuste»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.MAjuste` |
| `TipoOI` | `VARCHAR(4) ?` | Atributo legacy «TipoOI»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.TipoOI` |
| `NroCheque` | `VARCHAR(8) ?` | Número o referencia funcional legacy. | `ReportingSnapshot.legacy.NroCheque` |
| `MOtrosI` | `DOUBLE ?` | Atributo legacy «MOtrosI»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.MOtrosI` |
| `MPagoMas` | `DOUBLE ?` | Atributo legacy «MPagoMas»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.MPagoMas` |
| `MPagoMenos` | `DOUBLE ?` | Atributo legacy «MPagoMenos»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.MPagoMenos` |
| `OTipoDep` | `VARCHAR(2) ?` | Atributo legacy «OTipoDep»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.OTipoDep` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReportingSnapshot.legacy.DelReg` |
| `DifRec` | `VARCHAR(20) ?` | Atributo legacy «DifRec»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.DifRec` |
| `Montoalterno` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.Montoalterno` |
| `Tasa` | `DOUBLE ?` | Tasa de conversión aplicada a la operación. | `ReportingSnapshot.legacy.Tasa` |
| `Usuario` | `VARCHAR(30) ?` | Atributo legacy «Usuario»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.Usuario` |

## ImpReciboResOIAc

- **Propósito probable:** Partidas contables agregadas del resumen de recibos.
- **Nivel de importancia:** Secundaria
- **Registros:** 26
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Cond` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Cond` |
| `MesRec` | `VARCHAR(2) ?` | Atributo legacy «MesRec»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.MesRec` |
| `AnhoRec` | `VARCHAR(4) ?` | Atributo legacy «AnhoRec»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.AnhoRec` |
| `ItGrupo` | `VARCHAR(1) ?` | Atributo legacy «ItGrupo»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.ItGrupo` |
| `TipoDept` | `VARCHAR(1) ?` | Atributo legacy «TipoDept»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.TipoDept` |
| `CodBanRec` | `VARCHAR(3) ?` | Atributo legacy «CodBanRec»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CodBanRec` |
| `CtaContb` | `VARCHAR(11) ?` | Atributo legacy «CtaContb»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CtaContb` |
| `DescAc` | `VARCHAR(50) ?` | Atributo legacy «DescAc»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.DescAc` |
| `MontoDeb` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MontoDeb` |
| `MontoHab` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MontoHab` |
| `PagoMenos` | `VARCHAR(1) ?` | Atributo legacy «PagoMenos»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.PagoMenos` |
| `OTipoDep` | `VARCHAR(2) ?` | Atributo legacy «OTipoDep»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.OTipoDep` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReportingSnapshot.legacy.DelReg` |

## ImpSaldoPropt

- **Propósito probable:** Saldo resumido por propietario.
- **Nivel de importancia:** Secundaria
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 2
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Cond` |
| `CodPropt` | `VARCHAR(4) !` | Atributo legacy «CodPropt»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CodPropt` |
| `SaldoAnt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.SaldoAnt` |
| `MontoAvi` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MontoAvi` |
| `MontoDeb` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MontoDeb` |
| `MontoCre` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MontoCre` |
| `OtrosCarg` | `DOUBLE ?` | Atributo legacy «OtrosCarg»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.OtrosCarg` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `ReportingSnapshot.legacy.ActReg` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReportingSnapshot.legacy.DelReg` |

## ImpSubAvisoCI

- **Propósito probable:** Subreporte de cargos individuales del aviso.
- **Nivel de importancia:** Secundaria
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 3
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Cond` |
| `CodPropt` | `VARCHAR(4) !` | Atributo legacy «CodPropt»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CodPropt` |
| `TipoDoc` | `VARCHAR(2) ?` | Atributo legacy «TipoDoc»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.TipoDoc` |
| `DescAbTD` | `VARCHAR(20) ?` | Atributo legacy «DescAbTD»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.DescAbTD` |
| `SMontoDoc` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.SMontoDoc` |
| `Anho` | `VARCHAR(4) ?` | Año contable o de facturación. | `ReportingSnapshot.legacy.Anho` |
| `Mes` | `VARCHAR(2) ?` | Atributo legacy «Mes»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.Mes` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `ReportingSnapshot.legacy.ActReg` |

## ImpSubAvisoV

- **Propósito probable:** Subreporte de conceptos del aviso.
- **Nivel de importancia:** Secundaria
- **Registros:** 4
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_Avi` | `VARCHAR(20) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_Avi` |
| `CODIGO_CON` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_CON` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_COND` |
| `CodTipo` | `VARCHAR(3) ?` | Atributo legacy «CodTipo»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CodTipo` |
| `FECHA_Emi` | `DATETIME !` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FECHA_Emi` |
| `FECHA_Venc` | `DATETIME !` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FECHA_Venc` |
| `DESCRIPCION` | `VARCHAR(80) ?` | Texto descriptivo o concepto de negocio. | `ReportingSnapshot.legacy.DESCRIPCION` |
| `DETALLE` | `VARCHAR(150) ?` | Texto descriptivo o concepto de negocio. | `ReportingSnapshot.legacy.DETALLE` |
| `MONTO_GASTO` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MONTO_GASTO` |
| `MONTO_REINTEGRO` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MONTO_REINTEGRO` |
| `MONTO_Alicuota` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MONTO_Alicuota` |
| `Nro_Propt` | `DOUBLE !` | Número o referencia funcional legacy. | `ReportingSnapshot.legacy.Nro_Propt` |
| `MES` | `VARCHAR(2) !` | Mes contable o de facturación. | `ReportingSnapshot.legacy.MES` |
| `ANO` | `VARCHAR(4) !` | Año contable o de facturación. | `ReportingSnapshot.legacy.ANO` |
| `AplAlict` | `VARCHAR(2) ?` | Atributo legacy «AplAlict»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.AplAlict` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReportingSnapshot.legacy.DelReg` |

## ImpSubAvisoVFR

- **Propósito probable:** Subreporte de fondo de reserva del aviso.
- **Nivel de importancia:** Secundaria
- **Registros:** 1
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_Avi` | `VARCHAR(20) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_Avi` |
| `CODIGO_CON` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_CON` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_COND` |
| `SaldoAnterior` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.SaldoAnterior` |
| `MontoMes` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MontoMes` |
| `SaldoActual` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.SaldoActual` |
| `MES` | `VARCHAR(2) !` | Mes contable o de facturación. | `ReportingSnapshot.legacy.MES` |
| `ANO` | `VARCHAR(4) !` | Año contable o de facturación. | `ReportingSnapshot.legacy.ANO` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReportingSnapshot.legacy.DelReg` |

## ImpSubIBan

- **Propósito probable:** Subreporte bancario de recibos.
- **Nivel de importancia:** Secundaria
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CodBanRec` | `VARCHAR(3) ?` | Atributo legacy «CodBanRec»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CodBanRec` |
| `TipoTrans` | `VARCHAR(2) ?` | Atributo legacy «TipoTrans»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.TipoTrans` |
| `DescDocC` | `VARCHAR(50) ?` | Atributo legacy «DescDocC»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.DescDocC` |
| `CODIGO_CUEH` | `VARCHAR(8) ?` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_CUEH` |
| `DESCRIPCION` | `VARCHAR(50) ?` | Texto descriptivo o concepto de negocio. | `ReportingSnapshot.legacy.DESCRIPCION` |
| `DebCred` | `VARCHAR(1) ?` | Naturaleza débito/crédito codificada. | `ReportingSnapshot.legacy.DebCred` |
| `SMontoPagado` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.SMontoPagado` |
| `Codigo_Cond` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Cond` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReportingSnapshot.legacy.DelReg` |

## ImpSubIRecResC

- **Propósito probable:** Subreporte de contrapartidas contables de recibos.
- **Nivel de importancia:** Secundaria
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CodBancoSi` | `VARCHAR(3) ?` | Atributo legacy «CodBancoSi»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CodBancoSi` |
| `NroCtaBanSi` | `VARCHAR(50) ?` | Número o referencia funcional legacy. | `ReportingSnapshot.legacy.NroCtaBanSi` |
| `CODIGO_CUED` | `VARCHAR(8) ?` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_CUED` |
| `DESCRIPCIONCta` | `VARCHAR(50) ?` | Texto descriptivo o concepto de negocio. | `ReportingSnapshot.legacy.DESCRIPCIONCta` |
| `SMontoDep` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.SMontoDep` |
| `Anho` | `VARCHAR(4) ?` | Año contable o de facturación. | `ReportingSnapshot.legacy.Anho` |
| `Mes` | `VARCHAR(2) ?` | Atributo legacy «Mes»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.Mes` |
| `Codigo_Cond` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Cond` |

## ImpSubIRecResD

- **Propósito probable:** Subreporte de documentos aplicados en recibos.
- **Nivel de importancia:** Secundaria
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `TipoTrans` | `VARCHAR(2) ?` | Atributo legacy «TipoTrans»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.TipoTrans` |
| `DescDocC` | `VARCHAR(50) ?` | Atributo legacy «DescDocC»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.DescDocC` |
| `CODIGO_CUEH` | `VARCHAR(8) ?` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_CUEH` |
| `DESCRIPCION` | `VARCHAR(50) ?` | Texto descriptivo o concepto de negocio. | `ReportingSnapshot.legacy.DESCRIPCION` |
| `DebCred` | `VARCHAR(1) ?` | Naturaleza débito/crédito codificada. | `ReportingSnapshot.legacy.DebCred` |
| `SMontoPagado` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.SMontoPagado` |
| `Codigo_Cond` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Cond` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReportingSnapshot.legacy.DelReg` |

## ImpSubSalPropt

- **Propósito probable:** Subreporte de débitos y créditos por propietario.
- **Nivel de importancia:** Secundaria
- **Registros:** 1.336
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 2
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Cond` |
| `CodPropt` | `VARCHAR(4) !` | Atributo legacy «CodPropt»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CodPropt` |
| `TipoDoc` | `VARCHAR(2) ?` | Atributo legacy «TipoDoc»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.TipoDoc` |
| `MontoDeb` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MontoDeb` |
| `MontoHab` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MontoHab` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `ReportingSnapshot.legacy.ActReg` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReportingSnapshot.legacy.DelReg` |

## ImpTransCxC

- **Propósito probable:** Resumen imprimible de transacciones de cuentas por cobrar.
- **Nivel de importancia:** Secundaria
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 2
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.Codigo_Cond` |
| `CodTrans` | `VARCHAR(2) !` | Atributo legacy «CodTrans»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.CodTrans` |
| `DescTT` | `VARCHAR(50) ?` | Atributo legacy «DescTT»; semántica exacta por validar con reglas y pantallas originales. | `ReportingSnapshot.legacy.DescTT` |
| `MontoDeb` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MontoDeb` |
| `MontoCre` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MontoCre` |
| `MES` | `VARCHAR(2) !` | Mes contable o de facturación. | `ReportingSnapshot.legacy.MES` |
| `ANO` | `VARCHAR(4) !` | Año contable o de facturación. | `ReportingSnapshot.legacy.ANO` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `ReportingSnapshot.legacy.ActReg` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReportingSnapshot.legacy.DelReg` |

## ImpVDTransf

- **Propósito probable:** Verificación de documentos transferidos al auxiliar de cobro.
- **Nivel de importancia:** Secundaria
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 1
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `ReportingSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReportingSnapshot.legacy.CODIGO_COND` |
| `Nro_Propt` | `VARCHAR(4) ?` | Número o referencia funcional legacy. | `ReportingSnapshot.legacy.Nro_Propt` |
| `NroDoc` | `VARCHAR(6) ?` | Número o referencia funcional legacy. | `ReportingSnapshot.legacy.NroDoc` |
| `MES` | `VARCHAR(2) !` | Mes contable o de facturación. | `ReportingSnapshot.legacy.MES` |
| `ANO` | `VARCHAR(4) !` | Año contable o de facturación. | `ReportingSnapshot.legacy.ANO` |
| `MONTO_Transf` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReportingSnapshot.legacy.MONTO_Transf` |
| `FECHA_Emi` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FECHA_Emi` |
| `FECHA_Venc` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReportingSnapshot.legacy.FECHA_Venc` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReportingSnapshot.legacy.DelReg` |

## InteresesMora

- **Propósito probable:** Cálculos de intereses moratorios por documento; tabla vacía en el dump.
- **Nivel de importancia:** Importante
- **Registros:** 0
- **Clave primaria declarada:** Codigo_Cond, CodPropt, TipoDoc, NroDoc
- **Índices secundarios:** 4
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE_IF_PRESENT`
- **Destino conceptual:** `LateFeeAssessment`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `LateFeeAssessment.communityId (resolver por LegacyKeyMap)` |
| `CodPropt` | `VARCHAR(4) !` | Atributo legacy «CodPropt»; semántica exacta por validar con reglas y pantallas originales. | `LateFeeAssessment.CodPropt` |
| `TipoDoc` | `VARCHAR(2) !` | Atributo legacy «TipoDoc»; semántica exacta por validar con reglas y pantallas originales. | `LateFeeAssessment.TipoDoc` |
| `NroDoc` | `VARCHAR(6) !` | Número o referencia funcional legacy. | `LateFeeAssessment.NroDoc` |
| `NroDocAp` | `VARCHAR(6) ?` | Número o referencia funcional legacy. | `LateFeeAssessment.NroDocAp` |
| `FechaEmi` | `DATETIME ?` | Fecha asociada al registro o proceso. | `LateFeeAssessment.FechaEmi` |
| `FechaVen` | `DATETIME ?` | Fecha asociada al registro o proceso. | `LateFeeAssessment.FechaVen` |
| `MontoDoc` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `LateFeeAssessment.MontoDoc` |
| `SaldoDoc` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `LateFeeAssessment.SaldoDoc` |
| `MontoIntM` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `LateFeeAssessment.MontoIntM` |
| `DiasVenc` | `DOUBLE ?` | Atributo legacy «DiasVenc»; semántica exacta por validar con reglas y pantallas originales. | `LateFeeAssessment.DiasVenc` |
| `Porcent` | `DOUBLE ?` | Atributo legacy «Porcent»; semántica exacta por validar con reglas y pantallas originales. | `LateFeeAssessment.Porcent` |
| `Anho` | `VARCHAR(4) ?` | Año contable o de facturación. | `LateFeeAssessment.Anho` |
| `Mes` | `VARCHAR(2) ?` | Atributo legacy «Mes»; semántica exacta por validar con reglas y pantallas originales. | `LateFeeAssessment.Mes` |
| `NroRef` | `VARCHAR(6) ?` | Número o referencia funcional legacy. | `LateFeeAssessment.NroRef` |
| `DebCre` | `VARCHAR(1) ?` | Naturaleza débito/crédito codificada. | `LateFeeAssessment.DebCre` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `LateFeeAssessment.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `LateFeeAssessment.legacyDeleted/status` |

## Libro_Mayor

- **Propósito probable:** Libro mayor materializado para reportes.
- **Nivel de importancia:** Importante
- **Registros:** 9.149
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECONCILE`
- **Destino conceptual:** `GeneralLedgerSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_cue` | `VARCHAR(11) ?` | Código funcional usado como referencia implícita. | `GeneralLedgerSnapshot.Codigo_cue` |
| `Descripcion` | `VARCHAR(50) ?` | Texto descriptivo o concepto de negocio. | `GeneralLedgerSnapshot.Descripcion` |
| `Saldo_Anterior` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `GeneralLedgerSnapshot.Saldo_Anterior` |
| `Saldo_AnteriorD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `GeneralLedgerSnapshot.Saldo_AnteriorD` |
| `Codigo_Comp` | `VARCHAR(8) ?` | Código funcional usado como referencia implícita. | `GeneralLedgerSnapshot.Codigo_Comp` |
| `Codigo_Det` | `VARCHAR(8) ?` | Código funcional usado como referencia implícita. | `GeneralLedgerSnapshot.Codigo_Det` |
| `Descripcion_Detalle` | `VARCHAR(50) ?` | Texto descriptivo o concepto de negocio. | `GeneralLedgerSnapshot.Descripcion_Detalle` |
| `Debe` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `GeneralLedgerSnapshot.Debe` |
| `DebeD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `GeneralLedgerSnapshot.DebeD` |
| `Haber` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `GeneralLedgerSnapshot.Haber` |
| `HaberD` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `GeneralLedgerSnapshot.HaberD` |
| `Fecha` | `DATETIME ?` | Fecha asociada al registro o proceso. | `GeneralLedgerSnapshot.Fecha` |
| `Mes` | `VARCHAR(2) ?` | Atributo legacy «Mes»; semántica exacta por validar con reglas y pantallas originales. | `GeneralLedgerSnapshot.Mes` |
| `Ano` | `VARCHAR(4) ?` | Atributo legacy «Ano»; semántica exacta por validar con reglas y pantallas originales. | `GeneralLedgerSnapshot.Ano` |
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `GeneralLedgerSnapshot.communityId (resolver por LegacyKeyMap)` |

## Perfil_User

- **Propósito probable:** Matriz horizontal de permisos por usuario y función.
- **Nivel de importancia:** Crítica
- **Registros:** 12
- **Clave primaria declarada:** CodUser
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `TRANSFORM`
- **Destino conceptual:** `RolePermission`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CodUser` | `VARCHAR(30) !` | Atributo legacy «CodUser»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.CodUser` |
| `Empresa` | `TINYINT(1) ?` | Atributo legacy «Empresa»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Empresa` |
| `Conjuntos` | `TINYINT(1) ?` | Atributo legacy «Conjuntos»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Conjuntos` |
| `Condominios` | `TINYINT(1) ?` | Atributo legacy «Condominios»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Condominios` |
| `Seleccionar_Conjunto` | `TINYINT(1) ?` | Atributo legacy «Seleccionar_Conjunto»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Seleccionar_Conjunto` |
| `Seleccionar_Condominio` | `TINYINT(1) ?` | Atributo legacy «Seleccionar_Condominio»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Seleccionar_Condominio` |
| `Propietarios` | `TINYINT(1) ?` | Atributo legacy «Propietarios»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Propietarios` |
| `Alicuotas` | `TINYINT(1) ?` | Atributo legacy «Alicuotas»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Alicuotas` |
| `Documentos_de_Cobro` | `TINYINT(1) ?` | Atributo legacy «Documentos_de_Cobro»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Documentos_de_Cobro` |
| `Tipo_de_Gasto` | `TINYINT(1) ?` | Atributo legacy «Tipo_de_Gasto»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Tipo_de_Gasto` |
| `Concepto_de_Gasto` | `TINYINT(1) ?` | Texto descriptivo o concepto de negocio. | `RolePermission.Concepto_de_Gasto` |
| `Conceptos_Otros_Ingresos` | `TINYINT(1) ?` | Texto descriptivo o concepto de negocio. | `RolePermission.Conceptos_Otros_Ingresos` |
| `Bancos` | `TINYINT(1) ?` | Atributo legacy «Bancos»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Bancos` |
| `Cuentas_Bancarias` | `TINYINT(1) ?` | Atributo legacy «Cuentas_Bancarias»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Cuentas_Bancarias` |
| `Beneficiarios` | `TINYINT(1) ?` | Atributo legacy «Beneficiarios»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Beneficiarios` |
| `Tipo_de_Transaccion_Bancaria` | `TINYINT(1) ?` | Atributo legacy «Tipo_de_Transaccion_Bancaria»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Tipo_de_Transaccion_Bancaria` |
| `Tipo_de_Transaccion_Divisas` | `TINYINT(1) ?` | Atributo legacy «Tipo_de_Transaccion_Divisas»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Tipo_de_Transaccion_Divisas` |
| `Plan_Contable` | `TINYINT(1) ?` | Atributo legacy «Plan_Contable»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Plan_Contable` |
| `Generar_Aviso_Cobro_Chqs` | `TINYINT(1) ?` | Atributo legacy «Generar_Aviso_Cobro_Chqs»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Generar_Aviso_Cobro_Chqs` |
| `Carga_de_Documentos` | `TINYINT(1) ?` | Atributo legacy «Carga_de_Documentos»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Carga_de_Documentos` |
| `Cheques_Devueltos_Otros_Cargos` | `TINYINT(1) ?` | Atributo legacy «Cheques_Devueltos_Otros_Cargos»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Cheques_Devueltos_Otros_Cargos` |
| `Recibos_de_Caja` | `TINYINT(1) ?` | Atributo legacy «Recibos_de_Caja»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Recibos_de_Caja` |
| `Calculo_Intereses_de_Mora` | `TINYINT(1) ?` | Atributo legacy «Calculo_Intereses_de_Mora»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Calculo_Intereses_de_Mora` |
| `Facturacion_Aviso_de_Cobro` | `TINYINT(1) ?` | Atributo legacy «Facturacion_Aviso_de_Cobro»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Facturacion_Aviso_de_Cobro` |
| `Importar_Conceptos` | `TINYINT(1) ?` | Texto descriptivo o concepto de negocio. | `RolePermission.Importar_Conceptos` |
| `Verificacion_de_Saldos_Ctas_Por_Cobrar` | `TINYINT(1) ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `RolePermission.Verificacion_de_Saldos_Ctas_Por_Cobrar` |
| `Transf_Resumen_Aviso_de_Cobro` | `TINYINT(1) ?` | Atributo legacy «Transf_Resumen_Aviso_de_Cobro»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Transf_Resumen_Aviso_de_Cobro` |
| `Transf_Recibo_Pago_Dept` | `TINYINT(1) ?` | Atributo legacy «Transf_Recibo_Pago_Dept»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Transf_Recibo_Pago_Dept` |
| `Cierre_Mensual_de_Facturacion` | `TINYINT(1) ?` | Atributo legacy «Cierre_Mensual_de_Facturacion»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Cierre_Mensual_de_Facturacion` |
| `Contabilizacion_Depositos` | `TINYINT(1) ?` | Atributo legacy «Contabilizacion_Depositos»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Contabilizacion_Depositos` |
| `Contabilizacion_Aviso_de_Cobro` | `TINYINT(1) ?` | Atributo legacy «Contabilizacion_Aviso_de_Cobro»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Contabilizacion_Aviso_de_Cobro` |
| `Cierre_Anual` | `TINYINT(1) ?` | Atributo legacy «Cierre_Anual»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Cierre_Anual` |
| `Emision_de_Cheques` | `TINYINT(1) ?` | Atributo legacy «Emision_de_Cheques»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Emision_de_Cheques` |
| `Transacciones_Bancarias` | `TINYINT(1) ?` | Atributo legacy «Transacciones_Bancarias»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Transacciones_Bancarias` |
| `Conciliacion_Bancaria` | `TINYINT(1) ?` | Atributo legacy «Conciliacion_Bancaria»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Conciliacion_Bancaria` |
| `Cierre_Mensual_Banco` | `TINYINT(1) ?` | Atributo legacy «Cierre_Mensual_Banco»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Cierre_Mensual_Banco` |
| `Contabilizacion_Cheques` | `TINYINT(1) ?` | Atributo legacy «Contabilizacion_Cheques»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Contabilizacion_Cheques` |
| `Transf_Transacciones_Bancarias` | `TINYINT(1) ?` | Atributo legacy «Transf_Transacciones_Bancarias»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Transf_Transacciones_Bancarias` |
| `Transf_Transacciones_Divisas` | `TINYINT(1) ?` | Atributo legacy «Transf_Transacciones_Divisas»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Transf_Transacciones_Divisas` |
| `Tipos_de_Comprobantes` | `TINYINT(1) ?` | Atributo legacy «Tipos_de_Comprobantes»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Tipos_de_Comprobantes` |
| `Comprobante_Contable` | `TINYINT(1) ?` | Atributo legacy «Comprobante_Contable»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Comprobante_Contable` |
| `Actualizar_Comprobantes` | `TINYINT(1) ?` | Atributo legacy «Actualizar_Comprobantes»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Actualizar_Comprobantes` |
| `Cierre_Anual_Contabilidad` | `TINYINT(1) ?` | Atributo legacy «Cierre_Anual_Contabilidad»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Cierre_Anual_Contabilidad` |
| `Diario_Legal` | `TINYINT(1) ?` | Atributo legacy «Diario_Legal»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Diario_Legal` |
| `Relacion_de_Comprobantes` | `TINYINT(1) ?` | Atributo legacy «Relacion_de_Comprobantes»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Relacion_de_Comprobantes` |
| `Listado_Propietarios` | `TINYINT(1) ?` | Atributo legacy «Listado_Propietarios»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Listado_Propietarios` |
| `Listado_Documentos_de_Cobro` | `TINYINT(1) ?` | Atributo legacy «Listado_Documentos_de_Cobro»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Listado_Documentos_de_Cobro` |
| `Listado_Tipo_de_Gasto` | `TINYINT(1) ?` | Atributo legacy «Listado_Tipo_de_Gasto»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Listado_Tipo_de_Gasto` |
| `Listado_Concepto_de_Gasto` | `TINYINT(1) ?` | Texto descriptivo o concepto de negocio. | `RolePermission.Listado_Concepto_de_Gasto` |
| `Listado_Bancos` | `TINYINT(1) ?` | Atributo legacy «Listado_Bancos»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Listado_Bancos` |
| `Listado_Beneficiarios` | `TINYINT(1) ?` | Atributo legacy «Listado_Beneficiarios»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Listado_Beneficiarios` |
| `Listado_Cuentas_Bancarias` | `TINYINT(1) ?` | Atributo legacy «Listado_Cuentas_Bancarias»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Listado_Cuentas_Bancarias` |
| `Listado_Plan_Contable` | `TINYINT(1) ?` | Atributo legacy «Listado_Plan_Contable»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Listado_Plan_Contable` |
| `Listado_Tipo_Transacciones_Banc` | `TINYINT(1) ?` | Atributo legacy «Listado_Tipo_Transacciones_Banc»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Listado_Tipo_Transacciones_Banc` |
| `Listado_Relacion_de_Cheques` | `TINYINT(1) ?` | Atributo legacy «Listado_Relacion_de_Cheques»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Listado_Relacion_de_Cheques` |
| `Relacion_Pago_Proveedores` | `TINYINT(1) ?` | Atributo legacy «Relacion_Pago_Proveedores»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Relacion_Pago_Proveedores` |
| `Listado_Relacion_de_Cheques_Tipo_de_Gasto` | `TINYINT(1) ?` | Atributo legacy «Listado_Relacion_de_Cheques_Tipo_de_Gasto»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Listado_Relacion_de_Cheques_Tipo_de_Gasto` |
| `Listado_Relacion_Transac_Bancarias` | `TINYINT(1) ?` | Atributo legacy «Listado_Relacion_Transac_Bancarias»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Listado_Relacion_Transac_Bancarias` |
| `Listado_Libro_Mayor` | `TINYINT(1) ?` | Atributo legacy «Listado_Libro_Mayor»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Listado_Libro_Mayor` |
| `Listado_Analitico_X_Cuenta` | `TINYINT(1) ?` | Atributo legacy «Listado_Analitico_X_Cuenta»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Listado_Analitico_X_Cuenta` |
| `Listado_Balance_Comprobacion` | `TINYINT(1) ?` | Atributo legacy «Listado_Balance_Comprobacion»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Listado_Balance_Comprobacion` |
| `Listado_Balance_General` | `TINYINT(1) ?` | Atributo legacy «Listado_Balance_General»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Listado_Balance_General` |
| `Listado_Edo_Ganancias_y_Perdidas` | `TINYINT(1) ?` | Atributo legacy «Listado_Edo_Ganancias_y_Perdidas»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Listado_Edo_Ganancias_y_Perdidas` |
| `Recibo_de_Cobro` | `TINYINT(1) ?` | Atributo legacy «Recibo_de_Cobro»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Recibo_de_Cobro` |
| `Aviso_de_Cobro_Reporte_Verificacion` | `TINYINT(1) ?` | Atributo legacy «Aviso_de_Cobro_Reporte_Verificacion»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Aviso_de_Cobro_Reporte_Verificacion` |
| `Aviso_de_Cobro_Factura_Propietario` | `TINYINT(1) ?` | Atributo legacy «Aviso_de_Cobro_Factura_Propietario»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Aviso_de_Cobro_Factura_Propietario` |
| `Aviso_de_Cobro_Reporte_Resumen` | `TINYINT(1) ?` | Atributo legacy «Aviso_de_Cobro_Reporte_Resumen»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Aviso_de_Cobro_Reporte_Resumen` |
| `Reporte_de_Documetos_Tranf` | `TINYINT(1) ?` | Atributo legacy «Reporte_de_Documetos_Tranf»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Reporte_de_Documetos_Tranf` |
| `Relacion_de_Saldos_Por_Propietario` | `TINYINT(1) ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `RolePermission.Relacion_de_Saldos_Por_Propietario` |
| `Relacion_de_Docs_Pendientesr_Propietario` | `TINYINT(1) ?` | Atributo legacy «Relacion_de_Docs_Pendientesr_Propietario»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Relacion_de_Docs_Pendientesr_Propietario` |
| `Docs_Pendientes_Cartelera` | `TINYINT(1) ?` | Atributo legacy «Docs_Pendientes_Cartelera»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Docs_Pendientes_Cartelera` |
| `Listado_Chqs_Dev_Otros_Cargos` | `TINYINT(1) ?` | Atributo legacy «Listado_Chqs_Dev_Otros_Cargos»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Listado_Chqs_Dev_Otros_Cargos` |
| `Estado_de_Cuenta` | `TINYINT(1) ?` | Atributo legacy «Estado_de_Cuenta»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Estado_de_Cuenta` |
| `Relacion_Recibos_de_Caja` | `TINYINT(1) ?` | Atributo legacy «Relacion_Recibos_de_Caja»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Relacion_Recibos_de_Caja` |
| `Estadistica_de_Gastos` | `TINYINT(1) ?` | Atributo legacy «Estadistica_de_Gastos»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Estadistica_de_Gastos` |
| `Reporte_de_Cobranzas` | `TINYINT(1) ?` | Atributo legacy «Reporte_de_Cobranzas»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Reporte_de_Cobranzas` |
| `Relacion_de_DNI` | `TINYINT(1) ?` | Atributo legacy «Relacion_de_DNI»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Relacion_de_DNI` |
| `Transacciones_del_Mes_Res_Cont` | `TINYINT(1) ?` | Atributo legacy «Transacciones_del_Mes_Res_Cont»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Transacciones_del_Mes_Res_Cont` |
| `Desbloquear_Registros` | `TINYINT(1) ?` | Atributo legacy «Desbloquear_Registros»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Desbloquear_Registros` |
| `Eliminar_Avisos_de_Cobro_Transf` | `TINYINT(1) ?` | Atributo legacy «Eliminar_Avisos_de_Cobro_Transf»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Eliminar_Avisos_de_Cobro_Transf` |
| `Eliminacion_de_Condominios` | `TINYINT(1) ?` | Atributo legacy «Eliminacion_de_Condominios»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Eliminacion_de_Condominios` |
| `Copiar_Maestros` | `TINYINT(1) ?` | Atributo legacy «Copiar_Maestros»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Copiar_Maestros` |
| `Respaldo_de_Datos` | `TINYINT(1) ?` | Atributo legacy «Respaldo_de_Datos»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Respaldo_de_Datos` |
| `Restauracion_de_Datos` | `TINYINT(1) ?` | Atributo legacy «Restauracion_de_Datos»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Restauracion_de_Datos` |
| `Usuarios` | `TINYINT(1) ?` | Atributo legacy «Usuarios»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Usuarios` |
| `Perfil_de_Usuario` | `TINYINT(1) ?` | Atributo legacy «Perfil_de_Usuario»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Perfil_de_Usuario` |
| `Auditoria_de_Usuarios` | `TINYINT(1) ?` | Atributo legacy «Auditoria_de_Usuarios»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Auditoria_de_Usuarios` |
| `Mantenimiento_Auditoria` | `TINYINT(1) ?` | Atributo legacy «Mantenimiento_Auditoria»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Mantenimiento_Auditoria` |
| `Configuracion_Base_Datos` | `TINYINT(1) ?` | Atributo legacy «Configuracion_Base_Datos»; semántica exacta por validar con reglas y pantallas originales. | `RolePermission.Configuracion_Base_Datos` |

## PLAN

- **Propósito probable:** Plan de cuentas contables por entidad administrada.
- **Nivel de importancia:** Crítica
- **Registros:** 660
- **Clave primaria declarada:** ID_CUE
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `LedgerAccount`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_CUE` | `VARCHAR(8) !` | Código funcional usado como referencia implícita. | `LedgerAccount.CODIGO_CUE` |
| `DESCRIPCION` | `VARCHAR(50) !` | Texto descriptivo o concepto de negocio. | `LedgerAccount.DESCRIPCION` |
| `MOVIMIENTO` | `VARCHAR(2) !` | Atributo legacy «MOVIMIENTO»; semántica exacta por validar con reglas y pantallas originales. | `LedgerAccount.MOVIMIENTO` |
| `SALDO_INICIO` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `LedgerAccount.SALDO_INICIO` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `LedgerAccount.communityId (resolver por LegacyKeyMap)` |
| `ID_CUE` | `VARCHAR(11) !` | Identificador compuesto o técnico del sistema legacy. | `LedgerAccount.ID_CUE` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `LedgerAccount.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `LedgerAccount.legacyDeleted/status` |

## PLAN_old

- **Propósito probable:** Copia anterior del plan contable.
- **Nivel de importancia:** Importante
- **Registros:** 640
- **Clave primaria declarada:** ID_CUE
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_COMPARE`
- **Destino conceptual:** `LegacyLedgerAccountSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_CUE` | `VARCHAR(8) !` | Código funcional usado como referencia implícita. | `LegacyLedgerAccountSnapshot.CODIGO_CUE` |
| `DESCRIPCION` | `VARCHAR(50) !` | Texto descriptivo o concepto de negocio. | `LegacyLedgerAccountSnapshot.DESCRIPCION` |
| `MOVIMIENTO` | `VARCHAR(2) !` | Atributo legacy «MOVIMIENTO»; semántica exacta por validar con reglas y pantallas originales. | `LegacyLedgerAccountSnapshot.MOVIMIENTO` |
| `SALDO_INICIO` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `LegacyLedgerAccountSnapshot.SALDO_INICIO` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `LegacyLedgerAccountSnapshot.communityId (resolver por LegacyKeyMap)` |
| `ID_CUE` | `VARCHAR(11) !` | Identificador compuesto o técnico del sistema legacy. | `LegacyLedgerAccountSnapshot.ID_CUE` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `LegacyLedgerAccountSnapshot.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `LegacyLedgerAccountSnapshot.legacyDeleted/status` |

## PROPIETARIO

- **Propósito probable:** Registro mixto que combina inmueble, titular/representante, contacto y alícuota.
- **Nivel de importancia:** Crítica
- **Registros:** 742
- **Clave primaria declarada:** ID_PRO
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE_WITH_SPLIT`
- **Destino conceptual:** `Person+Property+Ownership`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_PRO` | `VARCHAR(4) !` | Código funcional usado como referencia implícita. | `Property.legacyCode` |
| `APTO` | `VARCHAR(7) !` | Atributo legacy «APTO»; semántica exacta por validar con reglas y pantallas originales. | `Property.code` |
| `REPRESENTANTE` | `VARCHAR(50) ?` | Atributo legacy «REPRESENTANTE»; semántica exacta por validar con reglas y pantallas originales. | `Person/LegalEntity.displayName` |
| `CEDULA` | `VARCHAR(20) ?` | Atributo legacy «CEDULA»; semántica exacta por validar con reglas y pantallas originales. | `PartyIdentification.documentNumber` |
| `ALICUOTAT` | `DOUBLE !` | Atributo legacy «ALICUOTAT»; semántica exacta por validar con reglas y pantallas originales. | `PropertyAliquotPeriod.generalAliquot` |
| `ALICUOTAC` | `DOUBLE !` | Atributo legacy «ALICUOTAC»; semántica exacta por validar con reglas y pantallas originales. | `PropertyAliquotPeriod.commercialAliquot` |
| `TELEFONO` | `VARCHAR(50) ?` | Atributo legacy «TELEFONO»; semántica exacta por validar con reglas y pantallas originales. | `PartyContact.phone` |
| `DIRECCION` | `VARCHAR(100) ?` | Atributo legacy «DIRECCION»; semántica exacta por validar con reglas y pantallas originales. | `PartyContact.address` |
| `E_MAIL` | `VARCHAR(50) ?` | Atributo legacy «E_MAIL»; semántica exacta por validar con reglas y pantallas originales. | `PartyContact.email` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `Community.legacyCode` |
| `ID_PRO` | `VARCHAR(7) !` | Identificador compuesto o técnico del sistema legacy. | `LegacyKeyMap.sourceKey` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `Person+Property+Ownership.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `Person+Property+Ownership.legacyDeleted/status` |

## PROPIETARIO_OLD

- **Propósito probable:** Copia histórica del registro mixto propietario/inmueble.
- **Nivel de importancia:** Crítica
- **Registros:** 740
- **Clave primaria declarada:** ID_PRO
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECONCILE`
- **Destino conceptual:** `LegacyOwnershipSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_PRO` | `VARCHAR(4) !` | Código funcional usado como referencia implícita. | `LegacyOwnershipSnapshot.CODIGO_PRO` |
| `APTO` | `VARCHAR(7) !` | Atributo legacy «APTO»; semántica exacta por validar con reglas y pantallas originales. | `LegacyOwnershipSnapshot.APTO` |
| `REPRESENTANTE` | `VARCHAR(50) ?` | Atributo legacy «REPRESENTANTE»; semántica exacta por validar con reglas y pantallas originales. | `LegacyOwnershipSnapshot.REPRESENTANTE` |
| `CEDULA` | `VARCHAR(20) ?` | Atributo legacy «CEDULA»; semántica exacta por validar con reglas y pantallas originales. | `LegacyOwnershipSnapshot.CEDULA` |
| `ALICUOTAT` | `DOUBLE !` | Atributo legacy «ALICUOTAT»; semántica exacta por validar con reglas y pantallas originales. | `LegacyOwnershipSnapshot.ALICUOTAT` |
| `ALICUOTAC` | `DOUBLE !` | Atributo legacy «ALICUOTAC»; semántica exacta por validar con reglas y pantallas originales. | `LegacyOwnershipSnapshot.ALICUOTAC` |
| `TELEFONO` | `VARCHAR(50) ?` | Atributo legacy «TELEFONO»; semántica exacta por validar con reglas y pantallas originales. | `LegacyOwnershipSnapshot.TELEFONO` |
| `DIRECCION` | `VARCHAR(100) ?` | Atributo legacy «DIRECCION»; semántica exacta por validar con reglas y pantallas originales. | `LegacyOwnershipSnapshot.DIRECCION` |
| `E_MAIL` | `VARCHAR(50) ?` | Atributo legacy «E_MAIL»; semántica exacta por validar con reglas y pantallas originales. | `LegacyOwnershipSnapshot.E_MAIL` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `LegacyOwnershipSnapshot.communityId (resolver por LegacyKeyMap)` |
| `ID_PRO` | `VARCHAR(7) !` | Identificador compuesto o técnico del sistema legacy. | `LegacyOwnershipSnapshot.ID_PRO` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `LegacyOwnershipSnapshot.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `LegacyOwnershipSnapshot.legacyDeleted/status` |

## Recibos

- **Propósito probable:** Cabecera de recibos de pago, medio, depósito, tasa y propietario.
- **Nivel de importancia:** Crítica
- **Registros:** 19.633
- **Clave primaria declarada:** NroRec, MesRec, AnhoRec, Codigo_Cond
- **Índices secundarios:** 4
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `PaymentReceipt`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `NroRec` | `VARCHAR(6) !` | Número o referencia funcional legacy. | `PaymentReceipt.number` |
| `MesRec` | `VARCHAR(2) !` | Atributo legacy «MesRec»; semántica exacta por validar con reglas y pantallas originales. | `PaymentReceipt.MesRec` |
| `AnhoRec` | `VARCHAR(4) !` | Atributo legacy «AnhoRec»; semántica exacta por validar con reglas y pantallas originales. | `PaymentReceipt.AnhoRec` |
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `PaymentReceipt.communityId (resolver por LegacyKeyMap)` |
| `CodProptRec` | `VARCHAR(4) ?` | Atributo legacy «CodProptRec»; semántica exacta por validar con reglas y pantallas originales. | `Payment.payerPropertyId (resolved)` |
| `CodBanRec` | `VARCHAR(3) ?` | Atributo legacy «CodBanRec»; semántica exacta por validar con reglas y pantallas originales. | `Payment.destinationBankId (resolved)` |
| `NroCtaBan` | `VARCHAR(30) ?` | Número o referencia funcional legacy. | `Payment.destinationBankAccountId (resolved)` |
| `NroDeptBan` | `VARCHAR(15) ?` | Número o referencia funcional legacy. | `Payment.reference` |
| `MontoRec` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `Payment.amount` |
| `MAjuste` | `DOUBLE ?` | Atributo legacy «MAjuste»; semántica exacta por validar con reglas y pantallas originales. | `PaymentReceipt.MAjuste` |
| `Monto_OI` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `PaymentReceipt.Monto_OI` |
| `SumRes` | `TINYINT(1) ?` | Atributo legacy «SumRes»; semántica exacta por validar con reglas y pantallas originales. | `PaymentReceipt.SumRes` |
| `FechaPago` | `DATETIME ?` | Fecha asociada al registro o proceso. | `Payment.paidOn` |
| `FechaDept` | `DATETIME ?` | Fecha asociada al registro o proceso. | `Payment.depositedOn` |
| `TipoDept` | `VARCHAR(1) ?` | Atributo legacy «TipoDept»; semántica exacta por validar con reglas y pantallas originales. | `Payment.methodLegacyCode` |
| `NroCheque` | `VARCHAR(8) ?` | Número o referencia funcional legacy. | `Payment.checkNumber` |
| `BancoChq` | `VARCHAR(20) ?` | Atributo legacy «BancoChq»; semántica exacta por validar con reglas y pantallas originales. | `Payment.originBank` |
| `Montoalterno` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `Payment.amountAlternate` |
| `Tasa` | `DOUBLE ?` | Tasa de conversión aplicada a la operación. | `Payment.exchangeRate` |
| `RtipoCambio` | `DOUBLE ?` | Atributo legacy «RtipoCambio»; semántica exacta por validar con reglas y pantallas originales. | `PaymentReceipt.RtipoCambio` |
| `RMontoUS$` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `PaymentReceipt.RMontoUS$` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `PaymentReceipt.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `PaymentReceipt.legacyDeleted/status` |
| `Usuario` | `VARCHAR(30) ?` | Atributo legacy «Usuario»; semántica exacta por validar con reglas y pantallas originales. | `Payment.recordedByUserId (resolved)` |

## RecibosDetalle

- **Propósito probable:** Aplicación de un recibo a documentos por cobrar.
- **Nivel de importancia:** Crítica
- **Registros:** 42.892
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 2
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `PaymentAllocation`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Cond` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `PaymentAllocation.communityId (resolver por LegacyKeyMap)` |
| `NroRecD` | `VARCHAR(6) !` | Número o referencia funcional legacy. | `PaymentAllocation.NroRecD` |
| `NroDoc` | `VARCHAR(50) ?` | Número o referencia funcional legacy. | `PaymentAllocation.NroDoc` |
| `TipoTrans` | `VARCHAR(2) ?` | Atributo legacy «TipoTrans»; semántica exacta por validar con reglas y pantallas originales. | `PaymentAllocation.TipoTrans` |
| `DebCred` | `VARCHAR(1) ?` | Naturaleza débito/crédito codificada. | `PaymentAllocation.DebCred` |
| `MontoPagado` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `PaymentAllocation.MontoPagado` |
| `RDTipoCambio` | `DOUBLE ?` | Atributo legacy «RDTipoCambio»; semántica exacta por validar con reglas y pantallas originales. | `PaymentAllocation.RDTipoCambio` |
| `RDMontoUS$` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `PaymentAllocation.RDMontoUS$` |
| `GenRec` | `TINYINT(1) ?` | Atributo legacy «GenRec»; semántica exacta por validar con reglas y pantallas originales. | `PaymentAllocation.GenRec` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `PaymentAllocation.legacyDeleted/status` |

## RecibosOtrosing

- **Propósito probable:** Otros ingresos incluidos en un recibo.
- **Nivel de importancia:** Importante
- **Registros:** 140
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 3
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `PaymentRevenueLine`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `PaymentRevenueLine.communityId (resolver por LegacyKeyMap)` |
| `NroRecOI` | `VARCHAR(6) !` | Número o referencia funcional legacy. | `PaymentRevenueLine.NroRecOI` |
| `ItemROI` | `VARCHAR(3) !` | Atributo legacy «ItemROI»; semántica exacta por validar con reglas y pantallas originales. | `PaymentRevenueLine.ItemROI` |
| `CodConcROI` | `VARCHAR(4) !` | Atributo legacy «CodConcROI»; semántica exacta por validar con reglas y pantallas originales. | `PaymentRevenueLine.CodConcROI` |
| `MontoOI` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `PaymentRevenueLine.MontoOI` |
| `DescConcOI` | `VARCHAR(40) ?` | Atributo legacy «DescConcOI»; semántica exacta por validar con reglas y pantallas originales. | `PaymentRevenueLine.DescConcOI` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `PaymentRevenueLine.legacyDeleted/status` |

## Tasas

- **Propósito probable:** Tasas de cambio BCV y paralela por fecha.
- **Nivel de importancia:** Crítica
- **Registros:** 6
- **Clave primaria declarada:** FECHA
- **Índices secundarios:** 1
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE_BCV_ONLY`
- **Destino conceptual:** `ExchangeRate`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `ID` | `INTEGER ?` | Atributo legacy «ID»; semántica exacta por validar con reglas y pantallas originales. | `ExchangeRate.ID` |
| `FECHA` | `DATETIME !` | Fecha asociada al registro o proceso. | `ExchangeRate.FECHA` |
| `BCV` | `DOUBLE !` | Atributo legacy «BCV»; semántica exacta por validar con reglas y pantallas originales. | `ExchangeRate.BCV` |
| `PARALELO` | `DOUBLE ?` | Atributo legacy «PARALELO»; semántica exacta por validar con reglas y pantallas originales. | `ExchangeRate.PARALELO` |
| `FECHALARGA` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ExchangeRate.FECHALARGA` |

## TBLRComisiones

- **Propósito probable:** Tabla auxiliar de reporte para comisiones de cobranza.
- **Nivel de importancia:** Secundaria
- **Registros:** 300
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `CollectionCommissionSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `APT` | `VARCHAR(255) ?` | Atributo legacy «APT»; semántica exacta por validar con reglas y pantallas originales. | `CollectionCommissionSnapshot.APT` |
| `APARTAMENTO` | `VARCHAR(255) ?` | Atributo legacy «APARTAMENTO»; semántica exacta por validar con reglas y pantallas originales. | `CollectionCommissionSnapshot.APARTAMENTO` |
| `PROPIETARIO` | `VARCHAR(255) ?` | Atributo legacy «PROPIETARIO»; semántica exacta por validar con reglas y pantallas originales. | `CollectionCommissionSnapshot.PROPIETARIO` |
| `REPRESENTANTE` | `VARCHAR(255) ?` | Atributo legacy «REPRESENTANTE»; semántica exacta por validar con reglas y pantallas originales. | `CollectionCommissionSnapshot.REPRESENTANTE` |
| `NroDoc` | `VARCHAR(255) ?` | Número o referencia funcional legacy. | `CollectionCommissionSnapshot.NroDoc` |
| `FechaEmi` | `DATETIME ?` | Fecha asociada al registro o proceso. | `CollectionCommissionSnapshot.FechaEmi` |
| `FechaVen` | `DATETIME ?` | Fecha asociada al registro o proceso. | `CollectionCommissionSnapshot.FechaVen` |
| `MontoDoc` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `CollectionCommissionSnapshot.MontoDoc` |
| `SaldoDoc` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `CollectionCommissionSnapshot.SaldoDoc` |
| `MONTOBASECOMISION` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `CollectionCommissionSnapshot.MONTOBASECOMISION` |

## TBLRP01

- **Propósito probable:** Tabla auxiliar de reporte de pagos agregados.
- **Nivel de importancia:** Secundaria
- **Registros:** 44
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `PaymentReportSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `FechaPago` | `DATETIME ?` | Fecha asociada al registro o proceso. | `PaymentReportSnapshot.FechaPago` |
| `Cuenta` | `VARCHAR(255) ?` | Atributo legacy «Cuenta»; semántica exacta por validar con reglas y pantallas originales. | `PaymentReportSnapshot.Cuenta` |
| `NroDoc` | `VARCHAR(255) ?` | Número o referencia funcional legacy. | `PaymentReportSnapshot.NroDoc` |
| `MES` | `VARCHAR(255) ?` | Mes contable o de facturación. | `PaymentReportSnapshot.MES` |
| `AÑOMES` | `VARCHAR(255) ?` | Atributo legacy «AÑOMES»; semántica exacta por validar con reglas y pantallas originales. | `PaymentReportSnapshot.AÑOMES` |
| `AÑO` | `VARCHAR(255) ?` | Atributo legacy «AÑO»; semántica exacta por validar con reglas y pantallas originales. | `PaymentReportSnapshot.AÑO` |
| `MontoPagado` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `PaymentReportSnapshot.MontoPagado` |

## TBLRP02

- **Propósito probable:** Tabla auxiliar secundaria de pagos agregados.
- **Nivel de importancia:** Secundaria
- **Registros:** 27
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_RECOMPUTE`
- **Destino conceptual:** `PaymentReportSnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `NroDoc` | `VARCHAR(255) ?` | Número o referencia funcional legacy. | `PaymentReportSnapshot.NroDoc` |
| `MES_PAGO` | `VARCHAR(255) ?` | Atributo legacy «MES_PAGO»; semántica exacta por validar con reglas y pantallas originales. | `PaymentReportSnapshot.MES_PAGO` |
| `AÑO_PAGO` | `VARCHAR(255) ?` | Atributo legacy «AÑO_PAGO»; semántica exacta por validar con reglas y pantallas originales. | `PaymentReportSnapshot.AÑO_PAGO` |
| `MONTO` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `PaymentReportSnapshot.MONTO` |

## TempContRecibo

- **Propósito probable:** Área temporal de contabilización y clasificación de recibos.
- **Nivel de importancia:** Secundaria
- **Registros:** 617
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `PaymentPostingStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Cond` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `PaymentPostingStaging.legacy.Codigo_Cond` |
| `MesRec` | `VARCHAR(2) ?` | Atributo legacy «MesRec»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.MesRec` |
| `AnhoRec` | `VARCHAR(4) ?` | Atributo legacy «AnhoRec»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.AnhoRec` |
| `NroRecibo` | `VARCHAR(7) ?` | Número o referencia funcional legacy. | `PaymentPostingStaging.legacy.NroRecibo` |
| `FechaPago` | `DATETIME ?` | Fecha asociada al registro o proceso. | `PaymentPostingStaging.legacy.FechaPago` |
| `CodPropt` | `VARCHAR(4) ?` | Atributo legacy «CodPropt»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.CodPropt` |
| `FechaDept` | `DATETIME ?` | Fecha asociada al registro o proceso. | `PaymentPostingStaging.legacy.FechaDept` |
| `NroDeptBan` | `VARCHAR(15) ?` | Número o referencia funcional legacy. | `PaymentPostingStaging.legacy.NroDeptBan` |
| `CodBanRec` | `VARCHAR(3) ?` | Atributo legacy «CodBanRec»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.CodBanRec` |
| `CtaBanRec` | `VARCHAR(30) ?` | Atributo legacy «CtaBanRec»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.CtaBanRec` |
| `TipoDept` | `VARCHAR(1) ?` | Atributo legacy «TipoDept»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.TipoDept` |
| `MontoDep` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `PaymentPostingStaging.legacy.MontoDep` |
| `MMesAnt` | `DOUBLE ?` | Atributo legacy «MMesAnt»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.MMesAnt` |
| `MMesAct` | `DOUBLE ?` | Atributo legacy «MMesAct»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.MMesAct` |
| `MTrans` | `DOUBLE ?` | Atributo legacy «MTrans»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.MTrans` |
| `MAjuste` | `DOUBLE ?` | Atributo legacy «MAjuste»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.MAjuste` |
| `TipoOI` | `VARCHAR(4) ?` | Atributo legacy «TipoOI»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.TipoOI` |
| `MOtrosI` | `DOUBLE ?` | Atributo legacy «MOtrosI»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.MOtrosI` |
| `MPagoMas` | `DOUBLE ?` | Atributo legacy «MPagoMas»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.MPagoMas` |
| `MPagoMenos` | `DOUBLE ?` | Atributo legacy «MPagoMenos»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.MPagoMenos` |
| `OTipoDep` | `VARCHAR(2) ?` | Atributo legacy «OTipoDep»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.OTipoDep` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `PaymentPostingStaging.legacy.DelReg` |
| `MontoDepAlt` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `PaymentPostingStaging.legacy.MontoDepAlt` |
| `MMesActAlt` | `DOUBLE ?` | Atributo legacy «MMesActAlt»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.MMesActAlt` |
| `MMesAntAlt` | `DOUBLE ?` | Atributo legacy «MMesAntAlt»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.MMesAntAlt` |
| `MTransAlt` | `DOUBLE ?` | Atributo legacy «MTransAlt»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.MTransAlt` |
| `MAjusteAlt` | `DOUBLE ?` | Atributo legacy «MAjusteAlt»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.MAjusteAlt` |
| `MOtrosIAlt` | `DOUBLE ?` | Atributo legacy «MOtrosIAlt»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.MOtrosIAlt` |
| `MPagoMasAlt` | `DOUBLE ?` | Atributo legacy «MPagoMasAlt»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.MPagoMasAlt` |
| `MPagoMenosAlt` | `DOUBLE ?` | Atributo legacy «MPagoMenosAlt»; semántica exacta por validar con reglas y pantallas originales. | `PaymentPostingStaging.legacy.MPagoMenosAlt` |

## TempContReciboAc

- **Propósito probable:** Área temporal de partidas contables generadas desde recibos.
- **Nivel de importancia:** Secundaria
- **Registros:** 115
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `PaymentJournalStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Cond` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `PaymentJournalStaging.legacy.Codigo_Cond` |
| `MesRec` | `VARCHAR(2) ?` | Atributo legacy «MesRec»; semántica exacta por validar con reglas y pantallas originales. | `PaymentJournalStaging.legacy.MesRec` |
| `AnhoRec` | `VARCHAR(4) ?` | Atributo legacy «AnhoRec»; semántica exacta por validar con reglas y pantallas originales. | `PaymentJournalStaging.legacy.AnhoRec` |
| `ItGrupo` | `VARCHAR(1) ?` | Atributo legacy «ItGrupo»; semántica exacta por validar con reglas y pantallas originales. | `PaymentJournalStaging.legacy.ItGrupo` |
| `TipoDept` | `VARCHAR(1) ?` | Atributo legacy «TipoDept»; semántica exacta por validar con reglas y pantallas originales. | `PaymentJournalStaging.legacy.TipoDept` |
| `CodBanRec` | `VARCHAR(3) ?` | Atributo legacy «CodBanRec»; semántica exacta por validar con reglas y pantallas originales. | `PaymentJournalStaging.legacy.CodBanRec` |
| `CtaContb` | `VARCHAR(11) ?` | Atributo legacy «CtaContb»; semántica exacta por validar con reglas y pantallas originales. | `PaymentJournalStaging.legacy.CtaContb` |
| `DescAc` | `VARCHAR(50) ?` | Atributo legacy «DescAc»; semántica exacta por validar con reglas y pantallas originales. | `PaymentJournalStaging.legacy.DescAc` |
| `MontoDeb` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `PaymentJournalStaging.legacy.MontoDeb` |
| `MontoHab` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `PaymentJournalStaging.legacy.MontoHab` |
| `PagoMenos` | `VARCHAR(1) ?` | Atributo legacy «PagoMenos»; semántica exacta por validar con reglas y pantallas originales. | `PaymentJournalStaging.legacy.PagoMenos` |
| `OTipoDep` | `VARCHAR(2) ?` | Atributo legacy «OTipoDep»; semántica exacta por validar con reglas y pantallas originales. | `PaymentJournalStaging.legacy.OTipoDep` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `PaymentJournalStaging.legacy.DelReg` |
| `MontoDebDolar` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `PaymentJournalStaging.legacy.MontoDebDolar` |
| `MontoHabDolar` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `PaymentJournalStaging.legacy.MontoHabDolar` |

## TempMovCxC

- **Propósito probable:** Área temporal para verificar movimientos y diferencias de cuentas por cobrar.
- **Nivel de importancia:** Secundaria
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 3
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `DISCARD_AFTER_RECONCILE`
- **Destino conceptual:** `ReceivableValidationStaging`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReceivableValidationStaging.legacy.Codigo_Cond` |
| `CodPropt` | `VARCHAR(4) !` | Atributo legacy «CodPropt»; semántica exacta por validar con reglas y pantallas originales. | `ReceivableValidationStaging.legacy.CodPropt` |
| `TipoDoc` | `VARCHAR(2) ?` | Atributo legacy «TipoDoc»; semántica exacta por validar con reglas y pantallas originales. | `ReceivableValidationStaging.legacy.TipoDoc` |
| `NroDoc` | `VARCHAR(6) ?` | Número o referencia funcional legacy. | `ReceivableValidationStaging.legacy.NroDoc` |
| `FechaEmi` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReceivableValidationStaging.legacy.FechaEmi` |
| `FechaVen` | `DATETIME ?` | Fecha asociada al registro o proceso. | `ReceivableValidationStaging.legacy.FechaVen` |
| `MontoDoc` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReceivableValidationStaging.legacy.MontoDoc` |
| `TotalPago` | `DOUBLE ?` | Atributo legacy «TotalPago»; semántica exacta por validar con reglas y pantallas originales. | `ReceivableValidationStaging.legacy.TotalPago` |
| `SaldoDoc` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReceivableValidationStaging.legacy.SaldoDoc` |
| `SaldoCalculado` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReceivableValidationStaging.legacy.SaldoCalculado` |
| `Diferencia` | `DOUBLE ?` | Atributo legacy «Diferencia»; semántica exacta por validar con reglas y pantallas originales. | `ReceivableValidationStaging.legacy.Diferencia` |
| `DebCre` | `VARCHAR(1) ?` | Naturaleza débito/crédito codificada. | `ReceivableValidationStaging.legacy.DebCre` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `ReceivableValidationStaging.legacy.ActReg` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReceivableValidationStaging.legacy.DelReg` |

## TempVerifSaldoCxC

- **Propósito probable:** Resultado temporal de verificación de saldos de cuentas por cobrar.
- **Nivel de importancia:** Importante
- **Registros:** 4.258
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_EXCEPTIONS`
- **Destino conceptual:** `ReceivableReconciliationIssue`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CodPropVerif` | `VARCHAR(255) ?` | Atributo legacy «CodPropVerif»; semántica exacta por validar con reglas y pantallas originales. | `ReceivableReconciliationIssue.legacy.CodPropVerif` |
| `NroDocVerif` | `VARCHAR(255) ?` | Número o referencia funcional legacy. | `ReceivableReconciliationIssue.legacy.NroDocVerif` |
| `SaldoDocVerif` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReceivableReconciliationIssue.legacy.SaldoDocVerif` |
| `SaldoCalculado` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReceivableReconciliationIssue.legacy.SaldoCalculado` |
| `Diferencia` | `DOUBLE ?` | Atributo legacy «Diferencia»; semántica exacta por validar con reglas y pantallas originales. | `ReceivableReconciliationIssue.legacy.Diferencia` |
| `CODIGO_COND` | `VARCHAR(3) ?` | Código funcional usado como referencia implícita. | `ReceivableReconciliationIssue.legacy.CODIGO_COND` |

## TIPO_COMPROBANTE

- **Propósito probable:** Catálogo de tipos de comprobante contable.
- **Nivel de importancia:** Importante
- **Registros:** 8
- **Clave primaria declarada:** ID_TCOM
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `JournalEntryType`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_COM` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `JournalEntryType.CODIGO_COM` |
| `DESCRIPCION` | `VARCHAR(50) !` | Texto descriptivo o concepto de negocio. | `JournalEntryType.DESCRIPCION` |
| `ID_TCOM` | `VARCHAR(3) !` | Identificador compuesto o técnico del sistema legacy. | `JournalEntryType.ID_TCOM` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `JournalEntryType.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `JournalEntryType.legacyDeleted/status` |

## TIPO_DOC_CXC

- **Propósito probable:** Modelo alternativo/vacío de tipos de documento por cobrar.
- **Nivel de importancia:** Secundaria
- **Registros:** 0
- **Clave primaria declarada:** ID_DOC
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `COMPARE_WITH_DOC_DE_COBRO`
- **Destino conceptual:** `ReceivableType`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_DOC` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReceivableType.CODIGO_DOC` |
| `CODIGO_CUE` | `VARCHAR(8) !` | Código funcional usado como referencia implícita. | `ReceivableType.CODIGO_CUE` |
| `DESCRIPCION` | `VARCHAR(50) !` | Texto descriptivo o concepto de negocio. | `ReceivableType.DESCRIPCION` |
| `DEBE_HABER` | `VARCHAR(5) !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ReceivableType.DEBE_HABER` |
| `APLICA_INT` | `VARCHAR(2) !` | Atributo legacy «APLICA_INT»; semántica exacta por validar con reglas y pantallas originales. | `ReceivableType.APLICA_INT` |
| `CODIGO_COND` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ReceivableType.communityId (resolver por LegacyKeyMap)` |
| `ID_DOC` | `VARCHAR(6) !` | Identificador compuesto o técnico del sistema legacy. | `ReceivableType.ID_DOC` |
| `ID_CUE` | `VARCHAR(11) !` | Identificador compuesto o técnico del sistema legacy. | `ReceivableType.ID_CUE` |
| `ABREVIADO` | `VARCHAR(6) ?` | Atributo legacy «ABREVIADO»; semántica exacta por validar con reglas y pantallas originales. | `ReceivableType.ABREVIADO` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `ReceivableType.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ReceivableType.legacyDeleted/status` |

## TIPO_GASTO

- **Propósito probable:** Categorías vigentes de gastos.
- **Nivel de importancia:** Crítica
- **Registros:** 10
- **Clave primaria declarada:** ID_TIP
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `ExpenseCategory`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_TIP` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `ExpenseCategory.CODIGO_TIP` |
| `DESCRIPCION` | `VARCHAR(50) !` | Texto descriptivo o concepto de negocio. | `ExpenseCategory.DESCRIPCION` |
| `ID_TIP` | `VARCHAR(3) !` | Identificador compuesto o técnico del sistema legacy. | `ExpenseCategory.ID_TIP` |
| `AplicaTPropt` | `TINYINT(1) ?` | Atributo legacy «AplicaTPropt»; semántica exacta por validar con reglas y pantallas originales. | `ExpenseCategory.AplicaTPropt` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `ExpenseCategory.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `ExpenseCategory.legacyDeleted/status` |

## TIPO_GASTO_ORIGINAL

- **Propósito probable:** Catálogo original de categorías de gasto.
- **Nivel de importancia:** Importante
- **Registros:** 17
- **Clave primaria declarada:** ID_TIP
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `ARCHIVE_COMPARE`
- **Destino conceptual:** `LegacyExpenseCategorySnapshot`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `CODIGO_TIP` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `LegacyExpenseCategorySnapshot.CODIGO_TIP` |
| `DESCRIPCION` | `VARCHAR(50) !` | Texto descriptivo o concepto de negocio. | `LegacyExpenseCategorySnapshot.DESCRIPCION` |
| `ID_TIP` | `VARCHAR(3) !` | Identificador compuesto o técnico del sistema legacy. | `LegacyExpenseCategorySnapshot.ID_TIP` |
| `AplicaTPropt` | `TINYINT(1) ?` | Atributo legacy «AplicaTPropt»; semántica exacta por validar con reglas y pantallas originales. | `LegacyExpenseCategorySnapshot.AplicaTPropt` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `LegacyExpenseCategorySnapshot.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `LegacyExpenseCategorySnapshot.legacyDeleted/status` |

## Tipo_TransBanc

- **Propósito probable:** Catálogo de tipos de transacción bancaria y su contrapartida contable.
- **Nivel de importancia:** Importante
- **Registros:** 12
- **Clave primaria declarada:** ID_TransB
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `BankTransactionType`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_TransB` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `BankTransactionType.Codigo_TransB` |
| `DescTrans` | `VARCHAR(50) !` | Atributo legacy «DescTrans»; semántica exacta por validar con reglas y pantallas originales. | `BankTransactionType.DescTrans` |
| `CtaContTTB` | `VARCHAR(8) ?` | Atributo legacy «CtaContTTB»; semántica exacta por validar con reglas y pantallas originales. | `BankTransactionType.CtaContTTB` |
| `DebCre` | `VARCHAR(1) ?` | Naturaleza débito/crédito codificada. | `BankTransactionType.DebCre` |
| `ID_TransB` | `VARCHAR(3) !` | Identificador compuesto o técnico del sistema legacy. | `BankTransactionType.ID_TransB` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `BankTransactionType.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `BankTransactionType.legacyDeleted/status` |

## TipoCambio

- **Propósito probable:** Tabla alternativa vacía de tasas de cambio.
- **Nivel de importancia:** Secundaria
- **Registros:** 0
- **Clave primaria declarada:** ninguna
- **Índices secundarios:** 0
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `COMPARE_WITH_TASAS`
- **Destino conceptual:** `ExchangeRate`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Fecha` | `DATETIME !` | Fecha asociada al registro o proceso. | `ExchangeRate.Fecha` |
| `TCMonto` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `ExchangeRate.TCMonto` |

## Transaccion_Bancaria

- **Propósito probable:** Movimientos bancarios conciliables en moneda principal.
- **Nivel de importancia:** Crítica
- **Registros:** 2.599
- **Clave primaria declarada:** Id_TB
- **Índices secundarios:** 6
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `BankTransaction`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_TB` | `VARCHAR(8) !` | Código funcional usado como referencia implícita. | `BankTransaction.Codigo_TB` |
| `Codigo_Ban` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `BankTransaction.Codigo_Ban` |
| `Codigo_Cueb` | `VARCHAR(30) !` | Código funcional usado como referencia implícita. | `BankTransaction.Codigo_Cueb` |
| `Codigo_TTB` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `BankTransaction.Codigo_TTB` |
| `Nro_Doc` | `VARCHAR(15) ?` | Número o referencia funcional legacy. | `BankTransaction.Nro_Doc` |
| `Nro_Recbo` | `VARCHAR(15) ?` | Número o referencia funcional legacy. | `BankTransaction.Nro_Recbo` |
| `FechaTB` | `DATETIME !` | Fecha asociada al registro o proceso. | `BankTransaction.FechaTB` |
| `MontoTB` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `BankTransaction.MontoTB` |
| `MontoTBALT` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `BankTransaction.MontoTBALT` |
| `Tasa` | `DOUBLE ?` | Tasa de conversión aplicada a la operación. | `BankTransaction.Tasa` |
| `Codigo_Ben` | `VARCHAR(4) ?` | Código funcional usado como referencia implícita. | `BankTransaction.Codigo_Ben` |
| `Codigo_Pro` | `VARCHAR(4) ?` | Código funcional usado como referencia implícita. | `BankTransaction.Codigo_Pro` |
| `DebCre` | `VARCHAR(1) ?` | Naturaleza débito/crédito codificada. | `BankTransaction.DebCre` |
| `Anho` | `VARCHAR(4) ?` | Año contable o de facturación. | `BankTransaction.Anho` |
| `Mes` | `VARCHAR(2) ?` | Atributo legacy «Mes»; semántica exacta por validar con reglas y pantallas originales. | `BankTransaction.Mes` |
| `Concepto` | `VARCHAR(100) ?` | Texto descriptivo o concepto de negocio. | `BankTransaction.Concepto` |
| `CONCILIADA` | `TINYINT(1) ?` | Atributo legacy «CONCILIADA»; semántica exacta por validar con reglas y pantallas originales. | `BankTransaction.CONCILIADA` |
| `Transf` | `TINYINT(1) ?` | Atributo legacy «Transf»; semántica exacta por validar con reglas y pantallas originales. | `BankTransaction.Transf` |
| `TipoDeptTB` | `VARCHAR(1) ?` | Atributo legacy «TipoDeptTB»; semántica exacta por validar con reglas y pantallas originales. | `BankTransaction.TipoDeptTB` |
| `CheCob` | `TINYINT(1) ?` | Atributo legacy «CheCob»; semántica exacta por validar con reglas y pantallas originales. | `BankTransaction.CheCob` |
| `GenCierre` | `TINYINT(1) ?` | Atributo legacy «GenCierre»; semántica exacta por validar con reglas y pantallas originales. | `BankTransaction.GenCierre` |
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `BankTransaction.communityId (resolver por LegacyKeyMap)` |
| `Id_TB` | `VARCHAR(11) !` | Identificador compuesto o técnico del sistema legacy. | `BankTransaction.Id_TB` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `BankTransaction.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `BankTransaction.legacyDeleted/status` |
| `Contab` | `TINYINT(1) ?` | Atributo legacy «Contab»; semántica exacta por validar con reglas y pantallas originales. | `BankTransaction.Contab` |

## Transaccion_Divisas

- **Propósito probable:** Movimientos bancarios de divisas con moneda y tasa.
- **Nivel de importancia:** Crítica
- **Registros:** 1.870
- **Clave primaria declarada:** Id_TB
- **Índices secundarios:** 6
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `MIGRATE`
- **Destino conceptual:** `BankTransaction`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo_TB` | `VARCHAR(8) !` | Código funcional usado como referencia implícita. | `BankTransaction.Codigo_TB` |
| `Codigo_Ban` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `BankTransaction.Codigo_Ban` |
| `Codigo_Cueb` | `VARCHAR(30) !` | Código funcional usado como referencia implícita. | `BankTransaction.Codigo_Cueb` |
| `Codigo_TTB` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `BankTransaction.Codigo_TTB` |
| `Nro_Doc` | `VARCHAR(15) ?` | Número o referencia funcional legacy. | `BankTransaction.Nro_Doc` |
| `Nro_Recbo` | `VARCHAR(15) ?` | Número o referencia funcional legacy. | `BankTransaction.Nro_Recbo` |
| `FechaTB` | `DATETIME !` | Fecha asociada al registro o proceso. | `BankTransaction.FechaTB` |
| `MontoTB` | `DOUBLE !` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `BankTransaction.MontoTB` |
| `MontoTBALT` | `DOUBLE ?` | Importe monetario; DOUBLE requiere conversión controlada a DECIMAL. | `BankTransaction.MontoTBALT` |
| `Codigo_Ben` | `VARCHAR(4) ?` | Código funcional usado como referencia implícita. | `BankTransaction.Codigo_Ben` |
| `Codigo_Pro` | `VARCHAR(4) ?` | Código funcional usado como referencia implícita. | `BankTransaction.Codigo_Pro` |
| `DebCre` | `VARCHAR(1) ?` | Naturaleza débito/crédito codificada. | `BankTransaction.DebCre` |
| `Anho` | `VARCHAR(4) ?` | Año contable o de facturación. | `BankTransaction.Anho` |
| `Mes` | `VARCHAR(2) ?` | Atributo legacy «Mes»; semántica exacta por validar con reglas y pantallas originales. | `BankTransaction.Mes` |
| `Concepto` | `VARCHAR(100) ?` | Texto descriptivo o concepto de negocio. | `BankTransaction.Concepto` |
| `CONCILIADA` | `TINYINT(1) ?` | Atributo legacy «CONCILIADA»; semántica exacta por validar con reglas y pantallas originales. | `BankTransaction.CONCILIADA` |
| `Transf` | `TINYINT(1) ?` | Atributo legacy «Transf»; semántica exacta por validar con reglas y pantallas originales. | `BankTransaction.Transf` |
| `TipoDeptTB` | `VARCHAR(1) ?` | Atributo legacy «TipoDeptTB»; semántica exacta por validar con reglas y pantallas originales. | `BankTransaction.TipoDeptTB` |
| `CheCob` | `TINYINT(1) ?` | Atributo legacy «CheCob»; semántica exacta por validar con reglas y pantallas originales. | `BankTransaction.CheCob` |
| `GenCierre` | `TINYINT(1) ?` | Atributo legacy «GenCierre»; semántica exacta por validar con reglas y pantallas originales. | `BankTransaction.GenCierre` |
| `Codigo_Cond` | `VARCHAR(3) !` | Código funcional usado como referencia implícita. | `BankTransaction.communityId (resolver por LegacyKeyMap)` |
| `Id_TB` | `VARCHAR(11) !` | Identificador compuesto o técnico del sistema legacy. | `BankTransaction.Id_TB` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `BankTransaction.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `BankTransaction.legacyDeleted/status` |
| `Contab` | `TINYINT(1) ?` | Atributo legacy «Contab»; semántica exacta por validar con reglas y pantallas originales. | `BankTransaction.Contab` |
| `MONEDA` | `INTEGER ?` | Código numérico de moneda sin catálogo relacional. | `BankTransaction.MONEDA` |
| `Tasa` | `DOUBLE ?` | Tasa de conversión aplicada a la operación. | `BankTransaction.Tasa` |

## USUARIO

- **Propósito probable:** Usuarios legacy con credenciales reversibles en texto plano.
- **Nivel de importancia:** Crítica
- **Registros:** 12
- **Clave primaria declarada:** Codigo
- **Índices secundarios:** 1
- **Claves foráneas declaradas:** 0
- **Decisión preliminar:** `IDENTITY_ONLY_RESET_PASSWORD`
- **Destino conceptual:** `AppUser`

| Campo | Tipo y nulabilidad | Interpretación | Nueva entidad recomendada |
|---|---|---|---|
| `Codigo` | `VARCHAR(4) !` | Atributo legacy «Codigo»; semántica exacta por validar con reglas y pantallas originales. | `AppUser.legacyCode` |
| `USUARIO` | `VARCHAR(30) ?` | Atributo legacy «USUARIO»; semántica exacta por validar con reglas y pantallas originales. | `AppUser.displayName` |
| `CLAVE` | `VARCHAR(7) ?` | Atributo legacy «CLAVE»; semántica exacta por validar con reglas y pantallas originales. | `NO MIGRAR; forzar restablecimiento` |
| `FECHA1` | `DATETIME ?` | Fecha asociada al registro o proceso. | `LegacyLoginEvent` |
| `HORA1` | `DATETIME ?` | Atributo legacy «HORA1»; semántica exacta por validar con reglas y pantallas originales. | `LegacyLoginEvent` |
| `FECHA2` | `DATETIME ?` | Fecha asociada al registro o proceso. | `LegacyLoginEvent` |
| `HORA2` | `DATETIME ?` | Atributo legacy «HORA2»; semántica exacta por validar con reglas y pantallas originales. | `LegacyLoginEvent` |
| `CONDICION` | `VARCHAR(8) ?` | Atributo legacy «CONDICION»; semántica exacta por validar con reglas y pantallas originales. | `AppUser.status` |
| `ActReg` | `VARCHAR(50) ?` | Metadato legacy de modificación; semántica no confirmada. | `AppUser.legacyAuditMetadata` |
| `DelReg` | `TINYINT(1) ?` | Indicador de eliminación lógica; validar valores y uso real. | `AppUser.legacyDeleted/status` |

