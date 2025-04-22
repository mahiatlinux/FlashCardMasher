import os
import sys

def navigate_and_install():
    os.chdir("backend")
    os.system("npm install")
    os.chdir("..")
    os.chdir("frontend")
    os.system("npm install")
    os.chdir("..")
    print("Dependencies installed. Please run 'python run.py' to start the application.")

if __name__ == "__main__":
    navigate_and_install()

