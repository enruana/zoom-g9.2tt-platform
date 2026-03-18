# Lo que se puede medir, se puede controlar

> Reverse-engineering un pedal de guitarra con IA — Pitch de 30 min

---

## Slide 0 — Hook `antes de mostrar nada`

"¿Les ha pasado que algo que les encanta...

se queda atrapado en el pasado?

Puede ser una herramienta... una aplicación... un dispositivo...

algo que sigue siendo increíble... pero ya no encaja con el mundo de hoy."

(Pausa corta)

"A mí me pasó con esto."

---

## Slide 1 — El Pedal

"Este es el Zoom G9.2tt...

un pedal multiefectos de guitarra del 2007.

A mí me enamoró más o menos en 2009, cuando lo conocí...

y desde ese momento siempre quise tener uno.

Hace aproximadamente un año... por fin me di el gusto de conseguirlo."

(Pausa breve)

"Y ahí fue cuando me di cuenta...

de que también había comprado sus problemas."

---

## Slide 2 — Software Muerto

"Porque al empezar a usarlo, me encontré con algo:

El software necesario para controlarlo...

corría únicamente en Windows XP.

Con drivers y dependencias que dejaron de existir en 2014.

Así que... literalmente...

el software estaba muerto."

---

## Slide 3 — La Locura `diagrama`

"Entonces, la solución que encontré... fue esta."

"Un MacBook conectado por SSH a una Raspberry Pi...

que corría Wine emulando Windows XP...

para poder ejecutar el software del 2007...

y conectarlo por USB MIDI al pedal."

(Pausa corta)

"Sí..."

"Era lento...

frágil...

una locura."

---

## Slide 4 — La Decisión

"Y ahí fue cuando pensé..."

(Pausa)

"¿Y si construyo mi propio software?"

> Dejar 1-2 segundos de silencio real.

---

# ACTO I — "Lo que se puede medir"

---

## Slide 5 — El Muro

"Y ahí apareció el primer problema real:

El protocolo de comunicación del pedal...

MIDI SysEx... completamente propietario.

Zoom nunca publicó documentación.

No había guías... no había specs... no había nada.

Lo único que tenía era esto:"

"268 bytes de hexadecimal... completamente incomprensible."

---

## Slide 6 — El Principio

"Pero recordé algo que aprendí hace tiempo:

'Lo que se puede medir... se puede controlar.'"

"Si puedo capturar los datos... puedo entenderlos.

Si puedo entenderlos... puedo controlarlos."

---

## Slide 7 — La Captura `diagrama`

"Así que decidí capturar el tráfico."

"Me puse en el medio de la comunicación

entre el software original y el pedal."

"Básicamente... intercepté y registré todos los mensajes MIDI

que se estaban enviando."

"Cada cambio de efecto...

cada parámetro...

cada interacción... quedaba registrada."

---

## Slide 8 — Datos Crudos

"Y esto es lo que obtuve:"

"Datos en hexadecimal crudo."

"F0: inicio del mensaje SysEx

52: Zoom

42: modelo G9.2tt

F7: fin del mensaje"

"Pero en ese momento...

seguía siendo ruido."

---

## Slide 9 — Análisis con IA `diagrama`

"Y aquí es donde entra la IA."

"Yo tenía el contexto:

sabía qué estaba cambiando en el pedal."

"La IA tenía la capacidad de analizar cientos de muestras

y encontrar patrones."

"Juntos empezamos a entender:"

- codificación por nibbles
- encoding de 7 bits
- estructura del header
- comandos SysEx

"No fue solo IA...

ni solo yo."

"Fue la combinación."

---

## Slide 10 — Protocolo Descifrado

"Y eventualmente... logramos descifrar el protocolo completo."

"Identificamos 6 comandos:"

- identificación del dispositivo
- entrar y salir del modo edición
- leer patches
- escribir patches
- modificar parámetros en tiempo real

