// Theme definitions
const themes = {
    light: {
        '--color-background': '#f2f5f8',
        '--color-surface': '#ffffff',
        '--color-surface-alt': '#f7fafc',
        '--color-text': '#0f172a',
        '--color-text-secondary': '#475569',
        '--color-primary': '#00634f',
        '--color-primary-hover': '#004f3f',
        '--color-primary-active': '#003d32',
        '--color-secondary': 'rgba(0, 99, 79, 0.1)',
        '--color-secondary-hover': 'rgba(0, 99, 79, 0.18)',
        '--color-secondary-active': 'rgba(0, 99, 79, 0.26)',
        '--color-border': '#d0d5dd',
        '--color-border-bright': '#b7c0cd',
        '--color-error': '#d03039',
        '--color-success': '#0c8c62',
        '--color-warning': '#d6911f',
        '--color-info': '#0f5ba7',
        '--color-focus-ring': 'rgba(0, 118, 94, 0.35)',
        '--color-btn-primary-text': '#f2f5f8',
        '--shadow-outline': '0 0 0 1px rgba(15, 23, 42, 0.08)'
    },
    dark: {
        '--color-background': '#050608',
        '--color-surface': '#0f1219',
        '--color-surface-alt': '#161b24',
        '--color-text': '#e8f0ff',
        '--color-text-secondary': '#8e9bad',
        '--color-primary': '#6af5b6',
        '--color-primary-hover': '#51e0a1',
        '--color-primary-active': '#38c48a',
        '--color-secondary': 'rgba(106, 245, 182, 0.12)',
        '--color-secondary-hover': 'rgba(106, 245, 182, 0.2)',
        '--color-secondary-active': 'rgba(106, 245, 182, 0.28)',
        '--color-border': '#1f232d',
        '--color-border-bright': '#2e3442',
        '--color-error': '#ff6b7d',
        '--color-success': '#6af5b6',
        '--color-warning': '#f9d76c',
        '--color-info': '#7fbff6',
        '--color-focus-ring': 'rgba(106, 245, 182, 0.35)',
        '--color-btn-primary-text': '#041f1b',
        '--shadow-outline': '0 0 0 1px rgba(255, 255, 255, 0.035)'
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
    lastXmlChanges: [],
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
        'bug-fix': 'Fix the following bug:\n\n{TASK_DESCRIPTION}\n\nPlease:\n- Identify the root cause\n- Provide a fix that doesn\'t break existing functionality\n- Add tests if appropriate\n- Explain the solution',
        'xml-patch': 'Please analyze the following code files and implement the requested changes.\n\n{TASK_DESCRIPTION}\n\nIMPORTANT: Respond ONLY with XML changes. Prefer the element form with CDATA:\n\n<changes>\n  <file path=\"filename.ext\">\n    <edit>\n      <old><![CDATA[exact old code]]></old>\n      <new><![CDATA[exact new code]]></new>\n    </edit>\n  </file>\n</changes>\n\nIf you cannot safely include raw text use Base64:\n\n<changes>\n  <file path=\"filename.ext\">\n    <edit encoding=\"base64\">\n      <old>BASE64_OLD</old>\n      <new>BASE64_NEW</new>\n    </edit>\n  </file>\n</changes>\n\nRules:\n- Use the EXACT old code snippet from the provided files\n- Provide ONLY the XML response, no surrounding commentary\n- Each <edit> represents one specific change\n- Multiple <edit> tags per file are allowed\n- Do not use Markdown code fences'
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
    document.getElementById('testXmlResponse').addEventListener('click', testXmlResponse);
    const toggleManualResponseBtn = document.getElementById('toggleManualResponse');
    if (toggleManualResponseBtn) {
        toggleManualResponseBtn.addEventListener('click', () => {
            const panel = document.getElementById('manualResponsePanel');
            const shouldShow = !(panel && panel.style.display !== 'none');
            setManualResponsePanel(shouldShow);
        });
    }
    const applyManualResponseBtn = document.getElementById('applyManualResponse');
    if (applyManualResponseBtn) {
        applyManualResponseBtn.addEventListener('click', () => {
            handleManualResponseApply();
        });
    }
    const cancelManualResponseBtn = document.getElementById('cancelManualResponse');
    if (cancelManualResponseBtn) {
        cancelManualResponseBtn.addEventListener('click', () => {
            setManualResponsePanel(false);
        });
    }

    // Apply Changes actions
    const applyAllBtn = document.getElementById('applyAllChanges');
    const rejectAllBtn = document.getElementById('rejectAllChanges');
    if (applyAllBtn) applyAllBtn.addEventListener('click', () => handleApplyAll(false));
    if (rejectAllBtn) rejectAllBtn.addEventListener('click', handleRejectAll);
    
    // Settings modal
    document.getElementById('closeSettings').addEventListener('click', closeSettingsModal);
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('cancelSettings').addEventListener('click', closeSettingsModal);
    
    // Temperature slider
    const tempSlider = document.getElementById('temperature');
    if (tempSlider) {
        tempSlider.addEventListener('input', (e) => {
            const valEl = document.getElementById('temperatureValue');
            if (valEl) valEl.textContent = e.target.value;
        });
    }
    
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
    if (content.includes('```') || content.includes('diff') || content.includes('<changes>')) {
        showApplySection(content);
    }
}

function setManualResponsePanel(shouldShow) {
    const panel = document.getElementById('manualResponsePanel');
    const input = document.getElementById('manualResponseInput');
    if (!panel) return;
    panel.style.display = shouldShow ? 'block' : 'none';
    if (shouldShow) {
        if (input) {
            requestAnimationFrame(() => {
                input.focus();
                input.select();
            });
        }
    } else if (input) {
        input.value = '';
    }
}

function handleManualResponseApply() {
    const input = document.getElementById('manualResponseInput');
    if (!input) return;
    const content = input.value.trim();
    if (!content) {
        showError('Paste an AI response to parse');
        input.focus();
        return;
    }
    setManualResponsePanel(false);
    displayResponse(content);
    showSuccess('Response loaded. Review the detected changes below.');
}

// Robust XML change extraction utilities and parser

// Decode common HTML entities in a string.
function __pb_unescapeHtmlEntities(str) {
    try {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = str;
        return textarea.value;
    } catch (_) {
        // Best effort fallback
        return str
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&amp;/gi, '&')
            .replace(/&quot;/gi, '"')
            .replace(/&apos;/gi, "'")
            .replace(/&#39;/gi, "'")
            .replace(/&#(\d+);/g, (match, code) => {
                const value = parseInt(code, 10);
                if (Number.isNaN(value)) return match;
                const fromCodePoint = String.fromCodePoint || String.fromCharCode;
                return fromCodePoint(value);
            })
            .replace(/&#x([0-9a-f]+);/gi, (match, code) => {
                const value = parseInt(code, 16);
                if (Number.isNaN(value)) return match;
                const fromCodePoint = String.fromCodePoint || String.fromCharCode;
                return fromCodePoint(value);
            });
    }
}

