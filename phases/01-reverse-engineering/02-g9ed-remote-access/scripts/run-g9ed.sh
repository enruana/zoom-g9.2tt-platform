#!/bin/bash
# =============================================================================
# run-g9ed.sh - Ejecuta G9ED con la configuracion correcta
# =============================================================================
#
# Uso:
#   ./run-g9ed.sh
#
# Requisitos:
#   - Conectar via SSH con X11 forwarding: ssh -Y usuario@ip
#   - Wine y Wine Mono instalados
#   - G9ED extraido en ~/g9ed/extracted/
#
# =============================================================================

# Verificar DISPLAY
if [ -z "$DISPLAY" ]; then
    echo "ERROR: Variable DISPLAY no configurada"
    echo ""
    echo "Opciones:"
    echo "  1. Conecta con: ssh -Y usuario@ip"
    echo "  2. O ejecuta: export DISPLAY=:0"
    echo ""
    exit 1
fi

# Configurar Wine
export WINE="$HOME/wine-i386/wine-11.0-x86/bin/wine"
export WINEPREFIX="$HOME/.wine32"
export WINEARCH="win32"

# Verificar archivos
if [ ! -f "$WINE" ]; then
    echo "ERROR: Wine no encontrado en $WINE"
    echo "Ejecuta: ./setup-wine.sh"
    exit 1
fi

if [ ! -f "$HOME/g9ed/extracted/G9ED.exe" ]; then
    echo "ERROR: G9ED.exe no encontrado"
    echo "Ejecuta: ./setup-g9ed.sh"
    exit 1
fi

# Ejecutar
echo "Iniciando G9ED..."
echo "  DISPLAY: $DISPLAY"
echo "  WINEPREFIX: $WINEPREFIX"
echo ""

box86 "$WINE" "$HOME/g9ed/extracted/G9ED.exe" "$@"
