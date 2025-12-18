// ========== VARIABLES GLOBALES ==========
const data = JSON.parse(localStorage.getItem('projectData') || '{}');

// ========== FUNCIONES PRINCIPALES ==========

/**
 * Actualiza el nombre del proyecto en la barra de navegación
 */
function updateProjectName() {
    const name = document.getElementById('projectName').value.trim();
    const projectText = document.getElementById('projectNameText');
    
    if (name) {
        projectText.textContent = name;
    } else {
        // Usar traducción para "(Sin nombre)"
        if (typeof t === 'function') {
            projectText.textContent = t('unnamed_project') || '(Sin nombre)';
        } else {
            projectText.textContent = '(Sin nombre)';
        }
    }
}

/**
 * Valida los formularios y habilita/deshabilita el botón de guardar
 */
function validateAndEnable() {
    const projectName = document.getElementById('projectName').value.trim();
    const criterios = Array.from(document.querySelectorAll('.criterio')).map(el => el.value.trim());
    const pesos = Array.from(document.querySelectorAll('.peso')).map(el => parseFloat(el.value) || 0);
    const conceptos = Array.from(document.querySelectorAll('.concepto')).map(el => el.value.trim());

    // MODIFICADO: Ya no requerimos que TODOS los conceptos estén llenos
    const criteriosLlenos = criterios.every(c => c);
    const pesosLlenos = pesos.every(p => p > 0);
    const sumaPesos = pesos.reduce((a, b) => a + b, 0);

    const errorEl = document.getElementById('pesoError');
    const guardarBtn = document.getElementById('guardarBtn');
    
    if (!guardarBtn) return; // Botón no encontrado
    
    // MODIFICADO: Solo requerimos proyecto, criterios, pesos (suma 10), y al menos UN concepto
    const alMenosUnConcepto = conceptos.some(con => con.trim() !== '');
    const projectNameValido = projectName !== '';
    
    if (projectNameValido && criteriosLlenos && pesosLlenos && sumaPesos === 10 && alMenosUnConcepto) {
        guardarBtn.disabled = false;
        if (errorEl) errorEl.textContent = '';
    } else {
        guardarBtn.disabled = true;
        if (errorEl) {
            if (sumaPesos !== 10 && pesos.some(p => p > 0)) {
                // Usar traducción para el mensaje de error
                const errorMsg = (typeof t === 'function') 
                    ? t('error_sum_weights') || 'La suma de pesos debe ser 10' 
                    : 'La suma de pesos debe ser 10';
                errorEl.textContent = `${errorMsg} (actual: ${sumaPesos.toFixed(1)})`;
            } else if (!alMenosUnConcepto) {
                // Nuevo mensaje de error para conceptos
                const errorMsg = (typeof t === 'function') 
                    ? t('error_at_least_one_concept') || 'Ingresa al menos una idea/concepto' 
                    : 'Ingresa al menos una idea/concepto';
                errorEl.textContent = errorMsg;
            } else if (!projectNameValido) {
                // Mensaje para nombre del proyecto
                const errorMsg = (typeof t === 'function') 
                    ? t('error_project_name') || 'Ingresa un nombre para el proyecto' 
                    : 'Ingresa un nombre para el proyecto';
                errorEl.textContent = errorMsg;
            } else if (!criteriosLlenos) {
                // Mensaje para criterios
                const errorMsg = (typeof t === 'function') 
                    ? t('error_all_criteria') || 'Completa todos los criterios' 
                    : 'Completa todos los criterios';
                errorEl.textContent = errorMsg;
            } else if (!pesosLlenos) {
                // Mensaje para pesos
                const errorMsg = (typeof t === 'function') 
                    ? t('error_all_weights') || 'Ingresa un peso para cada criterio' 
                    : 'Ingresa un peso para cada criterio';
                errorEl.textContent = errorMsg;
            } else {
                errorEl.textContent = '';
            }
        }
    }
}

/**
 * Guarda los datos y navega a la siguiente página
 */
