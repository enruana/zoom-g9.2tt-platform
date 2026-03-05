#!/usr/bin/env python3
"""
Parse G9ED.efx.xml - Zoom G9.2tt Effect Parameter Definitions
=============================================================
Extracts all modules, types, and parameters from the editor's XML definition file.
Outputs:
  - Formatted console tables per module
  - efx_parsed.json  (complete structured data)
  - efx_summary.md   (markdown reference)
"""

import json
import os
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
XML_PATH = os.path.join(SCRIPT_DIR, "G9ED.efx.xml")
JSON_PATH = os.path.join(SCRIPT_DIR, "efx_parsed.json")
MD_PATH = os.path.join(SCRIPT_DIR, "efx_summary.md")

# ── Helpers ──────────────────────────────────────────────────────────────────

def text(el, tag, default=""):
    """Get text content of a child element, or default."""
    child = el.find(tag)
    if child is None:
        return default
    return (child.text or "").strip()


def int_or(el, tag, default=0):
    """Get integer text of a child element, or default."""
    v = text(el, tag)
    try:
        return int(v)
    except (ValueError, TypeError):
        return default


# ── Parsing ──────────────────────────────────────────────────────────────────

def parse_xml(path):
    tree = ET.parse(path)
    root = tree.getroot()

    modules = []
    for fx_module in root.findall(".//FxModule"):
        module_name = text(fx_module, "name")
        types = []
        for fx_type in fx_module.findall(".//FxType"):
            type_name = text(fx_type, "name")
            params = []
            for fx_parm in fx_type.findall(".//FxParm"):
                views_el = fx_parm.find("views")
                views = []
                if views_el is not None:
                    views = [s.text or "" for s in views_el.findall("string")]

                param = {
                    "name": text(fx_parm, "name"),
                    "valType": text(fx_parm, "valType"),
                    "init": int_or(fx_parm, "init"),
                    "max": int_or(fx_parm, "max"),
                    "rtm_max": int_or(fx_parm, "rtm_max"),
                    "dispMax": int_or(fx_parm, "dispMax"),
                    "offset": int_or(fx_parm, "offset"),
                    "views": views,
                }
                params.append(param)
            types.append({"name": type_name, "parameters": params})
        modules.append({"name": module_name, "types": types})
    return modules


# ── Console Output ───────────────────────────────────────────────────────────

DIVIDER = "-" * 120
HEADER_FMT = "{:<20s} {:>5s} {:>5s} {:>5s} {:>7s} {:>8s} {:>8s}  {}"
ROW_FMT    = "{:<20s} {:>5d} {:>5d} {:>5d} {:>7d} {:>8d} {:>8s}  {}"


def print_module(mod):
    print()
    print("=" * 120)
    print(f"  MODULE: {mod['name']}")
    print("=" * 120)

    for typ in mod["types"]:
        print()
        print(f"  Type: {typ['name']}  ({len(typ['parameters'])} params)")
        print(DIVIDER)
        print(HEADER_FMT.format("Parameter", "Init", "Max", "RtmMx", "DispMax", "Offset", "ValType", "Views / Named Values"))
        print(DIVIDER)
        for p in typ["parameters"]:
            views_str = ""
            if p["views"]:
                if len(p["views"]) <= 8:
                    views_str = ", ".join(p["views"])
                else:
                    views_str = f"{', '.join(p['views'][:5])} ... ({len(p['views'])} values)"
            print(ROW_FMT.format(
                p["name"][:20],
                p["init"], p["max"], p["rtm_max"], p["dispMax"], p["offset"],
                p["valType"] if p["valType"] else "-",
                views_str,
            ))
        print(DIVIDER)


# ── Summary / Highlights ────────────────────────────────────────────────────

