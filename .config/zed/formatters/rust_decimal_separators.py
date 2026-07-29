#!/usr/bin/env python3
"""Group long decimal Rust integer literals with underscore separators."""

from __future__ import annotations

import sys


DECIMAL_DIGITS = "0123456789"
INTEGER_SUFFIXES = (
    "usize",
    "isize",
    "u128",
    "i128",
    "u64",
    "i64",
    "u32",
    "i32",
    "u16",
    "i16",
    "u8",
    "i8",
)


def identifier_start(char: str) -> bool:
    return bool(char) and (char == "_" or char.isidentifier())


def identifier_char(char: str) -> bool:
    return bool(char) and ("a" + char).isidentifier()


def quoted_end(source: str, start: int) -> int:
    quote = source[start]
    index = start + 1
    while index < len(source):
        if source[index] == "\\":
            index += 2
        elif source[index] == quote:
            return index + 1
        else:
            index += 1
    return index


def char_end(source: str, start: int) -> int | None:
    index = start + 1
    if index >= len(source) or source[index] == "\n":
        return None
    if source[index] == "\\":
        index += 2
        while index < len(source) and source[index] not in "'\n":
            index += 1
    else:
        index += 1
    return index + 1 if index < len(source) and source[index] == "'" else None


def raw_string_end(source: str, start: int) -> int | None:
    prefix = 2 if source.startswith(("br", "cr"), start) else 1
    if source[start + prefix - 1] != "r":
        return None
    index = start + prefix
    while index < len(source) and source[index] == "#":
        index += 1
    if index >= len(source) or source[index] != '"':
        return None
    terminator = '"' + "#" * (index - start - prefix)
    end = source.find(terminator, index + 1)
    return len(source) if end < 0 else end + len(terminator)


def block_comment_end(source: str, start: int) -> int:
    depth = 1
    index = start + 2
    while index < len(source) and depth:
        if source.startswith("/*", index):
            depth += 1
            index += 2
        elif source.startswith("*/", index):
            depth -= 1
            index += 2
        else:
            index += 1
    return index


def numeric_end(source: str, start: int) -> tuple[int, bool]:
    index = start
    if source.startswith(("0x", "0X", "0o", "0O", "0b", "0B"), start):
        index += 2
        while index < len(source) and (identifier_char(source[index])):
            index += 1
        return index, False

    while index < len(source) and (source[index] in DECIMAL_DIGITS or source[index] == "_"):
        index += 1
    body_end = index

    if index < len(source) and source[index] in "eE":
        exponent = index + 1
        if exponent < len(source) and source[exponent] in "+-":
            exponent += 1
        if exponent < len(source) and source[exponent] in DECIMAL_DIGITS:
            index = exponent + 1
            while index < len(source) and (source[index] in DECIMAL_DIGITS or source[index] == "_"):
                index += 1
            if source.startswith(("f32", "f64"), index):
                index += 3
            return index, False

    if index < len(source) and source[index] == ".":
        following = source[index + 1] if index + 1 < len(source) else ""
        if following != "." and not identifier_start(following):
            index += 1
            while index < len(source) and (source[index] in DECIMAL_DIGITS or source[index] == "_"):
                index += 1
            if index < len(source) and source[index] in "eE":
                index += 1
                if index < len(source) and source[index] in "+-":
                    index += 1
                while index < len(source) and (source[index] in DECIMAL_DIGITS or source[index] == "_"):
                    index += 1
            if source.startswith(("f32", "f64"), index):
                index += 3
            return index, False

    if source.startswith(("f32", "f64"), body_end):
        return body_end + 3, False

    for suffix in INTEGER_SUFFIXES:
        if source.startswith(suffix, body_end):
            end = body_end + len(suffix)
            if end == len(source) or not identifier_char(source[end]):
                return end, True

    if body_end < len(source) and identifier_char(source[body_end]):
        index = body_end + 1
        while index < len(source) and identifier_char(source[index]):
            index += 1
        return index, False
    return body_end, True


def group_decimal(token: str) -> str:
    body_end = 0
    while body_end < len(token) and (token[body_end] in DECIMAL_DIGITS or token[body_end] == "_"):
        body_end += 1
    digits = token[:body_end].replace("_", "")
    if len(digits) < 4:
        return token
    first = len(digits) % 3 or 3
    groups = [digits[:first]]
    groups.extend(digits[index : index + 3] for index in range(first, len(digits), 3))
    return "_".join(groups) + token[body_end:]