function saveAndContinue() {
    // Guardar datos en el objeto data
    data.projectName = document.getElementById('projectName').value.trim();
    
    document.querySelectorAll('.criterio').forEach(el => {
        data[`criterio${el.dataset.id}`] = el.value.trim();
    });
    
    document.querySelectorAll('.peso').forEach(el => {
        data[`peso${el.dataset.id}`] = el.value;
    });
    
    document.querySelectorAll('.concepto').forEach(el => {
        data[`concepto${el.dataset.id}`] = el.value.trim();
    });

    // Guardar en localStorage
    localStorage.setItem('projectData', JSON.stringify(data));
    
    // Navegar a la siguiente página
    window.location.href = 'evaluacion.html';
}

/**
 * Actualiza el icono y tooltip del botón de tema
 */
function updateThemeButton() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    
    if (currentTheme === 'dark') {
        themeToggle.textContent = '☀️';
        themeToggle.title = 'Cambiar a modo claro';
        // Actualizar tooltip traducido si está disponible
        if (typeof t === 'function') {
            themeToggle.title = t('theme_light') || 'Cambiar a modo claro';
        }
    } else {
        themeToggle.textContent = '🌙';
        themeToggle.title = 'Cambiar a modo oscuro';
        if (typeof t === 'function') {
            themeToggle.title = t('theme_dark') || 'Cambiar a modo oscuro';
        }
    }
}

/**
 * Configura el selector de idioma
 */
function setupLanguageSelector() {
    const langSelector = document.getElementById('languageSelector');
    if (!langSelector) return;
    
    const currentLang = localStorage.getItem('preferredLanguage') || 'es';
    langSelector.value = currentLang;
    
    langSelector.addEventListener('change', function() {
        if (typeof setLanguage === 'function') {
            setLanguage(this.value);
            updateProjectName(); // Actualizar nombre del proyecto con nueva traducción
            updateThemeButton(); // Actualizar tooltip en nuevo idioma
        } else {
            console.error('setLanguage function not found. Make sure lang.js is loaded.');
        }
    });
}

/**
 * Configura el tema oscuro/claro
 */
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Aplicar tema guardado
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeButton();
    
    // Cambiar tema al hacer clic
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeButton();
        });
    }
}

/**
 * Configura eventos de entrada para validación
 */
function setupInputEvents() {
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            updateProjectName();
            validateAndEnable();
        });
    });
}

/**
 * Configura el botón de guardar
 */
function setupSaveButton() {
    const guardarBtn = document.getElementById('guardarBtn');
    if (guardarBtn) {
        guardarBtn.addEventListener('click', saveAndContinue);
    }
}

/**
 * Carga los datos guardados en los formularios
 */
function loadSavedData() {
    const projectNameInput = document.getElementById('projectName');
    if (projectNameInput) {
        projectNameInput.value = data.projectName || '';
    }
    
    // Cargar criterios
    document.querySelectorAll('.criterio').forEach(el => {
        el.value = data[`criterio${el.dataset.id}`] || '';
    });
    
    // Cargar pesos
    document.querySelectorAll('.peso').forEach(el => {
        el.value = data[`peso${el.dataset.id}`] || '';
    });
    
    // Cargar conceptos
    document.querySelectorAll('.concepto').forEach(el => {
        el.value = data[`concepto${el.dataset.id}`] || '';
    });
}

/**
 * Inicializa la página
 */
function initializePage() {
    // Cargar datos guardados
    loadSavedData();
    
    // Configurar componentes
    setupLanguageSelector();
    setupThemeToggle();
    setupInputEvents();
    setupSaveButton();
    
    // Actualizar nombre del proyecto
    updateProjectName();
    
    // Validación inicial
    validateAndEnable();
}

// ========== EJECUCIÓN AL CARGAR EL DOM ==========
document.addEventListener('DOMContentLoaded', initializePage);

// ========== EXPORTAR FUNCIONES PARA USO GLOBAL ==========
window.updateProjectName = updateProjectName;
window.validateAndEnable = validateAndEnable;
window.saveAndContinue = saveAndContinue;
