# Central Deudores

Sistema de gestión de información crediticia desarrollado con React, TypeScript y Vite.

## Descripción

Central Deudores es una aplicación web moderna diseñada para gestionar y consultar información crediticia de deudores. La aplicación proporciona una interfaz intuitiva para el registro, consulta y análisis de datos financieros.

## Características

- 🔍 **Consulta de Deudores**: Búsqueda eficiente de información de deudores
- 📝 **Registro de Información**: Gestión completa de datos crediticios
- 📊 **Reportes**: Generación de reportes detallados
- 📈 **Historial Crediticio**: Seguimiento completo del historial de cada deudor
- 🔒 **Seguridad**: Manejo seguro de información sensible

## Tecnologías

- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Superset tipado de JavaScript
- **Vite** - Herramienta de construcción rápida
- **CSS3** - Estilos modernos y responsivos

## Instalación y Uso

## Instalación y Uso

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn

### Instalación

1. Clona el repositorio o descarga el proyecto
2. Navega al directorio del proyecto:
   ```bash
   cd centraldeudores
   ```

3. Instala las dependencias:
   ```bash
   npm install
   ```

### Comandos Disponibles

```bash
# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar la construcción de producción
npm run preview

# Ejecutar linting
npm run lint
```

### Desarrollo

La aplicación estará disponible en `http://localhost:5173` cuando ejecutes `npm run dev`.

## Estructura del Proyecto

```
centraldeudores/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/         # Páginas de la aplicación
│   ├── types/         # Definiciones de TypeScript
│   ├── utils/         # Utilidades y helpers
│   ├── App.tsx        # Componente principal
│   └── main.tsx       # Punto de entrada
├── public/            # Archivos estáticos
└── .github/           # Configuraciones de GitHub
```

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
