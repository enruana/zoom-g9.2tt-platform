#!/bin/bash
# =============================================================================
# setup.sh - Setup completo para sesión de mapeo MIDI del Zoom G9.2tt
# =============================================================================
#
# Ejecuta desde el Mac. Verifica XQuartz, conectividad con la Raspberry Pi,
# dispositivos MIDI, Wine/box86, y lanza G9ED.exe con X11 forwarding.
#
# Uso:
#   ./setup.sh [IP_RASPBERRY]
#
# Ejemplo:
#   ./setup.sh 192.168.80.31
#
# =============================================================================

set -e

# --- Configuración ---
RPI_IP="${1:-192.168.80.31}"
RPI_USER="felipemantilla"
RPI_PASS="enruana"

# --- Colores ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

ok()   { echo -e "  ${GREEN}✔${NC} $1"; }
fail() { echo -e "  ${RED}✘${NC} $1"; }
info() { echo -e "  ${CYAN}→${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }

# --- SSH helpers ---
export SSHPASS="$RPI_PASS"
SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=5"

rpi_cmd() {
    sshpass -e ssh $SSH_OPTS "$RPI_USER@$RPI_IP" "$1"
}

rpi_x11() {
    sshpass -e ssh $SSH_OPTS -Y "$RPI_USER@$RPI_IP" "$1"
}

# --- Funciones ---
check_dependencies() {
    echo -e "\n${CYAN}[1/6] Verificando dependencias locales (Mac)${NC}"

    if ! command -v sshpass &>/dev/null; then
        fail "sshpass no instalado"
        info "Instala con: brew install sshpass"
        exit 1
    fi
    ok "sshpass disponible"

    if [ ! -d "/Applications/Utilities/XQuartz.app" ]; then
        fail "XQuartz no instalado"
        info "Instala con: brew install --cask xquartz"
        exit 1
    fi
    ok "XQuartz instalado"

    if [ -z "$DISPLAY" ]; then
        fail "Variable DISPLAY no configurada"
        info "XQuartz puede necesitar reinicio de sesión"
        exit 1
    fi
    ok "DISPLAY=$DISPLAY"
}

check_rpi_connectivity() {
    echo -e "\n${CYAN}[2/6] Verificando conectividad con Raspberry Pi ($RPI_IP)${NC}"

    if ! ping -c 1 -W 2 "$RPI_IP" &>/dev/null; then
        fail "No se puede alcanzar $RPI_IP"
        info "Verifica que la Raspberry Pi está encendida y en la red"
        exit 1
    fi
    ok "Raspberry Pi accesible en la red"

    if ! rpi_cmd "echo ok" &>/dev/null; then
        fail "SSH no disponible"
        info "Verifica credenciales o servicio SSH"
        exit 1
    fi
    ok "SSH conectado ($RPI_USER@$RPI_IP)"

    X11_DISPLAY=$(rpi_x11 'echo $DISPLAY' 2>/dev/null)
    if [ -z "$X11_DISPLAY" ]; then
        fail "X11 forwarding no funciona"
        info "Verifica que XQuartz tiene habilitado 'Allow connections from network clients'"
        exit 1
    fi
    ok "X11 forwarding activo (DISPLAY=$X11_DISPLAY)"
}

check_midi_devices() {
    echo -e "\n${CYAN}[3/6] Verificando dispositivos MIDI${NC}"

    ACONNECT_OUTPUT=$(rpi_cmd "aconnect -l" 2>/dev/null)

    if echo "$ACONNECT_OUTPUT" | grep -q "UM-ONE"; then
        ok "UM-ONE detectado"
        UM_ONE_PORT=$(echo "$ACONNECT_OUTPUT" | grep -B1 "UM-ONE" | grep "client" | awk '{print $2}' | tr -d ':')
        info "Puerto ALSA: ${UM_ONE_PORT}:0"
    else
        fail "UM-ONE no detectado"
        info "Verifica que el cable USB está conectado a la Raspberry Pi"
        echo -e "\n  Dispositivos disponibles:"
        echo "$ACONNECT_OUTPUT" | sed 's/^/    /'
        exit 1
    fi
}

check_wine_box86() {
    echo -e "\n${CYAN}[4/6] Verificando Wine y box86${NC}"

    BOX86_VER=$(rpi_cmd 'box86 --version 2>&1 | head -1' 2>/dev/null)
    if [ -z "$BOX86_VER" ]; then
        fail "box86 no instalado"
        exit 1
    fi
    ok "box86: $BOX86_VER"

    if rpi_cmd 'test -f $HOME/wine-i386/wine-11.0-x86/bin/wine' 2>/dev/null; then
        ok "Wine x86 presente"
    else
        fail "Wine no encontrado"
        exit 1
    fi

    if rpi_cmd 'test -f $HOME/g9ed/extracted/G9ED.exe' 2>/dev/null; then
        ok "G9ED.exe presente"
    else
        fail "G9ED.exe no encontrado"
        exit 1
    fi

    if rpi_cmd 'test -d $HOME/.wine32/drive_c' 2>/dev/null; then
        ok "Wine prefix ~/.wine32 listo"
    else
        fail "Wine prefix ~/.wine32 no inicializado"
        exit 1
    fi
}

kill_existing() {
    echo -e "\n${CYAN}[5/6] Limpiando procesos previos${NC}"

    PROCS=$(rpi_cmd 'pgrep -a -f "G9ED|wineserver" 2>/dev/null' 2>/dev/null || true)
    if [ -n "$PROCS" ]; then
        warn "Procesos Wine/G9ED encontrados, terminando..."
        rpi_cmd 'pkill -f wineserver 2>/dev/null; sleep 1; pkill -9 -f wineserver 2>/dev/null' 2>/dev/null || true
        ok "Procesos anteriores terminados"
    else
        ok "No hay procesos previos"
    fi
}

launch_g9ed() {
    echo -e "\n${CYAN}[6/6] Lanzando G9ED.exe${NC}"
    info "Wine prefix: ~/.wine32"
    info "La ventana aparecerá en XQuartz..."
    echo ""

    rpi_x11 'export WINEPREFIX=$HOME/.wine32 WINEARCH=win32 && box86 $HOME/wine-i386/wine-11.0-x86/bin/wine $HOME/g9ed/extracted/G9ED.exe' 2>&1 &

    G9ED_PID=$!
    sleep 5

    if kill -0 $G9ED_PID 2>/dev/null; then
        ok "G9ED.exe corriendo (PID local: $G9ED_PID)"
        echo ""
        echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}  G9ED lanzado exitosamente                       ${NC}"
        echo -e "${GREEN}  La ventana debe estar visible en XQuartz         ${NC}"
        echo -e "${GREEN}                                                   ${NC}"
        echo -e "${GREEN}  Para captura MIDI abre otra terminal y ejecuta:  ${NC}"
        echo -e "${CYAN}  ./capture.sh                                     ${NC}"
        echo -e "${GREEN}                                                   ${NC}"
        echo -e "${GREEN}  Presiona Ctrl+C para cerrar G9ED                 ${NC}"
        echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
        echo ""
        wait $G9ED_PID 2>/dev/null
    else
        fail "G9ED.exe no se mantuvo corriendo"
        info "Revisa los mensajes de error arriba"
        exit 1
    fi
}

# --- Main ---
echo ""
echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Zoom G9.2tt - Setup de Sesión de Mapeo MIDI        ${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"

check_dependencies
check_rpi_connectivity
check_midi_devices
check_wine_box86
kill_existing
launch_g9ed
