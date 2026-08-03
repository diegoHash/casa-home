# Auditoría legacy Caribbean → CASA

## Entregables

1. [`AUDITORIA_Y_ARQUITECTURA_CASA.md`](./AUDITORIA_Y_ARQUITECTURA_CASA.md):
   reconstrucción funcional, procesos, riesgos, arquitectura objetivo y plan de
   migración.
2. [`PERFIL_CALIDAD_DATOS.md`](./PERFIL_CALIDAD_DATOS.md): resultados medidos
   sobre los 316.645 registros.
3. [`DICCIONARIO_DATOS_LEGACY.md`](./DICCIONARIO_DATOS_LEGACY.md): las 120
   tablas y sus 1.747 campos, con destino conceptual.
4. [`RELACIONES_INFERIDAS.md`](./RELACIONES_INFERIDAS.md): mapa de relaciones
   no declaradas y cómo validarlas.
5. [`MAPEO_LEGACY_A_CASA.md`](./MAPEO_LEGACY_A_CASA.md): reglas de
   transformación y compuertas del asistente.
6. [`inventory.json`](./inventory.json) y [`inventory.csv`](./inventory.csv):
   inventario reproducible para consumo técnico.
7. `profile-*.tsv`: evidencia agregada de las consultas de calidad, sin
   contraseñas ni PII copiada deliberadamente.

## Estado

- Descubrimiento estructural: completo.
- Perfilado inicial de datos: completo.
- Diseño conceptual de destino: completo.
- Mapeo preliminar: completo.
- Validación con Luis Venezuela: pendiente.
- Resolución de excepciones y reglas monetarias: pendiente.
- Migración simulada a entidades CASA: pendiente.
- Conciliación y cutover: pendiente.

Estos documentos no autorizan una importación directa. Los hallazgos críticos
del perfil deben resolverse antes de habilitar la ejecución del asistente.
