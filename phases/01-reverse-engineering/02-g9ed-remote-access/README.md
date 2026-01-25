# Paso 02: Acceso Remoto a G9ED

## Objetivo

Ejecutar el software original G9ED (Windows .NET) en una Raspberry Pi y acceder remotamente desde Mac via SSH con X11 forwarding.

## ¿Por qué este enfoque?

- G9ED es una aplicación Windows .NET 2.0 que no corre nativamente en Mac/Linux
- Necesitamos capturar el tráfico MIDI entre G9ED y el pedal
- Usar Raspberry Pi permite interceptar MIDI a nivel de sistema

## Arquitectura

```
┌────────────────────────────────────────────────────────────┐
│                         Mac                                 │
│   ┌──────────────┐                                         │
│   │   XQuartz    │◄─── Ventana de G9ED se muestra aquí     │
│   └──────────────┘                                         │
│          ▲                                                 │
│          │ X11                                             │
│          │                                                 │
│   ssh -Y user@raspberry                                    │
└──────────│─────────────────────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────────────────────────┐
│                    Raspberry Pi                             │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│   │  box86   │───▶│  Wine    │───▶│  G9ED    │            │
│   │ (x86 emu)│    │  (Win32) │    │ (.NET)   │            │
│   └──────────┘    └──────────┘    └──────────┘            │
│                                        │                   │
│                                        │ MIDI              │
│                                        ▼                   │
│                                   ┌──────────┐            │
│                                   │  UM-ONE  │            │
│                                   └──────────┘            │
└────────────────────────────────────────────────────────────┘
```

## Configuración en Mac

### 1. Instalar XQuartz

```bash
brew install --cask xquartz
```

**Importante:** Reiniciar sesión después de instalar.

### 2. Configurar XQuartz

1. Abrir XQuartz
2. Preferencias > Seguridad
3. ✅ Permitir conexiones de clientes de red

## Configuración en Raspberry Pi

### 1. Instalar dependencias armhf

```bash
sudo dpkg --add-architecture armhf
sudo apt update
sudo apt install -y \
    libc6:armhf \
    libx11-6:armhf \
    libfreetype6:armhf \
    libxext6:armhf \
    libxrender1:armhf \
    libxrandr2:armhf \
    libxcursor1:armhf \
    libxi6:armhf \
    libxfixes3:armhf \
    libxcomposite1:armhf \
    libglib2.0-0:armhf \
    libfontconfig1:armhf
```

### 2. Instalar box86

```bash
# Ver instrucciones actualizadas en:
# https://github.com/ptitSeb/box86

# Verificar instalación
box86 --version
```

### 3. Instalar Wine x86

```bash
mkdir -p ~/wine-i386 && cd ~/wine-i386

# Descargar Wine x86 (Kron4ek builds)
curl -L -o wine.tar.xz \
    'https://github.com/Kron4ek/Wine-Builds/releases/download/11.0/wine-11.0-x86.tar.xz'

tar -xf wine.tar.xz

# Verificar
box86 ~/wine-i386/wine-11.0-x86/bin/wine --version
# Debe mostrar: wine-11.0
```

### 4. Inicializar Wine Prefix

```bash
export WINEPREFIX=~/.wine32
export WINEARCH=win32

box86 ~/wine-i386/wine-11.0-x86/bin/wineboot --init
```

### 5. Instalar Wine Mono

```bash
curl -L -o ~/wine-mono.msi \
    "https://dl.winehq.org/wine/wine-mono/9.4.0/wine-mono-9.4.0-x86.msi"

box86 ~/wine-i386/wine-11.0-x86/bin/wine msiexec /i ~/wine-mono.msi
```

### 6. Copiar G9ED

```bash
mkdir -p ~/g9ed/extracted
# Copiar archivos de G9ED.exe y recursos
```

## Conexión SSH con X11

### Desde Mac

```bash
# 1. Asegurarse de que XQuartz está corriendo
# 2. Exportar DISPLAY
export DISPLAY=:0

# 3. Conectar con X11 forwarding
ssh -Y felipemantilla@192.168.80.31
# Password: enruana

# 4. Verificar que DISPLAY está configurado
echo $DISPLAY
# Debe mostrar: localhost:10.0 o similar
```

### Ejecutar G9ED

```bash
export WINEPREFIX=~/.wine32
export WINEARCH=win32

box86 ~/wine-i386/wine-11.0-x86/bin/wine ~/g9ed/extracted/G9ED.exe
```

La ventana de G9ED debería aparecer en tu Mac.

## Troubleshooting

### DISPLAY vacío después de SSH

```bash
# Asegurar XQuartz corriendo
# Usar -Y mayúscula (no -y)
export DISPLAY=:0
ssh -Y user@raspberry
```

### "Could not open display"

Conectar desde terminal de XQuartz:
1. XQuartz > Applications > Terminal
2. `ssh -Y user@raspberry`

### "Wine Mono is not installed"

```bash
box86 ~/wine-i386/wine-11.0-x86/bin/wine msiexec /i ~/wine-mono.msi
```

### "could not load kernel32.dll"

```bash
rm -rf ~/.wine32
export WINEPREFIX=~/.wine32
export WINEARCH=win32
box86 ~/wine-i386/wine-11.0-x86/bin/wineboot --init
```

## Scripts Útiles

Ver carpeta `scripts/` para:
- `setup-wine.sh` - Configuración inicial de Wine
- `install-wine-mono.sh` - Instalación de Mono
- `run-g9ed.sh` - Ejecutar G9ED

## Información del Sistema

| Componente | Versión |
|------------|---------|
| Raspberry Pi OS | Debian Bookworm (arm64) |
| box86 | v0.3.9 |
| Wine | 11.0 (x86) |
| Wine Mono | 9.4.0 |
| G9ED.exe | .NET 2.0 |

## Siguiente Paso

[03 - Captura MIDI](../03-midi-capture/)
