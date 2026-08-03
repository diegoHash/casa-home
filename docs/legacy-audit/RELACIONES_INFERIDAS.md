# Relaciones implícitas del sistema legacy

El dump no declara ninguna `FOREIGN KEY`. Las relaciones siguientes son
candidatas y deben validarse por cobertura de claves, cardinalidad y reglas del
sistema original.

## Relaciones de alta confianza

| Hija | Campo(s) | Padre | Campo(s) | Evidencia |
|---|---|---|---|---|
| `PROPIETARIO` | `CODIGO_COND` | `CONDOMINIO` | `CODIGO_COND` | nombre, dominio y clave `ID_PRO` concatenada |
| `Aviso` | `CODIGO_COND` | `CONDOMINIO` | `CODIGO_COND` | nombre y `ID_AVI` concatenado |
| `Detalle_Aviso` | `ID_AVI` | `Aviso` | `ID_AVI` | identificador homónimo |
| `Detalle_Aviso` | `ID_CON` | `CONCEPTO_FACT` | `ID_CON` | identificador homónimo |
| `DetAvisoPropt` | `ID_AVI` | `Aviso` | `ID_AVI` | identificador homónimo |
| `DetAvisoPropt` | `ID_CON` | `CONCEPTO_FACT` | `ID_CON` | identificador homónimo |
| `DetAvisoPropt` | `CODIGO_PRO` + comunidad del aviso | `PROPIETARIO` | `CODIGO_PRO` + `CODIGO_COND` | destino individual del aviso |
| `CargaDocs` | `Codigo_Cond`, `CodPropt` | `PROPIETARIO` | `CODIGO_COND`, `CODIGO_PRO` | auxiliar por propietario/unidad |
| `CargaDocs` | `Codigo_Cond`, `TipoDoc` | `Doc_De_Cobro` | `CODIGO_COND`, `COD_DocC` | tipo documental |
| `CargaDocsDetalle` | `Codigo_Cond`, `CodProptD`, `NroDocD` | `CargaDocs` | `Codigo_Cond`, `CodPropt`, `NroDoc` | movimiento aplicado al documento |
| `Recibos` | `Codigo_Cond`, `CodProptRec` | `PROPIETARIO` | `CODIGO_COND`, `CODIGO_PRO` | pago de la cuenta |
| `RecibosOtrosing` | `Codigo_Cond`, `NroRecOI` | `Recibos` | `Codigo_Cond`, `NroRec` | línea del recibo |
| `RecibosOtrosing` | `CodConcROI` | `ConcOtrosIng` | `CodConcOI` | concepto de ingreso |
| `CUENTA_BANC` | `CODIGO_BAN` | `BANCO` | `CODIGO_BAN`/`ID_BAN` | banco de la cuenta |
| `CUENTA_BANC` | `CODIGO_COND` | `CONDOMINIO` | `CODIGO_COND` | cuenta de la entidad |
| `Transaccion_Bancaria` | `Codigo_Cond`, `Codigo_Cueb` | `CUENTA_BANC` | `CODIGO_COND`, `CODIGO_CUEB` | movimiento de cuenta |
| `Transaccion_Divisas` | `Codigo_Cond`, `Codigo_Cueb` | `CUENTA_BANC` | `CODIGO_COND`, `CODIGO_CUEB` | movimiento de cuenta |
| `Transaccion_Bancaria` | `Codigo_TTB` | `Tipo_TransBanc` | `Codigo_TransB` | tipo de movimiento |
| `Transaccion_Divisas` | `Codigo_TTB` | `Tipo_TransBanc` | `Codigo_TransB` | tipo de movimiento |
| `EmisionCheque` | `CODIGO_COND`, `CodBenef` | `BENEFICIARIO` | `CODIGO_COND`, `CODIGO_BEN` | receptor del egreso |
| `EmisionChequeDeta` | `CODIGO_COND`, `Codigo_Emi` | `EmisionCheque` | `CODIGO_COND`, `Codigo_Emi` | detalle del egreso |
| `Comprobante` | `ID_TCOM` | `TIPO_COMPROBANTE` | `ID_TCOM` | tipo de asiento |
| `Comprobante_Detalle` | `ID_COMP` | `Comprobante` | `ID_COMP` | partidas del asiento |
| `Comprobante_Detalle` | `ID_CUE` | `PLAN` | `ID_CUE` | cuenta contable |
| `Perfil_User` | `CodUser` | `USUARIO` | `Codigo` | permisos del usuario |
| `AuditoriaU` | `UsuarioId` | `USUARIO` | `Codigo` | actor de la operación |

