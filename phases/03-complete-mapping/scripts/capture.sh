#!/bin/bash
# =============================================================================
# capture.sh - Captura bidireccional de tráfico MIDI (G9ED ↔ Zoom G9.2tt)
# =============================================================================
#
# Captura mensajes MIDI entre G9ED (Wine) y el pedal via UM-ONE.
# Ejecutar en una terminal separada mientras G9ED está corriendo.
#
# Uso:
#   ./capture.sh [nombre_sesion] [IP_RASPBERRY]
#
# Ejemplo:
#   ./capture.sh delay_mapping
#   ./capture.sh amp_types 192.168.80.31
#
# =============================================================================

set -e

# --- Configuración ---
SESSION_NAME="${1:-mapping_$(date +%Y%m%d_%H%M%S)}"
RPI_IP="${2:-192.168.80.31}"
RPI_USER="felipemantilla"
export SSHPASS="enruana"
SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=5"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOCAL_CAPTURE_DIR="$(dirname "$SCRIPT_DIR")/captures"

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

rpi_cmd() {
    sshpass -e ssh $SSH_OPTS "$RPI_USER@$RPI_IP" "$1"
}

# --- Verificaciones ---
echo ""
echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Zoom G9.2tt - Captura MIDI Bidireccional           ${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"

echo -e "\n${CYAN}[1/3] Verificando entorno${NC}"

# Verificar G9ED corriendo
WINE_PID=$(rpi_cmd 'pgrep -f wineserver 2>/dev/null | head -1' || true)
if [ -z "$WINE_PID" ]; then
    fail "G9ED/Wine no está corriendo"
    info "Ejecuta primero: ./setup.sh"
    exit 1
fi
ok "G9ED corriendo (wineserver PID: $WINE_PID)"

# Verificar puertos MIDI
ACONNECT=$(rpi_cmd "aconnect -l" 2>/dev/null)
WINE_PORT=$(echo "$ACONNECT" | grep -B0 "WINE midi" | grep "client" | awk '{print $2}' | tr -d ':')
UMONE_PORT=$(echo "$ACONNECT" | grep -B0 "UM-ONE" | grep "client" | awk '{print $2}' | tr -d ':')

if [ -z "$WINE_PORT" ] || [ -z "$UMONE_PORT" ]; then
    fail "No se encontraron puertos MIDI necesarios"
    echo "$ACONNECT"
    exit 1
fi
ok "Wine MIDI: ${WINE_PORT}:0  |  UM-ONE: ${UMONE_PORT}:0"

# --- Preparar directorio de capturas ---
echo -e "\n${CYAN}[2/3] Preparando captura${NC}"

mkdir -p "$LOCAL_CAPTURE_DIR"
REMOTE_LOG="/tmp/midi_capture_${SESSION_NAME}.log"
LOCAL_LOG="${LOCAL_CAPTURE_DIR}/${SESSION_NAME}.log"

info "Sesión: $SESSION_NAME"
info "Log remoto: $REMOTE_LOG"
info "Log local:  $LOCAL_LOG"

# --- Iniciar captura ---
echo -e "\n${CYAN}[3/3] Capturando tráfico MIDI${NC}"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Captura activa: ${SESSION_NAME}                      ${NC}"
echo -e "${GREEN}  Puertos: Wine(${WINE_PORT}:0) + UM-ONE(${UMONE_PORT}:0)${NC}"
echo -e "${GREEN}                                                       ${NC}"
echo -e "${GREEN}  Manipula parámetros en G9ED para capturar tráfico    ${NC}"
echo -e "${GREEN}  Presiona Ctrl+C para detener y guardar               ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""

# Capturar con aseqdump (ambas direcciones: Wine output + UM-ONE output)
# Ctrl+C para detener
trap cleanup INT

cleanup() {
    echo ""
    echo -e "\n${CYAN}Deteniendo captura...${NC}"

    # Copiar log desde Raspberry Pi
    if sshpass -e scp $SSH_OPTS "$RPI_USER@$RPI_IP:$REMOTE_LOG" "$LOCAL_LOG" 2>/dev/null; then
        LINES=$(wc -l < "$LOCAL_LOG" | tr -d ' ')
        ok "Captura guardada: $LOCAL_LOG ($LINES líneas)"
    else
        warn "No se pudo copiar el log remoto"
    fi

    # Limpiar proceso remoto
    rpi_cmd "pkill -f 'aseqdump.*${WINE_PORT}.*${UMONE_PORT}' 2>/dev/null" || true

    echo ""
    exit 0
}

# Lanzar aseqdump en la Raspberry Pi y mostrar output en tiempo real
rpi_cmd "aseqdump -p ${WINE_PORT}:0,${UMONE_PORT}:0 2>/dev/null | tee $REMOTE_LOG"
