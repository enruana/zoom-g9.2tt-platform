#!/usr/bin/env python3
"""
Zoom G9.2tt Patch Preview
Envía patches al buffer temporal del pedal (preview sin guardar)

Comandos descubiertos:
    0x28 - Write Patch Data (153 bytes) - Envía datos al buffer temporal
    0x31 - Select/Confirm (10 bytes) - Selecciona patch para preview

Uso:
    python g9tt_preview.py preview <patch_number>      # Preview un patch existente
    python g9tt_preview.py preview-file <sysex_file>   # Preview desde archivo
    python g9tt_preview.py select <patch_number>       # Solo seleccionar patch
    python g9tt_preview.py capture                     # Capturar preview actual

Descubierto: 2026-01-24
"""

import sys
import time
import argparse

try:
    import mido
except ImportError:
    print("Error: mido no está instalado")
    print("Instalar con: pip install mido python-rtmidi")
    sys.exit(1)

# Constantes del protocolo
ZOOM_MANUFACTURER_ID = 0x52
G9TT_MODEL_ID = 0x42
DEVICE_ID = 0x00

# Comandos
CMD_ENTER_EDIT = 0x12
CMD_EXIT_EDIT = 0x1F
CMD_READ_PATCH = 0x11
CMD_READ_RESPONSE = 0x21
CMD_PREVIEW_DATA = 0x28  # Write patch data to temp buffer
CMD_SELECT_PATCH = 0x31  # Select/confirm patch


