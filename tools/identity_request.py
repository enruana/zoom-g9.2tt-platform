#!/usr/bin/env python3
"""
Envía un Identity Request al Zoom G9.2tt y muestra la respuesta.

Este script descubre el Model ID del dispositivo conectado.

Requisitos:
    pip install mido python-rtmidi

Uso:
    python identity_request.py
    python identity_request.py --list          # Listar puertos MIDI
    python identity_request.py --port "nombre" # Especificar puerto
"""

import argparse
import sys
import time

try:
    import mido
except ImportError:
    print("Error: Se requiere la biblioteca 'mido'")
    print("Instalar con: pip install mido python-rtmidi")
    sys.exit(1)


# MIDI Universal Identity Request
IDENTITY_REQUEST = [0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7]

# Manufacturer IDs
MANUFACTURERS = {
    0x52: "Zoom",
}

# Device IDs conocidos de Zoom
ZOOM_DEVICES = {
    0x58: "MS-50G",
    0x5F: "MS-60B",
    0x61: "MS-70CDR",
    0x6E: "G1Four/G1XFour",
}


def list_ports():
    """Lista todos los puertos MIDI disponibles."""
    print("\n=== Puertos MIDI de Entrada ===")
    inputs = mido.get_input_names()
    if inputs:
        for i, name in enumerate(inputs):
            print(f"  [{i}] {name}")
    else:
        print("  (ninguno encontrado)")

    print("\n=== Puertos MIDI de Salida ===")
    outputs = mido.get_output_names()
    if outputs:
        for i, name in enumerate(outputs):
            print(f"  [{i}] {name}")
    else:
        print("  (ninguno encontrado)")

    return inputs, outputs


def find_midi_port(port_name: str = None, is_input: bool = True):
    """Encuentra un puerto MIDI por nombre o retorna el primero disponible."""
    ports = mido.get_input_names() if is_input else mido.get_output_names()

    if not ports:
        return None

    if port_name:
        # Buscar coincidencia parcial
        for port in ports:
            if port_name.lower() in port.lower():
                return port
        return None

    # Buscar puerto USB MIDI (evitar puertos internos del sistema)
    for port in ports:
        lower = port.lower()
        if "usb" in lower or "midi" in lower:
            if "iac" not in lower and "internal" not in lower:
                return port

    # Si no hay USB MIDI, retornar el primero
    return ports[0]


def parse_identity_response(data: list) -> dict:
    """Parsea una respuesta de Identity Request."""
    if len(data) < 10:
        return {"error": "Respuesta muy corta"}

    if data[0] != 0xF0 or data[-1] != 0xF7:
        return {"error": "No es un mensaje SysEx válido"}

    if data[1] != 0x7E or data[3] != 0x06 or data[4] != 0x02:
        return {"error": "No es una respuesta de Identity"}

    manufacturer_id = data[5]
    model_id = data[6]

    # Los bytes 7-9 suelen ser family/member
    # Los bytes 10-13 suelen ser versión de firmware
    version_bytes = data[10:14] if len(data) >= 14 else []

    result = {
        "manufacturer_id": hex(manufacturer_id),
        "manufacturer_name": MANUFACTURERS.get(manufacturer_id, "Unknown"),
        "model_id": hex(model_id),
        "model_name": ZOOM_DEVICES.get(model_id, "Unknown (G9.2tt?)"),
        "family": hex(data[7]) if len(data) > 7 else None,
        "member": hex(data[8]) if len(data) > 8 else None,
        "version_bytes": [hex(b) for b in version_bytes],
        "raw": " ".join(f"{b:02X}" for b in data),
    }

    return result


def send_identity_request(port_name: str = None, timeout: float = 2.0):
    """Envía Identity Request y espera respuesta."""

    # Encontrar puertos
    input_port = find_midi_port(port_name, is_input=True)
    output_port = find_midi_port(port_name, is_input=False)

    if not input_port or not output_port:
        print("Error: No se encontraron puertos MIDI")
        print("Usa --list para ver los puertos disponibles")
        return None

    print(f"\nUsando puertos:")
    print(f"  Input:  {input_port}")
    print(f"  Output: {output_port}")

    response_data = None

    try:
        # Abrir puertos
        with mido.open_input(input_port) as midi_in:
            with mido.open_output(output_port) as midi_out:
                # Limpiar mensajes pendientes
                for _ in midi_in.iter_pending():
                    pass

                # Enviar Identity Request
                print(f"\nEnviando Identity Request...")
                print(f"  -> {' '.join(f'{b:02X}' for b in IDENTITY_REQUEST)}")

                msg = mido.Message('sysex', data=IDENTITY_REQUEST[1:-1])
                midi_out.send(msg)

                # Esperar respuesta
                print(f"\nEsperando respuesta ({timeout}s timeout)...")
                start_time = time.time()

                while time.time() - start_time < timeout:
                    for msg in midi_in.iter_pending():
                        if msg.type == 'sysex':
                            response_data = [0xF0] + list(msg.data) + [0xF7]
                            break

                    if response_data:
                        break

                    time.sleep(0.01)

    except Exception as e:
        print(f"Error: {e}")
        return None

    if response_data:
        print(f"\n{'='*50}")
        print("RESPUESTA RECIBIDA")
        print(f"{'='*50}")

        result = parse_identity_response(response_data)

        if "error" in result:
            print(f"Error: {result['error']}")
            print(f"Raw: {result.get('raw', response_data)}")
        else:
            print(f"\nManufacturer: {result['manufacturer_name']} ({result['manufacturer_id']})")
            print(f"Model ID:     {result['model_id']}")
            print(f"Model Name:   {result['model_name']}")

            if result['family']:
                print(f"Family:       {result['family']}")
            if result['member']:
                print(f"Member:       {result['member']}")
            if result['version_bytes']:
                print(f"Version:      {' '.join(result['version_bytes'])}")

            print(f"\nRaw response: {result['raw']}")

            # Si es un dispositivo desconocido, probablemente es el G9.2tt
            if result['model_name'] == "Unknown (G9.2tt?)":
                print(f"\n{'*'*50}")
                print(f"POSIBLE G9.2tt DETECTADO!")
                print(f"Model ID: {result['model_id']}")
                print(f"Actualiza PROTOCOL.md con este Model ID")
                print(f"{'*'*50}")

        return result
    else:
        print("\nNo se recibió respuesta.")
        print("Verifica:")
        print("  1. El pedal está encendido")
        print("  2. Los cables MIDI están bien conectados")
        print("  3. MIDI OUT de la interface -> MIDI IN del pedal")
        print("  4. MIDI IN de la interface -> MIDI OUT del pedal")
        return None


def main():
    parser = argparse.ArgumentParser(
        description="Envía Identity Request al Zoom G9.2tt"
    )
    parser.add_argument("-l", "--list", action="store_true",
                       help="Listar puertos MIDI disponibles")
    parser.add_argument("-p", "--port", metavar="NAME",
                       help="Nombre del puerto MIDI a usar")
    parser.add_argument("-t", "--timeout", type=float, default=2.0,
                       help="Timeout en segundos (default: 2)")

    args = parser.parse_args()

    if args.list:
        list_ports()
        return

    send_identity_request(args.port, args.timeout)


if __name__ == "__main__":
    main()