"Ya podíamos leer todo del pedal."

(Pausa breve de logro)

---

## Slide 11 — Pero faltaba algo...

"Pero había un problema."

"Leer... funcionaba perfecto."

"Escribir... no."

"Nos faltaba algo crítico:"

"El checksum."

"Un algoritmo de verificación...

que no sabíamos cómo funcionaba."

"Y sin eso...

no podíamos controlar nada."

---

# ACTO II — "El momento que cambió todo"

---

## Slide 12 — El muro del checksum `diagrama`

"Pero había un problema."

"Para escribir datos en el pedal... necesitábamos un checksum."

"Un algoritmo de verificación... que no conocíamos."

"Y sin saber:"

- qué datos cubría
- qué algoritmo usaba

"Era imposible replicarlo."

(Pausa breve)

"Así que hicimos lo obvio..."

"Probamos de todo."

"Algoritmos simples... complejos... combinaciones..."

"Nada funcionaba."

"Absolutamente nada."

(Pausa)

"Y la frustración... empezó a aparecer."

---

## Slide 13 — La sugerencia inesperada `diagrama`

"Y en ese momento... pasó algo que no esperaba."

"La IA... sugirió algo que a mí no se me habría ocurrido."

(Pausa)

"Me dijo:"

*'¿Y si decompilas el ejecutable?'*

(Pausa corta, deja que entre la idea)

"El software original estaba escrito en .NET..."

"Y los binarios de .NET... se pueden decompilar casi perfectamente."

"Eso significaba algo muy loco:"

"El código fuente...

estaba ahí...

escondido dentro del .exe."

---

## Slide 14 — El contraste `slide estrella`

> Bajar el ritmo. Actuarlo. Esta es la slide más importante.

"En ese momento... había dos caminos."

(Revelas visualmente)

"El camino rojo:"

"Yo solo... con datos crudos...

probando algoritmos a ciegas..."

"Literalmente imposible."

(Pausa)

"Y el camino verde:"

"La IA sugiere decompilar...

encontramos el código...

y ahí estaba..."

(Pausa breve)

"El algoritmo exacto."

"CRC-32... con un polinomio específico."

"Funcionó... al primer intento."

(Pausa más larga — deja que respire)

"Y ahí entendí algo clave:"

"No era yo..."

"No era la IA..."

"Era la combinación."

---

## Slide 15 — El algoritmo

"El checksum era:"

"CRC-32...

polinomio 0xEDB88320...

calculado sobre los 128 bytes del patch."

"Estaba ahí..."

"En un ejecutable del 2007..."

"Esperando a que alguien lo encontrara."

---

## Slide 16 — Momento Eureka `diagrama`

> Clímax emocional. Darlo con peso.

"Y cuando lo probamos..."

(Pausa)

"Checksum verificado."

"Parche escrito."

"El pedal responde."

(Pausa)

"Funciona."

(Silencio corto)

"En ese momento..."

"Lo que se puede medir...

se puede controlar."

---

# ACTO III — "De script a plataforma"

---

## Slide 17 — La pregunta siguiente

"Listo."

"Ya podía hablar con el pedal."

"Tenía un script en Python... que funcionaba."

(Pausa)

"Pero eso era... para mí."

"Y ahí apareció la siguiente pregunta:"

"¿Puedo convertir esto... en algo para todos?"

---

## Slide 18 — El alcance

"Y eso fue lo que construí:"

"Una plataforma completa para controlar el pedal."

(Ritmo progresivo)

"Más de 140 efectos...

100 patches...

edición en tiempo real..."

"Sincronización en la nube...

sesiones colaborativas...

acceso desde el celular..."

(Pausa)

"Una sola persona..."

"Con IA."

---

## Slide 19 — El proceso `diagrama`

> Este slide te diferencia de los "vibe coders". Darlo con convicción.

"Pero esto es importante:"

"No fue sentarme...

