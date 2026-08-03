import type { OnboardingStageKey } from './onboarding';

export interface OnboardingStageGuide {
  purpose: string;
  result: string;
  tasks: string[];
  caution: string;
  actionLabel: string;
}

export const onboardingStageGuides: Record<OnboardingStageKey, OnboardingStageGuide> = {
  identity: {
    purpose: 'Confirmar que CASA sabe exactamente quién contrata, cuál comunidad será administrada y bajo qué licencia operará.',
    result: 'Una ficha contractual identificable, con RIF, ubicación, contacto responsable y licencia vigente.',
    tasks: [
      'Revisar nombre comercial y razón social.',
      'Confirmar RIF, dirección y ubicación de la comunidad.',
      'Registrar nombre, correo y teléfono del contacto responsable.',
      'Verificar vigencia y estado de la licencia CASA.',
    ],
    caution: 'Esta etapa no crea todavía inmuebles, propietarios ni accesos. Solo establece la identidad contractual.',
    actionLabel: 'Abrir ficha del cliente',
  },
  sources: {
    purpose: 'Registrar y custodiar todos los archivos o sistemas de donde provendrá la información histórica.',
    result: 'Fuentes inventariadas, extraídas, identificadas mediante hash y con volumen de tablas y filas comprobado.',
    tasks: [
      'Registrar cada archivo Access, Excel, CSV o fuente manual.',
      'Definir el período histórico cubierto por cada fuente.',
      'Ejecutar la extracción controlada sin modificar el original.',
      'Generar el hash de integridad y contabilizar tablas y registros.',
      'Resolver cualquier lote fallido antes de avanzar.',
    ],
    caution: 'Registrar el nombre de un archivo no significa que fue leído, validado ni importado.',
    actionLabel: 'Ir a fuentes y lotes',
  },
  structure: {
    purpose: 'Construir el mapa físico y económico de la comunidad que CASA utilizará como fuente única.',
    result: 'Edificios o centros comerciales, apartamentos, townhouses, locales, concesiones y alícuotas correctamente identificados.',
    tasks: [
      'Crear las ubicaciones necesarias: edificios o centros comerciales.',
      'Registrar cada apartamento, townhouse y local mediante un código único.',
      'Asignar la ubicación correspondiente cuando aplique.',
      'Definir alícuota y vigencia histórica de cada inmueble.',
      'Registrar concesiones separadamente cuando no sean inmuebles con alícuota.',
    ],
    caution: 'El total de unidades y la suma de alícuotas deben poder reconciliarse con los documentos oficiales.',
    actionLabel: 'Configurar estructura',
  },
  people: {
    purpose: 'Crear el directorio único de personas y vincularlas con sus relaciones reales dentro de la comunidad.',
    result: 'Propietarios, copropietarios, junta y personal identificados sin duplicados y con vigencias históricas.',
    tasks: [
      'Registrar cada persona una sola vez mediante su documento.',
      'Vincular propietarios con sus inmuebles y porcentaje de participación.',
      'Registrar copropiedad y períodos de vigencia.',
      'Designar integrantes y cargos de la junta.',
      'Vincular personal y modalidad contractual respetando incompatibilidades.',
    ],
    caution: 'Una persona puede ser propietaria y trabajadora, pero no puede ser trabajadora e integrante vigente de la junta simultáneamente.',
    actionLabel: 'Configurar personas',
  },
  finances: {
    purpose: 'Trasladar la historia económica sin alterar saldos, pagos, deudas, fondos ni movimientos del cliente.',
    result: 'Saldos iniciales y detalle histórico conciliados contra el sistema anterior y los soportes contables.',
    tasks: [
      'Importar avisos de cobro y conceptos históricos.',
      'Importar pagos, anticipos, cruces de cuenta y ajustes.',
      'Preservar fondos, provisiones y cuotas especiales.',
      'Comparar saldos por inmueble antes y después de la migración.',
      'Documentar y resolver toda diferencia financiera.',
    ],
    caution: 'No basta con que el total general coincida: también debe cuadrar cada inmueble y cada período.',
    actionLabel: 'Revisar conciliación financiera',
  },
  operations: {
    purpose: 'Preparar las reglas y responsables con los que la comunidad trabajará desde el primer día.',
    result: 'Tesorería, métodos de pago, responsable de salida y fecha de corte definidos.',
    tasks: [
      'Asignar el coordinador responsable de la incorporación.',
      'Definir la fecha exacta de corte entre el sistema anterior y CASA.',
      'Registrar cuentas bancarias y métodos de pago aceptados.',
      'Revisar políticas, permisos y canales de comunicación.',
      'Confirmar quién atenderá incidencias y quién administrará cada área.',
    ],
    caution: 'La fecha de corte determina desde cuándo CASA se convierte en la fuente operativa oficial.',
    actionLabel: 'Configurar operación',
  },
  validation: {
    purpose: 'Demostrar con evidencia que lo migrado coincide con la realidad jurídica, inmobiliaria y financiera.',
    result: 'Un expediente conciliado, sin críticos abiertos y con cada advertencia resuelta o aceptada formalmente.',
    tasks: [
      'Ejecutar controles de estructura, personas, alícuotas y finanzas.',
      'Comparar totales de origen contra totales importados.',
      'Resolver todos los hallazgos críticos.',
      'Resolver o aceptar expresamente cada advertencia.',
      'Conservar evidencia y trazabilidad de las decisiones.',
    ],
    caution: 'Marcar un hallazgo como resuelto debe estar respaldado por una corrección o una evidencia verificable.',
    actionLabel: 'Abrir hallazgos',
  },
  activation: {
    purpose: 'Autorizar el cambio controlado desde preparación hacia operación real de la comunidad en CASA.',
    result: 'La comunidad queda habilitada para usuarios reales, procesos operativos y datos de producción desde la fecha de corte.',
    tasks: [
      'Confirmar que las siete etapas anteriores están aprobadas.',
      'Repetir en el backend todas las validaciones críticas.',
      'Congelar la fuente anterior en la fecha y hora de corte acordadas.',
      'Ejecutar una última carga diferencial si hubo movimientos recientes.',
      'Obtener aprobación explícita de CASA y del responsable del cliente.',
      'Habilitar accesos, notificaciones y operación productiva.',
    ],
    caution: 'La etapa 8 no es otra carga de datos. Es el acto formal de salida en vivo. Debe exigir doble aprobación, registro de auditoría y posibilidad de detener el proceso.',
    actionLabel: 'Revisar preparación de salida',
  },
};
