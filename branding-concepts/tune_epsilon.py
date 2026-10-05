import subprocess

with open("/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/smooth_vectorize.py") as f:
    code = f.read()

# Replace epsilon=1.5 with epsilon=0.65
code = code.replace("epsilon=1.5", "epsilon=0.65")
code = code.replace("epsilon=1.6", "epsilon=0.65")

with open("/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/smooth_vectorize.py", "w") as f:
    f.write(code)

subprocess.run(["python3", "/Users/ugurugurlu/Desktop/LearnHouze_v2.0/branding-concepts/smooth_vectorize.py"], check=True)
