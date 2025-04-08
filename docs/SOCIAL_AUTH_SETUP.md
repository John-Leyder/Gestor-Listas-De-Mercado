# Configuración de Autenticación Social en Firebase

Este documento describe los pasos necesarios para habilitar y configurar la autenticación social (Google, GitHub y Facebook) en tu proyecto de Firebase.

## Configuración General

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, ve a "Authentication"
4. Haz clic en la pestaña "Sign-in method"

## Configurar Google Sign-In

1. En la lista de proveedores, busca "Google"
2. Haz clic en el botón de editar (ícono de lápiz)
3. Activa el switch "Enable"
4. Configura el "Project support email"
5. Haz clic en "Save"

## Configurar GitHub Sign-In

1. En la lista de proveedores, busca "GitHub"
2. Haz clic en el botón de editar
3. Activa el switch "Enable"
4. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
5. Crea una nueva OAuth App:
   - Application name: [Nombre de tu app]
   - Homepage URL: https://[tu-proyecto].firebaseapp.com
   - Authorization callback URL: https://[tu-proyecto].firebaseapp.com/__/auth/handler
6. Copia el "Client ID" y "Client Secret" de GitHub
7. Pega estos valores en la configuración de Firebase
8. Haz clic en "Save"

## Configurar Facebook Sign-In

1. En la lista de proveedores, busca "Facebook"
2. Haz clic en el botón de editar
3. Activa el switch "Enable"
4. Ve al [Facebook Developers Console](https://developers.facebook.com/)
5. Crea una nueva aplicación:
   - Selecciona "Consumer" como tipo de app
   - Completa la información básica
6. En el panel de la app, añade el producto "Facebook Login"
7. En la configuración de Facebook Login:
   - OAuth redirect URI: https://[tu-proyecto].firebaseapp.com/__/auth/handler
   - Configura los permisos necesarios (email es suficiente para inicio básico)
8. Copia el "App ID" y "App Secret"
9. Pega estos valores en la configuración de Firebase
10. Haz clic en "Save"

## Verificación

Para verificar que todo está configurado correctamente:

1. Intenta iniciar sesión con cada proveedor
2. Verifica que los usuarios se crean correctamente en Firebase Authentication
3. Comprueba que los tokens de acceso se generan correctamente
4. Verifica que los usuarios pueden acceder a las funcionalidades protegidas

## Solución de Problemas

Si encuentras problemas:

1. **Error de dominio no autorizado**:
   - Verifica que el dominio de tu aplicación esté autorizado en Firebase
   - Añade localhost a los dominios autorizados para desarrollo

2. **Error de callback**:
   - Verifica que las URLs de callback sean exactamente las mismas en Firebase y en los proveedores

3. **Error de permisos**:
   - Revisa los permisos solicitados en cada proveedor
   - Asegúrate de que la app esté en modo "Live" si es necesario

4. **Error de configuración**:
   - Verifica que todos los IDs y Secrets estén correctamente copiados
   - Asegúrate de que no hay espacios extras en los valores

## Notas de Seguridad

- Nunca compartas los Client Secrets
- Usa variables de entorno para las credenciales sensibles
- Revisa regularmente los accesos y permisos
- Mantén actualizadas las políticas de privacidad y términos de uso 