// Theme definitions
const themes = {
    light: {
        '--color-background': '#ffffff',
        '--color-surface': '#f8f8f8',
        '--color-text': '#133252',
        '--color-text-secondary': '#62686d',
        '--color-primary': '#3b82f6',
        '--color-primary-hover': '#2563eb',
        '--color-primary-active': '#1d4ed8',
        '--color-secondary': 'rgba(94, 82, 64, 0.12)',
        '--color-secondary-hover': 'rgba(94, 82, 64, 0.2)',
        '--color-secondary-active': 'rgba(94, 82, 64, 0.25)',
        '--color-border': 'rgba(94, 82, 64, 0.2)',
        '--color-error': '#c0152f',
        '--color-success': '#21c084',
        '--color-warning': '#a8752f',
        '--color-info': '#62686d',
        '--color-focus-ring': 'rgba(59, 130, 246, 0.4)',
        '--color-btn-primary-text': '#ffffff',
        '--color-card-border': 'rgba(94, 82, 64, 0.12)',
        '--color-card-border-inner': 'rgba(94, 82, 64, 0.12)',
        '--color-select-caret': 'rgba(19, 52, 59, 0.8)',
        '--shadow-inset-sm': 'inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.03)'
    },
    dark: {
        '--color-background': '#1a1a1a',
        '--color-surface': '#2a2a2a',
        '--color-text': '#f5f5f5',
        '--color-text-secondary': 'rgba(167, 169, 169, 0.7)',
        '--color-primary': '#ef4444',
        '--color-primary-hover': '#dc2626',
        '--color-primary-active': '#b91c1c',
        '--color-secondary': 'rgba(119, 124, 124, 0.15)',
        '--color-secondary-hover': 'rgba(119, 124, 124, 0.25)',
        '--color-secondary-active': 'rgba(119, 124, 124, 0.3)',
        '--color-border': 'rgba(119, 124, 124, 0.3)',
        '--color-error': '#ff5461',
        '--color-success': '#32c6c6',
        '--color-warning': '#e6a161',
        '--color-info': '#a7a9a9',
        '--color-focus-ring': 'rgba(239, 68, 68, 0.4)',
        '--color-btn-primary-text': '#133252',
        '--color-card-border': 'rgba(119, 124, 124, 0.2)',
        '--color-card-border-inner': 'rgba(119, 124, 124, 0.15)',
        '--color-select-caret': 'rgba(245, 245, 245, 0.8)',
        '--shadow-inset-sm': 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.15)'
    }
};

// Application State
const state = {
    apiKey: '',
    models: [],
    selectedModel: null,
    files: [],
    selectedFiles: new Set(),
    suggestedFiles: new Set(),
    currentPreviewFile: null,
    generatedPrompt: '',
    lastResponse: '',
    isStreaming: false,
    // Track which folders are expanded using full folder paths like "root/src"
    expandedFolders: new Set(),
    // Name of the single common top-level folder (if any), kept always expanded
    rootFolderName: null,
    theme: 'auto', // 'light', 'dark', or 'auto'
    settings: {
        maxTokens: 4000,
        temperature: 0.7,
        streamResponse: true
    },
    promptTemplates: {
        'code-review': 'Please review the following code files for:\n- Potential bugs or errors\n- Performance improvements\n- Code quality and best practices\n- Security vulnerabilities\n\nProvide specific suggestions with line numbers where applicable.',
        'feature-implementation': 'Implement the following feature:\n\n{TASK_DESCRIPTION}\n\nRequirements:\n- Follow existing code patterns and conventions\n- Include appropriate error handling\n- Add comments for complex logic\n- Ensure backward compatibility',
        'bug-fix': 'Fix the following bug:\n\n{TASK_DESCRIPTION}\n\nPlease:\n- Identify the root cause\n- Provide a fix that doesn\'t break existing functionality\n- Add tests if appropriate\n- Explain the solution'
    }
};

// === Live folder linking state ===
// For files indexed via the File System Access API we attach a FileSystemFileHandle to each file.
// We also keep a map path -> handle so we can re-resolve if needed.
state.livePathToHandle = new Map();

// File type configurations
const fileTypes = {
    '.js': { icon: '📄', color: '#f7df1e', type: 'javascript' },
    '.jsx': { icon: '📄', color: '#f7df1e', type: 'javascript' },
    '.ts': { icon: '📄', color: '#f7df1e', type: 'javascript' },
    '.tsx': { icon: '📄', color: '#f7df1e', type: 'javascript' },
    '.mjs': { icon: '📄', color: '#f7df1e', type: 'javascript' },
    '.py': { icon: '🐍', color: '#3776ab', type: 'python' },
    '.pyw': { icon: '🐍', color: '#3776ab', type: 'python' },
    '.css': { icon: '🎨', color: '#1572b6', type: 'css' },
    '.scss': { icon: '🎨', color: '#1572b6', type: 'css' },
    '.sass': { icon: '🎨', color: '#1572b6', type: 'css' },
    '.less': { icon: '🎨', color: '#1572b6', type: 'css' },
    '.html': { icon: '🌐', color: '#e34f26', type: 'html' },
    '.htm': { icon: '🌐', color: '#e34f26', type: 'html' },
    '.json': { icon: '📋', color: '#f39c12', type: 'json' },
    '.jsonl': { icon: '📋', color: '#f39c12', type: 'json' },
    '.md': { icon: '📝', color: '#083fa1', type: 'markdown' },
    '.markdown': { icon: '📝', color: '#083fa1', type: 'markdown' },
    '.txt': { icon: '📄', color: '#95a5a6', type: 'text' },
    '.yaml': { icon: '⚙️', color: '#cb171e', type: 'yaml' },
    '.yml': { icon: '⚙️', color: '#cb171e', type: 'yaml' },
    '.xml': { icon: '📄', color: '#e44d26', type: 'xml' },
    '.svg': { icon: '🖼️', color: '#ff9800', type: 'xml' },
    '.php': { icon: '🐘', color: '#777bb4', type: 'php' },
    '.rb': { icon: '💎', color: '#cc342d', type: 'ruby' },
    '.java': { icon: '☕', color: '#ed8b00', type: 'java' },
    '.go': { icon: '🐹', color: '#00add8', type: 'go' },
    '.rs': { icon: '🦀', color: '#ce422b', type: 'rust' },
    '.cpp': { icon: '⚡', color: '#00599c', type: 'cpp' },
    '.c': { icon: '⚡', color: '#00599c', type: 'c' },
    '.h': { icon: '⚡', color: '#00599c', type: 'c' },
    '.sh': { icon: '🐚', color: '#4eaa25', type: 'bash' },
    '.bash': { icon: '🐚', color: '#4eaa25', type: 'bash' },
    '.dockerfile': { icon: '🐳', color: '#2496ed', type: 'dockerfile' },
    '.gitignore': { icon: '🚫', color: '#f14e32', type: 'text' },
    '.env': { icon: '🔒', color: '#ecd53f', type: 'text' }
};

