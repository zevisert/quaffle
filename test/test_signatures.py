###
# For syntactically valid python
###

from typing import Any, List

def some_decorator(func: Any) -> Any:
    """
    A useless decorator to test with
    """
    return func

###
# Test cases below
###

def no_args():
    pass

def has_arg(a):
    pass

def has_args(a, b):
    pass

def has_default(a=1, b = {}):
    pass

def has_complex_default_values(a, b = { 'k1': has_args('a', b={'c': 1, "d":2}) }, c=None):
    pass

def has_return_type() -> None:
    pass

def is_party_annotated(a: List[Any], b) -> List[Any]:
    pass

@some_decorator
def has_decorator_and_args(a, b):
    pass

def multiline_def(a,
                  b):
    pass

def multiline_def_defaults(a,
                           b=None):
    pass

@some_decorator
def multiline_def_defaults_decorator(a,
                                     b=None):
    pass

def has_splat(a, *args):
    pass

def has_kwsplat(a, **kwargs):
    pass

def has_kwonly_args(a, *args, option=False):
    pass

def has_kwonly_unnammed_args(a, *, option=False):
    pass

def has_kwargs_kwonlyargs(a, *, option=False, **kwargs):
    pass

@some_decorator
def has_everything(a,
                   b=None,
                   c = {'a': [
                       1,
                       2,
                       3
                   ]},
                   *args,
                   **kwargs) \
-> None:
    pass
