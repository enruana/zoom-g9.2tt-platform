#!/usr/bin/env python3
"""
Checksum Capture Tool para Zoom G9.2tt

Captura checksums de múltiples patches para análisis.

Uso:
    python3 checksum_capture.py [--all] [--patches 0,1,2,10,50,99]
"""

import mido
import time
import json
import argparse
from datetime import datetime


def capture_patch(inp, out, patch_num, timeout=2):
    """Captura un patch y extrae su checksum."""
    # Enviar READ_REQ
    req = bytes([0x52, 0x00, 0x42, 0x11, patch_num])
    out.send(mido.Message('sysex', data=list(req)))

    # Esperar respuesta
    start = time.time()
    while time.time() - start < timeout:
        for msg in inp.iter_pending():
            if msg.type == 'sysex':
                data = bytes([0xF0] + list(msg.data) + [0xF7])
                if len(data) == 268 and data[4] == 0x21:
                    return data
        time.sleep(0.005)
    return None


def extract_checksum_info(response):
    """Extrae información del checksum de una respuesta READ_RESP."""
    if not response or len(response) != 268:
        return None

    patch_num = response[5]
    nibbles = list(response[6:262])  # 256 nibbles
    checksum = list(response[262:267])  # 5 bytes

    # Decodificar nibbles a bytes
    decoded = []
    for i in range(0, len(nibbles), 2):
        high = nibbles[i]
        low = nibbles[i + 1]
        decoded.append((high << 4) | low)

    return {
        'patch_num': patch_num,
        'nibbles': nibbles,
        'nibbles_sum': sum(nibbles),
        'decoded': decoded,
        'decoded_sum': sum(decoded),
        'checksum': checksum,
        'checksum_hex': ' '.join(f'{b:02X}' for b in checksum),
    }


def main():
    parser = argparse.ArgumentParser(description='Captura checksums del G9.2tt')
    parser.add_argument('--all', action='store_true', help='Capturar todos los 100 patches')
    parser.add_argument('--patches', type=str, default='0,1,2,10,50,99',
                        help='Lista de patches a capturar (separados por coma)')
    parser.add_argument('--port', type=str, default='UM-ONE', help='Puerto MIDI')
    parser.add_argument('--output', type=str, default=None, help='Archivo de salida JSON')
    args = parser.parse_args()

    # Determinar patches a capturar
    if args.all:
        patches_to_capture = list(range(100))
    else:
        patches_to_capture = [int(p.strip()) for p in args.patches.split(',')]

    # Archivo de salida
    if not args.output:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        args.output = f'checksums_{timestamp}.json'

    print(f'=== Checksum Capture Tool ===')
    print(f'Puerto: {args.port}')
    print(f'Patches: {len(patches_to_capture)}')
    print(f'Salida: {args.output}')
    print()

    try:
        out = mido.open_output(args.port)
        inp = mido.open_input(args.port)
    except Exception as e:
        print(f'Error abriendo puerto MIDI: {e}')
        return

    results = []
    errors = []

    for i, patch_num in enumerate(patches_to_capture):
        response = capture_patch(inp, out, patch_num)

        if response:
            info = extract_checksum_info(response)
            results.append(info)
            print(f'\r  Patch {patch_num:2d}: checksum={info["checksum"]} sum_nib={info["nibbles_sum"]} sum_dec={info["decoded_sum"]}', end='', flush=True)
        else:
            errors.append(patch_num)
            print(f'\r  Patch {patch_num:2d}: ERROR                                        ', end='', flush=True)

        time.sleep(0.03)

    print()
    print()

    # Guardar resultados
    output_data = {
        'timestamp': datetime.now().isoformat(),
        'port': args.port,
        'total_captured': len(results),
        'total_errors': len(errors),
        'errors': errors,
        'patches': results
    }

    with open(args.output, 'w') as f:
        json.dump(output_data, f, indent=2)

    print(f'Capturados: {len(results)}')
    print(f'Errores: {len(errors)}')
    print(f'Guardado en: {args.output}')

    # Mostrar tabla resumen
    if results:
        print()
        print('=== Resumen ===')
        print(f'{"Patch":<8} {"Sum Nib":<10} {"Sum Dec":<10} {"Checksum":<30}')
        print('-' * 60)
        for r in results[:20]:  # Solo primeros 20
            print(f'{r["patch_num"]:<8} {r["nibbles_sum"]:<10} {r["decoded_sum"]:<10} {r["checksum"]}')
        if len(results) > 20:
            print(f'... y {len(results) - 20} más')

    out.close()
    inp.close()


if __name__ == '__main__':
    main()
