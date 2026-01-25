#!/bin/bash
# =============================================================================
# install-wine-mono.sh - Instala Wine Mono para soporte .NET
# =============================================================================
#
# Wine Mono es necesario para ejecutar aplicaciones .NET como G9ED.exe
#
# Uso:
#   chmod +x install-wine-mono.sh
#   ./install-wine-mono.sh
#
# =============================================================================

set -e

echo "=============================================="
echo " Instalando Wine Mono (.NET support)"
echo "=============================================="
echo ""

# Configurar variables
export WINE="${WINE:-$HOME/wine-i386/wine-11.0-x86/bin/wine}"
export WINEPREFIX="${WINEPREFIX:-$HOME/.wine32}"
export WINEARCH="win32"

MONO_VERSION="9.4.0"
MONO_URL="https://dl.winehq.org/wine/wine-mono/${MONO_VERSION}/wine-mono-${MONO_VERSION}-x86.msi"
MONO_FILE="$HOME/wine-mono-${MONO_VERSION}.msi"

# Verificar que Wine esta instalado
if [ ! -f "$WINE" ]; then
    echo "ERROR: Wine no encontrado en $WINE"
    echo "Ejecuta primero: ./setup-wine.sh"
    exit 1
fi

# Descargar Wine Mono
echo "[1/3] Descargando Wine Mono ${MONO_VERSION}..."
if [ ! -f "$MONO_FILE" ]; then
    curl -L -o "$MONO_FILE" "$MONO_URL"
    echo "  Descargado: $MONO_FILE"
else
    echo "  Ya descargado: $MONO_FILE"
fi

# Verificar que el archivo se descargo correctamente
if [ ! -s "$MONO_FILE" ]; then
    echo "ERROR: Archivo de Wine Mono vacio o corrupto"
    rm -f "$MONO_FILE"
    exit 1
fi

# Instalar
echo "[2/3] Instalando Wine Mono..."
box86 "$WINE" msiexec /i "$MONO_FILE" 2>/dev/null || true

# Verificar instalacion
echo "[3/3] Verificando instalacion..."
if [ -d "$WINEPREFIX/drive_c/windows/Microsoft.NET" ]; then
    echo ""
    echo "=============================================="
    echo " Wine Mono instalado correctamente!"
    echo "=============================================="
    echo ""
    echo "Contenido de Microsoft.NET:"
    ls -la "$WINEPREFIX/drive_c/windows/Microsoft.NET/"
else
    echo ""
    echo "ADVERTENCIA: No se pudo verificar la instalacion"
    echo "Intenta ejecutar G9ED de todos modos"
fi

echo ""
echo "Siguiente paso: Instalar G9ED"
echo "  ./setup-g9ed.sh"
echo ""