// Initialize the application
function init() {
    setupEventListeners();
    loadSettings();
    updateUI();
    updateThemeToggleButton();
    updateModelDisplay();

    // Try to load models if API key is available
    if (state.apiKey) {
        loadModels();
    }

    console.log('PromptBuilder Web initialized');
}

// Setup all event listeners
function setupEventListeners() {
    // Navigation
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
    document.getElementById('refreshModels').addEventListener('click', loadModels);

    // Custom dropdown events
    setupModelDropdown();
    
    // File handling
    const fileUploadZone = document.getElementById('fileUploadZone');
    fileUploadZone.addEventListener('dragover', handleDragOver);
    fileUploadZone.addEventListener('dragleave', handleDragLeave);
    fileUploadZone.addEventListener('drop', handleFileDrop);
    
    document.getElementById('browseFiles').addEventListener('click', () => {
        document.getElementById('singleFileInput').click();
    });
    document.getElementById('browseFolders').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    // Live folder linking (File System Access API)
    const liveBtn = document.getElementById('linkLiveFolder');
    if (liveBtn) {
        liveBtn.addEventListener('click', linkLiveFolder);
    }
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
    document.getElementById('singleFileInput').addEventListener('change', handleFileSelect);
    
    document.getElementById('selectAllFiles').addEventListener('click', selectAllFiles);
    document.getElementById('clearFiles').addEventListener('click', clearFiles);
    
    // Context builder
    document.getElementById('suggestFiles').addEventListener('click', suggestRelevantFiles);
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
    
    // Prompt generation
    document.getElementById('generatePrompt').addEventListener('click', () => { generatePrompt().catch(err => showError(err.message || String(err))); });
    document.getElementById('copyPrompt').addEventListener('click', copyPrompt);
    document.getElementById('promptTemplate').addEventListener('change', handleTemplateChange);
    
    // AI response
    document.getElementById('sendPrompt').addEventListener('click', sendPromptToAI);
    document.getElementById('stopGeneration').addEventListener('click', stopGeneration);
    document.getElementById('copyResponse').addEventListener('click', copyResponse);
    
    // Settings modal
    document.getElementById('closeSettings').addEventListener('click', closeSettingsModal);
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('cancelSettings').addEventListener('click', closeSettingsModal);
    
    // Temperature slider
    const tempSlider = document.getElementById('temperature');
    tempSlider.addEventListener('input', (e) => {
        document.getElementById('temperatureValue').textContent = e.target.value;
    });
    
    // Project management
    document.getElementById('saveProject').addEventListener('click', saveProject);
    document.getElementById('loadProject').addEventListener('click', loadProject);
    document.getElementById('exportPrompt').addEventListener('click', exportPrompt);
    document.getElementById('projectFileInput').addEventListener('change', handleProjectLoad);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Modal click outside to close
    document.getElementById('settingsModal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeSettingsModal();
        }
    });
}

// Load settings from localStorage
function loadSettings() {
    // Load API key and settings from localStorage if available
    try {
        const savedApiKey = localStorage.getItem('openRouterApiKey');
        if (savedApiKey) {
            state.apiKey = savedApiKey;
        }

        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            state.settings = { ...state.settings, ...parsedSettings };
        }

        // Load saved selected model ID
        const savedModelId = localStorage.getItem('selectedModel');
        if (savedModelId) {
            state.savedModelId = savedModelId;
        }
    } catch (e) {
        console.warn('localStorage not available, using default settings');
    }

    // Load theme preference from sessionStorage if available
    try {
        const savedTheme = sessionStorage.getItem('theme');
        if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
            state.theme = savedTheme;
        }
    } catch (e) {
        // sessionStorage not available, use default 'auto'
    }

    // Apply initial theme
    applyTheme();

    // Update UI with loaded settings
    updateSettingsUI();
}

// Update settings UI
function updateSettingsUI() {
    document.getElementById('apiKey').value = state.apiKey;
    document.getElementById('maxTokens').value = state.settings.maxTokens;
    document.getElementById('temperature').value = state.settings.temperature;
    document.getElementById('temperatureValue').textContent = state.settings.temperature;
    document.getElementById('streamResponse').checked = state.settings.streamResponse;
    updateModelDisplay();
}

