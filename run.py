import os
import subprocess
import sys
import threading

def deploy_frontend():
    os.chdir("frontend")
    print("Deploying frontend...")
    subprocess.run(["npm", "run", "deploy"])
    os.chdir("..")

def run_backend():
    os.chdir("backend")
    print("Starting backend server...")
    subprocess.Popen(["node", "server.js"])

if __name__ == "__main__":
    deploy_frontend()

    t1 = threading.Thread(target=run_backend)
    t1.start()

    while True:
        pass