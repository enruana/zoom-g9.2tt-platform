#!/usr/bin/env python3
"""
Test: Escribir un patch MODIFICADO al Zoom G9.2tt

Este script demuestra que el checksum CRC-32 funciona correctamente.
Modifica el patch 0 (nombre y gain) y lo escribe al pedal.

Uso:
    python3 test_write_modified.py
    (sigue las instrucciones en pantalla)
"""

import mido
import time
import sys
sys.path.insert(0, '..')

from zoomg9.encoding import decode_nibbles, encode_nibbles, calculate_checksum
from zoomg9.patch import Patch


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

    def build_read_response(patch_num, patch_data_128):
        """Construye READ_RESP con checksum CRC-32 correcto."""
        nibbles = encode_nibbles(patch_data_128)
        checksum = calculate_checksum(patch_data_128)
        return bytes([0xF0, 0x52, 0x00, 0x42, 0x21, patch_num]) + nibbles + checksum + bytes([0xF7])

    print('=== Test: Escribir Patch MODIFICADO ===')
    print()

    # PASO 1: Leer todos los patches
    print('PASO 1: Leyendo 100 patches...')
    patches_decoded = []  # 128 bytes decodificados por patch

    for i in range(100):
        send_sysex(bytes([0xF0, 0x52, 0x00, 0x42, 0x11, i, 0xF7]))
        resp = recv_sysex(2)
        if resp and len(resp) == 268:
            nibbles = resp[6:262]
            decoded = decode_nibbles(nibbles)
            patches_decoded.append(bytearray(decoded))
            print(f'\r  Patch {i:2d}/99', end='', flush=True)
        else:
            print(f'\n  Error en patch {i}')
            sys.exit(1)
        time.sleep(0.03)

    print()
    print(f'✓ Leídos {len(patches_decoded)} patches')

    # PASO 2: Mostrar y modificar patch 0
    print()
    print('PASO 2: Modificando patch 0...')

    p0 = Patch.from_bytes(bytes(patches_decoded[0]))
    print(f'  Original:')
    print(f'    Nombre: "{p0.name}"')
    print(f'    Amp Gain: {p0.amp.gain}')

    # Modificar
    p0.name = "MODIFIED"
    p0.amp.gain = 99 if p0.amp.gain < 50 else 10

    print(f'  Modificado:')
    print(f'    Nombre: "{p0.name}"')
    print(f'    Amp Gain: {p0.amp.gain}')

    # Guardar datos modificados
    patches_decoded[0] = bytearray(p0.to_bytes())

    # PASO 3: Esperar BULK RX
    print()
    print('=' * 50)
    print('PASO 3: Pon el pedal en BULK RX')
    print('        Presiona Enter cuando esté listo...')
    print('=' * 50)
    sys.stdin.readline()

    # PASO 4: Enviar patches con checksums nuevos
    print()
    print('PASO 4: Iniciando transferencia...')

    # Enviar EDIT_ENTER
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
            # Construir respuesta con checksum CRC-32
            resp = build_read_response(patch_num, bytes(patches_decoded[patch_num]))
            send_sysex(resp)
            print(f'\r  Patch {patch_num:2d}/99', end='', flush=True)
            count += 1

        elif cmd == 0x1F:  # EDIT_EXIT
            print()
            print('  EDIT_EXIT recibido')
            break

    print()
    print(f'✓ Enviados {count} patches')

    if count == 100:
        print()
        print('=' * 50)
        print('¡ÉXITO! Transferencia completa.')
        print('=' * 50)

        # PASO 5: Verificar
        print()
        print('PASO 5: Verificando...')
        time.sleep(2)  # Esperar a que el pedal salga de BULK RX

        send_sysex(bytes([0xF0, 0x52, 0x00, 0x42, 0x11, 0, 0xF7]))
        resp = recv_sysex(2)
        if resp and len(resp) == 268:
            nibbles = resp[6:262]
            decoded = decode_nibbles(nibbles)
            p0_new = Patch.from_bytes(decoded)
            print(f'  Patch 0 en pedal:')
            print(f'    Nombre: "{p0_new.name}"')
            print(f'    Amp Gain: {p0_new.amp.gain}')

            if p0_new.name.strip() == "MODIFIED":
                print()
                print('✓ ¡VERIFICADO! El patch fue modificado correctamente.')
            else:
                print()
                print(f'✗ Error: nombre esperado "MODIFIED", obtenido "{p0_new.name}"')
    else:
        print(f'FALLÓ después de {count} patches')

    out.close()
    inp.close()


if __name__ == '__main__':
    main()
