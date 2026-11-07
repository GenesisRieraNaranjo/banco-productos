#Banco Productos — Gestión de Productos Financieros

Aplicación web desarrollada con Angular 18 para la administración de productos financieros mediante operaciones CRUD.

Este proyecto fue desarrollado como parte de una evaluación técnica Frontend, aplicando buenas prácticas de desarrollo, arquitectura modular, formularios reactivos, validaciones y pruebas unitarias.

1. Tecnologías utilizadas

* Angular 18.2.21
* TypeScript
* HTML5 y CSS3
* Angular Reactive Forms
* RxJS
* Jasmine
* Karma
* Node.js y npm
* Git y GitHub

2. Funcionalidades implementadas

La aplicación permite administrar productos financieros mediante las siguientes funcionalidades:

* Listado de productos: consulta y visualización de productos registrados.
* Búsqueda: filtrado de productos mediante un campo de búsqueda.
* Paginación: navegación entre los resultados del listado.
* Creación: registro de nuevos productos financieros.
* Edición: actualización de la información de productos existentes.
* Eliminación: eliminación de productos mediante un cuadro de confirmación.
* Validaciones: verificación de campos obligatorios, formatos y reglas de negocio.
* Validación de identificadores: comprobación de que el ID del producto no se encuentre registrado.
* Manejo de errores: tratamiento de respuestas incorrectas del servidor.
* Indicadores de carga: visualización de estados de carga durante las consultas.
* Diseño responsive: adaptación de la interfaz a diferentes tamaños de pantalla.

3. Requisitos previos

Para ejecutar el proyecto es necesario contar con:

* Node.js compatible con Angular 18.
* npm.
* Angular CLI 18.
* El servicio backend de productos financieros disponible.

4. Instalación del proyecto

Clonar el repositorio:

git clone https://github.com/GenesisRieraNaranjo/banco-productos.git

Ingresar a la carpeta:

cd banco-productos

Instalar las dependencias:

npm install

5. Ejecución del backend

La aplicación consume una API REST de productos financieros.

El backend debe encontrarse disponible en:

http://localhost:3002
El backend debe ejecutarse de acuerdo con las instrucciones del proyecto o servicio proporcionado para la evaluación.

6. Ejecución del frontend
Una vez instaladas las dependencias y con el backend funcionando, ejecutar:

npm start
Si el proyecto utiliza la configuración estándar de Angular CLI, también puede iniciarse mediante:
- ng serve

La aplicación se actualizará automáticamente al modificar los archivos fuente durante el desarrollo.

7. Operaciones disponibles

Operación	Método HTTP	Endpoint
Consultar productos	GET	/bp/products
Crear producto	POST	/bp/products
Actualizar producto	PUT	/bp/products/{id}
Eliminar producto	DELETE	/bp/products/{id}

La aplicación también realiza la verificación de identificadores antes de registrar productos.

8. Validaciones implementadas

Los formularios utilizan Reactive Forms y validadores personalizados para comprobar la información ingresada.

Entre las reglas implementadas se encuentran:

* Validación de campos obligatorios.
* Validación de longitud de los campos.
* Verificación de identificadores duplicados.
* Validación de fechas.
* La fecha de liberación no puede ser anterior a la fecha actual.
* La fecha de revisión debe corresponder a un año después de la fecha de liberación.
* Visualización de mensajes de error para facilitar la corrección de datos.

9. Pruebas unitarias

El proyecto incluye pruebas unitarias desarrolladas con Jasmine y Karma.

Para ejecutar las pruebas:

npm test

Para ejecutar las pruebas una sola vez:
npm test -- --watch=false

Para ejecutar las pruebas y generar el reporte de cobertura:
npm test -- --watch=false --code-coverage

Resultados obtenidos
En la última ejecución de las pruebas se obtuvieron los siguientes resultados:

Métrica	Resultado
Pruebas ejecutadas	101
Pruebas exitosas	101
Pruebas fallidas	0
Cobertura de sentencias	95.61 %
Cobertura de ramas	87.62 %
Cobertura de funciones	95.31 %
Cobertura de líneas	96.23 %

Resultado: 101 pruebas unitarias ejecutadas exitosamente.

Los reportes de cobertura se generan en el directorio:

coverage/
Esta carpeta no se incluye en el repositorio porque contiene archivos generados automáticamente.

10. Compilación para producción

Para compilar el proyecto:

npm run build


11. Buenas prácticas aplicadas
Durante el desarrollo se consideraron las siguientes prácticas:

* Separación de responsabilidades entre componentes y servicios.
* Uso de interfaces TypeScript para el tipado de datos.
* Formularios reactivos y validadores reutilizables.
* Gestión de operaciones asíncronas mediante RxJS.
* Componentes reutilizables.
* Manejo de estados de carga y errores.
* Pruebas unitarias para validar el comportamiento de la aplicación.
* Exclusión de dependencias y archivos generados mediante .gitignore.



Génesis Juliana Riera Naranjo

Desarrolladora de Software Full Stack
Proyecto desarrollado para evaluación técnica Frontend — Angular.