y pedirle a la IA que me hiciera una app."

(Pausa)

"Fue un proceso."

"Primero: entender el problema."

"Luego: definir producto."

"Después: arquitectura."

"Después: implementación."

(Ritmo claro)

"PRD... épicas... historias... componentes... servicios."

(Pausa)

"La IA aceleró todo..."

"Pero el pensamiento... fue mío."

---

## Slide 20 — La arquitectura `diagrama`

"La arquitectura es simple, pero intencional:"

"Frontend en React...

manejo de estado...

servicios para MIDI, sesiones y nube..."

"Y conexiones externas:"

"El pedal...

y Firebase."

(Pausa)

"No es sobre tecnología."

"Es sobre tomar decisiones correctas."

---

## Slide 21 — Velocidad real

"Todo esto:"

"Reverse engineering...

librería...

plataforma completa..."

(Pausa)

"Una persona."

"Con IA."

(Miras al público)

"Esto... es lo que es posible hoy."

---

# ACTO IV — "La verdad incómoda"

---

## Slide 22 — No todo fue perfecto

"Pero seamos honestos..."

(Pausa)

"La IA rompe cosas."

---

## Slide 23 — Ejemplos reales

"Me rompió interfaces que funcionaban."

"Cambió el protocolo sin avisar."

"Alteró estructuras de datos..."

"Y tuve que reconstruir módulos completos."

(Pausa)

"Esto pasa."

"Todo el tiempo."

---

## Slide 24 — Por qué importa `diagrama`

"Y aquí está el punto:"

"Un developer con contexto...

detecta el error...

y lo corrige."

"Un developer sin contexto..."

(Pausa)

"ni siquiera se da cuenta."

(Pausa)

"Y termina enviando datos corruptos...

a producción...

o peor... a un dispositivo físico."

(Miras al público)

"Tu experiencia...

es el filtro de calidad."

---

## Slide 25 — La lección inesperada `diagrama`

> Esta frase es oro. Entregarla bien.

"Y la lección más importante..."

"La IA no te hace mejor ingeniero

automatizando tu pensamiento."

(Pausa)

"Te hace mejor...

obligándote a pensar con claridad."

"Idea vaga... resultado vago."

"Prompt claro... resultado exacto."

---

# CIERRE

---

## Slide 26 — La reflexión

"Tu proceso cognitivo...

no se acelera."

(Pausa)

"Tus resultados... sí."

"La IA no piensa por ti."

"Amplifica... cómo piensas."

---

## Slide 27 — Lo que cambió

"Antes:"

"Memorizar sintaxis...

buscar en Stack Overflow...

copiar, pegar... adaptar."

(Pausa)

"Ahora:"

"Entender intención...

comunicar claramente...

validar resultados."

(Pausa)

"No cambió lo que aprendes."

"Cambió... cómo lo usas."

---

## Slide 28 — El camino `diagrama`

> Debe sentirse progresivo. Revelar escalones uno por uno.

"Este es el camino:"

"Primero: fundamentos."

"Luego: práctica... experiencia."

"Después: experimentación."

(Pausa)

"Y solo entonces..."

"IA."

(Pausa)

"Porque si no hay base..."

"no hay nada que amplificar."

---

## Slide 29 — El producto

"Y este es el resultado."

"Una plataforma real... en producción."

"zoomg9.enruana.com"

"Pueden probarla ahora mismo."

> Si haces demo, que sea breve.

---

## Slide 30 — La pregunta final

> Tu momento final. Darlo con peso.

"Estos LEDs..."

"representan potencial."

"Cada uno... es algo que podría construirse."

(Pausa larga)

"La pregunta no es si la IA puede ayudarte."

(Miras al público)

"La pregunta es:"

"¿Qué van a construir ustedes?"

> NO hablar después de esto inmediatamente.

---

## Slide 31 — Q&A

"Gracias."

"¿Preguntas?"
