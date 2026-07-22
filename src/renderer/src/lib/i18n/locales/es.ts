import type { TranslationDict } from "./pt";

const es: TranslationDict = {
  header: {
    lastScan: "último escaneo: {{time}}",
  },
  scan: {
    placeholder: "C:\\Usuarios\\tu\\Proyectos",
    browse: "Elegir carpeta",
    scanButton: "Escanear carpeta",
  },
  stats: {
    projectsFound: "Proyectos encontrados",
    gitRepos: "Repositorios Git",
    distinctTechs: "Tecnologías distintas",
    scannedFolder: "Carpeta escaneada",
  },
  filters: {
    placeholder: "Filtrar por nombre...",
    all: "Todas",
  },
  empty: {
    chooseFolder: "Elige una carpeta con tus proyectos para empezar.",
    noProjects: "Todavía no se encontró ningún proyecto en esta carpeta.",
    noMatch: "Ningún proyecto coincide con el filtro actual.",
  },
  card: {
    repo: "repo",
    localFolder: "carpeta local",
    updated: "actualizado {{time}}",
    branchSingular: "rama",
    branchPlural: "ramas",
    vscode: "VS Code",
    visualStudio: "Visual Studio",
    noSolutionTitle: "No se encontró ningún archivo .sln",
    openFork: "Abrir en Fork",
    openExplorer: "Abrir en el Explorador de Archivos",
    viewDetails: "Ver detalles y mejoras",
  },
  run: {
    runningTooltip: "En ejecución · clic para detener",
    stoppedTooltip: "Detenido · clic para ejecutar",
    runAria: "Ejecutar proyecto",
    stopAria: "Detener proyecto",
  },
  details: {
    back: "Volver a los proyectos",
    futureImprovements: "Mejoras futuras",
    addPlaceholder: "Describe una mejora para hacer más adelante...",
    add: "Añadir",
    loading: "Cargando...",
    empty: "Todavía no hay mejoras registradas para este proyecto.",
    savedLocally: "Guardado localmente en Documents/devboard_improvments.",
    removeAria: "Eliminar mejora",
  },
  window: {
    minimize: "Minimizar",
    reduce: "Reducir tamaño",
    fullscreen: "Pantalla completa",
    close: "Cerrar",
  },
  autostart: {
    enabled: "Iniciar con Windows: activado",
    disabled: "Iniciar con Windows: desactivado",
  },
  theme: {
    toLight: "Cambiar a tema claro",
    toDark: "Cambiar a tema oscuro",
  },
  language: {
    portuguese: "Português",
    english: "English",
    spanish: "Español",
  },
  time: {
    never: "sin actividad registrada",
    justNow: "justo ahora",
    minutesAgo: "hace {{count}} min",
    hoursAgo: "hace {{count}} h",
    daysAgo: "hace {{count}} d",
    monthsAgo: "hace {{count}} m",
    yearsAgo: "hace {{count}} a",
  },
  errors: {
    communicationFailed: "No fue posible comunicarse con el proceso principal de DevBoard.",
    emptyRoot: "Indica una carpeta para escanear.",
    folderNotFound: 'La carpeta "{{path}}" no fue encontrada en este equipo.',
    folderReadFailed: 'No fue posible leer la carpeta "{{path}}". Verifica los permisos de acceso.',
    projectNotFound: "Carpeta del proyecto no encontrada.",
    vscodeNotFound:
      "No fue posible abrir VS Code. Verifica que el comando 'code' esté instalado en el PATH (Ctrl+Shift+P → 'Shell Command: Install code command in PATH').",
    visualstudioWindowsOnly: "Visual Studio solo puede abrirse desde Windows.",
    noSolutionFile: "No se encontró ningún archivo .sln en esta carpeta.",
    visualstudioOpenFailed: "No fue posible abrir Visual Studio.",
    forkOpenFailed:
      "No fue posible abrir Fork. Verifica que esté instalado, o habilita la herramienta de línea de comandos en Preferences → Integration → Install Command Line Tool.",
    explorerOpenFailed: "No fue posible abrir el Explorador de Archivos.",
    unknownEditor: "Editor desconocido.",
    runUnsupportedTech: "Ningún comando de ejecución conocido para esta tecnología.",
  },
};

export default es;
