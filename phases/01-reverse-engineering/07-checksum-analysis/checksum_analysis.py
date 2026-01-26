#!/usr/bin/env python3
"""
Checksum Analysis Tool para Zoom G9.2tt

Analiza checksums capturados para encontrar patrones.

Uso:
    python3 checksum_analysis.py checksums_20260126.json
"""

import json
import argparse
import sys
from itertools import combinations


def analyze_simple_sums(patches):
    """Busca relación con sumas simples."""
    print("\n=== Análisis de Sumas Simples ===")

    for p in patches[:5]:
        nibbles_sum = p['nibbles_sum']
        decoded_sum = p['decoded_sum']
        checksum = p['checksum']

        # Checksum como número de 35 bits (5 bytes * 7 bits)
        checksum_35bit = sum(b << (7 * (4 - i)) for i, b in enumerate(checksum))

        # Checksum como número de 40 bits (5 bytes * 8 bits)
        checksum_40bit = sum(b << (8 * (4 - i)) for i, b in enumerate(checksum))

        print(f"\nPatch {p['patch_num']}:")
        print(f"  Nibbles sum: {nibbles_sum}")
        print(f"  Decoded sum: {decoded_sum}")
        print(f"  Checksum: {checksum}")
        print(f"  Checksum 35-bit: {checksum_35bit}")
        print(f"  Checksum 40-bit: {checksum_40bit}")
        print(f"  Ratios: {checksum_35bit/nibbles_sum:.4f}, {checksum_40bit/nibbles_sum:.4f}")


def analyze_xor(patches):
    """Busca relación con XOR."""
    print("\n=== Análisis XOR ===")

    for p in patches[:5]:
        nibbles = p['nibbles']
        decoded = p['decoded']
        checksum = p['checksum']

        # XOR de todos los nibbles
        nibbles_xor = 0
        for n in nibbles:
            nibbles_xor ^= n

        # XOR de todos los bytes decoded
        decoded_xor = 0
        for b in decoded:
            decoded_xor ^= b

        print(f"\nPatch {p['patch_num']}:")
        print(f"  Nibbles XOR: {nibbles_xor} (0x{nibbles_xor:02X})")
        print(f"  Decoded XOR: {decoded_xor} (0x{decoded_xor:02X})")
        print(f"  Checksum[0]: {checksum[0]} (0x{checksum[0]:02X})")


def analyze_crc_attempts(patches):
    """Intenta varios CRCs."""
    print("\n=== Intentos de CRC ===")

    try:
        import crcmod
        has_crcmod = True
    except ImportError:
        print("  crcmod no instalado. Instalar con: pip install crcmod")
        has_crcmod = False
        return

    # Polinomios comunes
    polynomials = [
        (0x104C11DB7, "CRC-32"),
        (0x11EDC6F41, "CRC-32C"),
        (0x1DB710641, "CRC-32Q"),
        (0x18005, "CRC-16/IBM"),
        (0x11021, "CRC-16/CCITT"),
        (0x18BB7, "CRC-16/T10-DIF"),
    ]

    for poly, name in polynomials:
        try:
            crc_func = crcmod.mkCrcFun(poly, initCrc=0, xorOut=0)

            for p in patches[:2]:
                nibbles_bytes = bytes(p['nibbles'])
                decoded_bytes = bytes(p['decoded'])

                crc_nibbles = crc_func(nibbles_bytes)
                crc_decoded = crc_func(decoded_bytes)

                print(f"  {name} Patch {p['patch_num']}: nibbles=0x{crc_nibbles:08X}, decoded=0x{crc_decoded:08X}")
        except Exception as e:
            print(f"  {name}: Error - {e}")


