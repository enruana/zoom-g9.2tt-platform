#!/usr/bin/env python3
"""
Bulk Round-Trip para Zoom G9.2tt

Lee todos los 100 patches y los escribe de vuelta sin modificación.
FUNCIONA CORRECTAMENTE - probado 2026-01-26.

LIMITACIÓN CONOCIDA:
    La escritura con modificaciones NO funciona porque el checksum
    de 5 bytes no ha sido descifrado. El pedal valida el checksum
    y rechaza patches con checksum incorrecto.

    Ver CHECKSUM.md para el análisis del problema.

Uso:
    1. Conecta el G9.2tt via MIDI (UM-ONE o similar)
    2. Ejecuta: python3 bulk_roundtrip.py
    3. Cuando lo pida, pon el pedal en modo BULK RX
    4. Presiona Enter para iniciar la transferencia

Flujo del protocolo (capturado de G9ED):
    1. Host envía EDIT_ENTER (F0 52 00 42 12 F7)
    2. Pedal (en BULK RX) envía READ_REQ para cada patch
    3. Host responde con READ_RESP (268 bytes con checksum)
    4. Pedal envía EDIT_EXIT cuando termina
"""

import mido
import time
import sys


def main():
    out = mido.open_output('UM-ONE')
    inp = mido.open_input('UM-ONE')

    def send_sysex(data):
        if data[0] == 0xF0:
            data = data[1:]
        if data[-1] == 0xF7:
            data = data[:-1]
        out.send(mido.Message('sysex', data=list(data)))

    def recv_sysex(timeout=3):
        start = time.time()
        while time.time() - start < timeout:
            for msg in inp.iter_pending():
                if msg.type == 'sysex':
                    return bytes([0xF0] + list(msg.data) + [0xF7])
            time.sleep(0.005)
        return None

    print('=== Bulk Round-Trip (Sin Modificaciones) ===')
    print()

    # PASO 1: Leer todos los patches
    print('PASO 1: Leyendo 100 patches...')
    patches_raw = []

    for i in range(100):
        send_sysex(bytes([0xF0, 0x52, 0x00, 0x42, 0x11, i, 0xF7]))
        resp = recv_sysex(2)
        if resp and len(resp) == 268:
            patches_raw.append(resp)
            print(f'\r  Patch {i:2d}/99', end='', flush=True)
        else:
            print(f'\n  Error en patch {i}')
            sys.exit(1)
        time.sleep(0.03)

    print()
    print(f'✓ Leídos {len(patches_raw)} patches')

    # PASO 2: Esperar BULK RX
    print()
    print('=' * 50)
    print('PASO 2: Pon el pedal en BULK RX')
    print('        Presiona Enter cuando esté listo...')
    print('=' * 50)
    sys.stdin.readline()

    # PASO 3: Enviar
    print()
    print('PASO 3: Iniciando transferencia...')

    send_sysex(bytes([0xF0, 0x52, 0x00, 0x42, 0x12, 0xF7]))

    count = 0
    errors = 0

    while True:
        req = recv_sysex(5)

        if not req:
            errors += 1
            if errors >= 3:
                print(f'\n  Timeout, abortando')
                break
            continue

        errors = 0
        cmd = req[4] if len(req) > 4 else 0

        if cmd == 0x11:  # READ_REQ
            patch_num = req[5]
            send_sysex(patches_raw[patch_num])
            print(f'\r  Patch {patch_num:2d}/99', end='', flush=True)
            count += 1

        elif cmd == 0x1F:  # EDIT_EXIT
            print()
            print('  EDIT_EXIT recibido')
            break

    print()
    print(f'✓ Enviados {count} patches')

    if count == 100:
        print('¡ÉXITO! Round-trip completo')
    else:
        print(f'FALLÓ después de {count} patches')

    out.close()
    inp.close()


if __name__ == '__main__':
    main()