def print_highlights(modules):
    offset_params = []
    rtm_params = []
    named_params = []
    dispmax_params = []
    val_types = defaultdict(int)
    total_params = 0
    total_types = 0

    for mod in modules:
        total_types += len(mod["types"])
        for typ in mod["types"]:
            for p in typ["parameters"]:
                total_params += 1
                if p["valType"]:
                    val_types[p["valType"]] += 1
                if p["offset"] != 0:
                    offset_params.append((mod["name"], typ["name"], p["name"], p["offset"]))
                if p["rtm_max"] != 0:
                    rtm_params.append((mod["name"], typ["name"], p["name"], p["rtm_max"], p["max"]))
                if p["views"]:
                    named_params.append((mod["name"], typ["name"], p["name"], len(p["views"]), p["views"]))
                if p["dispMax"] != 0:
                    dispmax_params.append((mod["name"], typ["name"], p["name"], p["dispMax"]))

    print("\n")
    print("=" * 120)
    print("  SUMMARY & HIGHLIGHTS")
    print("=" * 120)

    print(f"\n  Total modules:    {len(modules)}")
    print(f"  Total types:      {total_types}")
    print(f"  Total parameters: {total_params}")

    # Value types
    print(f"\n  Value types found ({len(val_types)}):")
    for vt, count in sorted(val_types.items(), key=lambda x: -x[1]):
        print(f"    {vt:<20s}  {count:>4d} params")

    # Offset != 0
    print(f"\n  Parameters with offset != 0 ({len(offset_params)}):")
    print(f"  (display_value = midi_value + offset)")
    print(f"  {'Module':<10s} {'Type':<22s} {'Parameter':<20s} {'Offset':>6s}")
    print(f"  {'-'*10} {'-'*22} {'-'*20} {'-'*6}")
    for mod, typ, pname, off in offset_params:
        print(f"  {mod:<10s} {typ:<22s} {pname:<20s} {off:>6d}")

    # rtm_max != 0
    print(f"\n  Parameters with rtm_max != 0 ({len(rtm_params)}):")
    print(f"  (real-time controllable parameters)")
    print(f"  {'Module':<10s} {'Type':<22s} {'Parameter':<20s} {'rtm_max':>7s} {'max':>5s} {'match?':>6s}")
    print(f"  {'-'*10} {'-'*22} {'-'*20} {'-'*7} {'-'*5} {'-'*6}")
    for mod, typ, pname, rtm, mx in rtm_params:
        match = "YES" if rtm == mx else "NO"
        print(f"  {mod:<10s} {typ:<22s} {pname:<20s} {rtm:>7d} {mx:>5d} {match:>6s}")

    # dispMax != 0
    if dispmax_params:
        print(f"\n  Parameters with dispMax != 0 ({len(dispmax_params)}):")
        print(f"  {'Module':<10s} {'Type':<22s} {'Parameter':<20s} {'dispMax':>7s}")
        print(f"  {'-'*10} {'-'*22} {'-'*20} {'-'*7}")
        for mod, typ, pname, dm in dispmax_params:
            print(f"  {mod:<10s} {typ:<22s} {pname:<20s} {dm:>7d}")

    # Named values (RefTbl)
    print(f"\n  Parameters with named values / RefTbl ({len(named_params)}):")
    print(f"  {'Module':<10s} {'Type':<22s} {'Parameter':<20s} {'#Vals':>5s}  Values")
    print(f"  {'-'*10} {'-'*22} {'-'*20} {'-'*5}  {'-'*40}")
    for mod, typ, pname, count, views in named_params:
        if count <= 6:
            v_str = ", ".join(views)
        else:
            v_str = f"{', '.join(views[:4])} ... {views[-1]}  ({count} total)"
        print(f"  {mod:<10s} {typ:<22s} {pname:<20s} {count:>5d}  {v_str}")


# ── JSON Output ──────────────────────────────────────────────────────────────

def save_json(modules, path):
    with open(path, "w") as f:
        json.dump({"modules": modules}, f, indent=2)
    print(f"\n  JSON saved to: {path}")


# ── Markdown Output ──────────────────────────────────────────────────────────

