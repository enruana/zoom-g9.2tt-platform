#!/bin/bash
# =============================================================================
# setup-wine.sh - Configuracion de Wine x86 con box86 en Raspberry Pi
# =============================================================================
#
# Este script instala y configura Wine x86 para ejecutar aplicaciones Windows
# de 32 bits en una Raspberry Pi usando box86 como emulador.
#
# Requisitos:
#   - Raspberry Pi 4 (arm64)
#   - Debian 12 (Bookworm) o superior
#   - Conexion a internet
#
# Uso:
#   chmod +x setup-wine.sh
#   ./setup-wine.sh
#
# =============================================================================

set -e

echo "=============================================="
echo " Setup Wine x86 + box86 para Raspberry Pi"
echo "=============================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funcion para imprimir pasos
step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# -----------------------------------------------------------------------------
# 1. Verificar arquitectura
# -----------------------------------------------------------------------------
step "Verificando arquitectura del sistema..."

ARCH=$(dpkg --print-architecture)
if [ "$ARCH" != "arm64" ]; then
    error "Este script requiere Raspberry Pi con arquitectura arm64 (actual: $ARCH)"
fi
echo "  Arquitectura: $ARCH OK"

# -----------------------------------------------------------------------------
# 2. Instalar dependencias del sistema
# -----------------------------------------------------------------------------
step "Instalando dependencias del sistema..."

sudo apt update
sudo apt install -y \
    curl \
    wget \
    xz-utils \
    cabextract \
    p7zip-full

# -----------------------------------------------------------------------------
# 3. Habilitar arquitectura armhf (32-bit)
# -----------------------------------------------------------------------------
step "Habilitando arquitectura armhf..."

sudo dpkg --add-architecture armhf
sudo apt update

# Instalar librerias 32-bit necesarias para Wine
sudo apt install -y \
    libc6:armhf \
    libx11-6:armhf \
    libfreetype6:armhf \
    libxext6:armhf \
    libxrender1:armhf \
    libxrandr2:armhf \
    libxcursor1:armhf \
    libxi6:armhf \
    libxfixes3:armhf \
    libxcomposite1:armhf \
    libglib2.0-0:armhf \
    libfontconfig1:armhf

# -----------------------------------------------------------------------------
# 4. Instalar box86
# -----------------------------------------------------------------------------
step "Verificando box86..."

if command -v box86 &> /dev/null; then
    echo "  box86 ya esta instalado: $(box86 --version 2>&1 | head -1)"
else
    warn "box86 no encontrado. Intentando instalar..."

    # Intentar desde repositorios oficiales
    if apt-cache show box86-rpi4arm64 &> /dev/null; then
        sudo apt install -y box86-rpi4arm64
    else
        error "box86 no disponible. Instala manualmente desde: https://github.com/ptitSeb/box86"
    fi
fi

# -----------------------------------------------------------------------------
# 5. Descargar Wine x86
# -----------------------------------------------------------------------------
step "Configurando Wine x86..."

WINE_DIR="$HOME/wine-i386"
WINE_VERSION="11.0"
WINE_URL="https://github.com/Kron4ek/Wine-Builds/releases/download/${WINE_VERSION}/wine-${WINE_VERSION}-x86.tar.xz"

mkdir -p "$WINE_DIR"
cd "$WINE_DIR"

if [ ! -d "wine-${WINE_VERSION}-x86" ]; then
    echo "  Descargando Wine ${WINE_VERSION} x86..."

    if [ ! -f "wine.tar.xz" ]; then
        curl -L -o wine.tar.xz "$WINE_URL"
    fi

    echo "  Extrayendo Wine..."
    tar -xf wine.tar.xz

    echo "  Wine extraido en: $WINE_DIR/wine-${WINE_VERSION}-x86"
else
    echo "  Wine ${WINE_VERSION} ya esta instalado"
fi

# -----------------------------------------------------------------------------
# 6. Configurar variables de entorno
# -----------------------------------------------------------------------------
step "Configurando variables de entorno..."

BASHRC_MARKER="# Wine x86 con box86 (zoom-g9.2tt-platform)"

if ! grep -q "$BASHRC_MARKER" ~/.bashrc; then
    cat >> ~/.bashrc << EOF

$BASHRC_MARKER
export WINE=$HOME/wine-i386/wine-${WINE_VERSION}-x86/bin/wine
export WINEPREFIX=\$HOME/.wine32
export WINEARCH=win32
alias wine86="box86 \$WINE"
EOF
    echo "  Variables agregadas a ~/.bashrc"
else
    echo "  Variables ya configuradas en ~/.bashrc"
fi

# Exportar para uso inmediato
export WINE="$HOME/wine-i386/wine-${WINE_VERSION}-x86/bin/wine"
export WINEPREFIX="$HOME/.wine32"
export WINEARCH="win32"

# -----------------------------------------------------------------------------
# 7. Inicializar Wine prefix
# -----------------------------------------------------------------------------
step "Inicializando Wine prefix..."

if [ ! -d "$WINEPREFIX" ]; then
    echo "  Creando prefix en $WINEPREFIX..."
    box86 "$WINE" wineboot --init 2>/dev/null || true
    echo "  Prefix creado"
else
    echo "  Prefix ya existe en $WINEPREFIX"
fi

# -----------------------------------------------------------------------------
# 8. Verificar instalacion
# -----------------------------------------------------------------------------
step "Verificando instalacion..."

echo ""
echo "  box86: $(box86 --version 2>&1 | head -1)"
echo "  Wine:  $(box86 $WINE --version 2>&1)"
echo "  Prefix: $WINEPREFIX"
echo ""

# -----------------------------------------------------------------------------
# Resumen
# -----------------------------------------------------------------------------
echo "=============================================="
echo -e "${GREEN} Instalacion completada!${NC}"
echo "=============================================="
echo ""
echo "Para usar Wine, ejecuta:"
echo "  source ~/.bashrc"
echo "  box86 \$WINE programa.exe"
echo ""
echo "O usa el alias:"
echo "  wine86 programa.exe"
echo ""
echo "Siguiente paso: Instalar Wine Mono para .NET"
echo "  ./install-wine-mono.sh"
echo ""
