#!/usr/bin/env python3
"""
Zoom G9.2tt Patch Writer
Escribe patches al dispositivo via MIDI SysEx

Uso:
    python g9tt_writer.py write <patch_number> <sysex_file>
    python g9tt_writer.py rename <patch_number> "Nuevo Nombre"
    python g9tt_writer.py send-raw <sysex_file>
    python g9tt_writer.py list-ports

Descubierto: 2026-01-23
Protocolo:
    0x12 - Enter Edit Mode
    0x28 - Write Patch Data (153 bytes)
    0x31 - Store Patch (10 bytes)
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
CMD_READ_PATCH = 0x11
CMD_READ_RESPONSE = 0x21
CMD_WRITE_PATCH = 0x28
CMD_STORE_PATCH = 0x31

class G9ttWriter:
    def __init__(self, port_name=None):
        self.port_name = port_name
        self.inport = None
        self.outport = None

    def find_port(self):
        """Busca el puerto MIDI del G9.2tt"""
        outputs = mido.get_output_names()
        inputs = mido.get_input_names()

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

    def send_sysex(self, data):
        """Envía un mensaje SysEx"""
        # mido espera datos sin F0/F7
        if data[0] == 0xF0:
            data = data[1:]
        if data[-1] == 0xF7:
            data = data[:-1]

        msg = mido.Message('sysex', data=list(data))
        self.outport.send(msg)
        print(f"  Enviado: F0 {' '.join(f'{b:02X}' for b in data)} F7")

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

    def read_patch(self, patch_num):
        """Lee un patch del dispositivo"""
        print(f"Leyendo patch {patch_num}...")
        cmd = bytes([0xF0, ZOOM_MANUFACTURER_ID, DEVICE_ID, G9TT_MODEL_ID, CMD_READ_PATCH, patch_num, 0xF7])
        self.send_sysex(cmd)

        response = self.receive_sysex(timeout=3.0)
        if response and len(response) == 268:
            print(f"  Recibido: {len(response)} bytes")
            return response
        else:
            print(f"  Error: respuesta inválida")
            return None

    def write_patch_data(self, data):
        """Envía datos de patch al buffer de edición (0x28)"""
        print("Enviando datos del patch...")

        # Construir comando 0x28
        # Header: F0 52 00 42 28
        # Data: 147 bytes
        # Footer: F7

        if len(data) != 147:
            raise ValueError(f"Datos deben ser 147 bytes, recibido: {len(data)}")

        cmd = bytes([0xF0, ZOOM_MANUFACTURER_ID, DEVICE_ID, G9TT_MODEL_ID, CMD_WRITE_PATCH]) + data + bytes([0xF7])
        self.send_sysex(cmd)
        time.sleep(0.1)

    def store_patch(self, patch_num, byte1=0x02, byte2=0x00):
        """Guarda el buffer en un slot de patch (0x31)"""
        print(f"Guardando en patch {patch_num}...")
        cmd = bytes([
            0xF0, ZOOM_MANUFACTURER_ID, DEVICE_ID, G9TT_MODEL_ID,
            CMD_STORE_PATCH, patch_num, byte1, byte2, 0x00, 0xF7
        ])
        self.send_sysex(cmd)
        time.sleep(0.2)

    def decode_read_response(self, response):
        """Decodifica respuesta de lectura (nibble-encoded) a formato de escritura"""
        if len(response) != 268:
            raise ValueError(f"Respuesta inválida: {len(response)} bytes")

        # Extraer payload (bytes 6 a 261 = 256 bytes nibble)
        nibbles = response[6:262]

        # Decodificar nibbles -> 128 bytes
        decoded = []
        for i in range(0, len(nibbles), 2):
            high = nibbles[i] & 0x0F
            low = nibbles[i+1] & 0x0F
            decoded.append((high << 4) | low)

        return bytes(decoded)

    def encode_for_write(self, decoded_data):
        """
        Convierte datos decodificados (128 bytes) al formato de escritura (147 bytes)

        Formato: Empaquetado de 7 bits MIDI
        - Cada 7 bytes de datos se convierten en 8 bytes
        - El 8vo byte contiene los bits altos (bit 7) de los 7 bytes anteriores
        - Esto asegura que todos los bytes sean < 128 (requisito MIDI)

        128 bytes * 8/7 = 146.3 -> 147 bytes (con padding)
        """
        if len(decoded_data) != 128:
            raise ValueError(f"Se esperan 128 bytes, recibido: {len(decoded_data)}")

        result = bytearray()
        data = bytearray(decoded_data)

        i = 0
        while i < len(data):
            # Tomar hasta 7 bytes
            chunk = data[i:i+7]

            # Calcular byte de bits altos
            high_bits = 0
            encoded_chunk = bytearray()

            for j, byte in enumerate(chunk):
                # Guardar bit 7 en high_bits
                if byte & 0x80:
                    high_bits |= (1 << j)
                # Guardar byte sin bit 7
                encoded_chunk.append(byte & 0x7F)

            # Añadir los 7 bytes (o menos si es el último grupo)
            result.extend(encoded_chunk)
            # Añadir byte de bits altos
            result.append(high_bits)

            i += 7

        # Asegurar tamaño exacto de 147 bytes
        while len(result) < 147:
            result.append(0x00)

        return bytes(result[:147])

    def decode_from_write(self, write_data):
        """
        Convierte datos de escritura (147 bytes) a formato decodificado (128 bytes)

        Inverso de encode_for_write
        """
        if len(write_data) != 147:
            raise ValueError(f"Se esperan 147 bytes, recibido: {len(write_data)}")

        result = bytearray()

        i = 0
        while i < len(write_data) - 1:
            # Cada grupo tiene hasta 7 bytes + 1 byte de bits altos
            remaining = len(write_data) - i
            chunk_size = min(8, remaining)

            if chunk_size < 2:
                break

            chunk = write_data[i:i+chunk_size]
            high_bits = chunk[-1] if len(chunk) == 8 else 0
            data_bytes = chunk[:-1] if len(chunk) == 8 else chunk

            for j, byte in enumerate(data_bytes):
                # Restaurar bit 7 desde high_bits
                if high_bits & (1 << j):
                    byte |= 0x80
                result.append(byte)

            i += 8

        return bytes(result[:128])

    def extract_patch_name(self, decoded_data):
        """Extrae el nombre del patch de los datos decodificados"""
        # Nombre está en offset 65-74 (10 bytes)
        name = decoded_data[65:75]
        return name.rstrip(b'\x00').decode('ascii', errors='replace')

    def set_patch_name(self, decoded_data, new_name):
        """Modifica el nombre del patch en los datos decodificados"""
        # Nombre está en offset 65-74 (10 bytes)
        name_bytes = new_name.encode('ascii')[:10].ljust(10, b'\x00')

        data = bytearray(decoded_data)
        data[65:75] = name_bytes
        return bytes(data)


def cmd_list_ports(args):
    """Lista puertos MIDI disponibles"""
    print("Puertos MIDI de entrada:")
    for name in mido.get_input_names():
        print(f"  - {name}")

    print("\nPuertos MIDI de salida:")
    for name in mido.get_output_names():
        print(f"  - {name}")


def cmd_read(args):
    """Lee un patch del dispositivo"""
    writer = G9ttWriter(args.port)
    try:
        writer.connect()
        writer.enter_edit_mode()

        response = writer.read_patch(args.patch)
        if response:
            decoded = writer.decode_read_response(response)
            name = writer.extract_patch_name(decoded)
            print(f"\nPatch {args.patch}: \"{name}\"")
            print(f"Datos decodificados: {len(decoded)} bytes")

            if args.output:
                with open(args.output, 'wb') as f:
                    f.write(response)
                print(f"Guardado en: {args.output}")
    finally:
        writer.disconnect()


def cmd_rename(args):
    """Renombra un patch en el dispositivo"""
    writer = G9ttWriter(args.port)
    try:
        writer.connect()
        writer.enter_edit_mode()

        # Leer patch actual
        response = writer.read_patch(args.patch)
        if not response:
            print("Error: no se pudo leer el patch")
            return

        decoded = writer.decode_read_response(response)
        old_name = writer.extract_patch_name(decoded)
        print(f"Nombre actual: \"{old_name}\"")
        print(f"Nuevo nombre: \"{args.name}\"")

        # Modificar nombre
        modified = writer.set_patch_name(decoded, args.name)

        # Convertir a formato de escritura
        write_data = writer.encode_for_write(modified)

        # Enviar y guardar
        writer.write_patch_data(write_data)
        writer.store_patch(args.patch)

        print("✓ Patch renombrado exitosamente")

    finally:
        writer.disconnect()


def cmd_send_raw(args):
    """Envía un archivo SysEx raw al dispositivo"""
    with open(args.file, 'rb') as f:
        data = f.read()

    print(f"Archivo: {args.file}")
    print(f"Tamaño: {len(data)} bytes")

    writer = G9ttWriter(args.port)
    try:
        writer.connect()
        writer.send_sysex(data)
        print("✓ Enviado")

        # Esperar respuesta
        response = writer.receive_sysex(timeout=2.0)
        if response:
            print(f"Respuesta: {len(response)} bytes")
            print(f"  {' '.join(f'{b:02X}' for b in response[:20])}...")
    finally:
        writer.disconnect()


def cmd_identity(args):
    """Envía Identity Request"""
    writer = G9ttWriter(args.port)
    try:
        writer.connect()

        print("Enviando Identity Request...")
        identity_req = bytes([0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7])
        writer.send_sysex(identity_req)

        response = writer.receive_sysex(timeout=2.0)
        if response:
            print(f"Respuesta: {' '.join(f'{b:02X}' for b in response)}")
            if len(response) >= 10:
                manufacturer = response[5]
                model = response[6]
                print(f"  Manufacturer: 0x{manufacturer:02X} ({'Zoom' if manufacturer == 0x52 else 'Unknown'})")
                print(f"  Model: 0x{model:02X} ({'G9.2tt' if model == 0x42 else 'Unknown'})")
                if len(response) >= 15:
                    firmware = ''.join(chr(b) for b in response[10:14])
                    print(f"  Firmware: {firmware}")
        else:
            print("No hubo respuesta")
    finally:
        writer.disconnect()


def cmd_test_write(args):
    """Prueba escribir un patch (modo seguro - solo lee y reescribe)"""
    writer = G9ttWriter(args.port)
    try:
        writer.connect()
        writer.enter_edit_mode()

        # Leer patch actual
        print(f"\n=== Leyendo patch {args.patch} ===")
        response = writer.read_patch(args.patch)
        if not response:
            print("Error: no se pudo leer el patch")
            return

        decoded = writer.decode_read_response(response)
        name = writer.extract_patch_name(decoded)
        print(f"Nombre: \"{name}\"")

        # Extraer datos raw de un comando 0x28 capturado para comparar formato
        print(f"\n=== Comparando formatos ===")
        print(f"Datos decodificados (lectura): {len(decoded)} bytes")
        print(f"Datos esperados (escritura):   147 bytes")

        # Mostrar primeros bytes
        print(f"\nPrimeros 20 bytes decodificados:")
        print(f"  {' '.join(f'{b:02X}' for b in decoded[:20])}")

        if args.dry_run:
            print("\n[DRY RUN] No se escribirá nada al dispositivo")
        else:
            # Intentar escribir
            write_data = writer.encode_for_write(decoded)
            print(f"\nEscribiendo {len(write_data)} bytes...")
            writer.write_patch_data(write_data)
            writer.store_patch(args.patch)
            print("✓ Escritura completada")

    finally:
        writer.disconnect()


def main():
    parser = argparse.ArgumentParser(
        description='Zoom G9.2tt Patch Writer',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  %(prog)s list-ports
  %(prog)s identity
  %(prog)s read 0 -o patch0.syx
  %(prog)s rename 0 "Mi Patch"
  %(prog)s test-write 0 --dry-run
        """
    )

    parser.add_argument('-p', '--port', help='Puerto MIDI a usar')

    subparsers = parser.add_subparsers(dest='command', help='Comando a ejecutar')

    # list-ports
    sp = subparsers.add_parser('list-ports', help='Lista puertos MIDI')
    sp.set_defaults(func=cmd_list_ports)

    # identity
    sp = subparsers.add_parser('identity', help='Envía Identity Request')
    sp.set_defaults(func=cmd_identity)

    # read
    sp = subparsers.add_parser('read', help='Lee un patch')
    sp.add_argument('patch', type=int, help='Número de patch (0-99)')
    sp.add_argument('-o', '--output', help='Archivo de salida')
    sp.set_defaults(func=cmd_read)

    # rename
    sp = subparsers.add_parser('rename', help='Renombra un patch')
    sp.add_argument('patch', type=int, help='Número de patch (0-99)')
    sp.add_argument('name', help='Nuevo nombre (max 10 chars)')
    sp.set_defaults(func=cmd_rename)

    # send-raw
    sp = subparsers.add_parser('send-raw', help='Envía archivo SysEx')
    sp.add_argument('file', help='Archivo .syx')
    sp.set_defaults(func=cmd_send_raw)

    # test-write
    sp = subparsers.add_parser('test-write', help='Prueba escritura (lee y reescribe)')
    sp.add_argument('patch', type=int, help='Número de patch (0-99)')
    sp.add_argument('--dry-run', action='store_true', help='No escribir, solo simular')
    sp.set_defaults(func=cmd_test_write)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    args.func(args)


if __name__ == '__main__':
    main()
