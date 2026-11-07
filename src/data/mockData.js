export const resumen = {
  analisis: 12,
  opiniones: 8450,
  positivo: 72,
  negativo: 16,
};

export const sentimientos = [
  { name: 'Positivas', value: 72, color: '#39c995' },
  { name: 'Neutras', value: 8, color: '#6485ff' },
  { name: 'Negativas', value: 16, color: '#f05b75' },
  { name: 'Mixtas', value: 4, color: '#f5a34b' },
];

export const ultimosAnalisis = [
  { id: 1, nombre: 'Congreso de Tecnología 2025', fecha: '15/04/2025', opiniones: 1250 },
  { id: 2, nombre: 'Conferencia de Innovación', fecha: '10/04/2025', opiniones: 984 },
  { id: 3, nombre: 'Jornada de IA y Educación', fecha: '22/03/2025', opiniones: 720 },
];

export const resultadoEvento = {
  nombre: 'Congreso de Tecnología 2025',
  tipo: 'Congreso',
  fecha: '15/04/2025',
  opiniones: 1250,
  temas: [
    { name: 'Disertantes', value: 32 },
    { name: 'Organización', value: 28 },
    { name: 'Contenido', value: 24 },
    { name: 'Instalaciones', value: 16 },
  ],
  destacados: [
    'Excelentes disertantes',
    'Contenido de calidad',
    'Buena organización',
  ],
  problemas: [
    'Demoras en el ingreso',
    'Salas con poca ventilación',
    'Precios elevados',
  ],
  recomendacion:
    'Mejorar los tiempos de ingreso, optimizar la ventilación de las salas y considerar opciones de precios más accesibles.',
};

export const historial = [
  { id: 1, nombre: 'Congreso de Tecnología 2025', tipo: 'Congreso', fecha: '15/04/2025', opiniones: 1250, positivo: 72 },
  { id: 2, nombre: 'Conferencia de Innovación', tipo: 'Conferencia', fecha: '10/04/2025', opiniones: 984, positivo: 68 },
  { id: 3, nombre: 'Jornada de IA y Educación', tipo: 'Jornada', fecha: '22/03/2025', opiniones: 720, positivo: 75 },
  { id: 4, nombre: 'Foro de Marketing Digital', tipo: 'Congreso', fecha: '15/02/2025', opiniones: 620, positivo: 60 },
];