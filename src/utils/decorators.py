"""
🎨 Decorators
============

Autor: Elizabeth Díaz Familia
"""

import time
from functools import wraps

def timer(func):
    """Decorator para medir tiempo de ejecución"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end-start:.2f} seconds")
        return result
    return wrapper
