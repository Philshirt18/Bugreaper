import subprocess
import sys
import json
from pathlib import Path


def run_pytest(repo_path: str, test_file: str = None, timeout: int = 120) -> dict:
    """Run pytest with timeout and capture results."""
    cmd = ["pytest", "-v", "--tb=short"]
    
    if test_file:
        cmd.append(test_file)
    
    try:
        result = subprocess.run(
            cmd,
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        
        return {
            "success": result.returncode == 0,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": f"Tests timed out after {timeout} seconds",
            "returncode": -1
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "returncode": -1
        }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python pytest_runner.py <repo_path> [test_file]")
        sys.exit(1)
    
    repo_path = sys.argv[1]
    test_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    result = run_pytest(repo_path, test_file)
    print(json.dumps(result, indent=2))
