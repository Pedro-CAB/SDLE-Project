class TwoPhaseSet:
    def __init__(self):
        self.added = set()
        self.removed = set()

    def add(self, element):
        if element not in self.removed:
            self.added.add(element)

    def remove(self, element):
        if element in self.added:
            self.removed.add(element)

    def exists(self, element):
        return element in self.added and element not in self.removed

    def merge(self, other_set):
        self.added.update(other_set.added)
        self.removed.update(other_set.removed)