// Load models from OpenRouter API
async function loadModels() {
    if (!state.apiKey) {
        showError('Please set your OpenRouter API key in settings');
        return;
    }
    
    try {
        showLoading('Loading models...');
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            headers: {
                'Authorization': `Bearer ${state.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        state.models = data.data || [];
        updateModelsDropdown();

        // Select saved model if available
        if (state.savedModelId && state.models.find(m => m.id === state.savedModelId)) {
            selectModel(state.savedModelId);
            delete state.savedModelId; // Clean up
        }

        hideLoading();

        console.log(`Loaded ${state.models.length} models`);
    } catch (error) {
        console.error('Failed to load models:', error);
        showError(`Failed to load models: ${error.message}`);
        hideLoading();
        
        // Use sample models as fallback
        state.models = [
            {
                id: "openai/gpt-4o",
                name: "GPT-4o",
                description: "OpenAI's most advanced model",
                context_length: 128000,
                pricing: { prompt: "0.000005", completion: "0.000015" },
                owned_by: "OpenAI"
            },
            {
                id: "anthropic/claude-3.5-sonnet",
                name: "Claude 3.5 Sonnet",
                description: "Anthropic's most capable model",
                context_length: 200000,
                pricing: { prompt: "0.000003", completion: "0.000015" },
                owned_by: "Anthropic"
            },
            {
                id: "meta-llama/llama-3.3-70b-instruct",
                name: "Llama 3.3 70B Instruct",
                description: "Meta's large language model",
                context_length: 131072,
                pricing: { prompt: "0.0000008", completion: "0.0000008" },
                owned_by: "Meta"
            }
        ];
        updateModelsDropdown();

        // Select saved model if available
        if (state.savedModelId && state.models.find(m => m.id === state.savedModelId)) {
            selectModel(state.savedModelId);
            delete state.savedModelId; // Clean up
        }
    }
}

// Setup custom model dropdown
function setupModelDropdown() {
    const dropdown = document.getElementById('modelDropdown');
    const trigger = document.getElementById('modelSearch');
    const menu = document.getElementById('modelMenu');

    // Toggle dropdown
    trigger.addEventListener('click', () => {
        const isOpen = dropdown.classList.contains('open');
        closeAllDropdowns();
        if (!isOpen) {
            dropdown.classList.add('open');
            trigger.readOnly = false;
            trigger.focus();
            trigger.select();
        }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            closeAllDropdowns();
        }
    });

    // Search functionality
    trigger.addEventListener('input', (e) => {
        filterModels(e.target.value);
    });

    // Keyboard navigation
    trigger.addEventListener('keydown', (e) => {
        handleDropdownKeydown(e);
    });
}

// Close all dropdowns
function closeAllDropdowns() {
    document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
        dropdown.classList.remove('open');
        const input = dropdown.querySelector('input');
        if (input) {
            input.readOnly = true;
        }
    });
}

// Update models dropdown
function updateModelsDropdown() {
    const menu = document.getElementById('modelMenu');
    menu.innerHTML = '';

    if (state.models.length === 0) {
        menu.innerHTML = '<div class="model-item">No models available</div>';
        return;
    }

    // Group models by provider
    const groupedModels = {};
    state.models.forEach(model => {
        const provider = model.owned_by || 'Other';
        if (!groupedModels[provider]) {
            groupedModels[provider] = [];
        }
        groupedModels[provider].push(model);
    });

    // Add grouped models
    Object.entries(groupedModels).forEach(([provider, models]) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'model-group';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'model-group-title';
        titleDiv.textContent = provider;
        groupDiv.appendChild(titleDiv);

        models.forEach(model => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'model-item';
            itemDiv.dataset.modelId = model.id;
            itemDiv.innerHTML = `
                <div class="model-name">${model.name || model.id}</div>
                <div class="model-provider">${provider}</div>
            `;

            itemDiv.addEventListener('click', () => {
                selectModel(model.id);
            });

            groupDiv.appendChild(itemDiv);
        });

        menu.appendChild(groupDiv);
    });
}

// Filter models based on search
function filterModels(query) {
    const menu = document.getElementById('modelMenu');
    const items = menu.querySelectorAll('.model-item');
    const groups = menu.querySelectorAll('.model-group');

    if (!query.trim()) {
        // Show all
        items.forEach(item => item.style.display = '');
        groups.forEach(group => group.style.display = '');
        return;
    }

    const searchTerm = query.toLowerCase();
    let hasVisibleItems = false;

    groups.forEach(group => {
        const groupItems = group.querySelectorAll('.model-item');
        let groupHasVisible = false;

        groupItems.forEach(item => {
            const modelName = item.querySelector('.model-name').textContent.toLowerCase();
            const modelProvider = item.querySelector('.model-provider').textContent.toLowerCase();
            const isVisible = modelName.includes(searchTerm) || modelProvider.includes(searchTerm);

            item.style.display = isVisible ? '' : 'none';
            if (isVisible) {
                groupHasVisible = true;
                hasVisibleItems = true;
            }
        });

        group.style.display = groupHasVisible ? '' : 'none';
    });

    // Show "no results" if nothing found
    if (!hasVisibleItems) {
        if (!menu.querySelector('.no-results')) {
            const noResults = document.createElement('div');
            noResults.className = 'model-item no-results';
            noResults.innerHTML = '<div class="model-name">No models found</div>';
            menu.appendChild(noResults);
        }
        menu.querySelector('.no-results').style.display = '';
    } else {
        const noResults = menu.querySelector('.no-results');
        if (noResults) noResults.style.display = 'none';
    }
}

// Handle keyboard navigation
function handleDropdownKeydown(e) {
    const menu = document.getElementById('modelMenu');
    const items = Array.from(menu.querySelectorAll('.model-item:not([style*="display: none"]):not(.no-results)'));

    if (!items.length) return;

    let highlightedIndex = items.findIndex(item => item.classList.contains('highlighted'));

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            highlightedIndex = highlightedIndex < items.length - 1 ? highlightedIndex + 1 : 0;
            updateHighlight(items, highlightedIndex);
            break;
        case 'ArrowUp':
            e.preventDefault();
            highlightedIndex = highlightedIndex > 0 ? highlightedIndex - 1 : items.length - 1;
            updateHighlight(items, highlightedIndex);
            break;
        case 'Enter':
            e.preventDefault();
            if (highlightedIndex >= 0) {
                const modelId = items[highlightedIndex].dataset.modelId;
                if (modelId) selectModel(modelId);
            }
            break;
        case 'Escape':
            e.preventDefault();
            closeAllDropdowns();
            break;
    }
}

// Update highlight
function updateHighlight(items, index) {
    items.forEach((item, i) => {
        item.classList.toggle('highlighted', i === index);
    });

    // Scroll into view
    if (items[index]) {
        items[index].scrollIntoView({ block: 'nearest' });
    }
}

// Select model
function selectModel(modelId) {
    state.selectedModel = state.models.find(m => m.id === modelId) || null;

    // Save to localStorage
    try {
        if (state.selectedModel) {
            localStorage.setItem('selectedModel', state.selectedModel.id);
        } else {
            localStorage.removeItem('selectedModel');
        }
    } catch (e) {
        console.warn('Failed to save selected model to localStorage:', e);
    }

    // Update display
    const trigger = document.getElementById('modelSearch');
    if (state.selectedModel) {
        trigger.value = state.selectedModel.name || state.selectedModel.id;
    } else {
        trigger.value = '';
    }

    // Update selection highlight
    const menu = document.getElementById('modelMenu');
    menu.querySelectorAll('.model-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.modelId === modelId);
    });

    closeAllDropdowns();
    updateModelInfo();
    updateTokenEstimates();
}

// Initialize model display
function updateModelDisplay() {
    const trigger = document.getElementById('modelSearch');
    if (state.selectedModel) {
        trigger.value = state.selectedModel.name || state.selectedModel.id;
    } else {
        trigger.value = '';
        trigger.placeholder = 'Search models...';
    }
}

// Update model information display
function updateModelInfo() {
    const modelInfo = document.getElementById('modelInfo');
    
    if (!state.selectedModel) {
        modelInfo.innerHTML = '<p class="text-secondary">Select a model to view details</p>';
        return;
    }
    
    const model = state.selectedModel;
    modelInfo.innerHTML = `
        <div class="model-detail">
            <span>Name:</span>
            <span>${model.name || model.id}</span>
        </div>
        <div class="model-detail">
            <span>Provider:</span>
            <span class="model-provider">${model.owned_by || 'Unknown'}</span>
        </div>
        <div class="model-detail">
            <span>Context:</span>
            <span>${(model.context_length || 0).toLocaleString()} tokens</span>
        </div>
        ${model.pricing ? `
        <div class="model-detail">
        <span>Input:</span>
        <span>$${(parseFloat(model.pricing.prompt || '0') * 1000000).toFixed(2)}/M tokens</span>
        </div>
        <div class="model-detail">
        <span>Output:</span>
        <span>$${(parseFloat(model.pricing.completion || '0') * 1000000).toFixed(2)}/M tokens</span>
        </div>
        ` : ''}
    `;
}

// File handling functions
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

// Drag-and-drop: try to capture FileSystemHandles when available (Chromium)
async function handleFileDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const dt = e.dataTransfer;
    // If the browser supports getAsFileSystemHandle, prefer indexing via handles for live refresh
    if (dt.items && 'getAsFileSystemHandle' in DataTransferItem.prototype) {
        const tasks = [];
        for (const item of dt.items) {
            tasks.push(indexDataTransferItem(item));
        }
        await Promise.allSettled(tasks);
        updateFileTree();
        updateTokenEstimates();
        return;
    }
    const files = Array.from(dt.files);
    processFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
}

// Process uploaded files
async function processFiles(files) {
    for (const file of files) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            showError(`File ${file.name} is too large (max 10MB)`);
            continue;
        }
        
        try {
            const content = await readFileContent(file);
            const fileObj = {
                id: generateId(),
                name: file.name,
                path: file.webkitRelativePath || file.name,
                size: file.size,
                type: getFileType(file.name),
                content: content,
                lastModified: file.lastModified,
                // Files from traditional inputs do not carry file handles.
                // Mark explicitly so refresh logic can short-circuit.
                canLiveRefresh: false
            };
            
            state.files.push(fileObj);
        } catch (error) {
            console.error(`Error reading file ${file.name}:`, error);
            showError(`Failed to read file ${file.name}`);
        }
    }
    
    updateFileTree();
    updateTokenEstimates();
}

async function indexDataTransferItem(item) {
    try {
        const handle = await item.getAsFileSystemHandle();
        if (!handle) return;
        if (handle.kind === 'file') {
            await upsertFileFromHandle(handle, handle.name, null);
        } else if (handle.kind === 'directory') {
            await indexDirectory(handle, handle.name, handle); // rootHandle = handle
        }
    } catch (err) {
        console.warn('Skipping dropped item, no handle permissions:', err);
    }
}

// Let user pick a folder that stays "live"
async function linkLiveFolder() {
    if (!window.showDirectoryPicker) {
        showError('Your browser does not support live folders. Use a Chromium-based browser for this feature.');
        return;
    }
    try {
        const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
        await indexDirectory(dirHandle, dirHandle.name, dirHandle);
        updateFileTree();
        updateTokenEstimates();
        showSuccess('Live folder linked');
    } catch (err) {
        if (err && err.name === 'AbortError') return; // user canceled
        showError('Failed to link folder');
        console.error(err);
    }
}

// Recursively index a directory handle
async function indexDirectory(dirHandle, prefix, rootHandle) {
    for await (const [name, handle] of dirHandle.entries()) {
        const nextPath = `${prefix}/${name}`;
        if (handle.kind === 'file') {
            await upsertFileFromHandle(handle, nextPath, rootHandle);
        } else if (handle.kind === 'directory') {
            await indexDirectory(handle, nextPath, rootHandle);
        }
    }
}

// Insert or update a file entry from a FileSystemFileHandle
async function upsertFileFromHandle(fileHandle, path, rootHandle) {
    // Request read permission if needed
    try {
        const perm = await fileHandle.queryPermission({ mode: 'read' });
        if (perm === 'prompt') {
            const res = await fileHandle.requestPermission({ mode: 'read' });
            if (res !== 'granted') return;
        } else if (perm !== 'granted') {
            return;
        }
    } catch (_) {
        // Some browsers throw, continue best-effort
    }
    const file = await fileHandle.getFile();
    const content = await file.text();
    const existing = state.files.find(f => f.path === path);
    const baseObj = {
        name: file.name,
        path,
        size: file.size,
        type: getFileType(file.name),
        content,
        lastModified: file.lastModified,
        fileHandle,
        canLiveRefresh: true
    };
    if (existing) {
        Object.assign(existing, baseObj);
    } else {
        state.files.push({ id: generateId(), ...baseObj });
    }
    state.livePathToHandle.set(path, fileHandle);
}

// Read file content
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e.target.error);
        reader.readAsText(file);
    });
}

// Get file type information
function getFileType(fileName) {
    const ext = '.' + fileName.split('.').pop().toLowerCase();
    return fileTypes[ext] || { icon: '📄', color: '#95a5a6', type: 'text' };
}

// Check if file is likely Git-tracked (filter out common untracked files)
function isLikelyGitTracked(file) {
const path = file.path.toLowerCase();

// Exclude hidden files and directories
if (path.includes('/.') || path.startsWith('.')) {
return false;
}

    // Exclude common untracked directories
    const untrackedDirs = [
        'node_modules',
        'build',
        'dist',
        'out',
        '.next',
        '.nuxt',
        '.vuepress',
        'public',
        'static',
        'assets',
        '.git',
        '__pycache__',
        '.pytest_cache',
        '.mypy_cache',
        'coverage',
        '.coverage',
        'htmlcov',
        '.DS_Store',
        'Thumbs.db',
        '.vscode',
        '.idea',
        '.settings',
        'target',
        'bin',
        'obj'
    ];

    if (untrackedDirs.some(dir => path.includes('/' + dir + '/') || path.startsWith(dir + '/'))) {
        return false;
    }

    // Exclude common untracked file extensions
    const untrackedExtensions = [
        '.log',
        '.tmp',
        '.temp',
        '.swp',
        '.swo',
        '.bak',
        '.orig',
        '.rej',
        '.lock',
        '.pid',
        '.DS_Store',
        'Thumbs.db'
    ];

    const ext = path.substring(path.lastIndexOf('.'));
    if (untrackedExtensions.includes(ext)) {
        return false;
    }

    // Exclude package lock files (these are often not committed)
    if (path.includes('package-lock.json') || path.includes('yarn.lock') || path.includes('pnpm-lock.yaml')) {
        return false;
    }

    return true;
}

// Build hierarchical tree structure from files
function buildFileTree(files) {
const tree = {};

    files.forEach(file => {
    const parts = file.path.split('/');
    let current = tree;

    parts.forEach((part, index) => {
    if (index === parts.length - 1) {
        // This is a file
            current[part] = { type: 'file', file: file };
        } else {
            // This is a directory
            if (!current[part]) {
                current[part] = { type: 'folder', children: {} };
        }
        current = current[part].children;
}
});
});

return tree;
}

// Render tree structure recursively
function renderFileTree(tree, depth = 0, currentPath = '') {
const container = document.createElement('div');
container.className = 'folder-children collapsed'; // default collapsed for nested containers
if (depth === 0) {
container.classList.remove('folder-children'); // Root level container has no border/indent
}

Object.entries(tree).forEach(([name, node]) => {
if (node.type === 'file') {
    const file = node.file;
const fileDiv = document.createElement('div');
fileDiv.className = 'file-item';
if (state.selectedFiles.has(file.id)) {
fileDiv.classList.add('selected');
}
if (state.suggestedFiles.has(file.id)) {
fileDiv.classList.add('suggested');
}

fileDiv.innerHTML = `
<input type="checkbox" class="file-checkbox" ${state.selectedFiles.has(file.id) ? 'checked' : ''}>
<span class="file-icon" style="color: ${file.type.color}">${file.type.icon}</span>
<span class="file-name">${file.name}</span>
<span class="file-size">${formatFileSize(file.size)}</span>
`;

fileDiv.addEventListener('click', (e) => {
if (e.target.type === 'checkbox') {
return; // Handle checkbox separately
}
selectFile(file);
});

const checkbox = fileDiv.querySelector('.file-checkbox');
checkbox.addEventListener('change', (e) => {
toggleFileSelection(file.id, e.target.checked);
updateTokenEstimates();
});

container.appendChild(fileDiv);
} else if (node.type === 'folder') {
// Compute full folder path for state tracking
const folderPath = currentPath ? `${currentPath}/${name}` : name;
const folderDiv = document.createElement('div');
folderDiv.className = 'folder-item';
folderDiv.innerHTML = `
    <span class="folder-icon">📁</span>
<span>${name}</span>
`;

            // Add click handler for expand/collapse
folderDiv.addEventListener('click', () => {
    // Keep the detected root folder always expanded
    if (name === state.rootFolderName && depth === 0) return;
    const children = folderDiv.nextElementSibling;
    if (children && children.classList.contains('folder-children')) {
        const willCollapse = !children.classList.contains('collapsed') ? true : false;
        children.classList.toggle('collapsed');
        folderDiv.querySelector('.folder-icon').classList.toggle('expanded');
        // Persist expansion state
        if (willCollapse) {
            state.expandedFolders.delete(folderPath);
        } else {
            state.expandedFolders.add(folderPath);
        }
    }
});

            container.appendChild(folderDiv);

            // Recursively render children
const childrenContainer = renderFileTree(node.children, depth + 1, folderPath);
childrenContainer.style.setProperty('--depth', depth + 1);

// Decide initial collapsed/expanded state:
// 1) Root folder (single top-level) must be expanded
// 2) Any folder present in state.expandedFolders must be expanded
const shouldBeExpanded =
    (name === state.rootFolderName && depth === 0) ||
    state.expandedFolders.has(folderPath);

if (shouldBeExpanded) {
    childrenContainer.classList.remove('collapsed');
    // Rotate the caret
    folderDiv.querySelector('.folder-icon').classList.add('expanded');
} else {
    childrenContainer.classList.add('collapsed');
}

container.appendChild(childrenContainer);
        }
    });

    return container;
}

// Update file tree display
function updateFileTree() {
const fileTree = document.getElementById('fileTree');
fileTree.innerHTML = '';

// Filter files to only show likely Git-tracked ones
const trackedFiles = state.files.filter(isLikelyGitTracked);

if (trackedFiles.length === 0) {
fileTree.innerHTML = '<p class="text-secondary">No Git-tracked files found</p>';
return;
}

// Detect a single common top-level folder and keep it open
state.rootFolderName = detectSingleRootFolder(trackedFiles);
if (state.rootFolderName) {
    // Ensure root stays marked as expanded
        state.expandedFolders.add(state.rootFolderName);
    }

    // Build and render hierarchical tree
    const tree = buildFileTree(trackedFiles);
    const treeContainer = renderFileTree(tree);
    fileTree.appendChild(treeContainer);
}

// Find a single common top-level folder name if all files share it, else null
function detectSingleRootFolder(files) {
    const firstSegments = new Set(
        files
            .map(f => (f.path.includes('/') ? f.path.split('/')[0] : null))
            .filter(Boolean)
    );
    return firstSegments.size === 1 ? Array.from(firstSegments)[0] : null;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Select file for preview
function selectFile(file) {
    state.currentPreviewFile = file;
    updateFilePreview();
}

// Toggle file selection
function toggleFileSelection(fileId, selected) {
    if (selected) {
        state.selectedFiles.add(fileId);
    } else {
        state.selectedFiles.delete(fileId);
    }
    updateFileTree();
}

// Update file preview
function updateFilePreview() {
    const previewFileName = document.getElementById('previewFileName');
    const fileContent = document.getElementById('fileContent');
    const syntaxHighlight = document.getElementById('syntaxHighlight');
    
    if (!state.currentPreviewFile) {
        previewFileName.textContent = 'Select a file to preview';
        fileContent.textContent = 'No file selected';
        return;
    }
    
    const file = state.currentPreviewFile;
    previewFileName.textContent = file.name;
    fileContent.textContent = file.content;
    
    // Set syntax highlighting
    syntaxHighlight.value = file.type.type;
}

// Select all files
function selectAllFiles() {
    const trackedFiles = state.files.filter(isLikelyGitTracked);
    trackedFiles.forEach(file => {
        state.selectedFiles.add(file.id);
    });
    updateFileTree();
    updateTokenEstimates();
}

// Clear all files
function clearFiles() {
    if (confirm('Are you sure you want to remove all files?')) {
        state.files = [];
        state.selectedFiles.clear();
        state.suggestedFiles.clear();
        state.expandedFolders.clear();
        state.rootFolderName = null;
        state.livePathToHandle.clear();
        state.currentPreviewFile = null;
        updateFileTree();
        updateFilePreview();
        updateTokenEstimates();
    }
}

// Suggest relevant files based on task description
function suggestRelevantFiles() {
    const taskDescription = document.getElementById('taskDescription').value.trim();
    if (!taskDescription) {
        showError('Please enter a task description first');
        return;
    }
    
    // Clear previous suggestions
    state.suggestedFiles.clear();
    
    // Simple keyword-based suggestion algorithm
    const keywords = taskDescription.toLowerCase().split(/\s+/);
    const suggestions = [];
    
    state.files.forEach(file => {
        let score = 0;
        const fileName = file.name.toLowerCase();
        const fileContent = file.content.toLowerCase();
        
        // Check filename matches
        keywords.forEach(keyword => {
            if (fileName.includes(keyword)) score += 3;
            if (fileContent.includes(keyword)) score += 1;
        });
        
        // Boost score for certain file types based on task
        if (keywords.some(k => ['test', 'spec', 'unit'].includes(k))) {
            if (fileName.includes('test') || fileName.includes('spec')) score += 2;
        }
        
        if (keywords.some(k => ['style', 'css', 'design'].includes(k))) {
            if (file.type.type === 'css') score += 2;
        }
        
        if (keywords.some(k => ['api', 'server', 'backend'].includes(k))) {
            if (file.type.type === 'javascript' && fileName.includes('server')) score += 2;
            if (file.type.type === 'python') score += 1;
        }
        
        if (score > 0) {
            suggestions.push({ file, score });
        }
    });
    
    // Sort by score and take top suggestions
    suggestions.sort((a, b) => b.score - a.score);
    const topSuggestions = suggestions.slice(0, Math.ceil(state.files.length * 0.3));
    
    topSuggestions.forEach(({ file }) => {
        state.suggestedFiles.add(file.id);
        state.selectedFiles.add(file.id); // Auto-select suggested files
    });
    
    updateFileTree();
    updateTokenEstimates();
    
    showSuccess(`Suggested ${topSuggestions.length} relevant files`);
}

// Tab switching
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

// Refresh contents for selected files that have live handles
async function refreshSelectedFilesContents() {
    const selectedFilesList = Array.from(state.selectedFiles)
        .map(id => state.files.find(f => f.id === id))
        .filter(Boolean);
    // Re-read any file that can live refresh
    for (const f of selectedFilesList) {
        if (f && f.canLiveRefresh && f.fileHandle && f.fileHandle.getFile) {
            try {
                const latest = await f.fileHandle.getFile();
                f.size = latest.size;
                f.lastModified = latest.lastModified;
                f.content = await latest.text();
            } catch (err) {
                console.warn(`Could not refresh ${f.path}:`, err);
            }
        }
    }
}

// Generate prompt
async function generatePrompt() {
    const taskInput = document.getElementById('taskInput').value.trim();
    await refreshSelectedFilesContents(); // <-- always read fresh when possible
    const selectedFilesList = Array.from(state.selectedFiles)
        .map(id => state.files.find(f => f.id === id))
        .filter(Boolean);
    
    if (selectedFilesList.length === 0) {
        showError('Please select at least one file');
        return;
    }
    
    if (!taskInput) {
        showError('Please enter a task description');
        return;
    }
    
    // Generate directory structure
    const structure = generateDirectoryStructure(selectedFilesList);
    
    // Generate XML-formatted prompt
    let prompt = `<task_description>\n${taskInput}\n</task_description>\n\n`;
    
    prompt += `<project_structure>\n${structure}\n</project_structure>\n\n`;
    
    prompt += `<files>\n`;
    selectedFilesList.forEach(file => {
        prompt += `<file path="${file.path}">\n${file.content}\n</file>\n\n`;
    });
    prompt += `</files>\n\n`;
    
    prompt += `Please analyze the provided code and ${taskInput.toLowerCase()}. Provide clear, actionable recommendations with specific code examples where applicable.`;
    
    state.generatedPrompt = prompt;
    document.getElementById('generatedPrompt').textContent = prompt;
    
    // Switch to prompt tab
    switchTab('prompt');
    
    updateTokenEstimates();
}

// Generate directory structure
function generateDirectoryStructure(files) {
    const tree = {};
    
    files.forEach(file => {
        const parts = file.path.split('/');
        let current = tree;
        
        parts.forEach((part, index) => {
            if (index === parts.length - 1) {
                current[part] = 'file';
            } else {
                if (!current[part]) {
                    current[part] = {};
                }
                current = current[part];
            }
        });
    });
    
    return formatTree(tree, 0);
}

// Format tree structure
function formatTree(tree, depth) {
    let result = '';
    const indent = '  '.repeat(depth);
    
    Object.entries(tree).forEach(([name, value]) => {
        if (value === 'file') {
            result += `${indent}├── ${name}\n`;
        } else {
            result += `${indent}├── ${name}/\n`;
            result += formatTree(value, depth + 1);
        }
    });
    
    return result;
}

// Handle template change
function handleTemplateChange(e) {
    const template = e.target.value;
    const taskInput = document.getElementById('taskInput');
    
    if (template && state.promptTemplates[template]) {
        taskInput.value = state.promptTemplates[template];
    }
}

// Copy prompt to clipboard
function copyPrompt() {
    const prompt = document.getElementById('generatedPrompt').textContent;
    navigator.clipboard.writeText(prompt).then(() => {
        showSuccess('Prompt copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy prompt:', err);
        showError('Failed to copy prompt');
    });
}

// Send prompt to AI
async function sendPromptToAI() {
    if (!state.selectedModel) {
        showError('Please select an AI model');
        return;
    }
    
    if (!state.generatedPrompt && !document.getElementById('generatedPrompt').textContent.trim()) {
        showError('Please generate a prompt first');
        return;
    }
    
    const prompt = state.generatedPrompt || document.getElementById('generatedPrompt').textContent;
    
    try {
        state.isStreaming = true;
        updateStreamingUI(true);
        switchTab('response');
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: state.selectedModel.id,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: state.settings.maxTokens,
                temperature: parseFloat(state.settings.temperature),
                stream: state.settings.streamResponse
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        if (state.settings.streamResponse) {
            await handleStreamingResponse(response);
        } else {
            const data = await response.json();
            const content = data.choices[0]?.message?.content || 'No response received';
            displayResponse(content);
        }
        
    } catch (error) {
        console.error('Error sending prompt:', error);
        showError(`Failed to send prompt: ${error.message}`);
    } finally {
        state.isStreaming = false;
        updateStreamingUI(false);
    }
}

// Handle streaming response
async function handleStreamingResponse(response) {
    const responseOutput = document.getElementById('responseOutput');
    responseOutput.textContent = '';
    responseOutput.classList.add('streaming');
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    
    try {
        while (state.isStreaming) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                        state.isStreaming = false;
                        break;
                    }
                    
                    try {
                        const json = JSON.parse(data);
                        const delta = json.choices[0]?.delta?.content;
                        if (delta) {
                            fullResponse += delta;
                            responseOutput.textContent = fullResponse;
                            responseOutput.scrollTop = responseOutput.scrollHeight;
                        }
                    } catch (parseError) {
                        // Ignore parsing errors for incomplete chunks
                    }
                }
            }
        }
    } finally {
        reader.releaseLock();
        responseOutput.classList.remove('streaming');
        state.lastResponse = fullResponse;
    }
}

// Display response
function displayResponse(content) {
    const responseOutput = document.getElementById('responseOutput');
    responseOutput.textContent = content;
    state.lastResponse = content;
    
    // Check if response contains code changes for apply mode
    if (content.includes('```') || content.includes('diff')) {
        showApplySection(content);
    }
}

// Show apply changes section
function showApplySection(response) {
    const applySection = document.getElementById('applySection');
    const changesPreview = document.getElementById('changesPreview');
    
    // Extract code blocks or diffs
    const codeBlocks = response.match(/```[\s\S]*?```/g) || [];
    
    if (codeBlocks.length > 0) {
        changesPreview.innerHTML = `
            <h5>Detected ${codeBlocks.length} code change(s):</h5>
            ${codeBlocks.map((block, index) => `
                <div class="change-item" style="margin-bottom: 12px; padding: 8px; background: var(--color-secondary); border-radius: 4px;">
                    <strong>Change ${index + 1}:</strong>
                    <pre style="font-size: 11px; margin: 8px 0 0 0;">${block}</pre>
                </div>
            `).join('')}
        `;
        applySection.style.display = 'block';
    }
}

// Stop generation
function stopGeneration() {
    state.isStreaming = false;
    updateStreamingUI(false);
}

// Update streaming UI
function updateStreamingUI(isStreaming) {
    document.getElementById('sendPrompt').style.display = isStreaming ? 'none' : 'inline-flex';
    document.getElementById('stopGeneration').style.display = isStreaming ? 'inline-flex' : 'none';
    document.getElementById('loadingIndicator').style.display = isStreaming ? 'flex' : 'none';
}

// Copy response to clipboard
function copyResponse() {
    const response = document.getElementById('responseOutput').textContent;
    navigator.clipboard.writeText(response).then(() => {
        showSuccess('Response copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy response:', err);
        showError('Failed to copy response');
    });
}

// Update token estimates
function updateTokenEstimates() {
    const selectedFilesList = Array.from(state.selectedFiles).map(id =>
        state.files.find(f => f.id === id)
    ).filter(Boolean);

    // Rough token estimation (1 token ≈ 3.5 characters for code and English mixed)
    const fileTokens = selectedFilesList.reduce((total, file) => {
        return total + Math.ceil(file.content.length / 3.5);
    }, 0);

    const promptTokens = Math.ceil(state.generatedPrompt.length / 3.5);
    const totalTokens = fileTokens + promptTokens;
    
    document.getElementById('fileTokens').textContent = fileTokens.toLocaleString();
    document.getElementById('promptTokens').textContent = promptTokens.toLocaleString();
    document.getElementById('totalTokens').textContent = totalTokens.toLocaleString();
    document.getElementById('tokenCount').textContent = `Tokens: ${totalTokens.toLocaleString()}`;
    
    // Estimate cost
    if (state.selectedModel && state.selectedModel.pricing) {
        const inputCost = totalTokens * parseFloat(state.selectedModel.pricing.prompt || 0);
        const outputCost = state.settings.maxTokens * parseFloat(state.selectedModel.pricing.completion || 0);
        const totalCost = inputCost + outputCost;
        document.getElementById('estimatedCost').textContent = `$${totalCost.toFixed(4)}`;
    } else {
        document.getElementById('estimatedCost').textContent = '$0.00';
    }
}

// Settings modal functions
function openSettingsModal() {
    document.getElementById('settingsModal').style.display = 'flex';
    updateSettingsUI();
}

function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
}

