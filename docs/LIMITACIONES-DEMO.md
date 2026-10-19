# Limitaciones del modo demo

- **Datos ficticios.** Las salas, compañías, personas, festivales y recursos son inventados. Los lugares son solo zonas generales. Las URL externas usan `example.org`.
- **Una copia por pestaña.** Los datos viven en `sessionStorage`: sobreviven a una recarga, pero se pierden al cerrar la pestaña, y cada pestaña tiene su propia copia. No es multiusuario: lo que hace una cuenta no lo ve otra persona en otra computadora.
- **Ingreso sin contraseña.** En modo demo la contraseña no se verifica ni se guarda. No es un acceso seguro.
- **Sin pagos.** Elegir un plan lo activa en modo demo y queda marcado así. Los precios son de demostración.
- **Reservas no reales.** Las solicitudes y reservas aceptadas no comprometen a nadie.
- **Mensajes simulados.** No hay chat en tiempo real y nadie más recibe lo que se escribe.
- **Archivos no se suben.** El selector valida tipo y tamaño, pero los archivos no se envían a ningún lado. Solo los archivos de `public/demo` se pueden descargar.
- **Audio y video.** No hay fuentes reales: se indica "contenido de ejemplo".
- **Reseñas.** No hay sistema de reseñas verificadas, así que no se muestran estrellas.
- **Verificación.** Ni las experiencias ni las convocatorias están verificadas, y la interfaz lo dice.
- **Permisos.** Se comprueban en la capa de servicios del navegador. Cualquier persona con conocimientos técnicos podría saltearlos. Para usuarios reales hace falta backend (ver ARQUITECTURA.md).
- **Publicación programada.** Un recurso programado aparece cuando llega la fecha, según el reloj del navegador.
- **Recuperar contraseña.** No envía correos.
- **Sponsors.** Las marcas del plano de platea (Café Bambalina, Imprenta Proscenio, etc.) son ficticias. Se reemplazan en `src/config/sponsors.js` antes de publicar.
