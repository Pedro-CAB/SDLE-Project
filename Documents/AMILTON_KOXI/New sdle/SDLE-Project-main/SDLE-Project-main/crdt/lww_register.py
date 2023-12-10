class LWWElement:
    def __init__(self, value, timestamp):
        self.value = value
        self.timestamp = timestamp

class LWWRegister:
    def __init__(self):
        self.data = {
            'quantity': LWWElement(0, 0),
            'checked': LWWElement(False, 0)
        }

    def update(self, field, value, timestamp):
        if field in self.data and timestamp > self.data[field].timestamp:
            self.data[field] = LWWElement(value, timestamp)

    def get_value(self, field):
        return self.data[field].value if field in self.data else None

    def merge(self, other_register):
        for field in self.data:
            if field in other_register.data:
                if other_register.data[field].timestamp > self.data[field].timestamp:
                    self.data[field] = other_register.data[field]
