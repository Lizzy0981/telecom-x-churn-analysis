/**
 * NOTIFICATION MANAGER - Sistema de notificaciones
 * Toast notifications + Browser notifications + Alertas personalizadas
 */

class NotificationManager {
    constructor() {
        this.toastContainer = null;
        this.notificationPermission = 'default';
        this.initToastContainer();
    }

    /**
     * Inicializa el contenedor de toasts
     */
    initToastContainer() {
        if (typeof document === 'undefined') return;

        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'toast-container';
        this.toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        `;
        document.body.appendChild(this.toastContainer);
    }

    /**
     * Muestra un toast notification
     * @param {String} message - Mensaje a mostrar
     * @param {String} type - Tipo: success, error, warning, info
     * @param {Number} duration - Duración en ms (0 = permanente)
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        toast.style.cssText = `
            background: ${colors[type]};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            animation: slideIn 0.3s ease-out;
            cursor: pointer;
            transition: transform 0.2s, opacity 0.2s;
        `;

        toast.innerHTML = `
            <span style="font-size: 20px; font-weight: bold;">${icons[type]}</span>
            <span style="flex: 1;">${message}</span>
            <span style="font-size: 18px; opacity: 0.8;">&times;</span>
        `;

        // Animación de entrada
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        // Hover effect
        toast.addEventListener('mouseenter', () => {
            toast.style.transform = 'scale(1.02)';
        });
        toast.addEventListener('mouseleave', () => {
            toast.style.transform = 'scale(1)';
        });

        // Click para cerrar
        toast.addEventListener('click', () => {
            this.removeToast(toast);
        });

        this.toastContainer.appendChild(toast);

        // Auto-remove después de duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }

        return toast;
    }

    /**
     * Remueve un toast con animación
     */
    removeToast(toast) {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    /**
     * Shortcuts para diferentes tipos
     */
    success(message, duration = 3000) {
        return this.showToast(message, 'success', duration);
    }

    error(message, duration = 4000) {
        return this.showToast(message, 'error', duration);
    }

    warning(message, duration = 3500) {
        return this.showToast(message, 'warning', duration);
    }

    info(message, duration = 3000) {
        return this.showToast(message, 'info', duration);
    }

    /**
     * Toast con progreso
     */
    showProgress(message, type = 'info') {
        const toast = this.showToast(message, type, 0);
        
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: rgba(255,255,255,0.3);
            width: 0%;
            transition: width 0.3s;
        `;
        toast.style.position = 'relative';
        toast.appendChild(progressBar);

        return {
            toast,
            updateProgress: (percent) => {
                progressBar.style.width = percent + '%';
            },
            complete: () => {
                progressBar.style.width = '100%';
                setTimeout(() => this.removeToast(toast), 500);
            },
            error: (errorMsg) => {
                this.removeToast(toast);
                this.error(errorMsg);
            }
        };
    }

    /**
     * Solicita permiso para notificaciones del navegador
     */
    async requestPermission() {
        if (!('Notification' in window)) {
            console.warn('⚠️ Browser notifications not supported');
            return false;
        }

        if (Notification.permission === 'granted') {
            this.notificationPermission = 'granted';
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission;
            return permission === 'granted';
        }

        return false;
    }

    /**
     * Muestra notificación del navegador
     */
    async showNotification(title, options = {}) {
        if (!('Notification' in window)) {
            // Fallback a toast
            this.info(title);
            return;
        }

        if (Notification.permission !== 'granted') {
            const granted = await this.requestPermission();
            if (!granted) {
                this.info(title);
                return;
            }
        }

        const notification = new Notification(title, {
            icon: '/assets/images/logo.png',
            badge: '/assets/images/favicon.png',
            body: options.body || '',
            tag: options.tag || 'telecom-x',
            requireInteraction: options.requireInteraction || false,
            ...options
        });

        notification.onclick = () => {
            window.focus();
            if (options.onClick) {
                options.onClick();
            }
            notification.close();
        };

        return notification;
    }

    /**
     * Muestra alerta de análisis completado
     */
    analysisComplete(stats) {
        this.success(`Analysis complete! ${stats.rows} customers processed`);
        
        if (Notification.permission === 'granted') {
            this.showNotification('Analysis Complete', {
                body: `Processed ${stats.rows} customers. Churn rate: ${stats.churnRate}%`,
                icon: '/assets/images/logo.png'
            });
        }
    }

    /**
     * Muestra alerta de anomalías detectadas
     */
    anomaliesDetected(count) {
        this.warning(`⚠️ ${count} anomalies detected! Click to view details`);
    }

    /**
     * Muestra alerta de error de carga
     */
    uploadError(filename, error) {
        this.error(`Failed to load ${filename}: ${error}`);
    }

    /**
     * Muestra alerta de éxito de carga
     */
    uploadSuccess(filename, rows) {
        this.success(`✓ ${filename} loaded successfully (${rows} rows)`);
    }

    /**
     * Muestra confirmación de acción
     */
    confirm(message, onConfirm, onCancel) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            animation: fadeIn 0.2s;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            padding: 24px;
            border-radius: 12px;
            max-width: 400px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            animation: scaleIn 0.2s;
        `;

        modal.innerHTML = `
            <div style="font-size: 16px; margin-bottom: 20px; color: #1f2937;">${message}</div>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button id="cancel-btn" style="
                    padding: 8px 16px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    background: white;
                    color: #374151;
                    cursor: pointer;
                    font-size: 14px;
                ">Cancel</button>
                <button id="confirm-btn" style="
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    background: #3b82f6;
                    color: white;
                    cursor: pointer;
                    font-size: 14px;
                ">Confirm</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Animaciones
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // Event listeners
        modal.querySelector('#confirm-btn').addEventListener('click', () => {
            document.body.removeChild(overlay);
            if (onConfirm) onConfirm();
        });

        modal.querySelector('#cancel-btn').addEventListener('click', () => {
            document.body.removeChild(overlay);
            if (onCancel) onCancel();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                if (onCancel) onCancel();
            }
        });
    }

    /**
     * Limpia todas las notificaciones
     */
    clearAll() {
        while (this.toastContainer.firstChild) {
            this.toastContainer.removeChild(this.toastContainer.firstChild);
        }
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.NotificationManager = NotificationManager;
    window.notificationManager = new NotificationManager();
    console.log('✅ NotificationManager loaded');
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}