def save_markdown(modules, path):
    lines = []
    lines.append("# Zoom G9.2tt Effect Parameters (G9ED.efx.xml)")
    lines.append("")

    # Stats
    total_types = sum(len(m["types"]) for m in modules)
    total_params = sum(len(p) for m in modules for t in m["types"] for p in [t["parameters"]])
    lines.append(f"- **Modules**: {len(modules)}")
    lines.append(f"- **Types (effects)**: {total_types}")
    lines.append(f"- **Parameters**: {total_params}")
    lines.append("")

    # Table of contents
    lines.append("## Modules")
    lines.append("")
    for mod in modules:
        types_list = ", ".join(t["name"] for t in mod["types"])
        lines.append(f"- **{mod['name']}** ({len(mod['types'])} types): {types_list}")
    lines.append("")

    # Detailed tables per module
    for mod in modules:
        lines.append(f"## {mod['name']}")
        lines.append("")
        for typ in mod["types"]:
            lines.append(f"### {typ['name']}")
            lines.append("")
            lines.append("| Parameter | Init | Max | rtm_max | dispMax | Offset | ValType | Named Values |")
            lines.append("|-----------|------|-----|---------|---------|--------|---------|--------------|")
            for p in typ["parameters"]:
                views_str = ""
                if p["views"]:
                    if len(p["views"]) <= 6:
                        views_str = ", ".join(p["views"])
                    else:
                        views_str = f"{', '.join(p['views'][:3])}... ({len(p['views'])} vals)"
                vt = p["valType"] if p["valType"] else "-"
                lines.append(
                    f"| {p['name']} | {p['init']} | {p['max']} | {p['rtm_max']} | "
                    f"{p['dispMax']} | {p['offset']} | {vt} | {views_str} |"
                )
            lines.append("")

    # Highlights section
    lines.append("## Highlights")
    lines.append("")

    # Offset params
    lines.append("### Parameters with offset != 0")
    lines.append("")
    lines.append("These parameters display as `display_value = midi_value + offset`.")
    lines.append("")
    lines.append("| Module | Type | Parameter | Offset |")
    lines.append("|--------|------|-----------|--------|")
    for mod in modules:
        for typ in mod["types"]:
            for p in typ["parameters"]:
                if p["offset"] != 0:
                    lines.append(f"| {mod['name']} | {typ['name']} | {p['name']} | {p['offset']} |")
    lines.append("")

    # rtm_max params
    lines.append("### Parameters with rtm_max != 0 (real-time controllable)")
    lines.append("")
    lines.append("| Module | Type | Parameter | rtm_max | max | Match? |")
    lines.append("|--------|------|-----------|---------|-----|--------|")
    for mod in modules:
        for typ in mod["types"]:
            for p in typ["parameters"]:
                if p["rtm_max"] != 0:
                    match = "Yes" if p["rtm_max"] == p["max"] else "**No**"
                    lines.append(
                        f"| {mod['name']} | {typ['name']} | {p['name']} | "
                        f"{p['rtm_max']} | {p['max']} | {match} |"
                    )
    lines.append("")

    # Named values
    lines.append("### Parameters with named values (RefTbl)")
    lines.append("")
    lines.append("| Module | Type | Parameter | # Values | Values |")
    lines.append("|--------|------|-----------|----------|--------|")
    for mod in modules:
        for typ in mod["types"]:
            for p in typ["parameters"]:
                if p["views"]:
                    if len(p["views"]) <= 6:
                        v_str = ", ".join(p["views"])
                    else:
                        v_str = f"{', '.join(p['views'][:3])}... ({len(p['views'])} total)"
                    lines.append(
                        f"| {mod['name']} | {typ['name']} | {p['name']} | "
                        f"{len(p['views'])} | {v_str} |"
                    )
    lines.append("")

    with open(path, "w") as f:
        f.write("\n".join(lines))
    print(f"  Markdown saved to: {path}")


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    if not os.path.isfile(XML_PATH):
        print(f"ERROR: XML file not found: {XML_PATH}", file=sys.stderr)
        sys.exit(1)

    print(f"Parsing {XML_PATH} ...")
    modules = parse_xml(XML_PATH)

    # Console output
    for mod in modules:
        print_module(mod)

    print_highlights(modules)

    # File outputs
    save_json(modules, JSON_PATH)
    save_markdown(modules, MD_PATH)

    print("\nDone.")


if __name__ == "__main__":
    main()
