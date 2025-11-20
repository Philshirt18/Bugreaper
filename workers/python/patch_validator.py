import ast
import sys
from typing import Dict, List


def validate_patch(original_code: str, patched_code: str, constraints: dict) -> dict:
    """Validate that a patch meets safety constraints."""
    errors = []
    warnings = []
    
    original_lines = original_code.split('\n')
    patched_lines = patched_code.split('\n')
    
    lines_changed = sum(1 for o, p in zip(original_lines, patched_lines) if o != p)
    lines_changed += abs(len(original_lines) - len(patched_lines))
    
    max_lines = constraints.get('max_lines_changed', 50)
    if lines_changed > max_lines:
        errors.append(f"Too many lines changed: {lines_changed} > {max_lines}")
    
    try:
        ast.parse(original_code)
    except SyntaxError:
        warnings.append("Original code has syntax errors")
    
    try:
        ast.parse(patched_code)
    except SyntaxError as e:
        errors.append(f"Patched code has syntax errors: {e}")
    
    if constraints.get('preserve_api', True):
        original_funcs = extract_function_signatures(original_code)
        patched_funcs = extract_function_signatures(patched_code)
        
        for func_name, orig_sig in original_funcs.items():
            if func_name not in patched_funcs:
                errors.append(f"Function {func_name} was removed")
            elif patched_funcs[func_name] != orig_sig:
                warnings.append(f"Function signature changed: {func_name}")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "lines_changed": lines_changed
    }


def extract_function_signatures(code: str) -> Dict[str, str]:
    """Extract function names and their signatures."""
    try:
        tree = ast.parse(code)
        functions = {}
        
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                args = [arg.arg for arg in node.args.args]
                functions[node.name] = f"{node.name}({', '.join(args)})"
        
        return functions
    except:
        return {}


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python patch_validator.py <original_file> <patched_file>")
        sys.exit(1)
    
    with open(sys.argv[1]) as f:
        original = f.read()
    
    with open(sys.argv[2]) as f:
        patched = f.read()
    
    result = validate_patch(original, patched, {"max_lines_changed": 50, "preserve_api": True})
    
    import json
    print(json.dumps(result, indent=2))
