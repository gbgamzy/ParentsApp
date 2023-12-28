import multiprocessing

# Gunicorn config
bind = '127.0.0.1:8003'  # Replace this with your desired bind address
workers = multiprocessing.cpu_count() * 2 + 1