class G9ttPreview:
    def __init__(self, port_name=None):
        self.port_name = port_name
        self.inport = None
        self.outport = None

    def find_port(self):
        """Busca el puerto MIDI del G9.2tt"""
        outputs = mido.get_output_names()
        for name in outputs:
            if 'UM-ONE' in name or 'G9' in name or 'MIDI' in name:
                return name
        if outputs:
            return outputs[0]
        return None

    def connect(self):
        """Conecta al dispositivo MIDI"""
        if not self.port_name:
            self.port_name = self.find_port()
        if not self.port_name:
            raise Exception("No se encontró puerto MIDI")
        print(f"Conectando a: {self.port_name}")
        self.outport = mido.open_output(self.port_name)
        self.inport = mido.open_input(self.port_name)
        return True

    def disconnect(self):
        """Desconecta del dispositivo"""
        if self.outport:
            self.outport.close()
        if self.inport:
            self.inport.close()

    def send_sysex(self, data, show=True):
        """Envía un mensaje SysEx"""
        if data[0] == 0xF0:
            data = data[1:]
        if data[-1] == 0xF7:
            data = data[:-1]
        msg = mido.Message('sysex', data=list(data))
        self.outport.send(msg)
        if show:
            if len(data) > 20:
                print(f"  TX: F0 {' '.join(f'{b:02X}' for b in data[:15])}... ({len(data)+2} bytes)")
            else:
                print(f"  TX: F0 {' '.join(f'{b:02X}' for b in data)} F7")

    def receive_sysex(self, timeout=2.0):
        """Recibe un mensaje SysEx"""
        start = time.time()
        while time.time() - start < timeout:
            for msg in self.inport.iter_pending():
                if msg.type == 'sysex':
                    return bytes([0xF0] + list(msg.data) + [0xF7])
            time.sleep(0.01)
        return None

    def enter_edit_mode(self):
        """Envía comando Enter Edit Mode (0x12)"""
        print("Entrando modo edición...")
        cmd = bytes([0xF0, ZOOM_MANUFACTURER_ID, DEVICE_ID, G9TT_MODEL_ID, CMD_ENTER_EDIT, 0xF7])
        self.send_sysex(cmd)
        time.sleep(0.1)

    def exit_edit_mode(self):
        """Envía comando Exit Edit Mode (0x1F)"""
        print("Saliendo modo edición...")
        cmd = bytes([0xF0, ZOOM_MANUFACTURER_ID, DEVICE_ID, G9TT_MODEL_ID, CMD_EXIT_EDIT, 0xF7])
        self.send_sysex(cmd)
        time.sleep(0.1)

    def read_patch(self, patch_num):
        """Lee un patch del dispositivo (formato nibble-encoded)"""
        print(f"Leyendo patch {patch_num}...")
        cmd = bytes([0xF0, ZOOM_MANUFACTURER_ID, DEVICE_ID, G9TT_MODEL_ID, CMD_READ_PATCH, patch_num, 0xF7])
        self.send_sysex(cmd)
        response = self.receive_sysex(timeout=3.0)
        if response and len(response) == 268:
            print(f"  RX: {len(response)} bytes")
            return response
        else:
            print(f"  Error: respuesta inválida")
            return None

    def select_patch(self, patch_num, param1=0x02, param2=0x00):
        """Envía comando Select Patch (0x31)"""
        print(f"Seleccionando patch {patch_num}...")
        cmd = bytes([
            0xF0, ZOOM_MANUFACTURER_ID, DEVICE_ID, G9TT_MODEL_ID,
            CMD_SELECT_PATCH, patch_num, param1, param2, 0x00, 0xF7
        ])
        self.send_sysex(cmd)
        time.sleep(0.05)

    def send_preview_data(self, data_147):
        """Envía datos de patch al buffer temporal (0x28)"""
        if len(data_147) != 147:
            raise ValueError(f"Se esperan 147 bytes, recibido: {len(data_147)}")

        # Verificar que todos los bytes son < 128
        for i, b in enumerate(data_147):
            if b > 127:
                raise ValueError(f"Byte {i} es {b} (debe ser < 128)")

        print(f"Enviando preview data (147 bytes)...")
        cmd = bytes([0xF0, ZOOM_MANUFACTURER_ID, DEVICE_ID, G9TT_MODEL_ID, CMD_PREVIEW_DATA]) + bytes(data_147) + bytes([0xF7])
        self.send_sysex(cmd)
        time.sleep(0.1)

    def decode_nibbles(self, response):
        """Decodifica respuesta de lectura (nibble-encoded) -> 128 bytes"""
        if len(response) != 268:
            raise ValueError(f"Respuesta inválida: {len(response)} bytes")
        nibbles = response[6:262]  # 256 nibbles
        decoded = []
        for i in range(0, len(nibbles), 2):
            high = nibbles[i] & 0x0F
            low = nibbles[i+1] & 0x0F
            decoded.append((high << 4) | low)
        return bytes(decoded)

    def encode_7bit(self, decoded_128):
        """
        Codifica 128 bytes a formato de 147 bytes (7-bit MIDI safe)

        Formato: Cada 7 bytes se convierten en 8 bytes
        - Bytes 0-6: Datos con bit 7 = 0
        - Byte 7: Bits altos de los 7 bytes anteriores
        """
        if len(decoded_128) != 128:
            raise ValueError(f"Se esperan 128 bytes, recibido: {len(decoded_128)}")

        result = bytearray()
        i = 0

        while i < len(decoded_128):
            chunk = decoded_128[i:i+7]
            high_bits = 0

            for j, byte in enumerate(chunk):
                # Guardar bit 7
                if byte & 0x80:
                    high_bits |= (1 << j)
                # Añadir byte sin bit 7
                result.append(byte & 0x7F)

            # Añadir byte de bits altos
            result.append(high_bits)
            i += 7

        # Padding a 147 bytes
        while len(result) < 147:
            result.append(0x00)

        return bytes(result[:147])

    def decode_7bit(self, encoded_147):
        """
        Decodifica 147 bytes (7-bit) a 128 bytes originales
        """
        if len(encoded_147) != 147:
            raise ValueError(f"Se esperan 147 bytes, recibido: {len(encoded_147)}")

        result = bytearray()
        i = 0

        while i < len(encoded_147) and len(result) < 128:
            # Cada grupo: 7 bytes de datos + 1 byte de bits altos
            if i + 8 <= len(encoded_147):
                chunk = encoded_147[i:i+7]
                high_bits = encoded_147[i+7]

                for j, byte in enumerate(chunk):
                    if high_bits & (1 << j):
                        byte |= 0x80
                    result.append(byte)

                i += 8
            else:
                break

        return bytes(result[:128])

    def extract_patch_name(self, decoded_128):
        """Extrae nombre del patch (offset 65-74)"""
        name = decoded_128[65:75]
        return name.rstrip(b'\x00').decode('ascii', errors='replace')

    def set_patch_name(self, decoded_128, new_name):
        """Modifica nombre del patch"""
        data = bytearray(decoded_128)
        name_bytes = new_name.encode('ascii')[:10].ljust(10, b'\x00')
        data[65:75] = name_bytes
        return bytes(data)


