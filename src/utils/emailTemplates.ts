/**
 * HTML Email Templates for CASA Owner Access Registration & Approvals.
 * Adheres strictly to CASA official visual identity (Navy #071a33, Gold #b08a3c, warm backdrop #f8f6f0).
 */

export interface OwnerRequestEmailData {
  folioNumber: string;
  docType: string;
  docNumber: string;
  fullName: string;
  propertyCode: string;
  email: string;
  phone?: string;
  createdAt?: string;
}

export function renderOwnerRegistrationEmailHtml(data: OwnerRequestEmailData): string {
  const dateStr = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString('es-VE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('es-VE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Solicitud - CASA</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8f6f0;
      color: #0b1d33;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(7, 26, 51, 0.08);
      border: 1px solid rgba(7, 26, 51, 0.08);
    }
    .header {
      background-color: #071a33;
      padding: 36px 32px;
      text-align: center;
      position: relative;
    }
    .header-logo {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 0.2em;
      color: #ffffff;
      margin: 0;
    }
    .header-subtitle {
      color: #f0cf77;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.25em;
      margin-top: 6px;
    }
    .badge {
      display: inline-block;
      background-color: #fcf8ee;
      color: #725421;
      border: 1px solid #d8c28e;
      padding: 6px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }
    .content {
      padding: 36px 32px;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      color: #071a33;
      margin-top: 0;
      margin-bottom: 8px;
    }
    .text {
      font-size: 14px;
      color: #4a5568;
      margin-bottom: 24px;
    }
    .card {
      background-color: #fbfaf7;
      border: 1px solid rgba(7, 26, 51, 0.1);
      border-radius: 16px;
      padding: 20px 24px;
      margin-bottom: 24px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px dashed rgba(7, 26, 51, 0.08);
      font-size: 13px;
    }
    .row:last-child {
      border-bottom: none;
    }
    .row-label {
      color: #718096;
      font-weight: 600;
    }
    .row-value {
      color: #071a33;
      font-weight: 700;
      text-align: right;
    }
    .notice-box {
      background-color: #faf6ec;
      border-left: 4px solid #b08a3c;
      padding: 16px 20px;
      border-radius: 0 12px 12px 0;
      margin-bottom: 24px;
    }
    .notice-title {
      font-size: 13px;
      font-weight: 700;
      color: #725421;
      margin: 0 0 4px 0;
    }
    .notice-desc {
      font-size: 12px;
      color: #594017;
      margin: 0;
      line-height: 1.5;
    }
    .footer {
      background-color: #f8f6f0;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid rgba(7, 26, 51, 0.06);
    }
    .footer-text {
      font-size: 11px;
      color: #a0aec0;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="header-logo">CASA</h1>
      <div class="header-subtitle">Plataforma de Gestión Residencial</div>
    </div>
    
    <div class="content">
      <div style="text-align: center;">
        <span class="badge">Nº Folio: ${data.folioNumber}</span>
      </div>
      
      <h2 class="title" style="text-align: center;">¡Solicitud de Registro Recibida!</h2>
      <p class="text" style="text-align: center;">
        Hemos registrado exitosamente tu solicitud de acceso al Portal del Propietario.
      </p>

      <div class="card">
        <div class="row">
          <span class="row-label">Folio de Solicitud:</span>
          <span class="row-value" style="color: #b08a3c;">${data.folioNumber}</span>
        </div>
        <div class="row">
          <span class="row-label">Titular / Propietario:</span>
          <span class="row-value">${data.fullName}</span>
        </div>
        <div class="row">
          <span class="row-label">Cédula / Documento:</span>
          <span class="row-value">${data.docType}-${data.docNumber}</span>
        </div>
        <div class="row">
          <span class="row-label">Código de Inmueble:</span>
          <span class="row-value">${data.propertyCode}</span>
        </div>
        <div class="row">
          <span class="row-label">Correo Electrónico:</span>
          <span class="row-value">${data.email}</span>
        </div>
        ${data.phone ? `<div class="row"><span class="row-label">Teléfono:</span><span class="row-value">${data.phone}</span></div>` : ''}
        <div class="row">
          <span class="row-label">Fecha de Solicitud:</span>
          <span class="row-value">${dateStr}</span>
        </div>
      </div>

      <div class="notice-box">
        <h4 class="notice-title">📋 Próximos pasos en la Administración</h4>
        <p class="notice-desc">
          Tu solicitud será verificada por el equipo administrativo y la Junta Directiva de tu comunidad. Una vez aprobada tu vinculación con el inmueble <b>${data.propertyCode}</b>, recibirás un <b>PIN temporal de 6 dígitos</b> en este correo electrónico para completar tu primer inicio de sesión.
        </p>
      </div>

      <p class="text" style="font-size: 12px; text-align: center; color: #718096; margin-bottom: 0;">
        Si no realizaste esta solicitud, por favor ignora este correo o comunícate con la administración de tu condominio.
      </p>
    </div>

    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} CASA — Ecosistema de Gestión de Condominios. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function renderOwnerApprovalEmailHtml(data: OwnerRequestEmailData, tempPin: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acceso Aprobado - CASA</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8f6f0;
      color: #0b1d33;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(7, 26, 51, 0.08);
      border: 1px solid rgba(7, 26, 51, 0.08);
    }
    .header {
      background-color: #071a33;
      padding: 36px 32px;
      text-align: center;
    }
    .header-logo {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 0.2em;
      color: #ffffff;
      margin: 0;
    }
    .header-subtitle {
      color: #f0cf77;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.25em;
      margin-top: 6px;
    }
    .content {
      padding: 36px 32px;
    }
    .pin-box {
      background-color: #071a33;
      color: #f0cf77;
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
      border: 1px solid #b08a3c;
    }
    .pin-code {
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 0.35em;
      margin: 12px 0 4px 0;
      color: #ffffff;
    }
    .footer {
      background-color: #f8f6f0;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid rgba(7, 26, 51, 0.06);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="header-logo">CASA</h1>
      <div class="header-subtitle">Portal del Propietario — Acceso Aprobado</div>
    </div>
    
    <div class="content">
      <h2 style="font-size: 22px; color: #071a33; text-align: center; margin-top: 0;">¡Tu acceso ha sido aprobado!</h2>
      <p style="font-size: 14px; color: #4a5568; text-align: center;">
        Estimado(a) <b>${data.fullName}</b>, la Administración ha verificado y aprobado tu registro para el inmueble <b>${data.propertyCode}</b> (Folio: ${data.folioNumber}).
      </p>

      <div class="pin-box">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: #f0cf77;">Tu PIN Temporal de Acceso</div>
        <div class="pin-code">${tempPin}</div>
        <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">Utilízalo junto a tu correo <b>${data.email}</b></div>
      </div>

      <p style="font-size: 13px; color: #4a5568; line-height: 1.6;">
        <b>Instrucciones de ingreso:</b><br/>
        1. Ingresa a la página de inicio de sesión del Portal de Propietarios.<br/>
        2. Introduce tu correo electrónico: <b>${data.email}</b>.<br/>
        3. En el campo de contraseña, escribe tu <b>PIN de 6 dígitos: ${tempPin}</b>.<br/>
        4. Al ingresar por primera vez, el sistema te solicitará definir tu contraseña definitiva.
      </p>
    </div>

    <div class="footer">
      <p style="font-size: 11px; color: #a0aec0; margin: 0;">© ${new Date().getFullYear()} CASA — Ecosistema Residencial.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
