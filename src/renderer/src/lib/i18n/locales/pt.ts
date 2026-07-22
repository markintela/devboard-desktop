import type { ErrorCode } from "@/lib/types";

const pt = {
  header: {
    lastScan: "último scan: {{time}}",
  },
  scan: {
    placeholder: "C:\\Users\\voce\\Projetos",
    browse: "Escolher pasta",
    scanButton: "Escanear pasta",
  },
  stats: {
    projectsFound: "Projetos encontrados",
    gitRepos: "Repositórios Git",
    distinctTechs: "Tecnologias distintas",
    scannedFolder: "Pasta escaneada",
  },
  filters: {
    placeholder: "Filtrar por nome...",
    all: "Todas",
  },
  empty: {
    chooseFolder: "Escolha uma pasta com seus projetos para começar.",
    noProjects: "Nenhum projeto encontrado nessa pasta ainda.",
    noMatch: "Nenhum projeto corresponde ao filtro atual.",
  },
  card: {
    repo: "repo",
    localFolder: "pasta local",
    updated: "atualizado {{time}}",
    branchSingular: "branch",
    branchPlural: "branches",
    vscode: "VS Code",
    visualStudio: "Visual Studio",
    noSolutionTitle: "Nenhum arquivo .sln encontrado",
    openFork: "Abrir no Fork",
    openExplorer: "Abrir no Explorador de Arquivos",
    viewDetails: "Ver detalhes e melhorias",
  },
  run: {
    runningTooltip: "Rodando · clique para parar",
    stoppedTooltip: "Parado · clique para rodar",
    runAria: "Rodar projeto",
    stopAria: "Parar projeto",
  },
  details: {
    back: "Voltar para os projetos",
    futureImprovements: "Melhorias futuras",
    addPlaceholder: "Descreva uma melhoria para fazer depois...",
    add: "Adicionar",
    loading: "Carregando...",
    empty: "Nenhuma melhoria registrada ainda para este projeto.",
    savedLocally: "Salvo localmente em Documents/devboard_improvments.",
    removeAria: "Remover melhoria",
  },
  window: {
    minimize: "Minimizar",
    reduce: "Reduzir tamanho",
    fullscreen: "Tela cheia",
    close: "Fechar",
  },
  autostart: {
    enabled: "Iniciar com o Windows: ativado",
    disabled: "Iniciar com o Windows: desativado",
  },
  theme: {
    toLight: "Mudar para tema claro",
    toDark: "Mudar para tema escuro",
  },
  language: {
    portuguese: "Português",
    english: "English",
    spanish: "Español",
  },
  time: {
    never: "sem atividade registrada",
    justNow: "agora mesmo",
    minutesAgo: "há {{count}} min",
    hoursAgo: "há {{count}} h",
    daysAgo: "há {{count}} d",
    monthsAgo: "há {{count}} m",
    yearsAgo: "há {{count}} a",
  },
  errors: {
    communicationFailed: "Não foi possível conversar com o processo principal do DevBoard.",
    emptyRoot: "Informe uma pasta para escanear.",
    folderNotFound: 'A pasta "{{path}}" não foi encontrada neste computador.',
    folderReadFailed: 'Não foi possível ler a pasta "{{path}}". Verifique as permissões de acesso.',
    projectNotFound: "Pasta do projeto não encontrada.",
    vscodeNotFound:
      "Não foi possível abrir o VS Code. Verifique se o comando 'code' está instalado no PATH (Ctrl+Shift+P → 'Shell Command: Install code command in PATH').",
    visualstudioWindowsOnly: "O Visual Studio só pode ser aberto a partir do Windows.",
    noSolutionFile: "Nenhum arquivo .sln foi encontrado nesta pasta.",
    visualstudioOpenFailed: "Não foi possível abrir o Visual Studio.",
    forkOpenFailed:
      "Não foi possível abrir o Fork. Verifique se ele está instalado, ou habilite a ferramenta de linha de comando em Preferences → Integration → Install Command Line Tool.",
    explorerOpenFailed: "Não foi possível abrir o Explorador de Arquivos.",
    unknownEditor: "Editor desconhecido.",
    runUnsupportedTech: "Nenhum comando de execução conhecido para essa tecnologia.",
  } satisfies Record<ErrorCode, string>,
};

export default pt;
export type TranslationDict = typeof pt;
