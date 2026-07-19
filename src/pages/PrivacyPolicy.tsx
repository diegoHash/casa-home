import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f7] selection:bg-white/20">
      <div
        className="mx-auto px-6 pt-24 pb-32"
        style={{
          maxWidth: '750px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "San Francisco", "Montserrat", sans-serif'
        }}
      >
        <header className="mb-24 text-center">
          <h1
            className="text-4xl md:text-5xl tracking-tight text-white mb-6"
            style={{ fontWeight: 200, letterSpacing: '-0.03em' }}
          >
            CASA
          </h1>
          <p className="text-[#a1a1a6] text-lg font-light tracking-wide">
            Ecosistema de Confianza y Privacidad.
          </p>
        </header>

        <main className="space-y-24">
          <section className="space-y-6">
            <h2 className="text-2xl font-medium tracking-tight text-white">1. Visión Minimalista</h2>
            <p className="text-[#86868b] leading-relaxed font-light text-[17px]">
              En CASA, concebimos la privacidad no como una obligación legal, sino como el cimiento de nuestro ecosistema. Diseñamos nuestras operaciones de gestión bajo el principio de minimización de datos: solo recopilamos lo estrictamente necesario para prestar y proteger los servicios de la plataforma.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-medium tracking-tight text-white">2. Datos Recopilados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-3 border-t border-[#333336] pt-6">
                <h3 className="text-[#f5f5f7] font-medium">Operativos</h3>
                <p className="text-[#86868b] leading-relaxed font-light text-[15px]">
                  Información relacionada con la logística, acceso y preferencias durante la estadía.
                </p>
              </div>
              <div className="space-y-3 border-t border-[#333336] pt-6">
                <h3 className="text-[#f5f5f7] font-medium">Financieros</h3>
                <p className="text-[#86868b] leading-relaxed font-light text-[15px]">
                  Historial de transacciones para cierres de caja y facturación transparente.
                </p>
              </div>
              <div className="space-y-3 border-t border-[#333336] pt-6">
                <h3 className="text-[#f5f5f7] font-medium">De Usuario</h3>
                <p className="text-[#86868b] leading-relaxed font-light text-[15px]">
                  Credenciales de acceso, roles asignados y preferencias del entorno.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-medium tracking-tight text-white">3. Uso de la Información</h2>
            <p className="text-[#86868b] leading-relaxed font-light text-[17px]">
              La información que fluye a través de nuestro sistema tiene un único propósito: optimizar la experiencia de propietarios y huéspedes. Analizamos patrones de uso de forma anónima para anticipar necesidades operativas, agilizar los procesos de check-in y garantizar que los servicios de alta gama superen constantemente las expectativas.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-medium tracking-tight text-white">4. Arquitectura de Protección</h2>
            <p className="text-[#86868b] leading-relaxed font-light text-[17px] mb-8">
              Nuestro ecosistema digital está blindado por una infraestructura técnica de grado bancario.
            </p>

            <div className="space-y-10 pl-4 border-l border-[#333336]">
              <div className="space-y-2">
                <h3 className="text-[#f5f5f7] font-medium">Seguridad Perimetral (Cloudflare)</h3>
                <p className="text-[#86868b] leading-relaxed font-light text-[15px]">
                  Todo el tráfico del ecosistema está resguardado por cifrado SSL estricto. Implementamos protección WAF (Web Application Firewall) para mitigar amenazas en tiempo real antes de que alcancen nuestra red.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-[#f5f5f7] font-medium">Autenticación Dinámica (JWT)</h3>
                <p className="text-[#86868b] leading-relaxed font-light text-[15px]">
                  El control de acceso (RBAC) se gestiona mediante tokens temporales encriptados. Cada sesión es validada y expira de forma segura para prevenir accesos no autorizados.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-[#f5f5f7] font-medium">Resiliencia y Modo Offline</h3>
                <p className="text-[#86868b] leading-relaxed font-light text-[15px]">
                  Para mantener la continuidad operativa, utilizamos almacenamiento local seguro (IndexedDB/Dexie). Los datos se cifran en el dispositivo y se sincronizan preservando su integridad absoluta una vez restaurada la conexión.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-[#f5f5f7] font-medium">Trazabilidad Absoluta</h3>
                <p className="text-[#86868b] leading-relaxed font-light text-[15px]">
                  Mantenemos logs de auditoría inmutables para operaciones críticas. Esta trazabilidad garantiza responsabilidad, transparencia y seguridad dentro de todo el ecosistema.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-medium tracking-tight text-white">5. Tus Derechos</h2>
            <p className="text-[#86868b] leading-relaxed font-light text-[17px]">
              Tienes control absoluto sobre tu huella digital. Puedes solicitar en cualquier momento la revisión, exportación o eliminación permanente de tu información. Para gestionar tus datos, comunícate con nuestro equipo de conserjería digital a través del panel de control o nuestro soporte corporativo.
            </p>
          </section>
        </main>

        <footer className="mt-32 pt-12 border-t border-[#1c1c1e] text-center">
          <p className="text-[#515154] text-sm font-light">
            CASA. Toda tu comunidad. Un solo sistema.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