def analyze_byte_positions(patches):
    """Analiza correlación entre posiciones de datos y checksum."""
    print("\n=== Análisis de Posiciones ===")

    if len(patches) < 10:
        print("  Necesita al menos 10 patches para análisis estadístico")
        return

    # Ver si algún byte del checksum tiene correlación con sumas parciales
    for cs_byte in range(5):
        print(f"\n  Checksum byte {cs_byte}:")

        # Correlación con suma de nibbles en diferentes rangos
        for start in [0, 64, 128, 192]:
            end = start + 64
            partial_sums = [sum(p['nibbles'][start:end]) for p in patches]
            cs_values = [p['checksum'][cs_byte] for p in patches]

            # Correlación simple
            mean_sum = sum(partial_sums) / len(partial_sums)
            mean_cs = sum(cs_values) / len(cs_values)

            numerator = sum((s - mean_sum) * (c - mean_cs) for s, c in zip(partial_sums, cs_values))
            denom_sum = sum((s - mean_sum) ** 2 for s in partial_sums) ** 0.5
            denom_cs = sum((c - mean_cs) ** 2 for c in cs_values) ** 0.5

            if denom_sum > 0 and denom_cs > 0:
                corr = numerator / (denom_sum * denom_cs)
                if abs(corr) > 0.3:
                    print(f"    Nibbles[{start}:{end}] - correlación: {corr:.3f}")


def analyze_differential(patches):
    """Busca patrones diferenciales entre patches."""
    print("\n=== Análisis Diferencial ===")

    if len(patches) < 2:
        print("  Necesita al menos 2 patches")
        return

    for i, (p1, p2) in enumerate(zip(patches[:-1], patches[1:])):
        if i >= 5:
            break

        # Diferencias en nibbles
        nibble_diffs = sum(1 for a, b in zip(p1['nibbles'], p2['nibbles']) if a != b)

        # Diferencias en checksum
        cs_diffs = [p2['checksum'][j] - p1['checksum'][j] for j in range(5)]

        print(f"\n  Patch {p1['patch_num']} -> {p2['patch_num']}:")
        print(f"    Nibbles diferentes: {nibble_diffs}/256")
        print(f"    Delta checksum: {cs_diffs}")


def analyze_modular(patches):
    """Busca operaciones modulares."""
    print("\n=== Análisis Modular ===")

    for p in patches[:5]:
        nibbles_sum = p['nibbles_sum']
        decoded_sum = p['decoded_sum']
        checksum = p['checksum']

        # Probar diferentes módulos
        for mod in [127, 128, 255, 256, 1000, 10000]:
            sum_mod = nibbles_sum % mod
            cs_combined = checksum[0] + (checksum[1] << 7) + (checksum[2] << 14)

            if sum_mod == checksum[0] or sum_mod == checksum[4]:
                print(f"  Patch {p['patch_num']}: nibbles_sum % {mod} = {sum_mod} matches checksum!")


def main():
    parser = argparse.ArgumentParser(description='Analiza checksums capturados')
    parser.add_argument('input', type=str, help='Archivo JSON con checksums')
    args = parser.parse_args()

    try:
        with open(args.input, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: archivo no encontrado: {args.input}")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: JSON inválido: {args.input}")
        sys.exit(1)

    patches = data.get('patches', [])

    print(f"=== Checksum Analysis Tool ===")
    print(f"Archivo: {args.input}")
    print(f"Patches: {len(patches)}")
    print(f"Timestamp: {data.get('timestamp', 'N/A')}")

    if not patches:
        print("No hay patches para analizar")
        return

    # Ejecutar análisis
    analyze_simple_sums(patches)
    analyze_xor(patches)
    analyze_modular(patches)
    analyze_differential(patches)
    analyze_byte_positions(patches)
    analyze_crc_attempts(patches)

    print("\n=== Análisis Completo ===")
    print("Revisa los resultados arriba para patrones.")
    print("Si no hay matches obvios, considera:")
    print("  1. Desensamblar G9ED.exe con Ghidra")
    print("  2. Capturar más datos con patches controlados")


if __name__ == '__main__':
    main()
