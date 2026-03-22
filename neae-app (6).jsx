import { useState } from "react";

const PERFILES = [
  { id: "TDAH", label: "TDAH", emoji: "⚡", color: "#F59E0B", bg: "#FEF3C7", desc: "Trastorno por Déficit de Atención e Hiperactividade" },
  { id: "TEA", label: "TEA", emoji: "🔵", color: "#3B82F6", bg: "#DBEAFE", desc: "Trastorno do Espectro Autista" },
  { id: "DEA", label: "DEA Lectura", emoji: "📖", color: "#8B5CF6", bg: "#EDE9FE", desc: "Dificultades Específicas de Aprendizaxe" },
  { id: "DI", label: "Discapacidade Intelectual", emoji: "🌱", color: "#10B981", bg: "#D1FAE5", desc: "Necesidades de apoio cognitivo" },
  { id: "DS", label: "Discapacidade Sensorial", emoji: "👁️", color: "#EC4899", bg: "#FCE7F3", desc: "Visual / Auditiva" },
  { id: "DM", label: "Discapacidade Motora", emoji: "♿", color: "#F97316", bg: "#FFEDD5", desc: "Limitacións motrices" },
  { id: "AC", label: "Altas Capacidades", emoji: "🌟", color: "#6366F1", bg: "#E0E7FF", desc: "Enriquecemento e profundización" },
  { id: "RE", label: "Regulación Emocional", emoji: "💚", color: "#059669", bg: "#ECFDF5", desc: "Dificultades de xestión emocional e conduta" },
];

const NECESIDADES = {
  TDAH: ["Dificultade para manter a atención", "Impulsividade", "Desorganización", "Exceso de actividade motora", "Dificultade para seguir instrucións longas"],
  TEA: ["Dificultade en comunicación social", "Necesidade de rutinas fixas", "Sensibilidade sensorial", "Dificultade con cambios inesperados", "Procesamento literal da linguaxe"],
  DEA: ["Dificultade lectora (dislexia)", "Dificultade escritura (disgrafía)", "Dificultade matemática (discalculia)", "Velocidade de procesamento lenta", "Memoria de traballo reducida"],
  DI: ["Dificultade en razoamento abstracto", "Ritmo de aprendizaxe lento", "Limitacións en comprensión lectora", "Dificultade en xeneralización", "Necesidade de aprendizaxe funcional"],
  DS: ["Perda auditiva", "Perda visual", "Necesita apoios visuais alternativos", "Necesita apoios auditivos alternativos", "Fatiga sensorial"],
  DM: ["Dificultade motriz fina", "Dificultade motriz grosa", "Necesita adaptacións de acceso ao currículo", "Fatiga física", "Dependencia de axudas técnicas"],
  AC: ["Aburrimento co ritmo ordinario", "Necesidade de profundización", "Alta motivación intrínseca", "Pensamento diverxente", "Necesidade de retos adicionais"],
  RE: ["Explosividade emocional ou rabietas frecuentes", "Dificultade para identificar as propias emocións", "Baixa tolerancia á frustración", "Dificultade para calmarse de forma autónoma", "Impulsividade reactiva ante conflitos", "Ansiedade ante situacións escolares", "Dificultade para pedir axuda de forma adecuada"],
};

const ETAPAS = ["Educación Infantil", "Educación Primaria"];
const AREAS_INFANTIL = ["Coñecemento de si mesmo e autonomía persoal", "Coñecemento do contorno", "Linguaxes: comunicación e representación", "Regulación Emocional e Benestar"];
const AREAS_PRIMARIA = ["Lingua Castelá e Literatura", "Matemáticas", "Ciencias da Natureza", "Ciencias Sociais", "Educación Física", "Educación Artística", "Lingua Estranxeira (Inglés)", "Relixión / Valores Cívicos", "Conduta e Convivencia", "Regulación Emocional e Benestar"];
const INTENSIDADES = ["Leve", "Moderada", "Intensa"];
const TRIMESTRES = ["1.º Trimestre", "2.º Trimestre", "3.º Trimestre"];

const getAreas = (etapa) => etapa === "Educación Infantil" ? AREAS_INFANTIL : AREAS_PRIMARIA;
const getCurrentTrimestre = () => { const m = new Date().getMonth() + 1; if (m >= 9 || m === 1) return "1.º Trimestre"; if (m <= 3) return "2.º Trimestre"; return "3.º Trimestre"; };
const initialHistorial = (() => { try { return JSON.parse(localStorage.getItem("neae_historial") || "[]"); } catch { return []; } })();

