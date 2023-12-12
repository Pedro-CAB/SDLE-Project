import hashlib

T = 50

def hash_value(value):
    return int(hashlib.md5(str(value).encode("utf-8")).hexdigest(), 16)

def get_partition_for_value(value, num_partitions):
    return value % num_partitions

if __name__ == '__main__':
    print(get_partition_for_value(1, T))