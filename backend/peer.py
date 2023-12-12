from pyre import Pyre, zhelper 
from threading import Thread, Lock
from pathlib import Path
import zmq 
import uuid
import logging
import argparse
import json
import time
import random
import hash
import shutil

POLL_TIMEOUT_MS = 300
GROUP_NAME = "SDLE"
SEED_HEADER = "SEED"
RING_PARTITIONS = 30
PREFERENCE_LIST_SIZE = 4
MIN_WRITES = 2
MIN_READS = 1

logger = logging.getLogger(__name__)
file_lock = Lock()
request_lock = Lock()
node_dir = 'node_data'

class Peer:
    def __init__(self, name, num_replicas):
        self.name = name
        #self.isSeed = is_seed
        self.num_replicas = num_replicas
        self.lbSocket = None
        self.tokens = list()

    def setup(self, ctx, pipe):
        self.pipe = pipe
        self.node = Pyre(self.name, ctx=ctx)
        #if self.isSeed:
            #self.node.set_header("SEED", f"{self.node.uuid()}")

        self.node.join(GROUP_NAME)
        self.node.start()
        Thread(target=self.connect_to_lb, args=[ctx]).start()
        self.create_directory()
        self.create_poller()
        Thread(target=self.assign_tokens).start()
        print(self.node.uuid())
        self.run()

    def connect_to_lb(self, ctx):
        self.lbSocket = ctx.socket(zmq.DEALER)
        self.lbSocket.identity = u"Worker-{}".format(self.name).encode("ascii")
        self.lbSocket.connect("tcp://localhost:5560")
        self.lbSocket.send_multipart([b"", b"READY"])

    def disconnect_from_lb(self):
        self.lbSocket.send_multipart([b"", b"EXIT"])
        self.lbSocket.close()

    def create_directory(self):
        self.dir_path = Path(f"{node_dir}/{self.name}")
        self.dir_path.mkdir(parents=True, exist_ok=True)

    def delete_directory(self):
        shutil.rmtree(self.dir_path)

    def create_poller(self):
        self.poller = zmq.Poller()
        self.poller.register(self.pipe, zmq.POLLIN)
        self.poller.register(self.node.socket(), zmq.POLLIN)
        self.poller.register(self.lbSocket, zmq.POLLIN)
        print(self.node.socket())

    def run(self):
        while(True):
            items = dict(self.poller.poll(POLL_TIMEOUT_MS))
            #print(self.node.socket(), items)
            if self.pipe in items:
                message = self.pipe.recv()
                # message to quit
                if message.decode('utf-8') == "$TERM":
                    break
                logger.debug(f"PARENT_MSG: {message.decode('utf-8')}")
                #self.node.shouts(GROUP_NAME, message.decode('utf-8'))
            elif self.lbSocket in items:
                message = self.lbSocket.recv_multipart()
                Thread(target=self.route_message, args=[message]).start()
                logger.debug(f"LB_MSG: {message}")
            else:
                if self.node.socket() in items and items[self.node.socket()] == zmq.POLLIN:
                    self.process_message()
        
        self.redistribute_tokens()
        Thread(target=self.disconnect_from_lb()).start()
        self.delete_directory()
        self.node.stop()

    def route_message(self, message):
        client, empty, operation, content = message[:4]
        if operation.decode('utf-8') == "WRITE":
            content_hash = hash.hash_value(list(json.loads(content).keys())[0])
        else:
            content_hash = hash.hash_value(content.decode('utf-8'))
        preference_list = self.get_preference_list(content_hash)
        if not preference_list:
            preference_list = self.set_preference_list(content_hash)

        peer_to_route = preference_list.pop(0)
        if peer_to_route == str(self.node.uuid().int):
            logger.debug(f"COORDINATING REQUEST {content_hash}.")
            Thread(target=self.handle_request(message)).start()
        else:
            logger.debug(f"ROUTING REQUEST {content_hash} to peer {peer_to_route}.")
            self.node.whisper(uuid.UUID(int=int(peer_to_route)), f"REQ {message}")

    def handle_request(self, request):
        client, empty, operation, content = request[:4]
        with request_lock:
            stored_data = self.read_from_file('storage')
            if operation.decode('utf-8') == "WRITE" or operation.decode('utf-8') == "DELETE":
                content_hash = hash.hash_value(list(json.loads(content).keys())[0])
            else:
                content_hash = hash.hash_value(content.decode('utf-8'))
            if operation.decode('utf-8') == "WRITE":
                if not stored_data:
                    stored_data = dict()
                stored_data[str(content_hash)] = list(json.loads(content).values())[0]
                self.write_to_file('storage', stored_data)
            elif operation.decode('utf-8') == "READ":
                if not stored_data or str(content_hash) not in stored_data.keys():
                    self.lbSocket.send_multipart([empty, client, empty, b"ERROR"])
                else:
                    self.lbSocket.send_multipart([empty, client, empty, json.dumps(stored_data[str(content_hash)]).encode('utf-8')]) 
            elif operation.decode('utf-8') == "DELETE":
                del stored_data[str(content_hash)]
                self.write_to_file('storage', stored_data)

    def get_preference_list(self, hash_value):
        preference_lists = self.read_from_file('preference_lists')
        if preference_lists == None:
            return None
        
        if hash_value in preference_lists.keys():
            return preference_lists[str(hash_value)]

        return None
    
    def set_preference_list(self, hash_value):
        partitions = self.read_from_file('partitions')
        preference_lists = self.read_from_file('preference_lists')
        if not preference_lists:
            preference_lists = dict()

        preference_list = list()
        n = hash.get_partition_for_value(hash_value, RING_PARTITIONS)
        while len(preference_list) < min(len(self.node.peers_by_group(GROUP_NAME))+1, PREFERENCE_LIST_SIZE):
            for(peer, tokens) in partitions.items():
                if n in tokens and peer not in preference_list:
                    preference_list.append(peer)
                    break
            n = (n + 1) % RING_PARTITIONS

        preference_lists[str(hash_value)] = list(map(int, preference_list))
        pref_list_str = " ".join(list(map(str, preference_list)))
        self.write_to_file('preference_lists', preference_lists)
        self.node.shout(GROUP_NAME, f"PREFLIST {str(hash_value)} {pref_list_str}".encode('utf-8'))
        return preference_list
    
    def add_pref_list(self, hash_value, peers):
        preference_lists = self.read_from_file('preference_lists')
        if not preference_lists:
            preference_lists = dict()
        
        preference_lists[str(hash_value)] = peers
        self.write_to_file('preference_lists', preference_lists)

    def process_message(self):
        cmds = self.node.recv()
        msg_type = cmds.pop(0)
        src_peer_uuid = cmds.pop(0)
        src_peer_name = cmds.pop(0)
        logger.debug(f"NODE_MSG TYPE: {msg_type}")
        logger.debug(f"NODE_MSG PEER: {uuid.UUID(bytes=src_peer_uuid)}")
        logger.debug(f"NODE_MSG NAME: {src_peer_name}")
        if msg_type.decode('utf-8') == "SHOUT":
            logger.debug(f"NODE_MSG GROUP: {cmds[0]}")
            content_parts = cmds[1].decode('utf-8').split()
            if content_parts[0] == "TOKENS":
                if content_parts[1] == "REQUEST":
                    self.split_tokens(uuid.UUID(bytes=src_peer_uuid), list(map(int, content_parts[2:])))
                elif content_parts[1] == "REPLY":
                    self.add_peer_tokens(uuid.UUID(bytes=src_peer_uuid), list(map(int, content_parts[2:])))
            elif content_parts[0] == "PREFLIST":    
                self.add_pref_list(content_parts[1], list(map(int, content_parts[2:])))
        elif msg_type.decode('utf-8') == "EXIT":
            self.remove_peer_partition(uuid.UUID(bytes=src_peer_uuid))
        elif msg_type.decode('utf-8') == "WHISPER":
            content_parts = cmds[0].decode('utf-8').split()
            if content_parts[0] == "TOKENS":
                if content_parts[1] == "RETURN":
                    self.reassign_tokens(list(map(int, content_parts[2:])))
            if content_parts[0] == "REQ":
                    Thread(target=self.handle_request(content_parts[1:])).start()
        elif msg_type.decode('utf-8') == "ENTER":
            headers = json.loads(cmds[0].decode('utf-8'))
            logger.debug(f"NODE_MSG HEADERS: {headers}")
            for key in headers:
                logger.debug(f"key = {key}, value = {headers[key]}")
        logger.debug(f"NODE_MSG CONT: {cmds}")
        
    def assign_tokens(self):
        time.sleep(1)
        num_peers = len(self.node.peers_by_group(GROUP_NAME))+1
        num_tokens = RING_PARTITIONS // num_peers
        self.tokens = random.sample(range(RING_PARTITIONS), num_tokens)
        logger.debug(f"TOKENS ASSIGNED: {self.tokens}.")

        tokens_str = " ".join(list(map(str, self.tokens)))
        self.node.shout(GROUP_NAME, f"TOKENS REQUEST {tokens_str}".encode('utf-8'))

        partitions = dict()
        partitions[str(self.node.uuid().int)] = self.tokens
        self.write_to_file('partitions', partitions)
        
    def reassign_tokens(self, tokens):
        partitions = self.read_from_file('partitions')
        self.tokens.extend(tokens)
        partitions[str(self.node.uuid().int)] = self.tokens
        self.write_to_file('partitions', partitions)

    def split_tokens(self, peer_uuid, peer_tokens): 
        partitions = self.read_from_file('partitions')
        self.tokens = [token for token in self.tokens if token not in peer_tokens]
        partitions[str(self.node.uuid().int)] = self.tokens
        partitions[str(peer_uuid.int)] = peer_tokens
        self.write_to_file('partitions', partitions)

        tokens_str = " ".join(list(map(str, self.tokens)))
        self.node.shout(GROUP_NAME, f"TOKENS REPLY {tokens_str}".encode('utf-8'))
        logger.debug(f"TOKENS REASSIGNED: {self.tokens}")

    def redistribute_tokens(self):
        partitions = self.read_from_file('partitions')
        del partitions[str(self.node.uuid().int)]

        for peer_id, peers_left in zip(sorted(partitions, key=lambda k: len(partitions[k]), reverse=True), range(len(self.node.peers_by_group(GROUP_NAME)), 0, -1)):
            num_tokens = len(self.tokens) // peers_left
            tokens = random.sample(self.tokens, num_tokens)
            self.tokens = list(set(self.tokens) - set(tokens))
            tokens_str = " ".join(list(map(str, tokens)))
            self.node.whisper(uuid.UUID(int=int(peer_id)), f"TOKENS RETURN {tokens_str}".encode('utf-8'))

    def add_peer_tokens(self, peer_uuid, peer_tokens):
        partitions = self.read_from_file('partitions')
        partitions[str(peer_uuid.int)] = peer_tokens
        self.write_to_file('partitions', partitions)

    def remove_peer_partition(self, peer_uuid):
        partitions = self.read_from_file('partitions')
        del partitions[str(peer_uuid.int)]
        self.write_to_file('partitions', partitions)

    def write_to_file(self, file, content):
        with file_lock:
            with open(self.dir_path / f"{file}.json", 'w') as fp:
                json.dump(content, fp, indent=2)

    def read_from_file(self, file):
        with file_lock:
            if file == 'partitions':
                with open(self.dir_path / f"{file}.json", 'r') as fp:
                        content = json.load(fp)
            else:
                try:
                    with open(self.dir_path / f"{file}.json", 'r') as fp:
                        content = json.load(fp)
                except FileNotFoundError:
                    return None
        return content
    
if __name__ == '__main__':
    logging.basicConfig(
        format='%(asctime)s :: %(levelname)s :: %(message)s', 
        datefmt='%d/%m/%Y %H:%M:%S'
    )
    logging.getLogger('__main__').setLevel(logging.DEBUG)

    parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument('name', help='Name to attribute to node.')
    parser.add_argument('replicas', type=int, nargs='?', default=3, help='Number of peers to share replicas.')
    #parser.add_argument('-s', '--seed', action='store_true', help='Assign this node as a seed node.')
    args = parser.parse_args()
    ctx = zmq.Context()

    peer = Peer(args.name, args.replicas)
    peer_thread = zhelper.zthread_fork(ctx, peer.setup)
    while True:
        try:
            msg = input()
            peer_thread.send(msg.encode('utf_8'))
        except (EOFError, KeyboardInterrupt, SystemExit):
            break
    peer_thread.send("$TERM".encode('utf_8'))
    logger.info("FINISHED")
    