def format_source(source: str) -> str:
    output: list[str] = []
    index = 0
    dot_run = 0
    while index < len(source):
        start = index
        if index == 0 and source.startswith("#!") and not source.startswith("#!["):
            index = source.find("\n")
            index = len(source) if index < 0 else index
        elif source.startswith("//", index):
            index = source.find("\n", index)
            index = len(source) if index < 0 else index
        elif source.startswith("/*", index):
            index = block_comment_end(source, index)
        else:
            boundary = index == 0 or not identifier_char(source[index - 1])
            raw_end = raw_string_end(source, index) if boundary else None
            if raw_end is not None:
                index = raw_end
                dot_run = 0
            elif boundary and source.startswith(("b\"", "c\""), index):
                index = quoted_end(source, index + 1)
                dot_run = 0
            elif source[index] == '"':
                index = quoted_end(source, index)
                dot_run = 0
            elif boundary and source.startswith("b'", index):
                index = char_end(source, index + 1) or index + 1
                dot_run = 0
            elif source[index] == "'" and (end := char_end(source, index)) is not None:
                index = end
                dot_run = 0
            elif source[index] in DECIMAL_DIGITS and boundary:
                index, is_integer = numeric_end(source, index)
                token = source[start:index]
                should_group = is_integer and dot_run != 1
                output.append(group_decimal(token) if should_group else token)
                dot_run = 0
                continue
            else:
                char = source[index]
                index += 1
                if char == ".":
                    dot_run += 1
                elif not char.isspace():
                    dot_run = 0
        output.append(source[start:index])
    return "".join(output)


def self_test() -> int:
    cases = {
        "decimal integers": (
            "let a = 1000; let b = 12_34_567u64; let c = 1_23;\n",
            "let a = 1_000; let b = 1_234_567u64; let c = 1_23;\n",
        ),
        "syntax exclusions": (
            "// 123456\n/* 1234 /* 5678 */ 9012 */\n"
            'let s = "123456"; let b = b"123456"; let c = c"123456";\n'
            'let multi = "before\n123456 after";\n'
            "let ch = '1'; let bc = b'2'; let life: &'life1234 str; 'label1234: loop {}\n"
            'let r = r###"123456"###; let br = br##"123456"##;\n'
            "let f = 123456.0; let e = 123456e7; let t = 123456f64;\n"
            "let h = 0x123456; let o = 0o123456; let bits = 0b101010;\n"
            "let ident123456 = value123456; let unicode = ١٢٣٤;\n",
            "// 123456\n/* 1234 /* 5678 */ 9012 */\n"
            'let s = "123456"; let b = b"123456"; let c = c"123456";\n'
            'let multi = "before\n123456 after";\n'
            "let ch = '1'; let bc = b'2'; let life: &'life1234 str; 'label1234: loop {}\n"
            'let r = r###"123456"###; let br = br##"123456"##;\n'
            "let f = 123456.0; let e = 123456e7; let t = 123456f64;\n"
            "let h = 0x123456; let o = 0o123456; let bits = 0b101010;\n"
            "let ident123456 = value123456; let unicode = ١٢٣٤;\n",
        ),
        "punctuation and suffixes": (
            "[10000, 1_000_000usize, 999]; 1234../* gap */5678; 1234.foo();\n"
            "tuple . /* gap */ 1234; tuple.// gap\n1234;\n",
            "[10_000, 1_000_000usize, 999]; 1_234../* gap */5_678; 1_234.foo();\n"
            "tuple . /* gap */ 1234; tuple.// gap\n1234;\n",
        ),
    }
    failures = 0
    for name, (source, expected) in cases.items():
        actual = format_source(source)
        if actual != expected:
            failures += 1
            print(f"FAIL: {name}\nexpected: {expected!r}\nactual:   {actual!r}", file=sys.stderr)
    if failures:
        print(f"self-test failed: {failures}/{len(cases)} cases", file=sys.stderr)
        return 1
    print(f"self-test passed: {len(cases)}/{len(cases)} cases", file=sys.stderr)
    return 0


def main() -> int:
    if sys.argv[1:] == ["--self-test"]:
        return self_test()
    if sys.argv[1:]:
        print(f"usage: {sys.argv[0]} [--self-test]", file=sys.stderr)
        return 2
    sys.stdout.write(format_source(sys.stdin.read()))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
