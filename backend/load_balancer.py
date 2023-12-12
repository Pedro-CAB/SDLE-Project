from pyre import zhelper
from random import choice
import multiprocessing
import logging
import zmq

NBR_CLIENTS = 10
NBR_WORKERS = 3

logger = logging.getLogger(__name__)

def client_task(ident):
    """Basic request-reply client using REQ socket."""
    socket = zmq.Context().socket(zmq.REQ)
    socket.identity = u"Client-{}".format(ident).encode("ascii")
    socket.connect("ipc://frontend.ipc")

    # Send request, get reply
    socket.send(b"HELLO")
    reply = socket.recv()
    print("{}: {}".format(socket.identity.decode("ascii"),
                          reply.decode("ascii")))


def worker_task(ident):
    """Worker task, using a REQ socket to do load-balancing."""
    socket = zmq.Context().socket(zmq.REQ)
    socket.identity = u"Worker-{}".format(ident).encode("ascii")
    socket.connect("ipc://backend.ipc")

    # Tell broker we're ready for work
    socket.send(b"READY")

    while True:
        address, empty, request = socket.recv_multipart()
        print("{}: {}".format(socket.identity.decode("ascii"),
                              request.decode("ascii")))
        socket.send_multipart([address, b"", b"OK"])


def main(ctx, pipe):
    """Load balancer main loop."""
    # Prepare context and sockets
    context = ctx
    frontend = context.socket(zmq.ROUTER)
    frontend.bind("tcp://*:5559")
    backend = context.socket(zmq.ROUTER)
    backend.bind("tcp://*:5560")

    # Start background tasks
    #def start(task, *args):
    #    process = multiprocessing.Process(target=task, args=args)
    #    process.daemon = True
    #    process.start()
    #for i in range(NBR_CLIENTS):
    #    start(client_task, i)
    #for i in range(NBR_WORKERS):
    #    start(worker_task, i)

    # Initialize main loop state
    backend_ready = False
    workers = []
    poller = zmq.Poller()
    # Only poll for requests from backend until workers are available
    poller.register(backend, zmq.POLLIN)
    poller.register(pipe, zmq.POLLIN)

    while True:
        sockets = dict(poller.poll())
        if pipe in sockets:
            message = pipe.recv_multipart()
            if message[0].decode('utf-8') == "$TERM":
                break
            elif workers:
                worker = choice(workers)
                operation, content = message
                backend.send_multipart([worker, b"terminal", b"", operation, content])
                if not workers:
                    # Don't poll clients if no workers are available and set backend_ready flag to false
                    poller.unregister(frontend)
                    backend_ready = False
            logger.debug(f"PARENT_MSG: {message}")
        if backend in sockets:
            # Handle worker activity on the backend
            request = backend.recv_multipart()
            worker, empty, client = request[:3]
            if worker not in workers:
                workers.append(worker)
            logger.debug(f"BACKEND_MSG: {request}")
            if client == b"READY":
                logger.debug(f"WORKER '{worker.decode('utf-8')}' ADDED")
            elif client == b"EXIT":
                logger.debug(f"WORKER '{worker.decode('utf-8')}' REMOVED")
                workers.remove(worker)
                logger.debug(f"WORKERS: {workers}")
            if workers and not backend_ready:
                # Poll for clients now that a worker is available and backend was not ready
                poller.register(frontend, zmq.POLLIN)
                backend_ready = True
            if client != b"READY" and len(request) > 3:
                # If client reply, send rest back to frontend
                empty, reply = request[3:]
                frontend.send_multipart([client, b"", reply])
        if frontend in sockets:
            # Get next client request, route to last-used worker
            request = frontend.recv_multipart()
            logger.debug(f"FRONTEND_MSG: {request}")
            client, empty, operation, content = request
            worker = choice(workers)
            backend.send_multipart([worker, client, b"", operation, content])
            if not workers:
                # Don't poll clients if no workers are available and set backend_ready flag to false
                poller.unregister(frontend)
                backend_ready = False

    # Clean up
    backend.close()
    frontend.close()
    pipe.close()


if __name__ == "__main__":
    logging.basicConfig(
        format='%(asctime)s :: %(levelname)s :: %(message)s', 
        datefmt='%d/%m/%Y %H:%M:%S'
    )
    logging.getLogger('__main__').setLevel(logging.DEBUG)

    ctx = zmq.Context()
    lb_thread = zhelper.zthread_fork(ctx, main)
    while True:
        try:
            op = input()
            content = input()
            lb_thread.send_multipart([op.encode('utf-8'), content.encode('utf-8')])
        except (EOFError, KeyboardInterrupt, SystemExit):
            break
    lb_thread.send_multipart(["$TERM".encode('utf-8')])
    logger.debug("FINISHED")
