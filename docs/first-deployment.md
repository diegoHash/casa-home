# Primer despliegue de CASA Home

## Arquitectura propuesta

- Publicar `dist/` en un bucket S3 privado, servido por CloudFront con Origin
  Access Control (OAC). No habilitar hosting web público en el bucket.
- Usar `somoscasa.site` como dominio del frontend, según el README actual, con
  certificado TLS en CloudFront y DNS apuntando a la distribución.
- CloudFront requiere que el certificado ACM para el frontend esté en
  `us-east-1`; el certificado de `api.somoscasa.site` se solicita en la región
  del ALB.
- Publicar el API en `api.somoscasa.site` detrás del Application Load Balancer.
  El frontend llama al API por HTTPS y Nest permite el origen del sitio.
- El servicio de conferencias sigue siendo una dependencia externa en
  `turn.caribbean-one.site`; no forma parte de estos dos repositorios.

## Build del frontend

El sitio se compila en Vite. `VITE_*` se incrusta en el JavaScript público; no
colocar secretos en estas variables.

```powershell
$env:VITE_CASA_API_URL = 'https://api.somoscasa.site/v1'
$env:VITE_CONFERENCE_BACKEND_URL = 'https://turn.caribbean-one.site'
$env:VITE_CONFERENCE_SIGNALING_URL = 'wss://turn.caribbean-one.site/ws'
$env:VITE_CONFERENCE_SFU_ENABLED = 'true'
npm ci
npm run build
```

Subir el contenido de `dist/` al bucket de frontend. El bucket debe permanecer
privado y CloudFront debe acceder mediante OAC. Para preservar navegación de
React Router, configurar una reescritura SPA o respuestas 403/404 de CloudFront
que sirvan `/index.html` con estado 200. Aplicar `public/_headers` mediante una
política de headers de CloudFront equivalente; el archivo `_headers` no es
interpretado automáticamente por S3/CloudFront.

Replicar la política actual de `public/_headers`: no guardar en caché `/`,
`index.html` ni `manifest.json`; revalidar `/assets/*`; y servir el manifiesto
con tipo `application/manifest+json`.

## Configuración coordinada con casa-api

Configurar en el API:

```dotenv
WEB_ORIGIN=https://somoscasa.site
```

Si se servirá también `www.somoscasa.site`, incluir ambos orígenes en `WEB_ORIGIN`
o redirigir `www` al dominio canónico. El certificado del ALB debe cubrir
`api.somoscasa.site`; el certificado de CloudFront debe cubrir el dominio del
frontend y residir en la región requerida por CloudFront.

## Revisiones antes de publicar

1. Confirmar que el API, ALB, certificado, DNS y bucket de frontend existen.
2. Confirmar que `turn.caribbean-one.site` está operativo y permite los orígenes
   del sitio; de lo contrario, el resto del portal puede funcionar pero las
   conferencias no.
3. Construir desde el commit/tag aprobado; revisar cambios locales antes de
   publicar y nunca subir `.env` ni datos de desarrollo.
4. Subir `dist/`, invalidar `/index.html` y probar rutas profundas como
   `/login`, `/dashboard` y `/portal` junto con llamadas al API y WebSocket de
   conferencias.

El build actual se genera sin errores. Vite avisa que el bundle principal
minificado supera 500 kB; es una advertencia de rendimiento, no un error que
bloquee el primer despliegue.

Referencias oficiales: [restringir el origen S3 con OAC](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-origin.html), [certificados HTTPS y dominios alternativos de CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html) y [respuestas de error de CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/custom-error-pages-procedure.html).
