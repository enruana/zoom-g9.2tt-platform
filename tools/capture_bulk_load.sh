#!/bin/bash
# Captura de tráfico MIDI durante bulk load de G9ED
# Ejecutar en la Raspberry Pi

CAPTURE_DIR="${1:-/tmp/g9tt_capture_$(date +%Y%m%d_%H%M%S)}"
LOG_FILE="$CAPTURE_DIR/midi_traffic.log"

echo "========================================"
echo "CAPTURA MIDI - Zoom G9.2tt Bulk Load"
echo "========================================"
echo ""

# Crear directorio
mkdir -p "$CAPTURE_DIR"
echo "Directorio de captura: $CAPTURE_DIR"

# Mostrar puertos MIDI actuales
echo ""
echo "=== Puertos MIDI actuales ==="
aconnect -l
echo ""

# Buscar el cliente de Wine
WINE_CLIENT=$(aconnect -l | grep -i "wine" | head -1 | awk -F: '{print $1}' | awk '{print $2}')
UMONE_CLIENT=$(aconnect -l | grep -i "UM-ONE\|USB\|MIDI" | head -1 | awk -F: '{print $1}' | awk '{print $2}')

if [ -z "$WINE_CLIENT" ]; then
    echo "AVISO: No se detectó cliente Wine. Inicia G9ED primero."
    echo "       Luego ejecuta: aseqdump -p <WINE_PORT>,<UMONE_PORT>"
fi

if [ -z "$UMONE_CLIENT" ]; then
    echo "AVISO: No se detectó UM-ONE."
fi

echo ""
echo "=== Instrucciones ==="
echo ""
echo "1. En otra terminal, inicia G9ED:"
echo "   cd ~/G9ED && DISPLAY=:0 box86 wine G9ED.exe"
echo ""
echo "2. Verifica las conexiones:"
echo "   aconnect -l"
echo ""
echo "3. Inicia la captura (ajustar números de puerto):"
echo "   aseqdump -p 128:0,24:0 > $LOG_FILE 2>&1 &"
echo ""
echo "4. En G9ED, ejecuta File → Send All to G9.2tt"
echo ""
echo "5. Detener captura:"
echo "   pkill aseqdump"
echo ""
echo "6. Ver log:"
echo "   cat $LOG_FILE"
echo ""
echo "========================================"
echo ""

# Si tenemos los puertos, ofrecer iniciar captura automáticamente
if [ -n "$WINE_CLIENT" ] && [ -n "$UMONE_CLIENT" ]; then
    echo "Puertos detectados:"
    echo "  Wine: $WINE_CLIENT"
    echo "  UM-ONE: $UMONE_CLIENT"
    echo ""
    read -p "¿Iniciar captura ahora? [y/N] " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Iniciando aseqdump..."
        aseqdump -p "${WINE_CLIENT}:0,${UMONE_CLIENT}:0" > "$LOG_FILE" 2>&1 &
        DUMP_PID=$!
        echo "aseqdump corriendo (PID: $DUMP_PID)"
        echo ""
        echo "Log guardándose en: $LOG_FILE"
        echo ""
        echo "Presiona Enter cuando hayas terminado el bulk load..."
        read
        kill $DUMP_PID 2>/dev/null
        echo ""
        echo "Captura completada."
        echo "Mensajes capturados: $(wc -l < "$LOG_FILE")"
        echo ""
        echo "Para analizar:"
        echo "  cat $LOG_FILE | grep 'F0 52'"
    fi
fi
