import type { TranslationDict } from "./pt";

const en: TranslationDict = {
  header: {
    lastScan: "last scan: {{time}}",
  },
  scan: {
    placeholder: "C:\\Users\\you\\Projects",
    browse: "Choose folder",
    scanButton: "Scan folder",
  },
  stats: {
    projectsFound: "Projects found",
    gitRepos: "Git repositories",
    distinctTechs: "Distinct technologies",
    scannedFolder: "Scanned folder",
  },
  filters: {
    placeholder: "Filter by name...",
    all: "All",
  },
  empty: {
    chooseFolder: "Choose a folder with your projects to get started.",
    noProjects: "No projects found in this folder yet.",
    noMatch: "No project matches the current filter.",
  },
  card: {
    repo: "repo",
    localFolder: "local folder",
    updated: "updated {{time}}",
    branchSingular: "branch",
    branchPlural: "branches",
    vscode: "VS Code",
    visualStudio: "Visual Studio",
    noSolutionTitle: "No .sln file found",
    openFork: "Open in Fork",
    openExplorer: "Open in File Explorer",
    viewDetails: "View details and improvements",
  },
  run: {
    runningTooltip: "Running · click to stop",
    stoppedTooltip: "Stopped · click to run",
    runAria: "Run project",
    stopAria: "Stop project",
  },
  details: {
    back: "Back to projects",
    futureImprovements: "Future improvements",
    addPlaceholder: "Describe an improvement to do later...",
    add: "Add",
    loading: "Loading...",
    empty: "No improvements registered yet for this project.",
    savedLocally: "Saved locally in Documents/devboard_improvments.",
    removeAria: "Remove improvement",
  },
  window: {
    minimize: "Minimize",
    reduce: "Reduce size",
    fullscreen: "Fullscreen",
    close: "Close",
  },
  autostart: {
    enabled: "Start with Windows: on",
    disabled: "Start with Windows: off",
  },
  theme: {
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme",
  },
  language: {
    portuguese: "Português",
    english: "English",
    spanish: "Español",
  },
  time: {
    never: "no activity recorded",
    justNow: "just now",
    minutesAgo: "{{count}} min ago",
    hoursAgo: "{{count}} h ago",
    daysAgo: "{{count}} d ago",
    monthsAgo: "{{count}} mo ago",
    yearsAgo: "{{count}} yr ago",
  },
  errors: {
    communicationFailed: "Could not communicate with the DevBoard main process.",
    emptyRoot: "Enter a folder to scan.",
    folderNotFound: 'Folder "{{path}}" was not found on this computer.',
    folderReadFailed: 'Could not read folder "{{path}}". Check the access permissions.',
    projectNotFound: "Project folder not found.",
    vscodeNotFound:
      "Could not open VS Code. Check whether the 'code' command is installed on PATH (Ctrl+Shift+P → 'Shell Command: Install code command in PATH').",
    visualstudioWindowsOnly: "Visual Studio can only be opened from Windows.",
    noSolutionFile: "No .sln file was found in this folder.",
    visualstudioOpenFailed: "Could not open Visual Studio.",
    forkOpenFailed:
      "Could not open Fork. Check whether it is installed, or enable the command line tool in Preferences → Integration → Install Command Line Tool.",
    explorerOpenFailed: "Could not open File Explorer.",
    unknownEditor: "Unknown editor.",
    runUnsupportedTech: "No known run command for this technology.",
  },
};

export default en;
