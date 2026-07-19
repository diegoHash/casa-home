import React from 'react';

const TermsOfService: React.FC = () => {
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
            Condiciones del Servicio
          </h1>
          <p className="text-[#a1a1a6] text-lg font-light tracking-wide">
            Condiciones operativas de CASA.
          </p>
        </header>

        <main className="space-y-24">
          <section className="space-y-6">
            <h2 className="text-2xl font-medium tracking-tight text-white">1. El Ecosistema</h2>
            <p className="text-[#86868b] leading-relaxed font-light text-[17px]">
              Al acceder a CASA, ingresas a una plataforma diseñada para centralizar la administración, las finanzas, los accesos y los servicios de comunidades residenciales y complejos inmobiliarios. El uso del sistema está sujeto a estas condiciones para preservar la integridad, seguridad y continuidad de la operación.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-medium tracking-tight text-white">2. Uso y Accesos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-3 border-t border-[#333336] pt-6">
                <h3 className="text-[#f5f5f7] font-medium">Credenciales</h3>
                <p className="text-[#86868b] leading-relaxed font-light text-[15px]">
                  El acceso (mediante JWT y SSO) es estrictamente personal e intransferible. La salvaguarda de tus credenciales es vital para la seguridad del entorno.
                </p>
              </div>
              <div className="space-y-3 border-t border-[#333336] pt-6">
                <h3 className="text-[#f5f5f7] font-medium">Roles (RBAC)</h3>
                <p className="text-[#86868b] leading-relaxed font-light text-[15px]">
                  Cada usuario tiene privilegios delimitados. Cualquier intento de eludir los controles de acceso resultará en la revocación inmediata de la cuenta.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-medium tracking-tight text-white">3. Resiliencia y Continuidad (SLA)</h2>
            <p className="text-[#86868b] leading-relaxed font-light text-[17px]">
              Nuestra arquitectura está diseñada para operaciones ininterrumpidas. La plataforma garantiza sincronización offline-first; en escenarios de pérdida de conectividad, las operaciones locales persisten criptográficamente en el dispositivo y se sincronizan automáticamente con la nube una vez restaurado el enlace, preservando la continuidad del negocio sin compromisos.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-medium tracking-tight text-white">4. Integridad del Sistema</h2>
            <p className="text-[#86868b] leading-relaxed font-light text-[17px] mb-8">
              Para garantizar el máximo estándar de calidad, rigen las siguientes normas técnicas y de convivencia dentro de la suite:
            </p>

            <div className="space-y-10 pl-4 border-l border-[#333336]">
              <div className="space-y-2">
                <h3 className="text-[#f5f5f7] font-medium">Trazabilidad Operativa</h3>
                <p className="text-[#86868b] leading-relaxed font-light text-[15px]">
                  Todas las acciones críticas en el punto de venta, control de accesos y cierres de lote generan registros inmutables. Nos reservamos el derecho de auditar estas bitácoras para garantizar la precisión contable.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-[#f5f5f7] font-medium">Uso Legítimo</h3>
                <p className="text-[#86868b] leading-relaxed font-light text-[15px]">
                  Queda estrictamente prohibida la automatización no autorizada, la ingeniería inversa del PWA, o la alteración de los mecanismos de almacenamiento local (IndexedDB) que sostienen nuestra sincronización.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-[#f5f5f7] font-medium">Propiedad Intelectual</h3>
                <p className="text-[#86868b] leading-relaxed font-light text-[15px]">
                  El diseño, la infraestructura tecnológica, las interfaces de usuario (UX/UI) y las marcas comerciales asociadas a CASA son propiedad exclusiva de su entidad operativa.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-medium tracking-tight text-white">5. Limitación de Responsabilidad</h2>
            <p className="text-[#86868b] leading-relaxed font-light text-[17px]">
              Aunque desplegamos tecnologías perimetrales robustas (Cloudflare WAF, TLS 1.3), CASA no se hace responsable por interrupciones derivadas de cortes masivos de infraestructura ISP, ni por el manejo administrativo de las cuotas o la fijación errónea de tasas de cambio por parte de los administradores de cada comunidad.
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

export default TermsOfService;
