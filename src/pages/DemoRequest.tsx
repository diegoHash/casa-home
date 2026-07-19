import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Check, ChevronDown, Mail, Send, ShieldCheck, UserRound } from 'lucide-react';

const fallbackCitiesByState: Record<string, string[]> = {
  Amazonas: ['Puerto Ayacucho', 'La Esmeralda', 'Maroa', 'San Carlos de Río Negro', 'San Fernando de Atabapo', 'San Juan de Manapiare'],
  Anzoátegui: ['Anaco', 'Aragua de Barcelona', 'Barcelona', 'Boca de Uchire', 'Cantaura', 'Clarines', 'El Tigre', 'Lechería', 'Pariaguán', 'Píritu', 'Puerto La Cruz', 'San José de Guanipa'],
  Apure: ['Achaguas', 'Biruaca', 'Bruzual', 'Elorza', 'Guasdualito', 'Mantecal', 'San Fernando de Apure', 'San Juan de Payara'],
  Aragua: ['Cagua', 'Choroní', 'Colonia Tovar', 'El Limón', 'La Victoria', 'Las Tejerías', 'Maracay', 'Ocumare de la Costa', 'Palo Negro', 'San Mateo', 'Santa Rita', 'Turmero', 'Villa de Cura'],
  Barinas: ['Barinas', 'Barinitas', 'Barrancas', 'Ciudad Bolivia', 'Libertad', 'Sabaneta', 'Santa Bárbara de Barinas', 'Socopó'],
  Bolívar: ['Caicara del Orinoco', 'Ciudad Bolívar', 'Ciudad Guayana', 'Ciudad Piar', 'El Callao', 'Guasipati', 'Puerto Ordaz', 'San Félix', 'Santa Elena de Uairén', 'Tumeremo', 'Upata'],
  Carabobo: ['Bejuma', 'Guacara', 'Güigüe', 'Los Guayos', 'Mariara', 'Morón', 'Naguanagua', 'Puerto Cabello', 'San Diego', 'Tocuyito', 'Valencia'],
  Cojedes: ['El Baúl', 'El Pao', 'Las Vegas', 'Libertad de Cojedes', 'San Carlos', 'Tinaco', 'Tinaquillo'],
  'Delta Amacuro': ['Curiapo', 'Pedernales', 'Sierra Imataca', 'Tucupita'],
  'Distrito Capital': ['Caracas'],
  Falcón: ['Chichiriviche', 'Coro', 'Cumarebo', 'Dabajuro', 'La Vela de Coro', 'Mene de Mauroa', 'Mirimire', 'Punto Fijo', 'San Luis', 'Tucacas'],
  Guárico: ['Altagracia de Orituco', 'Calabozo', 'Camaguán', 'El Sombrero', 'Las Mercedes del Llano', 'Ortiz', 'San Juan de los Morros', 'Tucupido', 'Valle de la Pascua', 'Zaraza'],
  'La Guaira': ['Caraballeda', 'Carayaca', 'Catia La Mar', 'La Guaira', 'Macuto', 'Maiquetía', 'Naiguatá'],
  Lara: ['Barquisimeto', 'Cabudare', 'Carora', 'Duaca', 'El Tocuyo', 'Quíbor', 'Sanare', 'Sarare', 'Siquisique'],
  Mérida: ['Bailadores', 'Ejido', 'El Vigía', 'Lagunillas', 'Mérida', 'Mucuchíes', 'Nueva Bolivia', 'Santa Cruz de Mora', 'Timotes', 'Tovar'],
  Miranda: ['Baruta', 'Caucagua', 'Chacao', 'Charallave', 'Cúa', 'El Hatillo', 'Guarenas', 'Guatire', 'Higuerote', 'Los Teques', 'Ocumare del Tuy', 'Petare', 'Río Chico', 'San Antonio de los Altos', 'Santa Teresa del Tuy'],
  Monagas: ['Aragua de Maturín', 'Barrancas del Orinoco', 'Caripe', 'Caripito', 'Maturín', 'Punta de Mata', 'Quiriquire', 'Temblador'],
  'Nueva Esparta': ['Boca del Río', 'El Valle del Espíritu Santo', 'Juan Griego', 'La Asunción', 'Pampatar', 'Pedro González', 'Porlamar', 'San Juan Bautista', 'Villa Rosa'],
  Portuguesa: ['Acarigua', 'Agua Blanca', 'Araure', 'Biscucuy', 'Guanare', 'Guanarito', 'Ospino', 'Píritu', 'Turén', 'Villa Bruzual'],
  Sucre: ['Araya', 'Cariaco', 'Carúpano', 'Casanay', 'Cumaná', 'Cumanacoa', 'Güiria', 'Irapa', 'Río Caribe', 'San Antonio del Golfo'],
  Táchira: ['Capacho', 'Colón', 'El Piñal', 'La Fría', 'La Grita', 'Palmira', 'Pregonero', 'Queniquea', 'Rubio', 'San Antonio del Táchira', 'San Cristóbal', 'Táriba', 'Ureña'],
  Trujillo: ['Betijoque', 'Boconó', 'Carache', 'Escuque', 'La Puerta', 'Pampán', 'Sabana de Mendoza', 'Santa Ana', 'Trujillo', 'Valera'],
  Yaracuy: ['Aroa', 'Boraure', 'Chivacoa', 'Cocorote', 'Guama', 'Nirgua', 'San Felipe', 'Urachiche', 'Yaritagua'],
  Zulia: ['Bachaquero', 'Cabimas', 'Caja Seca', 'Ciudad Ojeda', 'Encontrados', 'La Concepción', 'Los Puertos de Altagracia', 'Machiques', 'Maracaibo', 'Mene Grande', 'San Francisco', 'Santa Bárbara del Zulia', 'Santa Rita', 'Sinamaica', 'Villa del Rosario'],
};