function __pb_escapeHtml(str) {
    try {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    } catch (_) {
        return str;
    }
}

// Decode Base64 UTF-8 safely.
function __pb_decodeBase64Utf8(b64) {
    try {
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
        console.warn('Base64 decode failed; returning original string');
        return b64;
    }
}

// Try to parse an XML fragment that contains <changes>...</changes>.
// Returns a Document or null on failure.
function __pb_tryParseXmlDocument(xmlCandidate) {
    if (!xmlCandidate || typeof xmlCandidate !== 'string') return null;

    // Trim and normalize zero-width characters
    let xmlStr = xmlCandidate.trim().replace(/\u200B/g, '');

    // Detect HTML-escaped XML and decode only when needed so attribute entities remain intact.
    let searchStr = xmlStr;
    const hasLiteralChanges = /<\s*changes\b/i.test(searchStr);
    if (!hasLiteralChanges && /&lt;\s*changes\b/i.test(searchStr)) {
        searchStr = __pb_unescapeHtmlEntities(searchStr);
    }

    // Keep only the first <changes>...</changes> block if there is extra text around.
    const match = searchStr.match(/<\s*changes\b[\s\S]*?<\/\s*changes\s*>/i);
    if (!match) return null;

    let core = match[0];

    // Heuristic: ampersands that are not part of entities make XML invalid.
    // Protect CDATA blocks while escaping stray '&' elsewhere.
    const cdataSegments = [];
    core = core.replace(/<!\[CDATA\[[\s\S]*?]]>/g, (segment) => {
        const token = `__PB_CDATA_${cdataSegments.length}__`;
        cdataSegments.push({ token, segment });
        return token;
    });
    core = core.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-f]+;)/gi, '&amp;');
    cdataSegments.forEach(({ token, segment }) => {
        core = core.replace(token, segment);
    });

    const wrapped = `<root>${core}</root>`;
    const parser = new DOMParser();

    // Try application/xml first, then text/xml as a fallback.
    let doc = parser.parseFromString(wrapped, 'application/xml');
    if (doc.querySelector('parsererror')) {
        doc = parser.parseFromString(wrapped, 'text/xml');
        if (doc.querySelector('parsererror')) {
            return null;
        }
    }
    return doc;
}

