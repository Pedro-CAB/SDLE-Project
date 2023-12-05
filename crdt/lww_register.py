class LWWRegister:
    def __init__(self):
        self.value = None
        self.timestamp = 0

    def update(self, value, timestamp):
        if timestamp > self.timestamp:
            self.value = value
            self.timestamp = timestamp

    def get_value(self):
        return self.value

    def merge(self, other_register):
        if other_register.timestamp > self.timestamp:
            self.value = other_register.value
            self.timestamp = other_register.timestamp
