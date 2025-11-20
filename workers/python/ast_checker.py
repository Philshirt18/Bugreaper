import ast
import sys
from typing import List, Dict


class SecurityChecker(ast.NodeVisitor):
    """Check for potentially dangerous code patterns."""
    
    def __init__(self):
        self.issues = []
    
    def visit_Call(self, node):
        if isinstance(node.func, ast.Name):
            if node.func.id in ['eval', 'exec', '__import__']:
                self.issues.append({
                    "severity": "high",
                    "line": node.lineno,
                    "message": f"Dangerous function call: {node.func.id}"
                })
        
        self.generic_visit(node)
    
    def visit_Import(self, node):
        dangerous_modules = ['os', 'subprocess', 'sys']
        for alias in node.names:
            if alias.name in dangerous_modules:
                self.issues.append({
                    "severity": "medium",
                    "line": node.lineno,
                    "message": f"Potentially dangerous import: {alias.name}"
                })
        
        self.generic_visit(node)


def check_code_safety(code: str) -> Dict:
    """Run security checks on Python code."""
    try:
        tree = ast.parse(code)
        checker = SecurityChecker()
        checker.visit(tree)
        
        return {
            "safe": len([i for i in checker.issues if i["severity"] == "high"]) == 0,
            "issues": checker.issues
        }
    except SyntaxError as e:
        return {
            "safe": False,
            "issues": [{
                "severity": "critical",
                "line": e.lineno,
                "message": f"Syntax error: {e.msg}"
            }]
        }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ast_checker.py <file>")
        sys.exit(1)
    
    with open(sys.argv[1]) as f:
        code = f.read()
    
    result = check_code_safety(code)
    
    import json
    print(json.dumps(result, indent=2))
