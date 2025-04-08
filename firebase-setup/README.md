# Configuración de Firebase

## Instrucciones para configurar las reglas de Firestore

1. Abre la [consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a "Firestore Database" en el menú lateral
4. Haz clic en la pestaña "Reglas"
5. Reemplaza las reglas existentes con el contenido del archivo `firestore.rules`
6. Haz clic en "Publicar"

## Reglas para desarrollo vs producción

El archivo `firestore.rules` en esta carpeta contiene reglas que permiten acceso completo para facilitar el desarrollo. **No uses estas reglas en producción**.

Para producción, usa las reglas que están en el archivo principal `firestore.rules` en la raíz del proyecto, que incluyen validaciones de seguridad adecuadas.

## Solución de problemas de permisos

Si sigues teniendo problemas de permisos después de actualizar las reglas:

1. Asegúrate de que los cambios en las reglas se hayan publicado correctamente
2. Verifica que estás utilizando las credenciales correctas de Firebase en tu aplicación
3. A veces los cambios en las reglas tardan unos minutos en propagarse
4. Utiliza el depurador de Firebase en la página de inicio de la aplicación para crear datos de prueba 