## Relaciones que requieren validación

| Hija/campo | Padre candidato | Riesgo o duda |
|---|---|---|
| `RecibosDetalle(Codigo_Cond, NroRecD)` | `Recibos(Codigo_Cond, NroRec)` | el detalle omite mes y año; puede ser ambiguo si la numeración reinicia |
| `CargaDocs.NroRef` | `Aviso.CODIGO_AVI` u otro documento | valores y longitud requieren perfilado |
| `CargaDocsDetalle.NroTrans` | recibo, transacción o secuencia propia | el nombre no identifica el padre |
| `EmisionChequeDeta.CodConc` | `CONCEPTO_FACT.CODIGO_CON` | probable concepto de gasto, pero falta comunidad/sufijo |
| `Factura.CODIGO_CON` | `CONCEPTO_FACT.CODIGO_CON` | tabla vacía; no hay datos para probar |
| `CONCEPTO_FACT.CODIGO_TIP/ID_TIP` | `TIPO_GASTO` | `ID_TIP` no incluye comunidad y el catálogo parece global |
| `CONCEPTO_FACT.ID_CUE/ID_CUEG` | `PLAN.ID_CUE` | cuenta operativa y cuenta de gasto; validar significado |
| `CUENTA_BANC.ID_CUE`, `CtaContDNI` | `PLAN` | varias cuentas contables con roles distintos |
| `Doc_De_Cobro.ID_CUED/ID_CUEH` | `PLAN.ID_CUE` | cuentas de débito/haber |
| `Tipo_TransBanc.CtaContTTB` | `PLAN.CODIGO_CUE` | catálogo global contra plan por comunidad |
| `ControlDNI.NroRecibo` | `Recibos.NroRec` | puede estar vacío o ser asignado después |
| `Transaccion_Bancaria.Nro_Recbo` | `Recibos.NroRec` | formato y reinicio de secuencia |
| `Transaccion_Bancaria.Codigo_Pro` | `PROPIETARIO.CODIGO_PRO` | requiere `Codigo_Cond` |
| `Transaccion_Bancaria.Codigo_Ben` | `BENEFICIARIO.CODIGO_BEN` | requiere `Codigo_Cond` |
| `Alicuotas` | `PROPIETARIO.ALICUOTAT/ALICUOTAC` | puede ser catálogo de valores, no relación directa |
| `Conjuntos` | `CONDOMINIO.CONJUNTOR` | la tabla está vacía en este dump |

## Identificadores concatenados observados

| Identificador | Construcción probable | Estado |
|---|---|---|
| `PROPIETARIO.ID_PRO` | `CODIGO_PRO + CODIGO_COND` | confirmado por muestras |
| `PLAN.ID_CUE` | `CODIGO_CUE + CODIGO_COND` | confirmado por muestras |
| `CUENTA_BANC.ID_CUEB` | `CODIGO_CUEB + CODIGO_COND` | confirmado por muestras |
| `Doc_De_Cobro.ID_DocC` | `COD_DocC + CODIGO_COND` | confirmado por muestras |
| `Aviso.ID_AVI` | `CODIGO_AVI + CODIGO_COND` | confirmado por muestras |
| `Transaccion_Bancaria.Id_TB` | `Codigo_TB + Codigo_Cond` | confirmado por muestras |
| `EmisionCheque.ID_Emi` | `Codigo_Emi + CODIGO_COND` | confirmado por muestras |
| `Comprobante.ID_COMP` | código + comunidad + período | evidencia de muestras; validar orden exacto |
| `CONCEPTO_FACT.ID_CON` | concepto + comunidad/conjunto + discriminador | sufijo observado; semántica por validar |

CASA conservará estos valores en `LegacyKeyMap`. No volverá a construir claves
primarias concatenando códigos de negocio.
