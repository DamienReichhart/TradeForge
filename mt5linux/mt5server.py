#!/usr/bin/env python3
"""
Simple placeholder for mt5linux server to test connectivity
"""

import socket
import threading
import logging
import time
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("mt5server.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("mt5server")

def handle_client(client_socket, address):
    """Handle a client connection"""
    logger.info(f"Client connected from {address}")
    try:
        while True:
            data = client_socket.recv(1024)
            if not data:
                break
            logger.info(f"Received data from {address}: {data}")
            client_socket.send(b"ACK")
    except Exception as e:
        logger.error(f"Error handling client {address}: {e}")
    finally:
        client_socket.close()
        logger.info(f"Client {address} disconnected")

def main():
    """Main server function"""
    host = "0.0.0.0"  # Listen on all interfaces
    port = 8222  # Same port as mt5linux

    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    try:
        server.bind((host, port))
        server.listen(5)
        logger.info(f"Server started on {host}:{port}")
        
        while True:
            client, address = server.accept()
            logger.info(f"Accepted connection from {address}")
            client_thread = threading.Thread(target=handle_client, args=(client, address))
            client_thread.daemon = True
            client_thread.start()
    except KeyboardInterrupt:
        logger.info("Server shutting down")
    except Exception as e:
        logger.error(f"Server error: {e}")
    finally:
        server.close()

if __name__ == "__main__":
    main() 