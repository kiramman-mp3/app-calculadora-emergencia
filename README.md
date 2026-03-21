# 📱 CaluRescue (Calculadora de Emergencia)

**CaluRescue** es una herramienta de seguridad personal diseñada para la protección de personas en situaciones de riesgo bajo la apariencia de una calculadora funcional.

## 🛡️ Propósito

El objetivo principal de **CaluRescue** es proporcionar un medio de alerta discreto y camuflado. Su interfaz estándar de calculadora evita levantar sospechas mientras esconde funciones críticas de seguridad.

## ✨ Funciones de Seguridad Camufladas

- **Ajustes de Contactos (Modo Oculto)**: 
  - Al mantener presionada la tecla **"C"** durante **2 segundos**, se activa una pantalla secreta para la gestión de contactos de emergencia. 
  - Aquí el usuario selecciona y guarda los números que recibirán las alertas.

- **Activación de Alerta Silenciosa**:
  - Al escribir la secuencia **`1234=`** en el teclado, se dispara automáticamente un mensaje de alerta a todos los contactos configurados.
  - Utiliza un módulo nativo optimizado para asegurar el envío inmediato.

## 🚀 Características Técnicas

- **Interfaz Camuflada**: Diseño de calculadora aritmética común.
- **Módulo SMS Nativo**: Implementación robusta en Android para el envío de mensajes de socorro de emergencia.
- **Geolocalización**: Posibilidad de incluir la ubicación actual del dispositivo en los mensajes de alerta.
- **Persistencia Segura**: Contactos guardados localmente para disponibilidad constante sin internet.

## 🛠️ Instalación y Configuración

1. **Dependencias**: Instalar con `npm install`.
2. **Generación Nativa**: Ejecutar `npx expo prebuild` para preparar el entorno nativo.
3. **Ejecución**: Usar `npm run android` para compilar con soporte completo de SMS.

---
**IMPORTANTE**: Esta es una herramienta de seguridad crítica. Realice pruebas en entornos controlados y asegúrese de que sus contactos de confianza conozcan el propósito de estas alertas.