function saveSettings() {
    state.apiKey = document.getElementById('apiKey').value.trim();
    state.settings.maxTokens = parseInt(document.getElementById('maxTokens').value) || 4000;
    state.settings.temperature = parseFloat(document.getElementById('temperature').value) || 0.7;
    state.settings.streamResponse = document.getElementById('streamResponse').checked;

    // Save to localStorage
    try {
        localStorage.setItem('openRouterApiKey', state.apiKey);
        localStorage.setItem('settings', JSON.stringify(state.settings));
    } catch (e) {
        console.warn('Failed to save settings to localStorage:', e);
        showError('Failed to save settings locally');
    }

    closeSettingsModal();
    showSuccess('Settings saved');

    // Reload models if API key changed
    if (state.apiKey) {
        loadModels();
    }
}

// Project management functions
function saveProject() {
    const project = {
        files: state.files,
        selectedFiles: Array.from(state.selectedFiles),
        settings: state.settings,
        generatedPrompt: state.generatedPrompt,
        expandedFolders: Array.from(state.expandedFolders),
        timestamp: Date.now()
    };
    
    const dataStr = JSON.stringify(project, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptbuilder-project-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Project saved successfully');
}

function loadProject() {
    document.getElementById('projectFileInput').click();
}

function handleProjectLoad(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const project = JSON.parse(e.target.result);
            
            // Restore project state
            state.files = project.files || [];
            state.selectedFiles = new Set(project.selectedFiles || []);
            state.settings = { ...state.settings, ...(project.settings || {}) };
            state.generatedPrompt = project.generatedPrompt || '';
            // Try to restore expansion state if present; otherwise recompute
            state.expandedFolders = new Set(project.expandedFolders || []);
            state.rootFolderName = detectSingleRootFolder(state.files.filter(isLikelyGitTracked));
            if (state.rootFolderName) state.expandedFolders.add(state.rootFolderName);
            
            // Update UI
            updateFileTree();
            updateSettingsUI();
            document.getElementById('generatedPrompt').textContent = state.generatedPrompt;
            updateTokenEstimates();
            
            showSuccess('Project loaded successfully');
        } catch (error) {
            console.error('Failed to load project:', error);
            showError('Failed to load project file');
        }
    };
    reader.readAsText(file);
}