export default function App() {
  const [pantalla, setPantalla] = useState("inicio");
  const [perfil, setPerfil] = useState(null);
  const [necesidades, setNecesidades] = useState([]);
  const [etapa, setEtapa] = useState("Educación Primaria");
  const [areas, setAreas] = useState([]);
  const [intensidad, setIntensidad] = useState("Moderada");
  const [alumno, setAlumno] = useState("");
  const [caracteristicas, setCaracteristicas] = useState("");
  const [trimestre, setTrimestre] = useState(getCurrentTrimestre());
  const [anyo, setAnyo] = useState(new Date().getFullYear().toString());
  const [resultados, setResultados] = useState({});
  const [areaActiva, setAreaActiva] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingArea, setLoadingArea] = useState(null);
  const [historial, setHistorial] = useState(initialHistorial);
  const [guardado, setGuardado] = useState(false);
  const [historialItem, setHistorialItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [avisoAceptado, setAvisoAceptado] = useState(() => localStorage.getItem('neae_aviso') === '1');

  const perfilData = PERFILES.find(p => p.id === perfil);
  const toggleNecesidad = (n) => setNecesidades(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
  const toggleArea = (a) => { setAreas(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]); setResultados({}); setGuardado(false); };

  const generarParaArea = async (area) => {
    setLoadingArea(area);
    const intensidadeDesc = intensidad === "Leve" ? "axustes menores dentro do grupo ordinario, sen modificar obxectivos" : intensidad === "Moderada" ? "modificacións metodolóxicas claras, posible apoio PT/AL, criterios flexibilizados" : "adaptación significativa: obxectivos, contidos e criterios modificados substancialmente";

    const prompt = `Responde SEMPRE EN GALEGO. Es especialista en pedagoxía terapéutica en España (LOMLOE).

DATOS DO ALUMNO/A:
- Nome: ${alumno || "Sen especificar"}
- Perfil NEAE: ${perfil} (${perfilData?.desc})
- Necesidades CONCRETAS marcadas: ${necesidades.join("; ")}
- Características específicas: ${caracteristicas || "ningunha indicada"}
- Etapa: ${etapa} | Materia: ${area} | Intensidade: ${intensidad} — ${intensidadeDesc}
- Período: ${trimestre} ${anyo}

ESIXENCIAS DE CALIDADE — incumprilas é un fallo:
1. Cada adaptación debe ser ÚNICA e responder directamente a unha das necesidades marcadas arriba. NON repitas ideas entre seccións.
2. Nomea ELEMENTOS REAIS da materia "${area}": exercicios, textos, operacións, experimentos, obras... segundo o que corresponda.
3. ${caracteristicas ? `Integra "${caracteristicas}" en polo menos 2 adaptacións concretas.` : `Diferencia claramente as adaptacións do perfil ${perfil} das doutros perfís.`}
4. Intensidade ${intensidad}: ${intensidadeDesc}. As adaptacións deben reflectir este nivel, non ser xenéricas.
5. Máximo 1 liña por punto. Sen introdución nin conclusión fóra da estrutura.

Responde EXACTAMENTE con esta estrutura:

🎯 ACCESO (recursos, espazo, apoios)
- [acción moi concreta, específica para ${area} e perfil ${perfil}]
- [acción diferente á anterior]
- [acción diferente ás anteriores]

📚 METODOLOXÍA (como ensinar este contido)
- [estratexia concreta para ${area}, non válida para outra materia]
- [outra estratexia diferente]
- [outra estratexia diferente]
- [outra estratexia diferente]

✅ AVALIACIÓN (como avaliar a este alumno/a)
- [instrumento ou criterio concreto para ${area}]
- [outro diferente]
- [outro diferente]

📋 LISTA DE COTEXO
Criterios para rexistrar se o alumno/a consegue os obxectivos adaptados en ${area}:
| Criterio | Si | Non | Ás veces |
|---|---|---|---|
| [criterio observable e medible 1] | ☐ | ☐ | ☐ |
| [criterio observable e medible 2] | ☐ | ☐ | ☐ |
| [criterio observable e medible 3] | ☐ | ☐ | ☐ |
| [criterio observable e medible 4] | ☐ | ☐ | ☐ |

📊 RÚBRICA DE AVALIACIÓN
Descritores para ${area} adaptados ao perfil ${perfil}:
| Indicador | Excelente | Adecuado | En proceso | Non conseguido |
|---|---|---|---|---|
| [indicador 1 propio de ${area}] | [descritor] | [descritor] | [descritor] | [descritor] |
| [indicador 2 propio de ${area}] | [descritor] | [descritor] | [descritor] | [descritor] |
| [indicador 3 propio de ${area}] | [descritor] | [descritor] | [descritor] | [descritor] |

💡 CONSELLO DOCENTE
[Unha soa frase moi práctica e específica para ${area} con perfil ${perfil}. En galego.]`;

    const intentar = async (intentos = 3) => {
      for (let i = 0; i < intentos; i++) {
        try {
          if (i > 0) await new Promise(r => setTimeout(r, 1500 * i));
          const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "claude-sonnet-4-20250514",
              max_tokens: 2000,
              messages: [{ role: "user", content: prompt }],
            }),
          });
          if (response.status === 429 || response.status >= 500) continue;
          const data = await response.json();
          const text = data.content?.map(b => b.text || "").join("\n") || "";
          if (text.trim()) {
            setResultados(prev => ({ ...prev, [area]: text }));
            return;
          }
        } catch {}
      }
      setResultados(prev => ({ ...prev, [area]: "⚠️ Non se puido xerar. Preme ✏️ Editar para reintentalo." }));
    };
    await intentar();
    setLoadingArea(null);
  };

  const generarTodas = async () => {
    setLoading(true);
    setResultados({});
    setGuardado(false);
    for (let i = 0; i < areas.length; i++) {
      await generarParaArea(areas[i]);
      if (i < areas.length - 1) await new Promise(r => setTimeout(r, 600));
    }
    setLoading(false);
    setAreaActiva(areas[0] || null);
    setPantalla("resultado");
  };

  const reintentarArea = async (area) => {
    setResultados(prev => ({ ...prev, [area]: null }));
    setLoadingArea(area);
    await generarParaArea(area);
  };

  const guardarEnHistorial = () => {
    const entry = { id: Date.now(), fecha: new Date().toLocaleDateString("es-ES"), trimestre, anyo, alumno: alumno || "Sen nome", caracteristicas, perfil, necesidades, etapa, areas, intensidad, resultados };
    const nuevo = [entry, ...historial];
    setHistorial(nuevo);
    localStorage.setItem("neae_historial", JSON.stringify(nuevo));
    setGuardado(true);
  };

  const eliminarDeHistorial = (id) => {
    const nuevo = historial.filter(h => h.id !== id);
    setHistorial(nuevo);
    localStorage.setItem("neae_historial", JSON.stringify(nuevo));
    if (historialItem?.id === id) setHistorialItem(null);
    setConfirmDelete(null);
  };

  const copiarTodo = () => {
    const texto = areas.map(a => `=== ${a} ===\n${resultados[a] || ""}`).join("\n\n");
    navigator.clipboard.writeText(`ADAPTACIÓNS NEAE — ${alumno || "Alumno/a"}\n${perfil} | ${etapa} | ${trimestre} ${anyo}\n\n${texto}`);
  };

  const exportarPDF = () => {
    const nomeAlumno = alumno || "Alumno";
    const data = new Date().toLocaleDateString("gl-ES");
    let html = `
      <html><head><meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; padding: 24px; }
        h1 { font-size: 18px; color: #1E3A5F; margin-bottom: 4px; }
        .meta { color: #64748B; font-size: 11px; margin-bottom: 20px; }
        .materia { margin-bottom: 28px; page-break-inside: avoid; }
        .materia h2 { font-size: 14px; color: #2563EB; border-bottom: 2px solid #2563EB; padding-bottom: 4px; margin-bottom: 10px; }
        h3 { font-size: 12px; margin: 12px 0 5px; color: #1E3A5F; }
        li { margin-bottom: 4px; line-height: 1.5; }
        table { border-collapse: collapse; width: 100%; font-size: 11px; margin: 8px 0; }
        th { background: #EFF6FF; color: #1E3A5F; padding: 5px 7px; text-align: left; border: 1px solid #BFDBFE; }
        td { padding: 5px 7px; border: 1px solid #E2E8F0; }
        tr:nth-child(even) td { background: #F8FAFC; }
        .footer { margin-top: 30px; font-size: 10px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 8px; }
      </style></head><body>
      <h1>Adaptacións NEAE — ${nomeAlumno}</h1>
      <div class="meta">
        Perfil: ${perfil || ""} | Etapa: ${etapa} | ${trimestre} ${anyo} | Intensidade: ${intensidad}<br/>
        ${caracteristicas ? "Características: " + caracteristicas : ""}
      </div>`;
    areas.forEach(area => {
      const texto = resultados[area] || "";
      if (!texto) return;
      html += `<div class="materia"><h2>${area}</h2>`;
      texto.split("\n").forEach(line => {
        if (line.match(/^[🎯📚✅💡📋📊]/)) html += `<h3>${line}</h3>`;
        else if (line.startsWith("- ")) html += `<ul><li>${line.slice(2)}</li></ul>`;
        else if (line.startsWith("|")) {
          const cells = line.split("|").filter((_, i) => i > 0 && i < line.split("|").length - 1);
          const isHeader = !line.match(/^\|[-| ]+\|$/);
          if (isHeader) html += cells.map((c,i) => i===0 ? `<table><tr>${cells.map(cc=>`<th>${cc.trim()}</th>`).join("")}</tr>` : "").join("") || "";
          else html += `<tr>${cells.map(cc=>`<td>${cc.trim()}</td>`).join("")}</tr></table>`;
        } else if (line.trim()) html += `<p>${line}</p>`;
      });
      html += `</div>`;
    });
    html += `<div class="footer">Xerado con Adaptacións NEAE · ${data}</div></body></html>`;
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  const nueva = () => {
    setPerfil(null); setNecesidades([]); setEtapa("Educación Primaria"); setAreas([]);
    setIntensidad("Moderada"); setAlumno(""); setCaracteristicas(""); setTrimestre(getCurrentTrimestre());
    setAnyo(new Date().getFullYear().toString()); setResultados({}); setAreaActiva(null);
    setGuardado(false); setPantalla("inicio");
  };

  const cargarDesdeHistorial = (h) => {
    const hAreas = Array.isArray(h.areas) && h.areas.length > 0 ? h.areas : (h.area ? [h.area] : []);
    const hResultados = h.resultados && typeof h.resultados === "object" ? h.resultados : (h.resultado ? { [hAreas[0]]: h.resultado } : {});
    setPerfil(h.perfil);
    setNecesidades(h.necesidades || []);
    setEtapa(h.etapa || "Educación Primaria");
    setAreas(hAreas);
    setIntensidad(h.intensidad || "Moderada");
    setAlumno(h.alumno === "Sen nome" ? "" : (h.alumno || ""));
    setCaracteristicas(h.caracteristicas || "");
    setTrimestre(h.trimestre || getCurrentTrimestre());
    setAnyo(h.anyo || new Date().getFullYear().toString());
    setResultados(hResultados);
    setAreaActiva(hAreas[0] || null);
    setGuardado(false);
    setPantalla("resultado");
  };


  const renderMd = (text, color = "#2563EB") => {
    const lines = text.split("\n");
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      // Section headers
      if (line.match(/^[🎯📚✅💡📋📊]/)) {
        out.push(<h3 key={i} style={{ color, fontWeight: 800, fontSize: 14, marginTop: 16, marginBottom: 6 }}>{line.replace(/\*\*/g, "")}</h3>);
        i++; continue;
      }
      // Table: collect all | lines together
      if (line.startsWith("|")) {
        const tableLines = [];
        while (i < lines.length && lines[i].startsWith("|")) {
          tableLines.push(lines[i]);
          i++;
        }
        const rows = tableLines.filter(l => !l.match(/^\|[-| ]+\|$/));
        out.push(
          <div key={i} style={{ overflowX: "auto", marginBottom: 10, marginTop: 4 }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
              <tbody>
                {rows.map((row, ri) => {
                  const cells = row.split("|").filter((_, ci) => ci > 0 && ci < row.split("|").length - 1);
                  const isHeader = ri === 0;
                  return (
                    <tr key={ri} style={{ background: isHeader ? color + "18" : ri % 2 === 0 ? "#F8FAFC" : "white" }}>
                      {cells.map((cell, ci) => (
                        isHeader
                          ? <th key={ci} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700, color, borderBottom: "1.5px solid " + color + "40", whiteSpace: "nowrap" }}>{cell.trim()}</th>
                          : <td key={ci} style={{ padding: "6px 8px", color: "#374151", borderBottom: "1px solid #F1F5F9" }}>{cell.trim()}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
      // List items
      if (line.startsWith("- ")) {
        out.push(<li key={i} style={{ marginLeft: 16, marginBottom: 5, color: "#374151", fontSize: 13, lineHeight: 1.6 }}>{line.slice(2).replace(/\*\*/g, "")}</li>);
        i++; continue;
      }
      // Empty lines
      if (line.trim() === "") { i++; continue; }
      // Normal text
      out.push(<p key={i} style={{ color: "#4B5563", fontSize: 13, marginBottom: 4, lineHeight: 1.6 }}>{line.replace(/\*\*/g, "")}</p>);
      i++;
    }
    return out;
  };

  const IS = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, color: "#374151", outline: "none", fontFamily: "inherit", background: "white" };
  const LS = { fontWeight: 700, color: "#374151", fontSize: 13, display: "block", marginBottom: 6 };

  return (
    <div style={{ fontFamily: "'Nunito','Segoe UI',sans-serif", minHeight: "100vh", background: "#F8FAFC" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .ch{transition:all .2s;cursor:pointer}.ch:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.1)}
        .btn{transition:all .18s;cursor:pointer;border:none;font-family:inherit}.btn:hover:not(:disabled){filter:brightness(1.07);transform:translateY(-1px)}.btn:active:not(:disabled){transform:translateY(0)}.btn:disabled{opacity:.5;cursor:not-allowed}
        .fi{animation:fi .35s ease}@keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .pu{animation:pu 1.5s infinite}@keyframes pu{0%,100%{opacity:1}50%{opacity:.4}}
        select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:36px}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#F1F5F9}::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:3px}
      `}</style>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg,#1E3A5F,#2563EB)", padding: "13px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ fontSize: 24 }}>🧩</span>
          <div>
            <div style={{ color: "white", fontWeight: 900, fontSize: 16 }}>Adaptacións NEAE</div>
            <div style={{ color: "rgba(255,255,255,.65)", fontSize: 11 }}>Xerador con IA · Infantil e Primaria</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          {pantalla !== "inicio" && <button onClick={nueva} className="btn" style={{ background: "rgba(255,255,255,.15)", color: "white", padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 700 }}>← Inicio</button>}
          <button onClick={() => setPantalla("historial")} className="btn" style={{ background: "rgba(255,255,255,.15)", color: "white", padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 700 }}>📋 {historial.length}</button>
        </div>
      </div>

      <div style={{ maxWidth: 660, margin: "0 auto", padding: "20px 14px 48px" }}>

        {/* AVISO PROTECCIÓN DE DATOS */}
        {!avisoAceptado && (
          <div className="fi" style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "white", borderRadius: 16, padding: 28, maxWidth: 420, width: "100%" }}>
              <div style={{ fontSize: 36, textAlign: "center", marginBottom: 12 }}>🔒</div>
              <h2 style={{ fontWeight: 900, color: "#1E3A5F", fontSize: 18, textAlign: "center", marginBottom: 12 }}>Aviso de Privacidade</h2>
              <p style={{ color: "#374151", fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
                Esta aplicación <strong>non almacena nin transmite datos persoais</strong> a ningún servidor externo. Os datos gárdanse unicamente no teu dispositivo (localStorage).
              </p>
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
                <p style={{ color: "#991B1B", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>⚠️ Para cumprir o RGPD:</p>
                <ul style={{ color: "#7F1D1D", fontSize: 12, lineHeight: 1.8, paddingLeft: 16 }}>
                  <li>Non introduzas nomes completos de alumnos/as</li>
                  <li>Usa só iniciais ou códigos (ex: A.G., Alumno 3)</li>
                  <li>Non inclúas datos médicos identificativos</li>
                  <li>As adaptacións xeradas son orientativas</li>
                </ul>
              </div>
              <button onClick={() => { setAvisoAceptado(true); localStorage.setItem("neae_aviso", "1"); }} className="btn"
                style={{ width: "100%", background: "linear-gradient(135deg,#2563EB,#1D4ED8)", color: "white", padding: "13px", borderRadius: 11, fontSize: 14, fontWeight: 800 }}>
                ✅ Entendido, usar a aplicación
              </button>
            </div>
          </div>
        )}

        {/* INICIO */}
        {pantalla === "inicio" && (
          <div className="fi">
            <div style={{ textAlign: "center", marginBottom: 28, paddingTop: 6 }}>
              <div style={{ fontSize: 50, marginBottom: 10 }}>🏫</div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "#1E3A5F" }}>Adaptacións NEAE</h1>
              <p style={{ color: "#64748B", marginTop: 7, fontSize: 14 }}>Adaptacións curriculares personalizadas con IA, por materia e trimestre</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
              {[["⚡","Rápido","Xera por materia en segundos"],["🎯","Preciso","Por perfil, etapa, área e intensidade"],["📅","Por trimestre","Vinculado ao período escolar"],["💾","Historial","Garda e consulta por alumno"]].map(([ic,t,d])=>(
                <div key={t} style={{ background: "white", borderRadius: 11, padding: "14px 16px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{ic}</div>
                  <div style={{ fontWeight: 800, color: "#1E3A5F", fontSize: 13 }}>{t}</div>
                  <div style={{ color: "#94A3B8", fontSize: 12, marginTop: 2 }}>{d}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setPantalla("perfil")} className="btn" style={{ width: "100%", background: "linear-gradient(135deg,#2563EB,#1D4ED8)", color: "white", padding: "14px", borderRadius: 13, fontSize: 15, fontWeight: 800 }}>✨ Nova Adaptación →</button>
          </div>
        )}

        {/* PERFIL */}
        {pantalla === "perfil" && (
          <div className="fi">
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1E3A5F", marginBottom: 4 }}>1. Perfil NEAE</h2>
            <p style={{ color: "#64748B", marginBottom: 16, fontSize: 13 }}>Cal é a necesidade educativa especial do alumno/a?</p>
            <div style={{ display: "grid", gap: 8 }}>
              {PERFILES.map(p => (
                <div key={p.id} onClick={() => { setPerfil(p.id); setNecesidades([]); setPantalla("necesidades"); }} className="ch"
                  style={{ background: "white", border: `2px solid #E2E8F0`, borderRadius: 11, padding: "13px 16px", display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{ fontSize: 24, width: 40, height: 40, background: p.bg, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{p.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, color: "#1E3A5F", fontSize: 14 }}>{p.label}</div>
                    <div style={{ color: "#64748B", fontSize: 12 }}>{p.desc}</div>
                  </div>
                  <span style={{ color: p.color, fontSize: 16 }}>→</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NECESIDADES */}
        {pantalla === "necesidades" && perfilData && (
          <div className="fi">
            <div style={{ display: "inline-flex", gap: 6, background: perfilData.bg, borderRadius: 7, padding: "4px 11px", marginBottom: 8 }}>
              <span>{perfilData.emoji}</span><span style={{ fontWeight: 800, color: perfilData.color, fontSize: 13 }}>{perfilData.label}</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1E3A5F", marginBottom: 4 }}>2. Necesidades específicas</h2>
            <p style={{ color: "#64748B", marginBottom: 14, fontSize: 13 }}>Marca as que mellor describen ao alumno/a</p>
            <div style={{ background: "white", borderRadius: 11, border: "1px solid #E2E8F0", overflow: "hidden", marginBottom: 16 }}>
              {NECESIDADES[perfil]?.map((n, i) => (
                <div key={n} onClick={() => toggleNecesidad(n)}
                  style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 11, borderBottom: i < NECESIDADES[perfil].length-1 ? "1px solid #F1F5F9" : "none", cursor: "pointer", background: necesidades.includes(n) ? perfilData.bg : "white", transition: "background .15s" }}>
                  <div style={{ width: 19, height: 19, borderRadius: 5, border: `2px solid ${necesidades.includes(n) ? perfilData.color : "#CBD5E1"}`, background: necesidades.includes(n) ? perfilData.color : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
                    {necesidades.includes(n) && <span style={{ color: "white", fontSize: 11, fontWeight: 900 }}>✓</span>}
                  </div>
                  <span style={{ color: "#374151", fontWeight: necesidades.includes(n) ? 700 : 500, fontSize: 13 }}>{n}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
              <button onClick={() => setPantalla("perfil")} className="btn" style={{ background: "#F1F5F9", color: "#475569", padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>← Volver</button>
              <button onClick={() => setPantalla("ajustes")} disabled={necesidades.length === 0} className="btn"
                style={{ background: necesidades.length === 0 ? "#CBD5E1" : `linear-gradient(135deg,${perfilData.color}DD,${perfilData.color})`, color: "white", padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
                Continuar ({necesidades.length}) →
              </button>
            </div>
          </div>
        )}

        {/* AJUSTES */}
        {pantalla === "ajustes" && perfilData && (
          <div className="fi">
            <div style={{ display: "inline-flex", gap: 6, background: perfilData.bg, borderRadius: 7, padding: "4px 11px", marginBottom: 8 }}>
              <span>{perfilData.emoji}</span><span style={{ fontWeight: 800, color: perfilData.color, fontSize: 13 }}>{perfilData.label}</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1E3A5F", marginBottom: 4 }}>3. Parámetros</h2>
            <p style={{ color: "#64748B", marginBottom: 16, fontSize: 13 }}>Configura o contexto das adaptacións</p>
            <div style={{ background: "white", borderRadius: 11, border: "1px solid #E2E8F0", padding: 16, display: "grid", gap: 15, marginBottom: 14 }}>

              <div>
                <label style={LS}>🔒 Código ou iniciais <span style={{ color: "#94A3B8", fontWeight: 500 }}>(non usar nome completo)</span></label>
                <input value={alumno} onChange={e => setAlumno(e.target.value)} placeholder="Ex: A.G. ou Alumno 3" style={IS} />
                <div style={{ fontSize: 11, color: "#EF4444", marginTop: 4 }}>⚠️ Por protección de datos, non introduzas o nome completo do alumno/a.</div>
              </div>

              <div>
                <label style={LS}>🗒️ Características relevantes <span style={{ color: "#94A3B8", fontWeight: 500 }}>(opcional)</span></label>
                <textarea
                  value={caracteristicas}
                  onChange={e => setCaracteristicas(e.target.value)}
                  placeholder={"Ex: Usa SAAC (ARASAAC), é bilingüe (galego/castelán), toma medicación para o TDAH, recibe apoio PT 3h/semana, ten baixa tolerancia á frustración..."}
                  style={{ ...IS, minHeight: 80, resize: "vertical", lineHeight: 1.5 }}
                />
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 5 }}>
                  A IA incorporará estas características directamente nas adaptacións xeradas.
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 9 }}>
                <div>
                  <label style={LS}>📅 Trimestre</label>
                  <select value={trimestre} onChange={e => setTrimestre(e.target.value)} style={IS}>
                    {TRIMESTRES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LS}>📆 Ano</label>
                  <input value={anyo} onChange={e => setAnyo(e.target.value)} placeholder="2024" style={IS} />
                </div>
              </div>

              <div>
                <label style={LS}>🏫 Etapa educativa</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                  {ETAPAS.map(e => (
                    <button key={e} onClick={() => { setEtapa(e); setAreas([]); }} className="btn"
                      style={{ padding: "10px 7px", borderRadius: 9, border: `2px solid ${etapa === e ? perfilData.color : "#E2E8F0"}`, background: etapa === e ? perfilData.bg : "white", color: etapa === e ? perfilData.color : "#64748B", fontWeight: 700, fontSize: 12 }}>
                      {e === "Educación Infantil" ? "🌈 Infantil" : "📐 Primaria"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={LS}>📚 Materias / Áreas <span style={{ color: "#94A3B8", fontWeight: 500 }}>(unha ou varias)</span></label>
                <div style={{ display: "grid", gap: 5 }}>
                  {getAreas(etapa).map(a => (
                    <div key={a} onClick={() => toggleArea(a)}
                      style={{ padding: "9px 13px", borderRadius: 8, border: `1.5px solid ${areas.includes(a) ? perfilData.color : "#E2E8F0"}`, background: areas.includes(a) ? perfilData.bg : "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, transition: "all .15s" }}>
                      <div style={{ width: 17, height: 17, borderRadius: 4, border: `2px solid ${areas.includes(a) ? perfilData.color : "#CBD5E1"}`, background: areas.includes(a) ? perfilData.color : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {areas.includes(a) && <span style={{ color: "white", fontSize: 10, fontWeight: 900 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: areas.includes(a) ? 700 : 500, color: areas.includes(a) ? perfilData.color : "#374151" }}>{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={LS}>🎚️ Intensidade</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
                  {INTENSIDADES.map(i => (
                    <button key={i} onClick={() => setIntensidad(i)} className="btn"
                      style={{ padding: "9px", borderRadius: 8, border: `2px solid ${intensidad === i ? perfilData.color : "#E2E8F0"}`, background: intensidad === i ? perfilData.bg : "white", color: intensidad === i ? perfilData.color : "#64748B", fontWeight: 700, fontSize: 13 }}>
                      {i}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 5 }}>
                  {intensidad === "Leve" ? "Axustes menores no grupo ordinario" : intensidad === "Moderada" ? "Modificacións claras, posible apoio PT/AL" : "Adaptación significativa, obxectivos modificados"}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 9 }}>
              <button onClick={() => setPantalla("necesidades")} className="btn" style={{ background: "#F1F5F9", color: "#475569", padding: "12px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>← Volver</button>
              <button onClick={generarTodas} disabled={areas.length === 0} className="btn"
                style={{ background: areas.length === 0 ? "#CBD5E1" : "linear-gradient(135deg,#2563EB,#1D4ED8)", color: "white", padding: "12px", borderRadius: 10, fontSize: 13, fontWeight: 800 }}>
                ✨ Xerar{areas.length > 0 ? ` ${areas.length} materia${areas.length > 1 ? "s" : ""}` : ""} con IA
              </button>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="fi" style={{ textAlign: "center", padding: "50px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }} className="pu">🧠</div>
            <h3 style={{ fontWeight: 800, color: "#1E3A5F", fontSize: 18, marginBottom: 7 }}>Xerando adaptacións...</h3>
            {loadingArea && <div style={{ display: "inline-block", background: "#EFF6FF", color: "#2563EB", borderRadius: 7, padding: "4px 13px", fontSize: 12, fontWeight: 700, marginBottom: 14 }}>📚 {loadingArea}</div>}
            <p style={{ color: "#94A3B8", fontSize: 13 }}>Procesando {areas.length} materia{areas.length > 1 ? "s" : ""}...</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 16 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#2563EB" }} className="pu" />)}
            </div>
          </div>
        )}

        {/* RESULTADO */}
        {pantalla === "resultado" && !loading && perfilData && (
          <div className="fi">
            <div style={{ background: "white", borderRadius: 11, border: "1px solid #E2E8F0", padding: "13px 16px", marginBottom: 12 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                <span style={{ background: perfilData.bg, color: perfilData.color, borderRadius: 6, padding: "3px 9px", fontSize: 12, fontWeight: 800 }}>{perfilData.emoji} {perfilData.label}</span>
                <span style={{ background: "#F1F5F9", color: "#475569", borderRadius: 6, padding: "3px 9px", fontSize: 12, fontWeight: 600 }}>{etapa}</span>
                <span style={{ background: "#FEF3C7", color: "#92400E", borderRadius: 6, padding: "3px 9px", fontSize: 12, fontWeight: 700 }}>📅 {trimestre} {anyo}</span>
                <span style={{ background: "#F0FDF4", color: "#166534", borderRadius: 6, padding: "3px 9px", fontSize: 12, fontWeight: 600 }}>🎚️ {intensidad}</span>
              </div>
              {alumno && <div style={{ fontWeight: 800, color: "#1E3A5F", fontSize: 14, marginBottom: 3 }}>👤 {alumno}</div>}
              {caracteristicas && <div style={{ color: "#64748B", fontSize: 12, marginTop: 2, fontStyle: "italic" }}>📝 {caracteristicas}</div>}
              <div style={{ color: "#64748B", fontSize: 11 }}>{areas.length} materia{areas.length > 1 ? "s" : ""}: {areas.join(" · ")}</div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 4, marginBottom: 10 }}>
              {areas.map(a => (
                <button key={a} onClick={() => setAreaActiva(areaActiva === a ? null : a)} className="btn"
                  style={{ padding: "7px 13px", borderRadius: 18, border: `1.5px solid ${areaActiva === a ? perfilData.color : "#E2E8F0"}`, background: areaActiva === a ? perfilData.bg : "white", color: areaActiva === a ? perfilData.color : "#64748B", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap", flexShrink: 0 }}>
                  {loadingArea === a ? "⏳" : resultados[a] && !resultados[a].startsWith("⚠️") ? "✅" : resultados[a]?.startsWith("⚠️") ? "❌" : "⭕"} {a.split(" ").slice(0,2).join(" ")}
                </button>
              ))}
            </div>

            {areaActiva && resultados[areaActiva] && !resultados[areaActiva].startsWith("⚠️") ? (
              <div style={{ background: "white", borderRadius: 11, border: `1.5px solid ${perfilData.color}40`, padding: "15px 18px", marginBottom: 12 }}>
                <div style={{ fontWeight: 800, color: perfilData.color, fontSize: 13, marginBottom: 8 }}>📚 {areaActiva}</div>
                <div style={{ lineHeight: 1.7 }}>{renderMd(resultados[areaActiva], perfilData.color)}</div>
              </div>
            ) : areaActiva && resultados[areaActiva]?.startsWith("⚠️") ? (
              <div style={{ background: "#FEF2F2", borderRadius: 11, border: "1.5px solid #FECACA", padding: "20px", textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
                <div style={{ color: "#991B1B", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Non se puido xerar esta materia</div>
                <button onClick={() => reintentarArea(areaActiva)} disabled={loadingArea === areaActiva} className="btn"
                  style={{ background: "#DC2626", color: "white", padding: "9px 20px", borderRadius: 9, fontSize: 13, fontWeight: 700 }}>
                  {loadingArea === areaActiva ? "⏳ Xerando..." : "🔄 Reintentar"}
                </button>
              </div>
            ) : areaActiva && loadingArea === areaActiva ? (
              <div style={{ background: "#F8FAFC", borderRadius: 11, border: "1px dashed #CBD5E1", padding: "22px", textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 28, marginBottom: 7 }} className="pu">🧠</div>
                <div style={{ color: "#64748B", fontSize: 13, fontWeight: 600 }}>Xerando {areaActiva}...</div>
              </div>
            ) : !areaActiva && (
              <div style={{ background: "#F8FAFC", borderRadius: 11, border: "1px dashed #CBD5E1", padding: "22px", textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 28, marginBottom: 7 }}>☝️</div>
                <div style={{ color: "#94A3B8", fontSize: 13, fontWeight: 600 }}>Preme unha materia para ver as súas adaptacións</div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 7, marginBottom: 8 }}>
              <button onClick={copiarTodo} className="btn" style={{ background: "#F1F5F9", color: "#374151", padding: "10px 4px", borderRadius: 9, fontSize: 10, fontWeight: 700 }}>📋 Copiar</button>
              <button onClick={exportarPDF} className="btn" style={{ background: "#FEF3C7", color: "#92400E", padding: "10px 4px", borderRadius: 9, fontSize: 10, fontWeight: 700, border: "1.5px solid #FDE68A" }}>📄 PDF</button>
              <button onClick={guardarEnHistorial} disabled={guardado} className="btn"
                style={{ background: guardado ? "#D1FAE5" : "#ECFDF5", color: guardado ? "#065F46" : "#059669", padding: "10px 4px", borderRadius: 9, fontSize: 10, fontWeight: 700, border: `1.5px solid ${guardado ? "#6EE7B7" : "#A7F3D0"}` }}>
                {guardado ? "✅ Gardado" : "💾 Gardar"}
              </button>
              <button onClick={nueva} className="btn" style={{ background: "linear-gradient(135deg,#2563EB,#1D4ED8)", color: "white", padding: "10px 4px", borderRadius: 9, fontSize: 10, fontWeight: 700 }}>✨ Nova</button>
            </div>
            <button onClick={() => setPantalla("ajustes")} className="btn" style={{ width: "100%", background: "white", color: "#475569", padding: "9px", borderRadius: 9, fontSize: 12, fontWeight: 700, border: "1.5px solid #E2E8F0" }}>← Cambiar parámetros</button>
          </div>
        )}

        {/* HISTORIAL */}
        {pantalla === "historial" && (
          <div className="fi">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1E3A5F" }}>📋 Historial</h2>
                <p style={{ color: "#64748B", fontSize: 12, marginTop: 3 }}>{historial.length} adaptacións gardadas</p>
              </div>
              <button onClick={nueva} className="btn" style={{ background: "linear-gradient(135deg,#2563EB,#1D4ED8)", color: "white", padding: "7px 13px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>+ Nova</button>
            </div>
            {historial.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "white", borderRadius: 11, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 40, marginBottom: 9 }}>📭</div>
                <div style={{ fontWeight: 700, color: "#94A3B8", fontSize: 14 }}>Sin adaptacións gardadas aún</div>
              </div>
            ) : historial.map(h => {
              const pd = PERFILES.find(p => p.id === h.perfil);
              const open = historialItem?.id === h.id;
              const hAreas = Array.isArray(h.areas) && h.areas.length > 0 ? h.areas : (h.area ? [h.area] : ["Sen área"]);
              const hResultados = h.resultados && typeof h.resultados === "object" ? h.resultados : (h.resultado ? { [hAreas[0]]: h.resultado } : {});
              const textoCompleto = hAreas.map(a => `=== ${a} ===\n${hResultados[a] || ""}`).join("\n\n");
              return (
                <div key={h.id} className="ch" onClick={() => setHistorialItem(open ? null : h)}
                  style={{ background: "white", borderRadius: 11, border: "1px solid #E2E8F0", overflow: "hidden", marginBottom: 9 }}>
                  <div style={{ padding: "12px 15px", display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 9, background: pd?.bg || "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{pd?.emoji || "📄"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 800, color: "#1E3A5F", fontSize: 13 }}>{h.alumno || "Sen nome"}</span>
                        <span style={{ background: pd?.bg || "#F1F5F9", color: pd?.color || "#475569", borderRadius: 5, padding: "2px 7px", fontSize: 11, fontWeight: 700 }}>{h.perfil}</span>
                        {h.trimestre && <span style={{ background: "#FEF3C7", color: "#92400E", borderRadius: 5, padding: "2px 7px", fontSize: 11, fontWeight: 700 }}>{h.trimestre} {h.anyo}</span>}
                      </div>
                      <div style={{ color: "#94A3B8", fontSize: 11, marginTop: 3 }}>{h.etapa} · {hAreas.join(", ")} · {h.fecha}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <button onClick={e => { e.stopPropagation(); cargarDesdeHistorial(h); }} className="btn"
                        style={{ background: "#EFF6FF", color: "#2563EB", padding: "5px 10px", borderRadius: 7, fontSize: 11, fontWeight: 700, border: "1.5px solid #BFDBFE", whiteSpace: "nowrap" }}>✏️ Editar</button>
                      {confirmDelete === h.id ? (
                        <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
                          <button onClick={() => eliminarDeHistorial(h.id)} className="btn"
                            style={{ background: "#DC2626", color: "white", padding: "5px 9px", borderRadius: 7, fontSize: 11, fontWeight: 700, border: "none" }}>Si, borrar</button>
                          <button onClick={() => setConfirmDelete(null)} className="btn"
                            style={{ background: "#F1F5F9", color: "#475569", padding: "5px 9px", borderRadius: 7, fontSize: 11, fontWeight: 700, border: "none" }}>Cancelar</button>
                        </div>
                      ) : (
                        <button onClick={e => { e.stopPropagation(); setConfirmDelete(h.id); }} className="btn"
                          style={{ background: "#FEF2F2", color: "#DC2626", padding: "5px 10px", borderRadius: 7, fontSize: 11, fontWeight: 700, border: "1.5px solid #FECACA", whiteSpace: "nowrap" }}>🗑️</button>
                      )}
                      <div style={{ color: "#64748B", fontSize: 16, fontWeight: 700 }}>{open ? "▲" : "▼"}</div>
                    </div>
                  </div>
                  {open && (
                    <div style={{ borderTop: "1px solid #F1F5F9", padding: "14px 16px", background: "#FAFAFA" }}>
                      {hAreas.map(a => (
                        <div key={a} style={{ marginBottom: 14 }}>
                          {hAreas.length > 1 && (
                            <div style={{ fontWeight: 800, color: pd?.color || "#2563EB", fontSize: 12, marginBottom: 6, padding: "3px 10px", background: pd?.bg || "#EFF6FF", borderRadius: 6, display: "inline-block" }}>📚 {a}</div>
                          )}
                          <div style={{ marginTop: 4 }}>
                            {hResultados[a]
                              ? renderMd(hResultados[a], pd?.color)
                              : <p style={{ color: "#94A3B8", fontSize: 12 }}>Sen contido para esta materia.</p>}
                          </div>
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(textoCompleto); }} className="btn"
                          style={{ background: "#F1F5F9", color: "#374151", padding: "7px 13px", borderRadius: 7, fontSize: 11, fontWeight: 700 }}>📋 Copiar todo</button>
                        <button onClick={e => { e.stopPropagation(); cargarDesdeHistorial(h); }} className="btn"
                          style={{ background: "#EFF6FF", color: "#2563EB", padding: "7px 13px", borderRadius: 7, fontSize: 11, fontWeight: 700, border: "1.5px solid #BFDBFE" }}>✏️ Editar / Engadir</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