// Extract {path, old_str, new_str} tuples from a parsed XML Document.
// Supports multiple schemas:
// 1) <edit old_str="..." new_str="..."/>
// 2) <edit><old><![CDATA[...]]></old><new><![CDATA[...]]></new></edit>
// 3) Variants for tag names: <from>/<to>, <search>/<replace>, <old_str>/<new_str>
// 4) Base64 via encoding="base64" on <edit> or child nodes.
function __pb_collectChangesFromXmlDoc(xmlDoc) {
    const changes = [];
    if (!xmlDoc) return changes;

    const fileNodes = Array.from(xmlDoc.querySelectorAll('file'));
    // Also allow a flat form with <edit path="...">...</edit>
    const editNodesWithPath = Array.from(xmlDoc.querySelectorAll('edit[path]'));

    // Helper to extract text from a node, including CDATA
    function textOf(node) {
        if (!node) return null;
        let txt = node.textContent != null ? node.textContent : null;
        const enc = (node.getAttribute && node.getAttribute('encoding') || '').toLowerCase();
        if (enc === 'base64' && typeof txt === 'string') {
            txt = __pb_decodeBase64Utf8(txt.trim());
        }
        return txt;
    }

    function decodeAttr(el, name) {
        let v = el.getAttribute(name);
        if (v == null) return null;
        // Unescape XML entities that models often include
        if (/[&][a-z#]/i.test(v)) v = __pb_unescapeHtmlEntities(v);
        const enc = (el.getAttribute('encoding') || '').toLowerCase();
        if (enc === 'base64') {
            v = __pb_decodeBase64Utf8(v);
        }
        return v;
    }

    function extractEdits(parentEl, path) {
        const edits = parentEl.querySelectorAll('edit, replace');
        edits.forEach(editEl => {
            let oldStr = decodeAttr(editEl, 'old_str');
            let newStr = decodeAttr(editEl, 'new_str');

            // Attribute fallbacks
            if (oldStr == null) oldStr = decodeAttr(editEl, 'old');
            if (newStr == null) newStr = decodeAttr(editEl, 'new');
            if (oldStr == null) oldStr = decodeAttr(editEl, 'from');
            if (newStr == null) newStr = decodeAttr(editEl, 'to');
            if (oldStr == null) oldStr = decodeAttr(editEl, 'search');
            if (newStr == null) newStr = decodeAttr(editEl, 'replace');

            // Child element forms
            if (oldStr == null || newStr == null) {
                const oldNode = editEl.querySelector('old, old_str, from, search');
                const newNode = editEl.querySelector('new, new_str, to, replace');
                if (oldNode && newNode) {
                    oldStr = textOf(oldNode);
                    newStr = textOf(newNode);
                }
            }

            if (typeof oldStr === 'string' && typeof newStr === 'string') {
                changes.push({ path, old_str: oldStr, new_str: newStr });
            }
        });
    }

    // Structured form: <file path="..."><edit .../></file>
    fileNodes.forEach(fileEl => {
        let path = fileEl.getAttribute('path') || '';
        if (!path) {
            const pathNode = fileEl.querySelector('path');
            if (pathNode) path = pathNode.textContent.trim();
        }
        if (!path) return;
        extractEdits(fileEl, path);
    });

    // Flat form: <edit path="...">...</edit>
    editNodesWithPath.forEach(editEl => {
        const path = editEl.getAttribute('path');
        if (!path) return;
        // Reuse the same extraction but constrained to this node
        const container = document.createElement('div');
        container.appendChild(editEl.cloneNode(true));
        extractEdits(container, path);
    });

    return changes;
}

// Parse XML changes from response (robust, tolerant to code fences and HTML-escaped XML)
function parseXmlChanges(response) {
    // Collect likely XML blocks from the response
    const candidates = [];
    if (typeof response !== 'string' || !response.trim()) return [];

    // 1) Code-fenced blocks like ```xml ... ```
    const fenceRe = /```[ \t]*([\w-]*)[ \t]*\n([\s\S]*?)```/g;
    let m;
    while ((m = fenceRe.exec(response)) !== null) {
        const lang = (m[1] || '').toLowerCase();
        const body = m[2] || '';
        if (/<\s*changes\b/i.test(body) || lang === 'xml' || lang === 'changes') {
            candidates.push(body);
        }
        // HTML-escaped within a fence
        if (body.includes('<changes')) {
            candidates.push(body);
        }
    }

    // 2) Raw inline <changes>...</changes> blocks
    const rawRe = /<\s*changes\b[\s\S]*?<\/\s*changes\s*>/gi;
    const rawMatches = response.match(rawRe);
    if (rawMatches) {
        candidates.push(...rawMatches);
    }

    // 3) De-duplicated candidates
    const seen = new Set();
    const uniqueCandidates = candidates
        .map(c => c.trim())
        .filter(c => {
            if (!c) return false;
            const k = c.slice(0, 200);
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
        });

    // Try parsing each candidate until one works
    for (const candidate of uniqueCandidates) {
        const doc = __pb_tryParseXmlDocument(candidate);
        if (!doc) continue;
        const extracted = __pb_collectChangesFromXmlDoc(doc);
        if (extracted && extracted.length) {
            return extracted;
        }
    }

    // If we reach here, parsing failed
    console.warn('No valid <changes> block could be parsed.');
    showError('Could not read XML changes. Please return one of these formats:\n\n' +
        '<changes> with <file path="..."><edit old_str="..." new_str="..."/></file>\n' +
        'or\n' +
        '<changes> with <file path="..."><edit><old><![CDATA[...]]></old><new><![CDATA[...]]></new></edit></file>\n' +
        'You may also set encoding="base64" on <edit> or its children.');
    return [];
}

// Show XML patch section
function showXmlPatchSection(changes) {
    const applySection = document.getElementById('applySection');
    const changesPreview = document.getElementById('changesPreview');

    // Keep latest changes available for Apply All
    state.lastXmlChanges = Array.isArray(changes) ? changes : [];

    // Build patch and surface any errors
    const { patch, errors } = generatePatchContent(changes);
    const initialStrip = 0;
    const patchCommand = generateGitPatchCommands(changes, initialStrip);

    const errorBlock = errors && errors.length
        ? `
        <div style="margin-top:10px; padding:8px; background: var(--color-secondary); border-radius: 4px;">
            <strong>${errors.length} issue(s) detected:</strong>
            <ul style="margin-top:6px;">
                ${errors.map(e => `<li><code>${e.path || 'unknown'}</code>: ${e.reason}</li>`).join('')}
            </ul>
            <small class="text-secondary">These entries were skipped in the patch.</small>
        </div>`
        : '';

    changesPreview.innerHTML = `
        <h5>Detected ${changes.length} XML change(s)</h5>
        ${changes.map((change) => `
            <div class="change-item" style="margin-bottom: 12px; padding: 8px; background: var(--color-secondary); border-radius: 4px;">
                <strong>File: ${change.path}</strong>
                <div style="margin-top: 8px;">
                    <div style="color: var(--color-error); font-size: 11px;">- ${__pb_escapeHtml(change.old_str.substring(0, 80))}${change.old_str.length > 80 ? '...' : ''}</div>
                    <div style="color: var(--color-success); font-size: 11px;">+ ${__pb_escapeHtml(change.new_str.substring(0, 80))}${change.new_str.length > 80 ? '...' : ''}</div>
                </div>
            </div>
        `).join('')}
        ${errorBlock}
        <div style="margin-top: 16px; padding: 12px; background: var(--color-surface); border-radius: 4px;">
            <div style="display:flex; align-items:center; gap:8px; justify-content:space-between; flex-wrap: wrap;">
                <h6 style="margin:0;">Git Patch Command</h6>
                <label style="font-size:12px;">strip prefix:
                    <select id="patchStripLevel" class="form-control" style="display:inline-block; width:auto;">
                        <option value="0" selected>p0 (repo root)</option>
                        <option value="1">p1 (inside repo folder)</option>
                    </select>
                </label>
            </div>
            <pre id="patchCommand" style="font-size: 12px; background: var(--color-secondary); padding: 8px; border-radius: 4px; margin: 8px 0; white-space: pre-wrap;">${patchCommand}</pre>
            <div style="margin-top:6px;">
                <button id="copyPatchCommand" class="btn btn--primary btn--sm" style="margin-right: 8px;">📋 Copy Command</button>
                <button id="downloadPatch" class="btn btn--secondary btn--sm" style="margin-right: 8px;">📥 Download Patch</button>
                <button id="applyPatchCommand" class="btn btn--secondary btn--sm">⚡ Apply Changes</button>
            </div>
            <small class="text-secondary">Tip: run from your repo root with <code>-p0</code>. If you are inside a subfolder, choose <code>-p1</code>.</small>
        </div>
    `;

    applySection.style.display = 'block';

    // Button handlers
    const stripSel = document.getElementById('patchStripLevel');
    const patchPre = document.getElementById('patchCommand');

    stripSel.addEventListener('change', () => {
        const cmd = generateGitPatchCommands(changes, parseInt(stripSel.value, 10) || 0);
        patchPre.textContent = cmd;
    });

    document.getElementById('copyPatchCommand').addEventListener('click', () => {
        const command = patchPre.textContent;
        navigator.clipboard.writeText(command).then(() => {
            showSuccess('Patch command copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy command:', err);
            showError('Failed to copy command');
        });
    });

    document.getElementById('downloadPatch').addEventListener('click', () => {
        const blob = new Blob([patch], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'changes.patch';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showSuccess('Patch file downloaded');
    });

    document.getElementById('applyPatchCommand').addEventListener('click', async () => {
        // Apply to in-memory files and to disk where permitted
        await handleApplyAll(true);
    });
}

// Generate diff hunk for a change (returns { hunk, startLine, matchIndex, matchLength })

function generateDiff(change, fileContent, startOffset = 0) {
    if (!change || typeof change.old_str !== 'string' || typeof change.new_str !== 'string') {
        return null;
    }

    const stripCarriage = (line) => line.replace(/\r/g, '');
    const toDiffLines = (text) => {
        if (!text) return [];
        const parts = text.replace(/\r/g, '').split('\n');
        if (parts.length && parts[parts.length - 1] === '') {
            parts.pop(); // drop trailing empty from newline terminator
        }
        return parts.map(stripCarriage);
    };

    const normalizedFileContent = fileContent;
    const matchStart = Math.max(0, startOffset || 0);
    let matchIndex = normalizedFileContent.indexOf(change.old_str, matchStart);
    if (matchIndex === -1 && matchStart > 0) {
        // Fallback to search from start if sequential search misses (e.g., out-of-order edits)
        matchIndex = normalizedFileContent.indexOf(change.old_str);
    }
    if (matchIndex === -1) {
        console.error('Could not find old_str in file:', change.path);
        return null;
    }
    const usedFallback = matchStart > 0 && matchIndex < matchStart;

    const beforeContent = fileContent.slice(0, matchIndex);
    let startLine = beforeContent.split('\n').length - 1;
    if (startLine < 0) startLine = 0;
    const fileLines = fileContent.replace(/\r/g, '').split('\n');

    const oldLines = toDiffLines(change.old_str);
    const newLines = toDiffLines(change.new_str);
    const oldCount = oldLines.length;
    const newCount = newLines.length;
    const endLine = oldCount > 0 ? startLine + oldCount - 1 : startLine - 1;

    const beforeContext = fileLines.slice(Math.max(0, startLine - 3), startLine);
    const afterContext = fileLines.slice(endLine + 1, endLine + 1 + 3);

    const hunkStart = startLine + 1; // 1-based for diff header
    let hunk = `@@ -${hunkStart},${oldCount} +${hunkStart},${newCount} @@\n`;

    if (beforeContext.length) {
        hunk += beforeContext.map(line => ' ' + line).join('\n') + '\n';
    }
    if (oldCount) {
        hunk += oldLines.map(line => '-' + line).join('\n') + '\n';
    }
    if (newCount) {
        hunk += newLines.map(line => '+' + line).join('\n') + '\n';
    }
    if (afterContext.length) {
        hunk += afterContext.map(line => ' ' + line).join('\n') + '\n';
    }
    if (!hunk.endsWith('\n')) hunk += '\n';
    const matchLength = change.old_str.length || 0;
    return { hunk, startLine, matchIndex, matchLength, usedFallback };
}

// Generate git patch commands from changes
// Generate patch content from changes
function generatePatchContent(changes) {
    // Group changes by file
    const grouped = {};
    changes.forEach(change => {
        if (!grouped[change.path]) grouped[change.path] = [];
        grouped[change.path].push(change);
    });

    let patchContent = '';
    const errors = [];

    Object.entries(grouped).forEach(([path, fileChanges]) => {
        const file = state.files.find(f => f.path === path);
        if (!file) {
            console.error('File not found:', path);
            errors.push({ path, reason: 'File not loaded' });
            return;
        }
        const original = file.content;

        // Build hunks
        const diffs = [];
        let searchOffset = 0; // track char offset to disambiguate repeated snippets
        fileChanges.forEach(change => {
            const res = generateDiff(change, original, searchOffset);
            if (res && res.hunk) {
                diffs.push({ ...res, change });
                if (typeof res.matchIndex === 'number' && typeof res.matchLength === 'number') {
                    const nextOffset = res.matchIndex + res.matchLength;
                    if (res.usedFallback) {
                        searchOffset = nextOffset;
                    } else if (nextOffset > searchOffset) {
                        searchOffset = nextOffset;
                    }
                }
            } else {
                errors.push({ path, reason: 'old_str not found', change });
            }
        });

        if (diffs.length === 0) {
            return; // no hunks for this file
        }

        // Sort hunks by position for readability
        diffs.sort((a, b) => a.startLine - b.startLine);

        // Compute hashes for the index line (informational, not verified by git apply)
        let newContentForHash = original;
        diffs.forEach(d => {
            newContentForHash = newContentForHash.replace(d.change.old_str, d.change.new_str);
        });

        const oldHash = computeShortHash(original);
        const newHash = computeShortHash(newContentForHash);

        // File header
        patchContent += `diff --git a/${path} b/${path}\n`;
        patchContent += `index ${oldHash}..${newHash} 100644\n`;
        patchContent += `--- a/${path}\n`;
        patchContent += `+++ b/${path}\n`;

        // Hunks
        diffs.forEach(d => {
            patchContent += d.hunk;
        });

        // Blank line between files
        patchContent += '\n';
    });

    // Ensure single trailing newline
    patchContent = patchContent.replace(/\s+$/, '') + '\n';

    return { patch: patchContent, errors };
}
// Generate git patch commands from changes
function generateGitPatchCommands(changes, stripLevel = 0) {
    const { patch } = generatePatchContent(changes);
    const level = Number.isInteger(stripLevel) ? stripLevel : 0;
    const command = `git apply --index -p${level} <<'PATCH'\n${patch}\nPATCH`;
    return command;
}

// Helpers for patching and applying edits in-app and optionally to live-linked files
function computeShortHash(input) {
    // Fast non-crypto short hex hash for index line cosmetics
    let h1 = 0x811c9dc5, h2 = 0x1b873593;
    for (let i = 0; i < input.length; i++) {
        const c = input.charCodeAt(i);
        h1 = Math.imul(h1 ^ c, 2654435761);
        h2 = Math.imul(h2 ^ c, 1597334677);
    }
    const n = (h1 ^ h2) >>> 0;
    return n.toString(16).padStart(7, '0').slice(-7);
}

async function applyChangesToStateFiles(changes, { writeToDisk = false } = {}) {
    const summary = { total: changes.length, applied: 0, skipped: [], writtenToDisk: 0, modifiedFiles: new Set() };

    for (const change of changes) {
        const file = state.files.find(f => f.path === change.path);
        if (!file) {
            summary.skipped.push({ path: change.path, reason: 'File not loaded' });
            continue;
        }
        const idx = file.content.indexOf(change.old_str);
        if (idx === -1) {
            summary.skipped.push({ path: change.path, reason: 'old_str not found' });
            continue;
        }
        // Replace first occurrence only
        file.content = file.content.replace(change.old_str, change.new_str);
        summary.applied += 1;
        summary.modifiedFiles.add(file);

        if (writeToDisk && file.canLiveRefresh && file.fileHandle && file.fileHandle.createWritable) {
            try {
                // Request write permission if needed
                let perm = 'granted';
                try {
                    const q = await file.fileHandle.queryPermission({ mode: 'readwrite' });
                    if (q !== 'granted') {
                        perm = await file.fileHandle.requestPermission({ mode: 'readwrite' });
                    }
                } catch (_) { /* continue best-effort */ }
                if (perm === 'granted') {
                    const writable = await file.fileHandle.createWritable();
                    await writable.write(file.content);
                    await writable.close();
                    summary.writtenToDisk += 1;
                } else {
                    summary.skipped.push({ path: change.path, reason: 'Write permission denied' });
                }
            } catch (err) {
                console.warn('Failed to write file:', change.path, err);
                summary.skipped.push({ path: change.path, reason: 'Write failed' });
            }
        }
    }

    // Update UI counters
    updateFileTree();
    updateFilePreview();
    updateTokenEstimates();

    return summary;
}

async function handleApplyAll(writeToDisk) {
    const changes = state.lastXmlChanges && state.lastXmlChanges.length
        ? state.lastXmlChanges
        : parseXmlChanges(state.lastResponse);

    if (!changes || changes.length === 0) {
        showError('No XML changes detected to apply');
        return;
    }

    const result = await applyChangesToStateFiles(changes, { writeToDisk });
    const applySection = document.getElementById('applySection');
    const changesPreview = document.getElementById('changesPreview');

    const skippedList = result.skipped.map(s => `<li><code>${s.path}</code>: ${s.reason}</li>`).join('');
    const summaryHtml = `
        <div id="applyResult" style="margin-top: 12px; padding: 10px; background: var(--color-surface); border-radius: 4px;">
            <strong>Applied ${result.applied} of ${result.total} change(s).</strong>
            ${writeToDisk ? `<div>Wrote ${result.writtenToDisk} file(s) to disk where permitted.</div>` : ''}
            ${result.skipped.length ? `<details style="margin-top:8px;"><summary>${result.skipped.length} skipped</summary><ul style="margin-top:6px;">${skippedList}</ul></details>` : ''}
        </div>
    `;

    // Append or replace the result block
    const existing = document.getElementById('applyResult');
    if (existing) {
        existing.outerHTML = summaryHtml;
    } else {
        changesPreview.insertAdjacentHTML('beforeend', summaryHtml);
    }

    if (result.applied > 0 && result.skipped.length === 0) {
        showSuccess('All changes applied');
    } else if (result.applied > 0) {
        showSuccess(`Applied ${result.applied} change(s) with some skips`);
    } else {
        showError('No changes were applied. See details.');
    }

    applySection.style.display = 'block';
}

function handleRejectAll() {
    const applySection = document.getElementById('applySection');
    const changesPreview = document.getElementById('changesPreview');
    changesPreview.innerHTML = '<p class="text-secondary">Changes dismissed.</p>';
    applySection.style.display = 'none';
    state.lastXmlChanges = [];
}

// Show apply changes section (keeps behavior for non-XML code fences)
function showApplySection(response) {
    const applySection = document.getElementById('applySection');
    const changesPreview = document.getElementById('changesPreview');

    // Check for XML changes first
    const xmlChanges = parseXmlChanges(response);
    if (xmlChanges.length > 0) {
        showXmlPatchSection(xmlChanges);
        return;
    }

    // Extract code blocks or diffs
    const codeBlocks = response.match(/```[\s\S]*?```/g) || [];

    if (codeBlocks.length > 0) {
        changesPreview.innerHTML = `
            <h5>Detected ${codeBlocks.length} code change(s):</h5>
            ${codeBlocks.map((block, index) => `
                <div class="change-item" style="margin-bottom: 12px; padding: 8px; background: var(--color-secondary); border-radius: 4px;">
                    <strong>Change ${index + 1}:</strong>
                    <pre style="font-size: 11px; margin: 8px 0 0 0;">${__pb_escapeHtml(block)}</pre>
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

// Test XML response
function testXmlResponse() {
    const currentResponse = document.getElementById('responseOutput').textContent;
    displayResponse(currentResponse);
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
    console.error('Custom error:', message);
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