function exportPrompt() {
    const prompt = state.generatedPrompt || document.getElementById('generatedPrompt').textContent;
    if (!prompt.trim()) {
        showError('No prompt to export');
        return;
    }
    
    const blob = new Blob([prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Prompt exported successfully');
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'o':
                e.preventDefault();
                document.getElementById('browseFiles').click();
                break;
            case 's':
                e.preventDefault();
                saveProject();
                break;
            case 'Enter':
                e.preventDefault();
                if (!state.isStreaming) {
                    sendPromptToAI();
                }
                break;
            case 'a':
                if (e.target.type !== 'text' && e.target.type !== 'textarea') {
                    e.preventDefault();
                    selectAllFiles();
                }
                break;
        }
    } else if (e.key === 'Escape') {
        closeSettingsModal();
    }
}

// Theme functions
function toggleTheme() {
    const themeCycle = ['light', 'dark', 'auto'];
    const currentIndex = themeCycle.indexOf(state.theme);
    state.theme = themeCycle[(currentIndex + 1) % themeCycle.length];

    applyTheme();
    updateThemeToggleButton();

    // Save preference
    try {
        sessionStorage.setItem('theme', state.theme);
    } catch (e) {
        // sessionStorage not available
    }
}

function applyTheme() {
    const root = document.documentElement;

    // Remove any existing theme classes
    root.classList.remove('theme-light', 'theme-dark');

    if (state.theme === 'auto') {
        // Remove all theme-related inline styles to use CSS defaults and media queries
        Object.keys(themes.light).forEach(prop => {
            root.style.removeProperty(prop);
        });
        Object.keys(themes.dark).forEach(prop => {
            root.style.removeProperty(prop);
        });
    } else if (themes[state.theme]) {
        // Apply the theme's CSS variables as inline styles
        const themeVars = themes[state.theme];
        Object.entries(themeVars).forEach(([prop, value]) => {
            root.style.setProperty(prop, value);
        });
    }

    if (state.theme === 'auto') {
        document.documentElement.removeAttribute('data-color-scheme');
    } else {
        document.documentElement.setAttribute('data-color-scheme', state.theme);
    }
}

function updateThemeToggleButton() {
    const button = document.getElementById('themeToggle');

    switch (state.theme) {
        case 'light':
            button.textContent = '☀️';
            button.title = 'Switch to dark theme';
            break;
        case 'dark':
            button.textContent = '🌙';
            button.title = 'Switch to auto theme';
            break;
        case 'auto':
            button.textContent = '🌓';
            button.title = 'Switch to light theme';
            break;
    }
}

// Utility functions
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function showError(message) {
    console.error(message);
    // You could implement a toast notification system here
    alert(message);
}

function showSuccess(message) {
    console.log(message);
    // You could implement a toast notification system here
    // For now, just log to console
}

function showLoading(message) {
    console.log(`Loading: ${message}`);
}

function hideLoading() {
    console.log('Loading complete');
}

function updateUI() {
    updateFileTree();
    updateModelInfo();
    updateTokenEstimates();
    updateModelDisplay();
}

// Initialize the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}