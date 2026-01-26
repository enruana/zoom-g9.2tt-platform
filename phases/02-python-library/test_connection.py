#!/usr/bin/env python3
"""
Test de conexión con el Zoom G9.2tt
"""

from zoomg9 import G9Device, G9DeviceError

def main():
    print("=" * 50)
    print("  Zoom G9.2tt - Test de Conexión")
    print("=" * 50)

    # 1. Listar puertos MIDI
    print("\n1. Puertos MIDI disponibles:")
    ports = G9Device.list_ports()

    if not ports['output']:
        print("   ❌ No se encontraron puertos MIDI")
        print("   Conecta el UM-ONE y asegúrate de que el G9.2tt esté encendido")
        return

    print(f"   Input:  {ports['input']}")
    print(f"   Output: {ports['output']}")

    # 2. Conectar
    print("\n2. Conectando al G9.2tt...")
    try:
        device = G9Device()
        device.connect()
        print(f"   ✓ Conectado a: {device.port_name}")
    except G9DeviceError as e:
        print(f"   ❌ Error: {e}")
        return

    try:
        # 3. Identity Request
        print("\n3. Consultando identidad del dispositivo...")
        identity = device.identity()
        if identity["valid"]:
            print(f"   ✓ Manufacturer: 0x{identity['manufacturer']:02X} (Zoom)")
            print(f"   ✓ Model: 0x{identity['model']:02X} (G9.2tt)")
            if identity.get("firmware"):
                print(f"   ✓ Firmware: {identity['firmware']}")
        else:
            print("   ⚠ No hubo respuesta de identidad (esto es normal)")

        # 4. Leer patch 0
        print("\n4. Leyendo patch 0...")
        patch = device.read_patch(0)
        print(f"   ✓ Patch leído exitosamente!")

        # 5. Mostrar información del patch
        print("\n" + "=" * 50)
        print(patch.summary())
        print("=" * 50)

        # 6. Test de control en tiempo real
        print("\n5. ¿Quieres probar el control en tiempo real? [s/N] ", end="")
        resp = input().strip().lower()

        if resp == 's':
            print("\n   Moviendo ganancia del AMP de 0 a 100...")
            import time
            for gain in range(0, 101, 10):
                device.set_parameter("amp", "gain", gain)
                print(f"   Gain: {gain}", end="\r")
                time.sleep(0.1)
            print("\n   ✓ Test completado!")

            # Restaurar
            print("   Restaurando ganancia original...")
            device.set_parameter("amp", "gain", patch.amp.gain)

        print("\n✓ Todos los tests completados exitosamente!")

    except G9DeviceError as e:
        print(f"\n❌ Error: {e}")

    finally:
        device.disconnect()
        print("\nDesconectado.")


if __name__ == "__main__":
    main()
