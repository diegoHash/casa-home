# CASA Home

Sitio oficial de **CASA — Central de Administración y Servicios Automatizados**.

> Toda tu comunidad. Un solo sistema.

Dominio oficial: [somoscasa.site](https://somoscasa.site)

## Experiencias incluidas

- Landing comercial: `/`
- Solicitud de demo: `/solicitar-demo`
- Acceso de propietarios: `/login`
- Demo del portal de propietarios: `/portal?demo=1`
- Acceso del personal: `/staff-login`
- Acceso global CASA Control: `/control-login`
- Super Admin CASA: `/dashboard`
- Incorporación y migración por cliente: `/dashboard` → `Incorporación`
- Núcleo multi-condominio: `/dashboard` → `Núcleo CASA`
- Conferencias CASA: `/conferencias`

El modelo y las reglas de dominio del núcleo están documentados en [`docs/NUCLEO_CASA.md`](docs/NUCLEO_CASA.md).

El Super Admin reúne clientes, solvencia, licencias integrales, conciliaciones, renovación por pago, usuarios de plataforma y auditoría. Durante el desarrollo local puede revisarse con `/dashboard?demo=1`; este acceso no existe en producción.

## Desarrollo local

```bash
npm install
npm run dev
```

## Validación

```bash
npm run lint
npm run build
```

## Tecnología

React, TypeScript, Vite, Tailwind CSS y LiveKit.

Los endpoints operativos heredados se conservan temporalmente mientras los servicios se migran a la infraestructura de `somoscasa.site`.
