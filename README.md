# MyBookstore

MyBookstore es una aplicación web de comercio electrónico orientada a la venta de libros. Permite a los usuarios explorar un catálogo, consultar el detalle de cada título, gestionar una lista de deseos, agregar productos a un carrito y realizar pedidos, todo dentro de una experiencia de tienda en línea.

## Descripción general

La aplicación está concebida como una librería virtual completa. Los usuarios pueden registrarse e iniciar sesión, navegar por el catálogo, aplicar filtros de búsqueda por título, autor o rango de precio, leer y publicar reseñas sobre los libros, mantener una lista personal de favoritos y completar el flujo de compra hasta la confirmación del pedido.

## Arquitectura de la solución

MyBookstore está construida bajo un enfoque de **arquitectura distribuida**, combinando microservicios y componentes serverless:

- **Frontend:** una aplicación de página única construida en **React**, hospedada como sitio estático en **Amazon S3**.
- **Backend de microservicios:** un conjunto de servicios en **Node.js** desplegados sobre un cluster de **Amazon EKS** (Kubernetes), responsables de la autenticación, la gestión de usuarios, el catálogo, las reseñas, el carrito y los pedidos.
- **Componentes serverless:** funcionalidades específicas como la búsqueda avanzada y la lista de deseos están implementadas como funciones de **AWS Lambda**.
- **Persistencia:** la información de usuarios y autenticación se almacena en bases de datos **PostgreSQL** sobre **Amazon RDS**, mientras que el catálogo, las reseñas, los carritos, los pedidos y las listas de deseos residen en **Amazon DynamoDB**.
- **Punto de entrada unificado:** un **Amazon API Gateway** centraliza todo el tráfico HTTP y lo enruta hacia el microservicio o función Lambda correspondiente.

## Despliegue

Toda la infraestructura se gestiona mediante **Infraestructura como Código (IaC)** utilizando **Pulumi** con TypeScript, lo que permite reproducir el entorno completo de manera automatizada.