def cmd_preview(args):
    """Preview un patch existente del dispositivo"""
    previewer = G9ttPreview(args.port)
    try:
        previewer.connect()
        previewer.enter_edit_mode()

        # Leer patch
        response = previewer.read_patch(args.patch)
        if not response:
            print("Error: no se pudo leer el patch")
            return

        # Decodificar
        decoded = previewer.decode_nibbles(response)
        name = previewer.extract_patch_name(decoded)
        print(f"Patch {args.patch}: \"{name}\"")

        # Codificar para preview
        preview_data = previewer.encode_7bit(decoded)
        print(f"Datos codificados: {len(preview_data)} bytes")

        # Enviar preview
        previewer.select_patch(args.patch, 0x02, 0x02)
        previewer.send_preview_data(preview_data)
        previewer.select_patch(args.patch, 0x02, 0x00)

        print("✓ Preview enviado")

    finally:
        previewer.disconnect()


def cmd_select(args):
    """Solo seleccionar un patch"""
    previewer = G9ttPreview(args.port)
    try:
        previewer.connect()
        previewer.select_patch(args.patch, 0x02, 0x09)
        print(f"✓ Patch {args.patch} seleccionado")
    finally:
        previewer.disconnect()


def cmd_test_encode(args):
    """Prueba la codificación 7-bit"""
    previewer = G9ttPreview(args.port)
    try:
        previewer.connect()
        previewer.enter_edit_mode()

        # Leer patch
        response = previewer.read_patch(args.patch)
        if not response:
            print("Error: no se pudo leer el patch")
            return

        # Decodificar nibbles
        decoded = previewer.decode_nibbles(response)
        name = previewer.extract_patch_name(decoded)
        print(f"Patch {args.patch}: \"{name}\"")
        print(f"Decoded: {len(decoded)} bytes")

        # Mostrar primeros bytes
        print(f"Primeros 20 bytes decoded:")
        print(f"  {' '.join(f'{b:02X}' for b in decoded[:20])}")

        # Codificar a 7-bit
        encoded = previewer.encode_7bit(decoded)
        print(f"\nEncoded: {len(encoded)} bytes")
        print(f"Primeros 24 bytes encoded:")
        print(f"  {' '.join(f'{b:02X}' for b in encoded[:24])}")

        # Verificar que todos son < 128
        over_127 = [b for b in encoded if b > 127]
        if over_127:
            print(f"\n⚠ ERROR: {len(over_127)} bytes > 127")
        else:
            print(f"\n✓ Todos los bytes < 128")

        # Decodificar de vuelta
        re_decoded = previewer.decode_7bit(encoded)
        print(f"\nRe-decoded: {len(re_decoded)} bytes")

        # Comparar
        if decoded == re_decoded:
            print("✓ Codificación reversible OK")
        else:
            diffs = sum(1 for a, b in zip(decoded, re_decoded) if a != b)
            print(f"⚠ Diferencias: {diffs} bytes")

    finally:
        previewer.disconnect()


def cmd_capture_preview(args):
    """Captura el preview actual y lo guarda"""
    print("Este comando requiere capturar mientras cambias patch en G9ED")
    print("Usa el sniffer: ~/midi_sniffer.sh")


def main():
    parser = argparse.ArgumentParser(
        description='Zoom G9.2tt Patch Preview',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument('-p', '--port', help='Puerto MIDI a usar')

    subparsers = parser.add_subparsers(dest='command')

    # preview
    sp = subparsers.add_parser('preview', help='Preview un patch')
    sp.add_argument('patch', type=int, help='Número de patch (0-99)')
    sp.set_defaults(func=cmd_preview)

    # select
    sp = subparsers.add_parser('select', help='Seleccionar patch')
    sp.add_argument('patch', type=int, help='Número de patch (0-99)')
    sp.set_defaults(func=cmd_select)

    # test-encode
    sp = subparsers.add_parser('test-encode', help='Probar codificación 7-bit')
    sp.add_argument('patch', type=int, help='Número de patch (0-99)')
    sp.set_defaults(func=cmd_test_encode)

    # capture
    sp = subparsers.add_parser('capture', help='Info sobre captura')
    sp.set_defaults(func=cmd_capture_preview)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    args.func(args)


if __name__ == '__main__':
    main()