const fieldClass = 'mt-2 w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3.5 text-sm text-[#071a33] outline-none transition placeholder:text-slate-400 focus:border-[#b08a3c] focus:ring-4 focus:ring-[#b08a3c]/10';

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm font-semibold text-slate-700 ${className}`}>{label}{children}</label>;
}

export default function DemoRequest() {
  const [locations, setLocations] = useState(fallbackCitiesByState);
  const states = useMemo(() => Object.keys(locations).sort((a, b) => a.localeCompare(b, 'es')), [locations]);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [otherCity, setOtherCity] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    type LocationEntry = { estado: string; capital?: string; ciudades?: string[]; municipios?: Array<{ capital?: string }> };

    void fetch('https://raw.githubusercontent.com/zokeber/venezuela-json/master/venezuela.json', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('LOCATION_DATA');
        return response.json() as Promise<LocationEntry[]>;
      })
      .then(entries => {
        const completeLocations = Object.fromEntries(entries.map(entry => {
          const names = [entry.capital, ...(entry.ciudades || []), ...(entry.municipios || []).map(municipality => municipality.capital)]
            .filter((value): value is string => Boolean(value?.trim()));
          return [entry.estado, [...new Set(names)].sort((a, b) => a.localeCompare(b, 'es'))];
        }));
        if (Object.keys(completeLocations).length >= 24) setLocations(completeLocations);
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const selectedCity = city === 'Otra ciudad o localidad' ? otherCity : city;
    const body = [
      'SOLICITUD DE DEMO CASA',
      '',
      `Complejo: ${data.get('complexName')}`,
      `RIF: ${data.get('rif')}`,
      `Dirección: ${data.get('address')}`,
      `Estado: ${state}`,
      `Ciudad: ${selectedCity}`,
      `Código postal: ${data.get('postalCode')}`,
      '',
      `Solicitante: ${data.get('requesterName')}`,
      `Cédula: ${data.get('idPrefix')}-${data.get('idNumber')}`,
      `Teléfono: ${data.get('phone')}`,
      `Correo: ${data.get('email')}`,
    ].join('\n');
    window.location.href = `mailto:administracion@caribbean-one.site?subject=${encodeURIComponent(`Solicitud de demo CASA · ${String(data.get('complexName'))}`)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <main className="min-h-screen bg-[#f6f2e9] text-[#071a33]">
      <header className="border-b border-[#071a33]/10 bg-[#f6f2e9]/95">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link to="/" aria-label="CASA, inicio"><img src="/casa-wordmark-light.png" alt="CASA" className="h-10 w-auto max-w-[190px] object-contain" /></Link>
          <Link to="/" className="inline-flex items-center text-sm font-semibold text-slate-600 transition hover:text-[#071a33]"><ArrowLeft className="mr-2" size={17} /> Volver al inicio</Link>
        </nav>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[0.72fr_1.28fr] lg:px-8 lg:py-16">
        <section className="lg:sticky lg:top-10 lg:self-start">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#a77e27]">Solicitar demo</p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-5xl">Conozcamos la operación de tu comunidad.</h1>
          <p className="mt-6 text-base leading-8 text-slate-600">Completa los datos del complejo y coordinaremos una demostración enfocada en sus procesos, equipos y necesidades reales.</p>
          <div className="mt-9 space-y-4">
            {['Recorrido por los ocho espacios de trabajo', 'Demostración adaptada al tipo de complejo', 'Orientación sobre implementación y puesta en marcha'].map(item => (
              <p key={item} className="flex gap-3 text-sm leading-6 text-slate-600"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f0dfb1] text-[#7d5d1f]"><Check size={14} /></span>{item}</p>
            ))}
          </div>
          <div className="mt-10 rounded-3xl bg-[#071a33] p-6 text-white">
            <ShieldCheck className="text-[#e4c26f]" size={26} />
            <p className="mt-4 text-sm font-semibold">Información de contacto protegida</p>
            <p className="mt-2 text-xs leading-6 text-white/55">Usaremos estos datos únicamente para coordinar la presentación de CASA.</p>
          </div>
        </section>

        <form onSubmit={submit} className="rounded-[2rem] border border-[#071a33]/10 bg-white p-6 shadow-[0_28px_80px_rgba(7,26,51,.08)] sm:p-8 lg:p-10">
          <section>
            <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f1eadb] text-[#9a742b]"><Building2 size={21} /></span><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a77e27]">01</p><h2 className="font-semibold">Datos del complejo</h2></div></div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <Field label="Nombre del complejo" className="sm:col-span-2"><input name="complexName" className={fieldClass} placeholder="Ej.: Residencias Bahía Central" required /></Field>
              <Field label="RIF"><input name="rif" className={fieldClass} placeholder="J-12345678-9" pattern="[JjGgVvEePp]-?[0-9]{8}-?[0-9]" title="Utiliza el formato J-12345678-9" required /></Field>
              <Field label="Código postal"><input name="postalCode" inputMode="numeric" className={fieldClass} placeholder="Ej.: 1160" pattern="[0-9]{4}" title="Ingresa un código postal de 4 dígitos" required /></Field>
              <Field label="Dirección" className="sm:col-span-2"><textarea name="address" className={`${fieldClass} min-h-28 resize-y`} placeholder="Avenida, urbanización, sector y referencia" required /></Field>
              <Field label="Estado">
                <span className="relative block"><select name="state" value={state} onChange={event => { setState(event.target.value); setCity(''); setOtherCity(''); }} className={`${fieldClass} appearance-none pr-10`} required><option value="">Selecciona un estado</option>{states.map(item => <option key={item}>{item}</option>)}</select><ChevronDown className="pointer-events-none absolute bottom-4 right-4 text-slate-400" size={16} /></span>
              </Field>
              <Field label="Ciudad">
                <span className="relative block"><select name="city" value={city} onChange={event => setCity(event.target.value)} className={`${fieldClass} appearance-none pr-10`} disabled={!state} required><option value="">{state ? 'Selecciona una ciudad' : 'Selecciona primero el estado'}</option>{(locations[state] || []).map(item => <option key={item}>{item}</option>)}<option>Otra ciudad o localidad</option></select><ChevronDown className="pointer-events-none absolute bottom-4 right-4 text-slate-400" size={16} /></span>
              </Field>
              {city === 'Otra ciudad o localidad' && <Field label="Especifica la ciudad o localidad" className="sm:col-span-2"><input value={otherCity} onChange={event => setOtherCity(event.target.value)} className={fieldClass} placeholder="Escribe la ubicación" required /></Field>}
            </div>
          </section>

          <div className="my-9 h-px bg-slate-100" />

          <section>
            <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f1eadb] text-[#9a742b]"><UserRound size={21} /></span><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a77e27]">02</p><h2 className="font-semibold">Datos del solicitante</h2></div></div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <Field label="Nombre y apellido" className="sm:col-span-2"><input name="requesterName" autoComplete="name" className={fieldClass} placeholder="Persona responsable de la solicitud" required /></Field>
              <Field label="Cédula">
                <div className="mt-2 grid grid-cols-[88px_1fr] gap-2"><select name="idPrefix" className={`${fieldClass} mt-0`} aria-label="Tipo de documento"><option>V</option><option>E</option><option>P</option></select><input name="idNumber" inputMode="numeric" className={`${fieldClass} mt-0`} placeholder="12345678" pattern="[0-9]{5,9}" required /></div>
              </Field>
              <Field label="Número de teléfono"><input name="phone" type="tel" autoComplete="tel" className={fieldClass} placeholder="+58 414-123-4567" pattern="[+0-9 ()-]{10,20}" required /></Field>
              <Field label="Correo electrónico" className="sm:col-span-2"><input name="email" type="email" autoComplete="email" className={fieldClass} placeholder="nombre@correo.com" required /></Field>
            </div>
          </section>

          <button type="submit" className="mt-9 inline-flex w-full items-center justify-center rounded-full bg-[#071a33] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#12335a]">Preparar solicitud <Send className="ml-2" size={17} /></button>
          <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-slate-400"><Mail size={14} /> Se abrirá tu aplicación de correo para confirmar el envío.</p>
        </form>
      </div>
    </main>
  );
}
