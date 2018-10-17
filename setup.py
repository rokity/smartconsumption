#!/usr/bin/env python
import subprocess
import sys

def install(package):
    subprocess.call([sys.executable, "-m", "pip", "install", package])

install('matplotlib')
install('numpy')
