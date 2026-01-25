#!/bin/bash
# =============================================================================
# capture-midi.sh - Captura trafico MIDI del Zoom G9.2tt
# =============================================================================
#
# Este script captura todo el trafico MIDI en el puerto especificado.
#
# Uso:
#   ./capture-midi.sh              # Captura 30 segundos (default)
#   ./capture-midi.sh 60           # Captura 60 segundos
#   ./capture-midi.sh 60 output    # Especifica nombre de archivo
#
# =============================================================================

# Parametros
DURATION=${1:-30}
OUTPUT_NAME=${2:-"capture"}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="${OUTPUT_NAME}_${TIMESTAMP}.hex"

# Buscar dispositivo MIDI
echo "=============================================="
echo " Captura MIDI - Zoom G9.2tt"
echo "=============================================="
echo ""

echo "Buscando dispositivos MIDI..."
amidi -l
echo ""

# Intentar encontrar el dispositivo automaticamente
DEVICE=$(amidi -l | grep -i "um-one\|midi" | head -1 | awk '{print $2}')

if [ -z "$DEVICE" ]; then
    echo "No se encontro dispositivo MIDI automaticamente"
    echo "Dispositivos disponibles:"
    amidi -l
    echo ""
    read -p "Ingresa el dispositivo (ej: hw:2,0,0): " DEVICE
fi

if [ -z "$DEVICE" ]; then
    echo "ERROR: No se especifico dispositivo MIDI"
    exit 1
fi

echo "Dispositivo: $DEVICE"
echo "Duracion: $DURATION segundos"
echo "Output: $OUTPUT_FILE"
echo ""
echo "Iniciando captura..."
echo "(Presiona Ctrl+C para detener antes)"
echo ""

# Capturar
timeout $DURATION amidi -p "$DEVICE" -d > "$OUTPUT_FILE" 2>&1

echo ""
echo "=============================================="
echo " Captura completada"
echo "=============================================="
echo ""
echo "Archivo: $OUTPUT_FILE"
echo "Tamano: $(wc -c < "$OUTPUT_FILE") bytes"
echo ""

# Mostrar preview si hay datos
if [ -s "$OUTPUT_FILE" ]; then
    echo "Preview (primeros 500 bytes):"
    head -c 500 "$OUTPUT_FILE" | xxd
else
    echo "ADVERTENCIA: No se capturaron datos"
    echo "Verifica:"
    echo "  - El pedal esta encendido"
    echo "  - Los cables MIDI estan conectados"
    echo "  - El dispositivo correcto esta seleccionado"
fi
