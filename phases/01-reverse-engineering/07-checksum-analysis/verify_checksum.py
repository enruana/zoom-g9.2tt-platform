#!/usr/bin/env python3
"""
Verificación del Checksum CRC-32 con datos reales del G9.2tt

Este script lee patches del pedal y verifica que el checksum
calculado coincide con el recibido.

Uso:
    python3 verify_checksum.py [--port UM-ONE] [--patches 0,1,2]
"""

import mido
import time
import argparse
from crc32_checksum import (
    decode_nibbles,
    calculate_crc32,
    decode_checksum_7bit,
    encode_checksum_7bit,
)


def read_patch(inp, out, patch_num, timeout=2):
    """Lee un patch del pedal."""
    req = bytes([0x52, 0x00, 0x42, 0x11, patch_num])
    out.send(mido.Message('sysex', data=list(req)))

    start = time.time()
    while time.time() - start < timeout:
        for msg in inp.iter_pending():
            if msg.type == 'sysex':
                data = bytes([0xF0] + list(msg.data) + [0xF7])
                if len(data) == 268 and data[4] == 0x21:
                    return data
        time.sleep(0.005)
    return None


def verify_patch(response):
    """Verifica el checksum de un READ_RESP."""
    if not response or len(response) != 268:
        return None

    patch_num = response[5]
    nibbles = bytes(response[6:262])
    received_cs = bytes(response[262:267])

    # Decodificar
    decoded = decode_nibbles(nibbles)
    received_crc = decode_checksum_7bit(received_cs)

    # Calcular
    calculated_crc = calculate_crc32(decoded)
    calculated_cs = encode_checksum_7bit(calculated_crc)

    match = received_crc == calculated_crc

    return {
        'patch_num': patch_num,
        'received_checksum': list(received_cs),
        'calculated_checksum': list(calculated_cs),
        'received_crc': received_crc,
        'calculated_crc': calculated_crc,
        'match': match,
        'decoded_data': decoded,
    }


def main():
    parser = argparse.ArgumentParser(description='Verifica checksums del G9.2tt')
    parser.add_argument('--port', type=str, default='UM-ONE', help='Puerto MIDI')
    parser.add_argument('--patches', type=str, default='0,1,2,10,50,99',
                        help='Patches a verificar')
    args = parser.parse_args()

    patches_to_test = [int(p.strip()) for p in args.patches.split(',')]

    print(f'=== Verificación de Checksum CRC-32 ===')
    print(f'Puerto: {args.port}')
    print(f'Patches: {patches_to_test}')
    print()

    try:
        out = mido.open_output(args.port)
        inp = mido.open_input(args.port)
    except Exception as e:
        print(f'Error abriendo puerto MIDI: {e}')
        print('Asegúrate de que el pedal está conectado.')
        return

    results = []
    all_match = True

    for patch_num in patches_to_test:
        response = read_patch(inp, out, patch_num)

        if not response:
            print(f'Patch {patch_num}: ERROR - No response')
            all_match = False
            continue

        result = verify_patch(response)
        results.append(result)

        status = "✓ MATCH" if result['match'] else "✗ MISMATCH"

        print(f'Patch {patch_num}: {status}')
        print(f'  Recibido:   {result["received_checksum"]} -> 0x{result["received_crc"]:08X}')
        print(f'  Calculado:  {result["calculated_checksum"]} -> 0x{result["calculated_crc"]:08X}')

        if not result['match']:
            all_match = False
            print(f'  *** DIFERENCIA: {result["received_crc"] - result["calculated_crc"]}')

        time.sleep(0.05)

    print()
    if all_match:
        print('=== ÉXITO: Todos los checksums coinciden ===')
        print('El algoritmo CRC-32 es correcto.')
    else:
        print('=== FALLO: Algunos checksums no coinciden ===')
        print('Revisa el algoritmo o la tabla CRC.')

    out.close()
    inp.close()


if __name__ == '__main__':
    main()
